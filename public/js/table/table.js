/**
 * table.js — Enhanced Lazy Loading DataTables with API Client Integration
 * ✅ Uses centralized API client with response_schema support
 * ✅ Handles ui_context for client-side actions
 * ✅ Consistent request/response handling
 * ✅ Better error handling
 * ✅ Improved code organization
 * ✅ FIXED: Inbox view rendering error when switching from table view
 * ✅ FIXED: Sticky DataTables controls (preserving original UI) in inbox view
 */

// ---------------------------
// 🧩 CONSTANTS
// ---------------------------
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
const DEFAULT_LEFT_PANEL_WIDTH = 40;

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
const inboxViewStates = new Map();

// ---------------------------
// 🎛️ VIEW MODE MANAGER
// ---------------------------
class ViewModeManager {
    constructor(tableElement, schema, cache, dtConfig, entity) {
        this.tableElement = tableElement;
        this.schema = schema;
        this.cache = cache;
        this.dtConfig = dtConfig;
        this.entity = entity;
        this.storageKey = `view_mode_${entity}_${tableElement.id}`;
        this.defaultViewMode = schema.default_view_mode || VIEW_MODE_TABLE;
        
        // Store the original parent BEFORE any DataTable initialization
        // This is crucial because DataTables wraps the table in its own divs
        this.originalParent = tableElement.parentNode;
        
        console.log('💾 Stored original parent:', this.originalParent?.className);
        
        // Initialize view mode from local storage or use default
        this.currentViewMode = this.getStoredViewMode() || this.defaultViewMode;
        
        // Setup toggle button
        this.setupToggleButton();
    }
    
    getStoredViewMode() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored || null;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return null;
        }
    }
    
    storeViewMode(mode) {
        try {
            localStorage.setItem(this.storageKey, mode);
            console.log(`💾 Stored view mode for ${this.entity}: ${mode}`);
        } catch (e) {
            console.warn('Failed to write to localStorage:', e);
        }
    }
    
    setupToggleButton() {
        const toggleBtn = document.getElementById('toggleViewBtn');
        if (!toggleBtn) {
            console.warn('Toggle button not found');
            return;
        }
        
        // Update button state based on current view mode
        this.updateToggleButton(toggleBtn);
        
        // Add click handler
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleViewMode();
        });
    }
    
    updateToggleButton(btn) {
        const isTableMode = this.currentViewMode === VIEW_MODE_TABLE;
        
        btn.title = isTableMode ? 'Switch to Split View' : 'Switch to Table View';
        
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = `fas ${isTableMode ? 'fa-table-columns' : 'fa-table'}`;
        }
    }
    
    toggleViewMode() {
        // Toggle the view mode
        const newMode = this.currentViewMode === VIEW_MODE_TABLE 
            ? VIEW_MODE_INBOX 
            : VIEW_MODE_TABLE;
        
        console.log(`🔄 Switching view mode: ${this.currentViewMode} → ${newMode}`);
        
        // Store in localStorage
        this.storeViewMode(newMode);
        
        // Update current mode
        this.currentViewMode = newMode;
        
        // Update button UI
        const toggleBtn = document.getElementById('toggleViewBtn');
        if (toggleBtn) this.updateToggleButton(toggleBtn);
        
        // Dispatch view mode changed event
        const event = new CustomEvent('viewModeChanged', {
            detail: { 
                entity: this.entity,
                oldMode: this.currentViewMode === VIEW_MODE_TABLE ? VIEW_MODE_INBOX : VIEW_MODE_TABLE,
                newMode: this.currentViewMode
            },
            bubbles: true
        });
        document.dispatchEvent(event);
        
        // Re-render the table with new view mode
        this.reRenderView();
    }
    
    reRenderView() {
        console.log('🔧 Starting view re-render...');
        
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable && $.fn.DataTable.isDataTable(this.tableElement)) {
            console.log('🗑️ Destroying existing DataTable');
            $(this.tableElement).DataTable().destroy(true);
        }
        
        // Find the actual container to work with
        // After DataTable.destroy(), the table should be back in its original location
        // But we need to find the right parent to insert the inbox container
        let targetParent = this.tableElement.parentNode;
        
        // If table is still wrapped in DataTables divs, unwrap it
        if (targetParent && targetParent.classList.contains('dt-layout-full')) {
            console.log('🔍 Table still in DataTables wrapper, finding original parent');
            // Find the original parent (should be the col-md-12 div or similar)
            let current = targetParent;
            while (current.parentNode && current.classList.contains('dt-layout-full')) {
                current = current.parentNode;
            }
            targetParent = current.parentNode || this.originalParent;
            
            // Move table back to original parent
            if (targetParent) {
                console.log('📤 Moving table back to original parent');
                targetParent.appendChild(this.tableElement);
            }
        }
        
        // Use stored original parent as fallback
        if (!targetParent || targetParent.classList.contains('dt-layout-full')) {
            console.log('⚠️ Using stored original parent as fallback');
            targetParent = this.originalParent;
        }
        
        if (!targetParent) {
            console.error('❌ Cannot find valid parent element');
            return;
        }
        
        console.log('✅ Using parent:', targetParent.className);
        
        // Find and remove inbox container if it exists
        const existingInboxContainer = targetParent.querySelector('.inbox-view-container');
        if (existingInboxContainer) {
            console.log('🗑️ Removing existing inbox container');
            existingInboxContainer.remove();
        }
        
        // Ensure table is in the correct parent
        if (this.tableElement.parentNode !== targetParent) {
            console.log('📌 Attaching table to parent');
            targetParent.appendChild(this.tableElement);
        }
        
        // Clear the table element and make it visible
        this.tableElement.innerHTML = '';
        this.tableElement.style.display = ''; // Reset display to default
        
        console.log(`🎨 Rendering ${this.currentViewMode} view...`);
        
        // Re-render based on current view mode
        if (this.currentViewMode === VIEW_MODE_INBOX) {
            renderInboxView(
                this.tableElement, 
                this.cache, 
                this.dtConfig, 
                this.entity, 
                this.schema,
                targetParent  // Pass the correct parent
            );
        } else {
            // Make sure table is visible and in DOM for table mode
            this.tableElement.style.display = '';
            
            // Ensure table is properly attached before rendering
            if (!this.tableElement.parentNode) {
                targetParent.appendChild(this.tableElement);
            }
            
            console.log('📊 Table element visible:', this.tableElement.style.display);
            console.log('📊 Table in DOM:', !!this.tableElement.parentNode);
            
            renderLazyDataTable(
                this.tableElement, 
                this.cache, 
                this.dtConfig, 
                this.entity
            );
        }
        
        console.log('✅ View re-render complete');
        
        // Re-attach bulk action handlers
        if (typeof setupBulkActions === 'function') {
            setupBulkActions(this.entity);
        }
    }
}

// ---------------------------
// 🚀 UPDATED ENTRY POINT
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log('📄 DOM Ready - Initializing tables');
    
    // Wait for API client to be available
    if (typeof apiClient === 'undefined') {
        console.error('❌ API Client not loaded');
        showAuthWarning();
        return;
    }

    document.querySelectorAll(".lab-table").forEach(initLabTable);
});

// ---------------------------
// ⚙️ UPDATED INIT SINGLE TABLE
// ---------------------------
async function initLabTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn("❌ Missing table id");

    console.log(`📋 Initializing table: ${slug}`);
    
    // Fetch schema using API client
    const schemaResponse = await apiClient.get(`/api/auth/table/${slug}`);
    
    if (!schemaResponse.success || !schemaResponse.data) {
        return showErrorMessage(tableElement, schemaResponse.message || "Table Schema not found");
    }

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtSchemaConfig = schema["dt-options"] || {};
    const entriesPerPage = schema.entries_per_page || 10;
    
    // Check localStorage first for view mode preference
    const storageKey = `view_mode_${entity}_${slug}`;
    let viewMode = null;
    
    try {
        viewMode = localStorage.getItem(storageKey);
    } catch (e) {
        console.warn('Failed to read from localStorage:', e);
    }
    
    // If no stored preference, use schema default
    if (!viewMode) {
        viewMode = schema.default_view_mode || VIEW_MODE_TABLE;
    }

    if (!entity || !dtSchemaConfig.columns) {
        return showErrorMessage(tableElement, "Invalid schema or missing entity");
    }

    // Initialize cache
    const cache = new EntityCache(entity, entriesPerPage);
    entityCaches.set(entity, cache);

    // Smart initial fetch
    const initialFetchSize = Math.min(entriesPerPage * 2, 100);
    console.log(`🔄 Fetching initial ${initialFetchSize} records for ${entity}`);
    showTableLoader(tableElement);

    const initialData = await fetchEntityData(entity, 0, initialFetchSize);
    
    if (!initialData.success || !initialData.data) {
        return showErrorMessage(tableElement, initialData.message || "Failed to load data");
    }

    cache.set(0, initialData.data, initialData.total);

    // Merge configs
    const mergedConfig = mergeDataTableConfigs(
        DEFAULT_DT_CONFIG,
        dtSchemaConfig,
        getUserPersonalization(entity)
    );

    // Initialize view mode manager
    const viewManager = new ViewModeManager(
        tableElement,
        schema,
        cache,
        mergedConfig,
        entity
    );

    // Store manager instance on table element for debugging/access
    tableElement.__viewManager = viewManager;

    // Render initial view based on stored preference
    if (viewManager.currentViewMode === VIEW_MODE_INBOX) {
        renderInboxView(tableElement, cache, mergedConfig, entity, schema);
    } else {
        renderLazyDataTable(tableElement, cache, mergedConfig, entity);
    }

    // Listen for view mode changes to clear selections
    document.addEventListener('viewModeChanged', function(e) {
        if (e.detail && e.detail.entity === entity) {
            console.log('👁️ View mode changed, clearing selections');
            if (window.bulkActionsManager) {
                window.bulkActionsManager.clearAllSelections();
            }
        }
    });
}

// ---------------------------
// 🌐 API HELPERS (Using API Client with response_schema)
// ---------------------------
async function fetchEntityData(entity, offset = 0, length = 50) {
    const response = await apiClient.get(`/api/entity/${entity}`, {
        offset,
        length
    });

    if (!response.success) {
        console.error('Failed to fetch entity data:', response.message);
        return {
            success: false,
            message: response.message,
            error: response.error
        };
    }

    // Data is now in response.data (extracted from response_schema.data by api-client)
    // Meta information is in response.meta
    return {
        success: true,
        data: response.data || [],
        total: response.meta?.pagination?.total || response.data?.length || 0,
        meta: response.meta
    };
}

async function fetchHtmlComponent(formSchemaId, entityUid = null, componentName = 'userinterface::components.form') {
    const urlParts = ['/hola', formSchemaId];
    if (entityUid) {
        urlParts.push(entityUid);
    }

    const endpoint = urlParts.join('/');
    
    const response = await apiClient.get(endpoint, {
        component: componentName
    });

    if (!response.success) {
        return {
            success: false,
            error: response.message || 'Failed to fetch component'
        };
    }

    // Handle ui_context for redirects, modals, etc.
    if (response.ui_context) {
        handleUIContext(response.ui_context);
    }

    // Handle different response types
    if (response.data?.html) {
        return {
            success: true,
            html: response.data.html
        };
    }

    return {
        success: true,
        html: response.data || ''
    };
}

/**
 * Handle UI context from API responses
 * @param {Object} uiContext
 */
function handleUIContext(uiContext) {
    if (!uiContext) return;

    // Handle redirect
    if (uiContext.redirect) {
        console.log('🔄 Redirecting to:', uiContext.redirect);
        window.location.href = uiContext.redirect;
        return;
    }

    // Handle page refresh
    if (uiContext.refresh) {
        console.log('🔄 Refreshing page');
        window.location.reload();
        return;
    }

    // Handle close action (for modals, panels, etc.)
    if (uiContext.close) {
        console.log('❌ Closing current view');
        // Dispatch event for application to handle
        window.dispatchEvent(new CustomEvent('ui-close'));
    }

    // Toast notifications are handled by api-client
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

function getUserPersonalization(entityName) {
    return {};
}

// ---------------------------
// 📧 INBOX VIEW RENDERING
// ---------------------------
function renderInboxView(tableElement, cache, dtConfig, entityName, schema, targetParent = null) {
    console.log('📧 renderInboxView called for:', entityName);
    
    const { columns = [] } = dtConfig;
    
    // Create inbox container with proper Bootstrap classes
    const container = document.createElement('div');
    container.className = 'inbox-view-container w-100';
    container.style.cssText = 'display: flex !important; height: 600px; position: relative;';
    
    console.log('📦 Created inbox container');
    
    // Left panel (list view) - flex container with flex-column
    const leftPanel = document.createElement('div');
    leftPanel.className = 'inbox-left-panel';
    leftPanel.style.cssText = `
        width: ${DEFAULT_LEFT_PANEL_WIDTH}%;
        border-right: 1px solid #dee2e6;
        background: white;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;
    
    // Resizer
    const resizer = document.createElement('div');
    resizer.className = 'inbox-resizer bg-light';
    resizer.style.cssText = 'width: 5px; cursor: col-resize; user-select: none; background: #e9ecef;';
    resizer.title = 'Drag to resize';
    
    // Right panel (detail view)
    const rightPanelEle = document.createElement('div');
    rightPanelEle.className = 'inbox-right-panel';
    rightPanelEle.style.cssText = `flex: 1; overflow: auto; padding: 20px; background: #f8f9fa;`;
    rightPanelEle.innerHTML = '<div class="text-center text-muted py-5">Select an item to view details</div>';
    
    container.appendChild(leftPanel);
    container.appendChild(resizer);
    container.appendChild(rightPanelEle);
    
    console.log('📦 Assembled inbox container structure');
    
    // Use provided parent or fall back to table's parent
    const parentNode = targetParent || tableElement.parentNode;
    
    if (!parentNode) {
        console.error('❌ Cannot render inbox view: no valid parent');
        return;
    }
    
    console.log('🔗 Parent node found:', parentNode.className);
    
    // Check if table is actually a child of parentNode
    if (tableElement.parentNode === parentNode) {
        // Table is in the parent, insert before it
        console.log('📍 Table is in parent, inserting before it');
        parentNode.insertBefore(container, tableElement);
    } else {
        // Table is not in parent (or was removed), just append container
        console.log('📍 Table not in parent, appending container');
        parentNode.appendChild(container);
    }
    
    // Hide the table
    tableElement.style.display = 'none';
    
    console.log('✅ Inbox container inserted into parent');
    console.log('📍 Container is now child of:', container.parentNode?.className);
    
    // Create DataTable
    const listTable = document.createElement('table');
    listTable.className = 'table table-striped table-bordered table-hover inbox-list-table';
    listTable.style.cssText = 'margin: 0; cursor: pointer; width: 100%;';
    
    // Format entity name nicely
    const formattedEntityName = entityName
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    listTable.innerHTML = `
        <thead>
            <tr>
                <th class="checkbox-column">
                    <input type="checkbox" id="select-all-inbox" style="cursor: pointer;">
                </th>
                <th class="text-uppercase">
                    ${formattedEntityName}
                </th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    leftPanel.appendChild(listTable);

    const resolvedColumns = [
        {
            data: null,
            orderable: false,
            className: 'checkbox-column',
            render: (row) => `<input type="checkbox" class="row-checkbox" data-uid="${row.uid || row.id}" style="cursor: pointer;">`
        },
        {
            data: null,
            render: (row) => renderInboxRow(row, columns)
        }
    ];
    
    console.log('🎨 Initializing DataTable for inbox list');
    
    // Initialize DataTable
    const dt = $(listTable).DataTable({
        ...dtConfig,
        responsive: false,
        autoWidth: false,
        pageLength: cache.pageSize,
        columns: resolvedColumns,
        columnDefs: [
            {
                targets: 0,
                orderable: false,
                searchable: false,
                width: '40px'
            }
        ],
        select: {
            style: 'single',
            className: 'bg-primary bg-opacity-10'
        },
        ajax: (params, callback) =>
            handleAjaxFetch(params, callback, cache, entityName, listTable),
    });

    // Apply sticky positioning after DataTable is initialized
    setTimeout(() => {
        applyInboxStickyStyles(leftPanel);
    }, 100);

    // Setup resizer
    setupResizer(resizer, leftPanel, rightPanelEle, container);

    // Setup checkbox handlers
    setupCheckboxHandlers(listTable, true);

    console.log(`✅ Inbox view ready for: ${entityName}`);

    // Handle row selection
    $(listTable).on('click', 'tbody tr', function(e) {
        // Don't trigger if clicking checkbox
        if ($(e.target).hasClass('row-checkbox') || $(e.target).closest('.checkbox-column').length) {
            return;
        }
        
        const data = dt.row(this).data();
        if (data) {
            loadDetailComponent(rightPanelEle, schema, data);
            $(this).addClass('table-active').siblings().removeClass('table-active');
        }
    });
    
    console.log(`✅ Inbox view fully initialized for: ${entityName}`);
    
    // Force a reflow to ensure rendering
    container.offsetHeight;
}

/**
 * Apply sticky positioning to DataTables elements in inbox view
 */
function applyInboxStickyStyles(leftPanel) {
    console.log('🎨 Applying sticky styles to inbox DataTable');
    
    // Find the DataTables container that was created by DataTables
    const dtContainer = leftPanel.querySelector('.dt-container');
    if (!dtContainer) {
        console.warn('⚠️ DataTables container not found');
        return;
    }
    
    console.log('✅ Found DataTables container');
    
    // Make the dt-container fill the leftPanel and use flexbox
    dtContainer.style.display = 'flex';
    dtContainer.style.flexDirection = 'column';
    dtContainer.style.height = '100%';
    dtContainer.style.overflow = 'hidden';
    
    // Find all direct children of dt-container (layout rows)
    const layoutRows = Array.from(dtContainer.children).filter(el => 
        el.classList.contains('dt-layout-row') || el.classList.contains('dt-layout-table')
    );
    
    console.log(`📊 Found ${layoutRows.length} layout elements`);
    
    // Identify each row by its content
    layoutRows.forEach((row, index) => {
        const hasSearch = row.querySelector('.dt-search, input[type="search"]');
        const hasLength = row.querySelector('.dt-length, select');
        const hasTable = row.querySelector('table');
        const hasPagination = row.querySelector('.dt-paging, .dataTables_paginate');
        const hasInfo = row.querySelector('.dt-info, .dataTables_info');
        
        console.log(`Row ${index}:`, {
            hasSearch: !!hasSearch,
            hasLength: !!hasLength,
            hasTable: !!hasTable,
            hasPagination: !!hasPagination,
            hasInfo: !!hasInfo,
            classes: row.className
        });
        
        // Top row: Contains search or page length controls
        if ((hasSearch || hasLength) && !hasTable && !hasPagination) {
            row.style.flexShrink = '0';
            row.style.position = 'sticky';
            row.style.top = '0';
            row.style.zIndex = '11';
            row.style.backgroundColor = 'white';
            row.style.paddingBottom = '10px';
            row.style.borderBottom = '1px solid #dee2e6';
            console.log(`✅ Styled top controls at row ${index}`);
        }
        
        // Table row: Contains the actual table
        else if (hasTable) {
            row.style.flex = '1 1 auto';
            row.style.overflow = 'auto';
            row.style.minHeight = '0';
            row.style.position = 'relative';
            
            // Make thead sticky within this scrollable container
            const thead = row.querySelector('thead');
            if (thead) {
                thead.style.position = 'sticky';
                thead.style.top = '0';
                thead.style.zIndex = '10';
            }
            console.log(`✅ Styled scrollable table at row ${index}`);
        }
        
        // Bottom row: Contains pagination or info
        else if (hasPagination || hasInfo) {
            row.style.flexShrink = '0';
            row.style.position = 'sticky';
            row.style.bottom = '0';
            row.style.zIndex = '11';
            row.style.backgroundColor = 'white';
            row.style.paddingTop = '10px';
            row.style.borderTop = '1px solid #dee2e6';
            console.log(`✅ Styled bottom pagination at row ${index}`);
        }
    });
    
    console.log('✅ Sticky styles application complete');
}

/**
 * Render inbox row with "Label: Value" in one line (Bootstrap only)
 */
function renderInboxRow(row, columns) {
    const visibleColumns = columns.filter(
        col =>
            col.visible !== false &&
            col.data &&
            !col.data.startsWith('meta.')
    );

    return `
        <div class="d-flex flex-column gap-1 p-2">
            ${visibleColumns
                .map(col => {
                    let value = '';

                    if (col.data.includes('.')) {
                        value = col.data
                            .split('.')
                            .reduce((acc, key) => acc?.[key], row) ?? '';
                    } else {
                        value = row[col.data] ?? '';
                    }

                    if (value === '' || value === null || value === undefined) {
                        return '';
                    }

                    // Convert objects/arrays to string
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }

                    return `
                        <div style="display: flex; align-items: start; gap: 4px; overflow: hidden;">
                            <span class="fw-semibold text-muted" style="white-space: nowrap; flex-shrink: 0;">
                                ${col.title || col.data}:
                            </span>
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1 1 auto; min-width: 0;" title="${String(value).replace(/"/g, '&quot;')}">
                                ${value}
                            </span>
                        </div>
                    `;
                })
                .join('')}
        </div>
    `;
}


function getPriorityColumns(columns) {
    const priorityOrder = ['id', 'status', 'name', 'email', 'title', 'subject'];
    
    return columns
        .filter(c => c.visible !== false)
        .filter(c => !c.data?.startsWith?.('meta.'))
        .sort((a, b) => {
            const aIdx = priorityOrder.indexOf(a.data);
            const bIdx = priorityOrder.indexOf(b.data);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
        })
        .slice(0, 4);
}

function renderInboxListCell(col, row) {
    let val = "";
    if (col.data?.includes?.(".")) {
        val = col.data.split(".").reduce((acc, key) => acc?.[key], row) ?? "";
    } else {
        val = row[col.data] ?? "";
    }
    
    if (typeof val === 'string' && val.length > 50) {
        val = val.substring(0, 47) + '...';
    }
    
    return `<span class="inbox-list-cell">${val}</span>`;
}

function getLoaderComponentHTML() {
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
    // Store the current width/percentage before modifying
    const currentWidth = rightPanelEle.style.width;
    const currentFlex = rightPanelEle.style.flex;
    
    // Clear the panel and set up flex layout - PRESERVE EXISTING WIDTH
    rightPanelEle.innerHTML = '';
    
    // Apply Bootstrap classes instead of inline styles
    rightPanelEle.className = rightPanelEle.className
        .split(' ')
        .filter(cls => !cls.includes('inbox-') && cls !== 'd-flex' && cls !== 'flex-column')
        .join(' ');
    
    rightPanelEle.classList.add('d-flex', 'flex-column', 'h-100', 'overflow-hidden', 'p-0', 'm-0');
    
    // Restore width settings if they existed
    if (currentWidth) rightPanelEle.style.width = currentWidth;
    if (currentFlex) rightPanelEle.style.flex = currentFlex;
    
    // Create header - using Bootstrap classes
    const header = document.createElement('div');
    header.className = 'inbox-detail-header d-flex justify-content-between align-items-center w-100 py-2 px-3 bg-white border-bottom flex-shrink-0';
    
    // Title on left
    const title = document.createElement('h6');
    title.className = 'mb-0 fw-medium text-primary';
    
    // Try to get a meaningful title from the data
    let titleText = 'Details';
    if (data) {
        if (data.title) titleText = data.title;
        else if (data.name) titleText = data.name;
        else if (data.subject) titleText = data.subject;
        else if (data.id || data.uid) titleText = `Item #${data.id || data.uid}`;
    }
    title.textContent = titleText;
    
    // Cross icon on right - using Bootstrap btn-close
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn btn-sm btn-close opacity-50-hover';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.onclick = (e) => {
        e.stopPropagation();
        
        // Clear the right panel content but PRESERVE WIDTH
        const parentContainer = rightPanelEle.closest('.inbox-view-container');
        const currentWidth = rightPanelEle.style.width;
        const currentFlex = rightPanelEle.style.flex;
        
        rightPanelEle.innerHTML = '';
        rightPanelEle.className = rightPanelEle.className
            .split(' ')
            .filter(cls => !cls.includes('inbox-') && cls !== 'bg-white')
            .join(' ');
        
        rightPanelEle.classList.add('d-flex', 'flex-column', 'bg-light', 'overflow-hidden', 'p-0', 'm-0');
        
        // Restore width settings
        if (currentWidth) rightPanelEle.style.width = currentWidth;
        if (currentFlex) rightPanelEle.style.flex = currentFlex;
        
        const emptyState = document.createElement('div');
        emptyState.className = 'd-flex align-items-center justify-content-center h-100 w-100 text-center text-muted';
        emptyState.innerHTML = 'Select an item to view details';
        rightPanelEle.appendChild(emptyState);
        
        // Remove active class from selected row
        const activeRow = parentContainer?.querySelector('tr.table-active');
        if (activeRow) {
            activeRow.classList.remove('table-active');
        }
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Content container - using Bootstrap classes
    const contentContainer = document.createElement('div');
    contentContainer.className = 'inbox-detail-content flex-grow-1 w-100 overflow-auto bg-light p-3';
    contentContainer.innerHTML = getLoaderComponentHTML();
    
    // Assemble the panel
    rightPanelEle.appendChild(header);
    rightPanelEle.appendChild(contentContainer);
    
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
        // Priority 2: Form schema UID
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
            contentContainer.innerHTML = `
                <div class="alert alert-warning m-0 w-100">
                    <h5>⚠️ Configuration Missing</h5>
                    <p class="mb-1">No detail component or form schema defined in table configuration.</p>
                    <small class="text-muted">Define either <code>details-component</code> or <code>form-schema-uid</code> in schema.</small>
                </div>
            `;
            return;
        }
        
        // Handle successful response
        if (result.success && result.html) {
            contentContainer.innerHTML = result.html;
            
            // Ensure loaded content respects container width using Bootstrap classes
            const contentChildren = contentContainer.children;
            for (let child of contentChildren) {
                if (child.style) {
                    child.classList.add('w-100');
                    child.style.boxSizing = 'border-box'; // Bootstrap doesn't have a class for this
                }
            }
            
            // Initialize forms if present
            const form = contentContainer.querySelector('.shoz-form');
            if (form && typeof setupForm === 'function') {
                setupForm(form);
            }
            if (typeof setupCoreFormElement === 'function') {
                setupCoreFormElement();
            }
            
            // Re-initialize scripts
            initializeDetailViewScripts(contentContainer);
            
            console.log(`✅ Detail component loaded successfully for UID: ${data.uid}`);
        } else {
            showDetailError(contentContainer, result.error || 'Failed to load component content');
        }
        
    } catch (error) {
        console.error('❌ Error loading detail component:', error);
        showDetailError(contentContainer, error.message);
    }
}

// Update showDetailError to use Bootstrap classes
function showDetailError(container, message) {
    container.innerHTML = `
        <div class="alert alert-danger m-0 w-100">
            <h5>Error Loading Details</h5>
            <p class="mb-2">${message}</p>
            <button class="btn btn-sm btn-outline-danger" onclick="location.reload()">
                Reload Page
            </button>
        </div>
    `;
}

function initializeDetailViewScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
    
    const event = new CustomEvent('inboxDetailLoaded', { 
        bubbles: true,
        detail: { container }
    });
    container.dispatchEvent(event);
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

    // ✅ Add Bootstrap styling classes
    tableElement.classList.add(
        "table",
        "table-striped",
        "table-bordered",
        "table-hover",
    );
    tableElement.innerHTML = `<thead><tr></tr></thead><tbody></tbody>`;
    const theadRow = tableElement.querySelector("thead tr");

    // Add checkbox column header
    const checkboxTh = document.createElement("th");
    checkboxTh.className = "checkbox-column";
    checkboxTh.innerHTML = '<input type="checkbox" id="select-all-table" style="cursor: pointer;">';
    theadRow.appendChild(checkboxTh);

    // Add other columns
    columns.forEach(col => {
        if (col.visible !== false) {
            const th = document.createElement("th");
            th.textContent = col.title || col.data;
            theadRow.appendChild(th);
        }
    });

    const resolvedColumns = [
    {
        data: null,
        orderable: false,  // ✅ Make checkbox column non-sortable
        searchable: false, // ✅ Exclude from search
        className: 'checkbox-column',
        width: '40px',
        render: (row) => `<input type="checkbox" class="row-checkbox" data-uid="${row.uid || row.id}" style="cursor: pointer;">`
    },
    ...columns
        .filter(c => c.visible !== false)
        .map(col => ({
            data: null,
            title: col.title,
            orderable: col.orderable !== false, // ✅ Respect column's orderable setting
            render: (row) => renderCell(col, row, rootFormSchemaUid),
        }))
];

    $(tableElement).DataTable({
        ...dtConfig,
        pageLength: cache.pageSize,
        columns: resolvedColumns,
        columnDefs: [
            {
                targets: 0, // First column (checkbox)
                orderable: false,
                searchable: false,
                width: '40px'
            }
        ],
        ajax: async (dataTablesParams, callback) =>
            handleAjaxFetch(dataTablesParams, callback, cache, entityName, tableElement),
    });

    // Setup checkbox handlers
    setupCheckboxHandlers(tableElement, false);

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

    // Check cache first
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

    // Fetch from API
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
        showErrorMessage(tableElement, result.message || "Failed to load data");
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
// 🌀 UI HELPERS
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

// ---------------------------
// ✅ CHECKBOX HANDLERS
// ---------------------------
function setupCheckboxHandlers(tableElement, isInboxView = false) {
    const selectAllId = isInboxView ? 'select-all-inbox' : 'select-all-table';
    const selectAllCheckbox = document.getElementById(selectAllId);
    
    if (!selectAllCheckbox) return;
    
    // Select/Deselect all
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = tableElement.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = this.checked;
        });
        updateSelectionCount(tableElement);
    });
    
    // Handle individual checkbox changes
    $(tableElement).on('change', '.row-checkbox', function() {
        const allCheckboxes = tableElement.querySelectorAll('.row-checkbox');
        const checkedCount = tableElement.querySelectorAll('.row-checkbox:checked').length;
        
        selectAllCheckbox.checked = checkedCount === allCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
        
        updateSelectionCount(tableElement);
    });
    
    // Also listen for clicks on the checkbox itself (for when it's clicked directly)
    $(tableElement).on('click', '.row-checkbox', function(e) {
        // Small delay to allow the checkbox state to update
        setTimeout(() => {
            updateSelectionCount(tableElement);
        }, 10);
    });
}

function updateSelectionCount(tableElement) {
    const checkedBoxes = tableElement.querySelectorAll('.row-checkbox:checked');
    console.log(`📋 Selected rows: ${checkedBoxes.length}`);
    
    // Get selected UIDs
    const selectedUids = Array.from(checkedBoxes).map(cb => cb.dataset.uid);
    console.log('Selected UIDs:', selectedUids);
    
    // Dispatch event on document for bulk actions to catch
    const event = new CustomEvent('rowSelectionChanged', {
        detail: { 
            count: checkedBoxes.length, 
            uids: selectedUids,
            tableId: tableElement.id || tableElement.className
        },
        bubbles: true,
        cancelable: true
    });
    
    // Dispatch on both the table element AND document for better coverage
    tableElement.dispatchEvent(event);
    document.dispatchEvent(event);
}

function getSelectedRows(tableElement) {
    const checkedBoxes = tableElement.querySelectorAll('.row-checkbox:checked');
    return Array.from(checkedBoxes).map(cb => cb.dataset.uid);
}