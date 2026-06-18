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
        
        console.log(TABLE_LOG_STORED_ORIGINAL_PARENT, this.originalParent?.className);
        
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
            console.warn(TABLE_MESSAGE_FAILED_LOCALSTORAGE_READ, e);
            return null;
        }
    }
    
    storeViewMode(mode) {
        try {
            localStorage.setItem(this.storageKey, mode);
            console.log(`${TABLE_LOG_STORED_VIEW_MODE} ${this.entity}: ${mode}`);
        } catch (e) {
            console.warn(TABLE_MESSAGE_FAILED_LOCALSTORAGE_WRITE, e);
        }
    }
    
    setupToggleButton() {
        const toggleBtn = document.getElementById('toggleViewBtn');
        if (!toggleBtn) {
            console.warn(TABLE_MESSAGE_TOGGLE_BUTTON_NOT_FOUND);
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
    
    async toggleViewMode() {
        // Toggle the view mode
        const newMode = this.currentViewMode === VIEW_MODE_TABLE 
            ? VIEW_MODE_INBOX 
            : VIEW_MODE_TABLE;
        
        console.log(`${TABLE_LOG_SWITCHING_VIEW_MODE} ${this.currentViewMode} → ${newMode}`);
        
        // Store in localStorage
        this.storeViewMode(newMode);
        
        // Update current mode
        this.currentViewMode = newMode;
        
        // Update button UI
        const toggleBtn = document.getElementById('toggleViewBtn');
        if (toggleBtn) this.updateToggleButton(toggleBtn);
        
        // Dispatch view mode changed event
        const event = new CustomEvent(TABLE_EVENT_VIEW_MODE_CHANGED, {
            detail: { 
                entity: this.entity,
                oldMode: this.currentViewMode === VIEW_MODE_TABLE ? VIEW_MODE_INBOX : VIEW_MODE_TABLE,
                newMode: this.currentViewMode
            },
            bubbles: true
        });
        document.dispatchEvent(event);
        
        // Re-render the table with new view mode
        await this.reRenderView();
    }

    async reRenderView() {
        console.log(TABLE_LOG_START_VIEW_RERENDER);
        
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable && $.fn.DataTable.isDataTable(this.tableElement)) {
            console.log(TABLE_LOG_DESTROYING_DATATABLE);
            $(this.tableElement).DataTable().destroy(true);
        }
        
        // Find the actual container to work with
        // After DataTable.destroy(), the table should be back in its original location
        // But we need to find the right parent to insert the inbox container
        let targetParent = this.tableElement.parentNode;
        
        // If table is still wrapped in DataTables divs, unwrap it
        if (targetParent && targetParent.classList.contains('dt-layout-full')) {
            console.log(TABLE_LOG_FINDING_ORIGINAL_PARENT);
            // Find the original parent (should be the col-md-12 div or similar)
            let current = targetParent;
            while (current.parentNode && current.classList.contains('dt-layout-full')) {
                current = current.parentNode;
            }
            targetParent = current.parentNode || this.originalParent;
            
            // Move table back to original parent
            if (targetParent) {
                console.log(TABLE_LOG_MOVING_TABLE_TO_ORIGINAL_PARENT);
                targetParent.appendChild(this.tableElement);
            }
        }
        
        // Use stored original parent as fallback
        if (!targetParent || targetParent.classList.contains('dt-layout-full')) {
            console.log(TABLE_LOG_USING_ORIGINAL_PARENT_FALLBACK);
            targetParent = this.originalParent;
        }
        
        if (!targetParent) {
            console.error(TABLE_LOG_MISSING_PARENT);
            return;
        }
        
        console.log(TABLE_LOG_USING_PARENT, targetParent.className);
        
        // Find and remove inbox container if it exists
        const existingInboxContainer = targetParent.querySelector(TABLE_SELECTOR_INBOX_VIEW_CONTAINER);
        if (existingInboxContainer) {
            console.log(TABLE_LOG_REMOVING_EXISTING_INBOX);
            existingInboxContainer.remove();
        }
        
        // Ensure table is in the correct parent
        if (this.tableElement.parentNode !== targetParent) {
            console.log(TABLE_LOG_ATTACHING_TABLE_TO_PARENT);
            targetParent.appendChild(this.tableElement);
        }
        
        // Clear the table element and make it visible
        this.tableElement.innerHTML = '';
        this.tableElement.style.display = ''; // Reset display to default
        
        console.log(`${TABLE_LOG_RENDERING_VIEW} ${this.currentViewMode}`);
        
        // Re-render based on current view mode
        if (this.currentViewMode === VIEW_MODE_INBOX) {
            await ensureSummaryComponentTemplate(this.schema);
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
            
            console.log(TABLE_LOG_TABLE_VISIBLE, this.tableElement.style.display);
            console.log(TABLE_LOG_TABLE_IN_DOM, !!this.tableElement.parentNode);
            
            renderLazyDataTable(
                this.tableElement, 
                this.cache, 
                this.dtConfig, 
                this.entity
            );
        }
        
        console.log(TABLE_LOG_VIEW_RERENDER_COMPLETE);
        
        // Re-attach bulk action handlers
        if (typeof setupBulkActions === 'function') {
            setupBulkActions(this.entity);
        }
    }
}

// ---------------------------
// 🚀 UPDATED ENTRY POINT
// ---------------------------
// ---------------------------
// ⚙️ UPDATED INIT SINGLE TABLE
// ---------------------------
async function initLabTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn(TABLE_LOG_MISSING_TABLE_ID);

    console.log(`${TABLE_LOG_INITIALIZING_TABLE} ${slug}`);
    
    // Fetch schema using API client
    const schemaResponse = await apiClient.get(`/api/auth/table/${slug}`);
    
    if (!schemaResponse.success || !schemaResponse.data) {
        removeTableSkeleton(tableElement);
        return showErrorMessage(tableElement, schemaResponse.message || TABLE_MESSAGE_TABLE_SCHEMA_NOT_FOUND);
    }

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtSchemaConfig = schema["dt-options"] || {};
    const entriesPerPage = schema.entries_per_page || 10;

    if (!entity || !dtSchemaConfig.columns) {
        removeTableSkeleton(tableElement);
        return showErrorMessage(tableElement, "Invalid schema or missing entity");
    }

    // Initialize cache
    const cache = new EntityCache(entity, entriesPerPage);
    entityCaches.set(entity, cache);

    // DataTables will perform the first fetch; keep the cache empty until then.

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

    removeTableSkeleton(tableElement);
    // Render initial view based on stored preference
    if (viewManager.currentViewMode === VIEW_MODE_INBOX) {
        await ensureSummaryComponentTemplate(schema);
        renderInboxView(tableElement, cache, mergedConfig, entity, schema);
    } else {
        renderLazyDataTable(tableElement, cache, mergedConfig, entity);
    }

    // Listen for view mode changes to clear selections
    document.addEventListener('viewModeChanged', function(e) {
        if (e.detail && e.detail.entity === entity) {
            console.log(TABLE_LOG_VIEW_MODE_SELECTION_CLEAR);
            if (window.bulkActionsManager) {
                window.bulkActionsManager.clearAllSelections();
            }
        }
    });
}

// ---------------------------
// 🌐 API HELPERS (Using API Client with response_schema)
// ---------------------------
