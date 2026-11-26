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
        
        window.uiDebug?.(TABLE_LOG_STORED_ORIGINAL_PARENT, this.originalParent?.className);
        
        // View mode: the URL's ?mode, else the one stored for this table, else the default.
        const urlState = typeof parseTableUrl === 'function' ? parseTableUrl() : null;
        this.currentViewMode = (urlState && urlState.mode)
            || this.getStoredViewMode()
            || this.defaultViewMode;

        // Table mode with a record open: the record shows full width in place
        // of the table (split mode shows it in the right panel).
        this.recordFull = this.currentViewMode === VIEW_MODE_TABLE && this.urlRecordUid(urlState) !== null;
        this.openUid = null;
        
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
            window.uiDebug?.(`${TABLE_LOG_STORED_VIEW_MODE} ${this.entity}: ${mode}`);
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
        const next = this.currentViewMode === VIEW_MODE_TABLE ? VIEW_MODE_INBOX : VIEW_MODE_TABLE;
        // A history entry per switch: Back returns to the other mode.
        this.writeModeToUrl(next, true);
        await this.setViewMode(next);
    }

    /** The view mode in the URL (?mode=table|split), left out when it is the table's default. */
    writeModeToUrl(mode, push = false) {
        if (typeof setTableUrlMode === 'function') {
            setTableUrlMode(mode, this.defaultViewMode, { push });
        }
    }

    /** The record uid in the URL (view/edit), or null. */
    urlRecordUid(state = (typeof parseTableUrl === 'function' ? parseTableUrl() : null)) {
        return state && state.uid && (state.action === 'view' || state.action === 'edit') ? state.uid : null;
    }

    /** Switch to a view mode (stored per table) and re-render. No-op if already in it. */
    async setViewMode(newMode) {
        if (newMode === this.currentViewMode) {
            return;
        }

        const oldMode = this.currentViewMode;
        window.uiDebug?.(`${TABLE_LOG_SWITCHING_VIEW_MODE} ${oldMode} → ${newMode}`);

        this.storeViewMode(newMode);
        this.currentViewMode = newMode;
        this.writeModeToUrl(newMode);

        // A record in the URL stays open: full width in table mode, the right panel in split mode.
        const recordUid = this.urlRecordUid();
        this.recordFull = newMode === VIEW_MODE_TABLE && recordUid !== null;

        const toggleBtn = document.getElementById('toggleViewBtn');
        if (toggleBtn) this.updateToggleButton(toggleBtn);

        document.dispatchEvent(new CustomEvent(TABLE_EVENT_VIEW_MODE_CHANGED, {
            detail: { entity: this.entity, oldMode, newMode },
            bubbles: true
        }));

        await this.reRenderView();

        if (recordUid) {
            this.openUid = null;
            await this.openRecordFromUrl();
        }
    }

    /** The split view's container for this table (null in table mode). */
    inboxContainer() {
        const parent = this.tableElement.parentNode || this.originalParent;
        return parent?.querySelector(TABLE_SELECTOR_INBOX_VIEW_CONTAINER) || null;
    }

    /**
     * Open a record: in split mode in the right panel (its row highlighted);
     * in table mode full width in place of the table. The URL follows
     * (loadDetailComponent writes /view|edit/{form}/{uid}).
     */
    async openRecord(rowData, { formMode = 'view' } = {}) {
        if (this.currentViewMode === VIEW_MODE_TABLE && !this.recordFull) {
            this.recordFull = true;
            await this.reRenderView();
        }

        const container = this.inboxContainer();
        const rightPanel = container?.__rightPanel;
        const listTable = container?.__listTable;
        if (!rightPanel) {
            return;
        }

        await loadDetailComponent(rightPanel, this.schema, rowData, {
            formMode,
            preferredMode: formMode === 'edit' ? DETAIL_RENDER_MODE_FORM : undefined,
        });

        if (this.recordFull) {
            return;
        }

        const uid = String(rowData?.uid || rowData?.id || '');
        const highlight = () => {
            const checkbox = listTable?.querySelector(`${TABLE_SELECTOR_ROW_CHECKBOX}[data-uid="${CSS.escape(uid)}"]`);
            const row = checkbox?.closest('tr');
            if (row) {
                setInboxRowSelection(row);
                row.scrollIntoView({ block: 'nearest' });
            }
            return Boolean(row);
        };

        // The list may still be loading its first page.
        if (!highlight() && listTable && typeof $ !== 'undefined') {
            $(listTable).one('draw.dt', () => setTimeout(highlight, 0));
        }
    }

    /** Kept for callers of the old name. */
    async openRowInSplit(rowData) {
        return this.openRecord(rowData);
    }

    /** Open the record named in the URL (a reload, a shared link, Back/Forward). */
    async openRecordFromUrl(state = parseTableUrl()) {
        const uid = this.urlRecordUid(state);
        if (!uid) {
            return;
        }

        // The record's placeholder while it loads (the panel showed "Select an item").
        if (this.currentViewMode === VIEW_MODE_TABLE && !this.recordFull) {
            this.recordFull = true;
            await this.reRenderView();
        }
        const panel = this.inboxContainer()?.__rightPanel;
        if (panel && typeof renderRecordSkeleton === 'function') {
            panel.innerHTML = renderRecordSkeleton();
            setInboxDetailOpen(panel, true);
        }

        let row = { uid };
        if (typeof fetchSessionJsonData === 'function' && typeof entityRecordUrl === 'function') {
            const record = await fetchSessionJsonData(
                (typeof tableRecordDataUrl === 'function' && tableRecordDataUrl(this.schema, uid))
                    || entityRecordUrl('show', this.entity, uid)
            );
            if (record && typeof record === 'object' && !Array.isArray(record)) {
                row = { uid, ...record };
            }
        }

        await this.openRecord(row, { formMode: state.action === 'edit' ? 'edit' : 'view' });
    }

    /**
     * The record's close button: back to the list (a history entry). Table
     * mode shows the table again; split mode returns to table view, as before.
     */
    async closeRecord() {
        if (typeof setTableUrlRecord === 'function') {
            setTableUrlRecord(null);
        }
        this.openUid = null;

        if (this.recordFull) {
            this.recordFull = false;
            await this.reRenderView();
            return;
        }

        await this.setViewMode(VIEW_MODE_TABLE);
    }

    /** The open record was deleted: drop it from the URL; a full width record returns to the table. */
    async recordDeleted({ reloadList = true } = {}) {
        if (typeof setTableUrlRecord === 'function') {
            setTableUrlRecord(null, { push: false });
        }
        this.openUid = null;

        if (typeof window.clearLabTableCache === 'function') {
            window.clearLabTableCache(this.tableElement);
        }

        if (this.recordFull) {
            this.recordFull = false;
            await this.reRenderView();
            return;
        }

        const listTable = this.inboxContainer()?.__listTable;
        if (reloadList && listTable && $.fn.DataTable.isDataTable(listTable)) {
            $(listTable).DataTable().ajax.reload(null, false);
        }
    }

    /** Back / Forward: show what the URL says (mode, record, create form) without a reload. */
    async applyUrl() {
        const state = parseTableUrl();
        if (!state) {
            return;
        }

        const mode = state.mode || this.defaultViewMode;
        const uid = this.urlRecordUid(state);
        const full = mode === VIEW_MODE_TABLE && uid !== null;

        if (mode !== this.currentViewMode || full !== this.recordFull) {
            this.currentViewMode = mode;
            this.storeViewMode(mode);
            this.recordFull = full;
            const toggleBtn = document.getElementById('toggleViewBtn');
            if (toggleBtn) this.updateToggleButton(toggleBtn);
            await this.reRenderView();
            this.openUid = null;
        }

        if (uid && uid !== this.openUid) {
            await this.openRecordFromUrl(state);
        } else if (!uid && this.openUid && mode === VIEW_MODE_INBOX) {
            // Split mode, record closed: the list with an empty panel.
            await this.reRenderView();
            this.openUid = null;
        }

        if (typeof applyCreateFormUrl === 'function') {
            applyCreateFormUrl(state);
        }
    }

    async reRenderView() {
        window.uiDebug?.(TABLE_LOG_START_VIEW_RERENDER);
        
        // Destroy existing DataTable if it exists
        if ($.fn.DataTable && $.fn.DataTable.isDataTable(this.tableElement)) {
            window.uiDebug?.(TABLE_LOG_DESTROYING_DATATABLE);
            $(this.tableElement).DataTable().destroy(true);
        }
        
        // Find the actual container to work with
        // After DataTable.destroy(), the table should be back in its original location
        // But we need to find the right parent to insert the inbox container
        let targetParent = this.tableElement.parentNode;
        
        // If table is still wrapped in DataTables divs, unwrap it
        if (targetParent && targetParent.classList.contains('dt-layout-full')) {
            window.uiDebug?.(TABLE_LOG_FINDING_ORIGINAL_PARENT);
            // Find the original parent (should be the col-md-12 div or similar)
            let current = targetParent;
            while (current.parentNode && current.classList.contains('dt-layout-full')) {
                current = current.parentNode;
            }
            targetParent = current.parentNode || this.originalParent;
            
            // Move table back to original parent
            if (targetParent) {
                window.uiDebug?.(TABLE_LOG_MOVING_TABLE_TO_ORIGINAL_PARENT);
                targetParent.appendChild(this.tableElement);
            }
        }
        
        // Use stored original parent as fallback
        if (!targetParent || targetParent.classList.contains('dt-layout-full')) {
            window.uiDebug?.(TABLE_LOG_USING_ORIGINAL_PARENT_FALLBACK);
            targetParent = this.originalParent;
        }
        
        if (!targetParent) {
            console.error(TABLE_LOG_MISSING_PARENT);
            return;
        }
        
        window.uiDebug?.(TABLE_LOG_USING_PARENT, targetParent.className);
        
        // Find and remove inbox container if it exists
        const existingInboxContainer = targetParent.querySelector(TABLE_SELECTOR_INBOX_VIEW_CONTAINER);
        if (existingInboxContainer) {
            window.uiDebug?.(TABLE_LOG_REMOVING_EXISTING_INBOX);
            existingInboxContainer.remove();
        }
        
        // Ensure table is in the correct parent
        if (this.tableElement.parentNode !== targetParent) {
            window.uiDebug?.(TABLE_LOG_ATTACHING_TABLE_TO_PARENT);
            targetParent.appendChild(this.tableElement);
        }
        
        // Clear the table element and make it visible
        this.tableElement.innerHTML = '';
        this.tableElement.style.display = ''; // Reset display to default
        
        window.uiDebug?.(`${TABLE_LOG_RENDERING_VIEW} ${this.currentViewMode}`);
        
        // Re-render based on current view mode (a full width record uses the split layout, list hidden)
        if (this.currentViewMode === VIEW_MODE_INBOX || this.recordFull) {
            await ensureSummaryComponentTemplate(this.schema);
            renderInboxView(
                this.tableElement,
                this.cache,
                this.dtConfig,
                this.entity,
                this.schema,
                targetParent  // Pass the correct parent
            );
            this.markRecordFull();
        } else {
            // Make sure table is visible and in DOM for table mode
            this.tableElement.style.display = '';
            
            // Ensure table is properly attached before rendering
            if (!this.tableElement.parentNode) {
                targetParent.appendChild(this.tableElement);
            }
            
            window.uiDebug?.(TABLE_LOG_TABLE_VISIBLE, this.tableElement.style.display);
            window.uiDebug?.(TABLE_LOG_TABLE_IN_DOM, !!this.tableElement.parentNode);
            
            renderLazyDataTable(
                this.tableElement, 
                this.cache, 
                this.dtConfig, 
                this.entity
            );
        }
        
        window.uiDebug?.(TABLE_LOG_VIEW_RERENDER_COMPLETE);
        
        // Re-attach bulk action handlers
        if (typeof setupBulkActions === 'function') {
            setupBulkActions(this.entity);
        }
    }

    /** Table mode record: the split layout shows only the record (CSS .inbox-record-full). */
    markRecordFull() {
        this.inboxContainer()?.classList.toggle('inbox-record-full', this.recordFull);
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

    window.uiDebug?.(`${TABLE_LOG_INITIALIZING_TABLE} ${slug}`);
    
    // Fetch schema using API client
    const schemaResponse = await apiClient.get(uiApiUrl(`auth/table/${slug}`));
    
    if (!schemaResponse.success || !schemaResponse.data) {
        removeTableSkeleton(tableElement);
        return showErrorMessage(tableElement, schemaResponse.message || TABLE_MESSAGE_TABLE_SCHEMA_NOT_FOUND);
    }

    const schema = schemaResponse.data;
    // A page can show a table's rows from its own address (e.g. one event's attendees):
    // <table class="lab-table" data-data-url="/events/manage/{uid}/attendees/data">.
    if (tableElement.dataset.dataUrl) {
        schema.data_url = tableElement.dataset.dataUrl;
    }
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

    tableElement.__defaultPageLength = entriesPerPage;

    removeTableSkeleton(tableElement);
    // Render the initial view (URL ?mode, stored preference or default)
    if (viewManager.currentViewMode === VIEW_MODE_INBOX || viewManager.recordFull) {
        await ensureSummaryComponentTemplate(schema);
        renderInboxView(tableElement, cache, mergedConfig, entity, schema);
        viewManager.markRecordFull();
    } else {
        renderLazyDataTable(tableElement, cache, mergedConfig, entity);
    }

    // The URL shows the mode in use (a stored preference too), then opens
    // what it names: a record (reload, shared link) or the create form.
    viewManager.writeModeToUrl(viewManager.currentViewMode);
    const urlState = typeof parseTableUrl === 'function' ? parseTableUrl() : null;
    if (viewManager.urlRecordUid(urlState)) {
        await viewManager.openRecordFromUrl(urlState);
    } else if (urlState?.action === 'create' && typeof applyCreateFormUrl === 'function') {
        applyCreateFormUrl(urlState);
    }

    // Listen for view mode changes to clear selections
    document.addEventListener('viewModeChanged', function(e) {
        if (e.detail && e.detail.entity === entity) {
            window.uiDebug?.(TABLE_LOG_VIEW_MODE_SELECTION_CLEAR);
            if (window.bulkActionsManager) {
                window.bulkActionsManager.clearAllSelections();
            }
        }
    });
}

// ---------------------------
// 🌐 API HELPERS (Using API Client with response_schema)
// ---------------------------
