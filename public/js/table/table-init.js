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
    
    async toggleViewMode() {
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
        await this.reRenderView();
    }

    async reRenderView() {
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
        removeTableSkeleton(tableElement);
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
