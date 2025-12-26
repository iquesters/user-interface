/**
 * table.js — Enhanced Lazy Loading DataTables with Smart Caching
 * ✅ Intelligent cache reuse across page size changes
 * ✅ Predictive prefetching
 * ✅ Memory-efficient batch management
 */

// ---------------------------
// 🧩 CONSTANTS
// ---------------------------
const SANCTUM_META_SELECTOR = 'meta[name="sanctum-token"]';
const API_SCHEMA_URL = '/api/auth/table/';
const API_ENTITY_URL = '/api/entity/';
const TOKEN_WAIT_TIMEOUT = 5000;
const CHECK_INTERVAL = 100;
const PREFETCH_THRESHOLD = 0.7; // Prefetch when 70% through cached data
const DEFAULT_DT_CONFIG = {
    processing: false,      // Disable "Processing..." indicator (we use custom loader)
    serverSide: true,       // Enable server-side processing for large datasets
    searching: true,        // Enable search box
    ordering: true,         // Enable column sorting
    responsive: true,       // Make table responsive on mobile
    autoWidth: true,        // Auto-calculate column widths
    destroy: true,          // Allow reinitialization
    pagingType: "full_numbers", // Show first, previous, numbers, next, last buttons
    lengthMenu: [10, 25, 50, 100], // Page size options
    language: {
        searchPlaceholder: "Search records...",
        search: "",         // Remove "Search:" label (we use placeholder)
    },
};

// ---------------------------
// 🔐 SANCTUM TOKEN HELPERS
// ---------------------------
const getSanctumToken = () => {
    const tokenMeta = document.querySelector(SANCTUM_META_SELECTOR);
    return tokenMeta ? tokenMeta.getAttribute('content') : '';
};

const waitForToken = (maxWaitTime = TOKEN_WAIT_TIMEOUT) => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const token = getSanctumToken();
            if (token) return resolve(token);
            if (Date.now() - start > maxWaitTime)
                return reject(new Error('Sanctum token not found after waiting'));
            setTimeout(check, CHECK_INTERVAL);
        };
        check();
    });
};

// ---------------------------
// 📦 ENHANCED ENTITY CACHE
// ---------------------------
class EntityCache {
    constructor(entity, initialPageSize = 10) {
        this.entity = entity;
        this.pageSize = initialPageSize;
        this.total = 0;
        this.cache = new Map(); // Map<startIndex, data[]>
        this.prefetchPromises = new Map(); // Track in-flight requests
    }

    /**
     * Store data at a specific offset
     */
    set(offset, data, total) {
        if (total !== undefined) this.total = total;
        
        data.forEach((row, idx) => {
            this.cache.set(offset + idx, row);
        });
        
        console.log(`📦 Cached ${data.length} rows starting at offset ${offset} (total cached: ${this.cache.size})`);
    }

    /**
     * Get data range from cache
     */
    get(start, length) {
        const result = [];
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return null; // Cache miss
            result.push(this.cache.get(i));
        }
        return result;
    }

    /**
     * Check if a range is fully cached
     */
    hasRange(start, length) {
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return false;
        }
        return true;
    }

    /**
     * Get the highest contiguous cached offset
     */
    getMaxCachedOffset() {
        if (this.cache.size === 0) return 0;
        
        let max = 0;
        while (this.cache.has(max)) {
            max++;
        }
        return max;
    }

    /**
     * Check if we should prefetch based on current position
     */
    shouldPrefetch(currentStart, currentLength) {
        const cachedUpTo = this.getMaxCachedOffset();
        const requestEnd = currentStart + currentLength;
        const distanceToEnd = cachedUpTo - requestEnd;
        
        // Prefetch if we're within threshold of cached boundary
        return distanceToEnd < (currentLength * PREFETCH_THRESHOLD) && cachedUpTo < this.total;
    }

    /**
     * Clear cache (useful for refresh/search)
     */
    clear() {
        this.cache.clear();
        this.prefetchPromises.clear();
        console.log(`🧹 Cache cleared for ${this.entity}`);
    }
}

const entityCaches = new Map(); // Map<entityName, EntityCache>

// ---------------------------
// 🚀 ENTRY POINT
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log('📄 DOM Ready - Initializing tables');
    try {
        await waitForToken();
        console.log('🔐 Sanctum token detected');
        document.querySelectorAll(".shoz-table").forEach(initShozTable);
    } catch (err) {
        console.warn('⚠️ Token missing:', err.message);
        showAuthWarning();
    }
});

// ---------------------------
// ⚙️ INIT SINGLE TABLE
// ---------------------------
async function initShozTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn("❌ Missing table id");

    console.log(`📋 Fetching schema for: ${slug}`);
    const schemaResponse = await fetchTableSchema(slug);
    if (!schemaResponse?.data) return showErrorMessage(tableElement, "Schema not found");

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtSchemaConfig = schema["dt-options"] || {};
    const entriesPerPage = schema.entries_per_page || 10;

    if (!entity || !dtSchemaConfig.columns)
        return showErrorMessage(tableElement, "Invalid schema or missing entity");

    // Initialize cache
    const cache = new EntityCache(entity, entriesPerPage);
    entityCaches.set(entity, cache);

    // Smart initial fetch: load 2x the page size for better UX
    const initialFetchSize = Math.min(entriesPerPage * 2, 100);
    console.log(`🔄 Fetching initial ${initialFetchSize} records for ${entity}`);
    showTableLoader(tableElement);

    const initialData = await fetchEntityData(entity, 0, initialFetchSize);
    if (!initialData.success || !initialData.data)
        return showErrorMessage(tableElement, initialData.error || "Failed to load data");

    cache.set(0, initialData.data, initialData.total);

    // Merge configs
    const mergedConfig = mergeDataTableConfigs(
        DEFAULT_DT_CONFIG,
        dtSchemaConfig,
        getUserPersonalization(entity)
    );

    renderLazyDataTable(tableElement, cache, mergedConfig, entity);
}

// ---------------------------
// 🌐 FETCH HELPERS
// ---------------------------
async function fetchTableSchema(slug) {
    try {
        const token = getSanctumToken();
        const res = await fetch(`${API_SCHEMA_URL}${slug}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return handleUnauthorized();
        return await res.json();
    } catch (err) {
        console.error("Schema fetch failed:", err);
        return null;
    }
}

async function fetchEntityData(entity, offset = 0, length = 50) {
    try {
        const token = getSanctumToken();
        const url = `${API_ENTITY_URL}${entity}?offset=${offset}&length=${length}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) return handleUnauthorized();
        const data = await res.json();
        return { success: true, ...data };
    } catch (err) {
        console.error("Entity fetch failed:", err);
        return { success: false, error: err.message };
    }
}

// ---------------------------
// 🧠 CONFIG MERGE LOGIC
// ---------------------------
function mergeDataTableConfigs(defaultConfig, schemaConfig, userConfig = {}) {
    return {
        ...defaultConfig,
        ...schemaConfig,
        ...userConfig,
        columns: mergeColumns(defaultConfig.columns || [], schemaConfig.columns || [], userConfig.columns || []),
    };
}

function mergeColumns(defaultCols, schemaCols, userCols) {
    return schemaCols.map(col => ({
        ...defaultCols.find(d => d.data === col.data),
        ...col,
        ...userCols.find(u => u.data === col.data),
    }));
}

// ---------------------------
// 🧩 USER PERSONALIZATION
// ---------------------------
/**
 * TODO: User personalization not yet implemented
 * This function will eventually load user-specific DataTable preferences such as:
 * - Saved column visibility settings
 * - Custom column order
 * - Preferred page size
 * - Saved filters/search terms
 * 
 * Possible implementation:
 * return JSON.parse(localStorage.getItem(`dt-user-${entityName}`)) || {};
 */
function getUserPersonalization(entityName) {
    return {}; // Empty for now - user preferences not yet implemented
}

// ---------------------------
// 🧱 DATATABLE RENDERING
// ---------------------------
function renderLazyDataTable(tableElement, cache, dtConfig, entityName) {
    const { columns = [] } = dtConfig;
    const rootFormSchemaUid = dtConfig["form-schema-uid"] || "";

    tableElement.innerHTML = `<thead><tr></tr></thead><tbody></tbody>`;
    const theadRow = tableElement.querySelector("thead tr");
    columns.forEach(col => {
        if (col.visible !== false) {
            const th = document.createElement("th");
            th.textContent = col.title || col.data;
            theadRow.appendChild(th);
        }
    });

    const resolvedColumns = columns
        .filter(c => c.visible !== false)
        .map(col => ({
            data: null,
            title: col.title,
            render: (row) => renderCell(col, row, rootFormSchemaUid),
        }));

    $(tableElement).DataTable({
        ...dtConfig,
        pageLength: cache.pageSize,
        columns: resolvedColumns,
        ajax: async (dataTablesParams, callback) =>
            handleAjaxFetch(dataTablesParams, callback, cache, entityName, tableElement),
    });

    console.log(`✅ DataTable ready for: ${entityName}`);
}

// ---------------------------
// 🧮 DATATABLE CELL RENDER
// ---------------------------
function renderCell(col, row, rootFormSchemaUid) {
    let val = "";
    if (col.data?.startsWith?.("meta.")) {
        const key = col.data.split(".")[1];
        const metaItem = (row.meta || []).find(m => m.meta_key === key);
        val = metaItem ? metaItem.meta_value : "";
    } else if (col.data?.includes?.(".")) {
        val = col.data.split(".").reduce((acc, key) => acc?.[key], row) ?? "";
    } else {
        val = row[col.data] ?? "";
    }

    if (col.link && row.uid) {
        const formSchemaUid = col["form-schema-uid"] || rootFormSchemaUid;
        return `<a href="/edit/${formSchemaUid}/${row.uid}" class="datatable-link text-primary" style="text-decoration:none;">${val}</a>`;
    }
    return val;
}

// ---------------------------
// 🔁 ENHANCED AJAX FETCH HANDLER
// ---------------------------
async function handleAjaxFetch(params, callback, cache, entityName, tableElement) {
    const start = params.start || 0;
    const length = params.length || cache.pageSize;
    const page = Math.floor(start / length) + 1;

    console.log(`📄 Request: page ${page} (offset=${start}, length=${length})`);

    // Update cache page size if changed
    if (cache.pageSize !== length) {
        console.log(`🔄 Page size changed: ${cache.pageSize} → ${length}`);
        cache.pageSize = length;
    }

    // ✅ Try to serve from cache first
    if (cache.hasRange(start, length)) {
        const cachedData = cache.get(start, length);
        console.log(`✨ Serving from cache (${start}-${start + length})`);
        
        callback({
            draw: params.draw,
            recordsTotal: cache.total,
            recordsFiltered: cache.total,
            data: cachedData,
        });

        // Smart prefetch: load next batch if getting close to cache boundary
        if (cache.shouldPrefetch(start, length)) {
            prefetchNextBatch(cache, entityName, start, length);
        }
        
        return;
    }

    // ✅ Cache miss - fetch from API
    console.log(`🌐 Cache miss - fetching from API`);
    showTableLoader(tableElement);

    const result = await fetchEntityData(entityName, start, length);
    
    if (result.success && result.data) {
        cache.set(start, result.data, result.total);
        
        callback({
            draw: params.draw,
            recordsTotal: result.total || cache.total,
            recordsFiltered: result.total || cache.total,
            data: result.data,
        });

        // Prefetch adjacent data for smoother navigation
        if (cache.shouldPrefetch(start, length)) {
            prefetchNextBatch(cache, entityName, start, length);
        }
    } else {
        callback({
            draw: params.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
        });
        showErrorMessage(tableElement, result.error || "Failed to load data");
    }
}

// ---------------------------
// 🔮 PREDICTIVE PREFETCH
// ---------------------------
async function prefetchNextBatch(cache, entityName, currentStart, currentLength) {
    const nextOffset = cache.getMaxCachedOffset();
    const prefetchKey = `${entityName}-${nextOffset}`;

    // Avoid duplicate prefetch requests
    if (cache.prefetchPromises.has(prefetchKey)) {
        return;
    }

    // Don't prefetch if we already have all data
    if (nextOffset >= cache.total) {
        return;
    }

    console.log(`🔮 Prefetching next batch at offset ${nextOffset}`);
    
    const prefetchPromise = fetchEntityData(entityName, nextOffset, currentLength)
        .then(result => {
            if (result.success && result.data?.length) {
                cache.set(nextOffset, result.data, result.total);
                console.log(`✅ Prefetch complete: ${result.data.length} rows`);
            }
        })
        .catch(err => console.warn('Prefetch failed:', err))
        .finally(() => cache.prefetchPromises.delete(prefetchKey));

    cache.prefetchPromises.set(prefetchKey, prefetchPromise);
}

// ---------------------------
// 🌀 TABLE LOADER
// ---------------------------
function showTableLoader(tableElement) {
    const tbody = tableElement.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="100%" class="text-center py-4">
                <div class="d-flex justify-content-center align-items-center gap-2 text-muted">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <span>Loading...</span>
                </div>
            </td>
        </tr>`;
}

// ---------------------------
// ⚠️ AUTH & ERROR HANDLING
// ---------------------------
function handleUnauthorized() {
    console.error('Authentication required - redirecting to login');
    localStorage.removeItem('auth_token');
    // window.location.href = '/login?error=token_expired';
}

function showAuthWarning() {
    document.querySelectorAll(".shoz-table").forEach(t => {
        t.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">
                <div class="alert alert-warning">
                    <h5>Authentication Required</h5>
                    <p>Please log in to view this table.</p>
                    <a href="/login" class="btn btn-primary">Login</a>
                </div>
            </td>
        </tr>`;
    });
}

function showErrorMessage(table, msg) {
    table.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">${msg}</td></tr>`;
}