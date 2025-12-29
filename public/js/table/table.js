/**
 * table.js — Enhanced Lazy Loading DataTables with Smart Caching & Inbox View
 * ✅ Intelligent cache reuse across page size changes
 * ✅ Predictive prefetching
 * ✅ Memory-efficient batch management
 * ✅ Gmail-style inbox view with resizable panels (NO IFRAME)
 */

// ---------------------------
// 🧩 CONSTANTS
// ---------------------------
const SANCTUM_META_SELECTOR = 'meta[name="sanctum-token"]';
const API_SCHEMA_URL = '/api/auth/table/';
const API_ENTITY_URL = '/api/entity/';
const TOKEN_WAIT_TIMEOUT = 5000;
const CHECK_INTERVAL = 100;
const PREFETCH_THRESHOLD = 0.7;
const DEFAULT_DT_CONFIG = {
    processing: false,
    serverSide: true,
    searching: true,
    ordering: true,
    responsive: true,
    autoWidth: true,
    destroy: true,
    pagingType: "full_numbers",
    lengthMenu: [10, 25, 50, 100],
    language: {
        searchPlaceholder: "Search records...",
        search: "",
    },
};

// View mode constants
const VIEW_MODE_TABLE = 'table';
const VIEW_MODE_INBOX = 'inbox';
const MIN_PANEL_WIDTH = 250;
const DEFAULT_LEFT_PANEL_WIDTH = 40; // percentage

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
        this.cache = new Map();
        this.prefetchPromises = new Map();
    }

    set(offset, data, total) {
        if (total !== undefined) this.total = total;
        data.forEach((row, idx) => {
            this.cache.set(offset + idx, row);
        });
        console.log(`📦 Cached ${data.length} rows starting at offset ${offset} (total cached: ${this.cache.size})`);
    }

    get(start, length) {
        const result = [];
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return null;
            result.push(this.cache.get(i));
        }
        return result;
    }

    hasRange(start, length) {
        for (let i = start; i < start + length; i++) {
            if (!this.cache.has(i)) return false;
        }
        return true;
    }

    getMaxCachedOffset() {
        if (this.cache.size === 0) return 0;
        let max = 0;
        while (this.cache.has(max)) {
            max++;
        }
        return max;
    }

    shouldPrefetch(currentStart, currentLength) {
        const cachedUpTo = this.getMaxCachedOffset();
        const requestEnd = currentStart + currentLength;
        const distanceToEnd = cachedUpTo - requestEnd;
        return distanceToEnd < (currentLength * PREFETCH_THRESHOLD) && cachedUpTo < this.total;
    }

    clear() {
        this.cache.clear();
        this.prefetchPromises.clear();
        console.log(`🧹 Cache cleared for ${this.entity}`);
    }
}

const entityCaches = new Map();
const inboxViewStates = new Map(); // Track active row selection per entity

// ---------------------------
// 🚀 ENTRY POINT
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log('📄 DOM Ready - Initializing tables');
    try {
        await waitForToken();
        console.log('🔐 Sanctum token detected');
        document.querySelectorAll(".lab-table").forEach(initLabTable);
    } catch (err) {
        console.warn('⚠️ Token missing:', err.message);
        showAuthWarning();
    }
});

// ---------------------------
// ⚙️ INIT SINGLE TABLE
// ---------------------------
async function initLabTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn("❌ Missing table id");

    console.log(`📋 Fetching schema for: ${slug}`);
    const schemaResponse = await fetchTableSchema(slug);
    if (!schemaResponse?.data) return showErrorMessage(tableElement, "Schema not found");

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtSchemaConfig = schema["dt-options"] || {};
    const entriesPerPage = schema.entries_per_page || 10;
    const viewMode = schema.default_view_mode || VIEW_MODE_TABLE;

    if (!entity || !dtSchemaConfig.columns)
        return showErrorMessage(tableElement, "Invalid schema or missing entity");

    // Initialize cache
    const cache = new EntityCache(entity, entriesPerPage);
    entityCaches.set(entity, cache);

    // Smart initial fetch
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

    // Render based on view mode
    if (viewMode === VIEW_MODE_INBOX) {
        renderInboxView(tableElement, cache, mergedConfig, entity, schema);
    } else {
        renderLazyDataTable(tableElement, cache, mergedConfig, entity);
    }
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
async function fetchFormContent(formSchemaUid, entityUid) {
    try {
        const url = `/edit/${formSchemaUid}/${entityUid}?ajax=true`;
        // ?component=component-name&component=true
        const res = await fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (res.status === 401) return handleUnauthorized();

        const contentType = res.headers.get('content-type') || '';

        // ✅ JSON response
        if (contentType.includes('application/json')) {
            const json = await res.json();
            return {
                success: true,
                html: json.html
            };
        }

        // ✅ HTML response
        const html = await res.text();
        return { success: true, html };

    } catch (err) {
        console.error("Form content fetch failed:", err);
        return { success: false, error: err.message };
    }
}

// async function fetchFormContent(formSchemaUid, entityUid) {
//     try {
//         // const token = getSanctumToken();
//         const url = `/edit/${formSchemaUid}/${entityUid}?ajax=true`;
//         // const res = await fetch(url, {
//         //     headers: { 
//         //         Authorization: `Bearer ${token}`,
//         //         'X-Requested-With': 'XMLHttpRequest'
//         //     },
//         // });
//         const res = await fetch(url);
        
//         if (res.status === 401) return handleUnauthorized();
        
//         const contentType = res.headers.get('content-type');
//         if (contentType && contentType.includes('application/json')) {
//             return await res.json();
//         }
        
//         const html = await res.text();
//         return { success: true, html };
//     } catch (err) {
//         console.error("Form content fetch failed:", err);
//         return { success: false, error: err.message };
//     }
// }

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

function getUserPersonalization(entityName) {
    //get from localdata, if not available get from sessiondata(session data saved from DB during login)
    return {};
}
// changeTableViewMode{

// }
// ---------------------------
// 📧 INBOX VIEW RENDERING
// ---------------------------
function renderInboxView(tableElement, cache, dtConfig, entityName, schema) {
    const { columns = [] } = dtConfig;
    const rootFormSchemaUid = dtConfig["form-schema-uid"] || schema["form-schema-uid"] || null;
    
    // Create inbox container
    const container = document.createElement('div');
    container.className = 'inbox-view-container';
    container.style.cssText = 'display: flex; height: 600px; border: 1px solid #ddd; position: relative;';
    
    // Left panel (list view)
    const leftPanel = document.createElement('div');
    leftPanel.className = 'inbox-left-panel';
    leftPanel.style.cssText = `width: ${DEFAULT_LEFT_PANEL_WIDTH}%; overflow: auto; border-right: 1px solid #ddd;`;
    
    // Resizer
    const resizer = document.createElement('div');
    resizer.className = 'inbox-resizer';
    resizer.style.cssText = 'width: 5px; cursor: col-resize; background: #e0e0e0; user-select: none;';
    resizer.title = 'Drag to resize';
    
    // Right panel (detail view)
    const rightPanelEle = document.createElement('div');
    rightPanelEle.className = 'inbox-right-panel';
    rightPanelEle.style.cssText = `flex: 1; overflow: auto; padding: 20px; background: #f9f9f9;`;
    rightPanelEle.innerHTML = '<div class="text-center text-muted py-5">Select an item to view details</div>';
    
    container.appendChild(leftPanel);
    container.appendChild(resizer);
    container.appendChild(rightPanelEle);
    
    // Replace table with inbox container
    tableElement.parentNode.insertBefore(container, tableElement);
    tableElement.style.display = 'none';
    
    // Create DataTable in left panel
    const listTable = document.createElement('table');
    listTable.className = 'table table-hover inbox-list-table';
    listTable.style.cssText = 'margin: 0; cursor: pointer;';
    leftPanel.appendChild(listTable);
    
    // Setup list columns (priority fields only)
    const priorityColumns = getPriorityColumns(columns);
    listTable.innerHTML = `<thead><tr></tr></thead><tbody></tbody>`;
    const theadRow = listTable.querySelector("thead tr");
    priorityColumns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.title || col.data;
        theadRow.appendChild(th);
    });
    
    const resolvedColumns = priorityColumns.map(col => ({
        data: null,
        title: col.title,
        render: (row) => renderInboxListCell(col, row),
    }));
    
    // Initialize DataTable
    const dt = $(listTable).DataTable({
        ...dtConfig,
        pageLength: cache.pageSize,
        columns: resolvedColumns,
        select: {
            style: 'single',
            className: 'bg-primary bg-opacity-10'
        },
        ajax: async (dataTablesParams, callback) =>
            handleAjaxFetch(dataTablesParams, callback, cache, entityName, listTable),
    });
    
    // Handle row selection
    $(listTable).on('click', 'tbody tr', function() {
        const data = dt.row(this).data();
        if (data) {
                loadDetailComponent(rightPanelEle, schema, data);
                // loadDetailFormView(rightPanel, data, columns, rootFormSchemaUid);

            $(this).addClass('table-active').siblings().removeClass('table-active');
        }
    });
    
    // Setup resizer
    setupResizer(resizer, leftPanel, rightPanel, container);
    
    console.log(`✅ Inbox view ready for: ${entityName}`);
}

function getPriorityColumns(columns) {
    // Return columns that should appear in the list view
    // Prioritize: id, status, name, email, and other visible non-meta fields
    const priorityOrder = ['id', 'status', 'name', 'email', 'title', 'subject'];
    
    return columns
        .filter(c => c.visible !== false)
        .filter(c => !c.data?.startsWith?.('meta.')) // Exclude meta fields from list
        .sort((a, b) => {
            const aIdx = priorityOrder.indexOf(a.data);
            const bIdx = priorityOrder.indexOf(b.data);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
        })
        .slice(0, 4); // Show max 4 columns in list
}

function renderInboxListCell(col, row) {
    let val = "";
    if (col.data?.includes?.(".")) {
        val = col.data.split(".").reduce((acc, key) => acc?.[key], row) ?? "";
    } else {
        val = row[col.data] ?? "";
    }
    
    // Truncate long text in list view
    if (typeof val === 'string' && val.length > 50) {
        val = val.substring(0, 47) + '...';
    }
    
    return `<span class="inbox-list-cell">${val}</span>`;
}

// async function loadDetailView(rightPanel, rowData, allColumns, formSchemaUid) {
//     // Show loading spinner
//     rightPanel.innerHTML = `
//         <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
//             <div class="text-center">
//                 <div class="spinner-border text-primary mb-2" role="status"></div>
//                 <div class="text-muted">Loading details...</div>
//             </div>
//         </div>
//     `;
    
//     try {
//         // Fetch the form content directly
//         const result = await fetchFormContent(formSchemaUid, rowData.uid);
        
//         if (result.success && result.html) {
//             // Create container for the form content
//             const detailContainer = document.createElement('div');
//             detailContainer.className = 'inbox-detail-view';
//             detailContainer.style.cssText = 'height: 100%; overflow-y: auto;';
//             detailContainer.innerHTML = result.html;
            
//             // Clear and append
//             rightPanel.innerHTML = '';
//             rightPanel.appendChild(detailContainer);
            
//             // Re-initialize any scripts that might be in the loaded content
//             initializeDetailViewScripts(detailContainer);
            
//             console.log(`✅ Detail view loaded for UID: ${rowData.uid}`);
//         } else {
//             showDetailError(rightPanel, result.error || 'Failed to load details');
//         }
//     } catch (error) {
//         console.error('Error loading detail view:', error);
//         showDetailError(rightPanel, error.message);
//     }
// }
async function loadDetailFormView(rightPanel, rowData, allColumns, formSchemaUid) {
    rightPanel.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <div class="text-muted">Loading details...</div>
            </div>
        </div>
    `;

    try {
        const result = await fetchFormContent(formSchemaUid, rowData.uid);

        if (result.success && result.html) {
            rightPanel.innerHTML = result.html;

            // ✅ THIS IS THE FIX (REQUIRED)
            const form = rightPanel.querySelector('.shoz-form');
            if (form) {
                setupForm(form);           // ← THIS was missing
                setupCoreFormElement();    // ← THIS too
            }

        } else {
            showDetailError(rightPanel, result.error || 'Failed to load details');
        }
    } catch (error) {
        console.error('Error loading detail view:', error);
        showDetailError(rightPanel, error.message);
    }
}

// async function loadDetailComponent(rightPanelEle, schema, data) {
//     // Show loading spinner
//     rightPanelEle.innerHTML = getLoaderComponentHTML();
//     // redeclear new api route and controller function
//     if(schema["details-component"]) {
//         // Fetch the component HTML with component name as schema["details-component"]
//     } else if(schema["form-schema-uid"]) {
//         // Fetch the component HTML with hardcoded component name as userinterface::components.form
//     }else {
//         rightPanelEle.innerHTML = '<div class="alert alert-warning">No detail component or form schema defined.</div>';
//         // or may be some default fall back which we will decide later.
//     }
    
// }

// moved in ui utils
function getLoaderComponentHTML()
{
    return `
        <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <div class="text-muted">Loading details...</div>
            </div>
        </div>
    `;

}

async function loadDetailComponent(rightPanelEle, schema, data) {
    // Show loading spinner
    rightPanelEle.innerHTML = getLoaderComponentHTML();
    
    try {
        let result;
        
        // Priority 1: Custom details component
        if (schema["details-component"]) {
            console.log(`📋 Loading custom component: ${schema["details-component"]}`);
            result = await fetchHtmlComponent(
                schema["form-schema-uid"] || schema["details-component"], 
                data.uid, 
                schema["details-component"]
            );
        } 
        // Priority 2: Form schema UID (fallback to form component)
        else if (schema["form-schema-uid"]) {
            console.log(`📝 Loading form component for UID: ${data.uid}`);
            result = await fetchHtmlComponent(
                schema["form-schema-uid"], 
                data.uid, 
                'userinterface::components.form'
            );
        } 
        // Priority 3: No configuration found
        else {
            rightPanelEle.innerHTML = `
                <div class="alert alert-warning m-3">
                    <h5>⚠️ Configuration Missing</h5>
                    <p>No detail component or form schema defined in table configuration.</p>
                    <small class="text-muted">Define either <code>details-component</code> or <code>form-schema-uid</code> in schema.</small>
                </div>
            `;
            return;
        }
        
        // Handle successful response
        if (result.success && result.html) {
            rightPanelEle.innerHTML = result.html;
            
            // Initialize forms if present
            const form = rightPanelEle.querySelector('.shoz-form');
            if (form) {
                setupForm(form);
                setupCoreFormElement();
            }
            
            // Re-initialize scripts in loaded content
            initializeDetailViewScripts(rightPanelEle);
            
            console.log(`✅ Detail component loaded successfully for UID: ${data.uid}`);
        } else {
            showDetailError(rightPanelEle, result.error || 'Failed to load component content');
        }
        
    } catch (error) {
        console.error('❌ Error loading detail component:', error);
        showDetailError(rightPanelEle, error.message);
    }
}


async function fetchHtmlComponent(formSchemaId, entityUid = null, componentName = 'userinterface::components.form') {
    try {
        const token = getSanctumToken();
        
        // Build URL: /api/{form_schema_id}/{entity_uid}?component={componentName}
        const urlParts = ['/api/hola', formSchemaId];
        if (entityUid) {
            urlParts.push(entityUid);
        }
        
        const url = `${urlParts.join('/')}?component=${encodeURIComponent(componentName)}`;
        
        console.log(`Fetching component: ${url}`);
        
        const res = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${token}`,
            }
        });
        console.log('response of fetching new api', res);
        
        if (res.status === 401) {
            return handleUnauthorized();
        }
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const contentType = res.headers.get('content-type') || '';
        
        // Handle JSON response
        if (contentType.includes('application/json')) {
            const json = await res.json();
            
            // Check if response has html property
            if (json.html) {
                return {
                    success: true,
                    html: json.html
                };
            }
            
            // Handle error responses
            if (json.error || json.message) {
                return {
                    success: false,
                    error: json.error || json.message
                };
            }
            
            return {
                success: false,
                error: 'Invalid response format'
            };
        }
        
        // Handle HTML response (fallback)
        const html = await res.text();
        return { success: true, html };
        
    } catch (err) {
        console.error("HTML component fetch failed:", err);
        return { 
            success: false, 
            error: err.message || 'Failed to fetch component'
        };
    }
}

function initializeDetailViewScripts(container) {
    // Re-run any scripts in the loaded content
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
    
    // Trigger custom event for any listeners
    const event = new CustomEvent('inboxDetailLoaded', { 
        bubbles: true,
        detail: { container }
    });
    container.dispatchEvent(event);
}

function showDetailError(rightPanel, message) {
    rightPanel.innerHTML = `
        <div class="alert alert-danger m-3">
            <h5>Error Loading Details</h5>
            <p>${message}</p>
            <button class="btn btn-sm btn-outline-danger" onclick="location.reload()">
                Reload Page
            </button>
        </div>
    `;
}

function setupResizer(resizer, leftPanel, rightPanel, container) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const delta = e.clientX - startX;
        const newWidth = startWidth + delta;
        const containerWidth = container.offsetWidth;
        const minWidth = MIN_PANEL_WIDTH;
        const maxWidth = containerWidth - MIN_PANEL_WIDTH - 5;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            const percentage = (newWidth / containerWidth) * 100;
            leftPanel.style.width = `${percentage}%`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// ---------------------------
// 🧱 STANDARD TABLE RENDERING
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

    if (cache.pageSize !== length) {
        console.log(`🔄 Page size changed: ${cache.pageSize} → ${length}`);
        cache.pageSize = length;
    }

    if (cache.hasRange(start, length)) {
        const cachedData = cache.get(start, length);
        console.log(`✨ Serving from cache (${start}-${start + length})`);
        
        callback({
            draw: params.draw,
            recordsTotal: cache.total,
            recordsFiltered: cache.total,
            data: cachedData,
        });

        if (cache.shouldPrefetch(start, length)) {
            prefetchNextBatch(cache, entityName, start, length);
        }
        
        return;
    }

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

    if (cache.prefetchPromises.has(prefetchKey)) return;
    if (nextOffset >= cache.total) return;

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
}

function showAuthWarning() {
    document.querySelectorAll(".lab-table").forEach(t => {
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