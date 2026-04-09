/**
 * bulk-actions.js — Bulk Actions Handler for DataTables
 * ✅ Handles selection tracking across multiple tables
 * ✅ Provides bulk operations (edit, delete, export, etc.)
 * ✅ Integrates with header UI (no separate bar)
 * ✅ Shows/hides select hint based on selection
 */

// ---------------------------
// 🎯 BULK ACTIONS MANAGER
// ---------------------------

class BulkActionsManager {
    constructor() {
        this.selectedUids = new Set();
        this.bulkActionsContainer = null;
        this.selectionCountBadge = null;
        this.selectHint = null;
        this.clearSelectionBtn = null;
        this.refreshBtn = null;
        this.initialized = false;
        this.currentEntity = null;
    }

    /**
     * Initialize bulk actions UI and handlers
     */
    init(entityName = null) {
        if (this.initialized) {
            console.warn('⚠️ Bulk actions already initialized');
            return;
        }

        console.log('🎯 Initializing bulk actions');
        
        this.currentEntity = entityName;

        // Get new header elements
        this.bulkActionsContainer = document.getElementById('bulkActionsContainer');
        this.selectionCountBadge = document.getElementById('selectionCount');
        this.selectHint = document.getElementById('selectHint');
        this.clearSelectionBtn = document.getElementById('bulkClearSelectionBtn');
        this.refreshBtn = document.getElementById('refreshTableBtn');

        if (!this.bulkActionsContainer) {
            console.warn('⚠️ Bulk actions container not found in DOM');
            return;
        }

        // Listen for selection changes
        document.addEventListener('rowSelectionChanged', (e) => {
            console.log('📢 Selection changed event received:', e.detail);
            this.handleSelectionChange(e.detail);
        });

        window.addEventListener('rowSelectionChanged', (e) => {
            console.log('📢 Selection changed event received on window:', e.detail);
            this.handleSelectionChange(e.detail);
        });

        // Setup refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshTables();
            });
        }

        // Setup clear selection button
        if (this.clearSelectionBtn) {
            this.clearSelectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllSelections();
            });
        }

        // Setup all button handlers
        this.setupEventHandlers();

        // Check for any pre-selected rows on init
        setTimeout(() => {
            this.checkForExistingSelections();
        }, 500);

        this.initialized = true;
        console.log('✅ Bulk actions initialized');
    }

    /**
     * Check for any pre-selected rows when initializing
     */
    checkForExistingSelections() {
        const selectedUids = this.getSelectedUids();
        if (selectedUids.length > 0) {
            console.log('📋 Found existing selections:', selectedUids.length);
            this.handleSelectionChange({ 
                count: selectedUids.length, 
                uids: selectedUids 
            });
        }
    }

    /**
     * Setup event handlers for all bulk action buttons
     */
    setupEventHandlers() {
        const handlers = {
            'bulkEditBtn': () => this.handleEdit(),
            'bulkDeleteBtn': () => this.handleDelete(),
            'bulkExportBtn': () => this.handleExport(),
            'bulkArchiveBtn': () => this.handleArchive(),
            'bulkDuplicateBtn': () => this.handleDuplicate()
        };

        Object.entries(handlers).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });
    }

    /**
     * Handle selection change event
     */
    handleSelectionChange(detail) {
        const { count, uids } = detail;
        
        // Update internal tracking
        this.selectedUids = new Set(uids);
        
        // Update UI
        this.updateUI(count);
    }

    /**
     * Update bulk actions UI based on selection count
     */
    updateUI(count) {
        if (!this.bulkActionsContainer || !this.selectionCountBadge || !this.selectHint || !this.clearSelectionBtn) return;

        if (count > 0) {
            // Show bulk actions, count badge, and clear button
            this.bulkActionsContainer.classList.remove('d-none');
            this.selectionCountBadge.classList.remove('d-none');
            this.clearSelectionBtn.classList.remove('d-none');
             
            // Hide select hint
            this.selectHint.classList.add('d-none');

            const countSpan = this.selectionCountBadge.querySelector('.selected-count');
            if (countSpan) {
                countSpan.textContent = count;
            } else {
                this.selectionCountBadge.textContent = `${count} Selected`;
            }
        } else {
            // Hide bulk actions, count badge, and clear button
            this.bulkActionsContainer.classList.add('d-none');
            this.selectionCountBadge.classList.add('d-none');
            this.clearSelectionBtn.classList.add('d-none');
             
            // Show select hint
            this.selectHint.classList.remove('d-none');

            const countSpan = this.selectionCountBadge.querySelector('.selected-count');
            if (countSpan) {
                countSpan.textContent = '0';
            }
             
            // Clear selected UIDs
            this.selectedUids.clear();
        }
    }

    /**
     * Get all selected row UIDs from all tables on the page
     */
    getSelectedUids() {
        const allSelectedUids = [];
        
        // Get from regular tables
        document.querySelectorAll('.lab-table').forEach(table => {
            const checkboxes = table.querySelectorAll('.row-checkbox:checked');
            const uids = Array.from(checkboxes).map(cb => cb.dataset.uid);
            allSelectedUids.push(...uids);
        });
        
        // Get from inbox view tables
        document.querySelectorAll('.inbox-list-table').forEach(table => {
            const checkboxes = table.querySelectorAll('.row-checkbox:checked');
            const uids = Array.from(checkboxes).map(cb => cb.dataset.uid);
            allSelectedUids.push(...uids);
        });
        
        // Remove duplicates and return
        return [...new Set(allSelectedUids)];
    }

    /**
     * Validate selection
     */
    validateSelection() {
        const selectedUids = this.getSelectedUids();
        
        if (selectedUids.length === 0) {
            this.showToast('Please select at least one item', 'warning');
            return null;
        }
        
        return selectedUids;
    }

    /**
     * Set button loading state
     */
    setButtonLoading(buttonId, isLoading) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
            delete btn.dataset.originalHtml;
        }
    }

    /**
     * Refresh all tables
     */
    refreshTables() {
        if (this.refreshBtn) {
            this.refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.refreshBtn.disabled = true;
        }

        const reloadTable = (element) => {
            if (!$.fn.DataTable.isDataTable(element)) {
                return;
            }

            if (typeof window.clearLabTableCache === 'function') {
                window.clearLabTableCache(element);
            }

            $(element).DataTable().ajax.reload(null, false);
        };

        document.querySelectorAll('.lab-table').forEach((table) => {
            reloadTable(table);
        });

        document.querySelectorAll('.inbox-list-table').forEach((table) => {
            reloadTable(table);
        });

        this.clearAllSelections();

        setTimeout(() => {
            if (this.refreshBtn) {
                this.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                this.refreshBtn.disabled = false;
            }
        }, 500);
    }

    // ---------------------------
    // 🔧 ACTION HANDLERS
    // ---------------------------

    /**
     * Bulk Edit Handler
     */
    async handleEdit() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('📝 Bulk editing:', selectedUids);
        this.showToast(`Ready to edit ${selectedUids.length} item(s)`, 'info');
    }

    /**
     * Bulk Delete Handler
     */
    async handleDelete() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        // Confirm deletion
        const confirmed = confirm(
            `⚠️ Are you sure you want to delete ${selectedUids.length} item(s)?\n\n` +
            `This action cannot be undone.`
        );
        
        if (!confirmed) return;

        console.log('🗑️ Bulk deleting:', selectedUids);
        
        try {
            this.setButtonLoading('bulkDeleteBtn', true);
            
            // TODO: Replace with your actual API endpoint
            const response = await apiClient.post('/api/bulk-delete', {
                uids: selectedUids
            });
            
            if (response.success) {
                this.showToast(`Successfully deleted ${selectedUids.length} item(s)`, 'success');
                this.refreshTables();
                this.clearAllSelections();
            } else {
                this.showToast(response.message || 'Failed to delete items', 'error');
            }
            
        } catch (error) {
            console.error('❌ Bulk delete error:', error);
            this.showToast('An error occurred during deletion', 'error');
        } finally {
            this.setButtonLoading('bulkDeleteBtn', false);
        }
    }

    /**
     * Bulk Export Handler
     */
    async handleExport() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('📥 Bulk exporting:', selectedUids);
        
        try {
            this.setButtonLoading('bulkExportBtn', true);
            
            // TODO: Replace with your actual API endpoint
            const response = await apiClient.post('/api/bulk-export', {
                uids: selectedUids,
                format: 'csv'
            });
            
            if (response.success && response.data?.download_url) {
                window.location.href = response.data.download_url;
                this.showToast(`Exporting ${selectedUids.length} item(s)`, 'success');
            } else {
                this.showToast(response.message || 'Failed to export items', 'error');
            }
            
        } catch (error) {
            console.error('❌ Bulk export error:', error);
            this.showToast('An error occurred during export', 'error');
        } finally {
            this.setButtonLoading('bulkExportBtn', false);
        }
    }

    /**
     * Bulk Archive Handler
     */
    async handleArchive() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('📦 Bulk archiving:', selectedUids);
        
        try {
            const response = await apiClient.post('/api/bulk-archive', {
                uids: selectedUids
            });
            
            if (response.success) {
                this.showToast(`Successfully archived ${selectedUids.length} item(s)`, 'success');
                this.refreshTables();
                this.clearAllSelections();
            } else {
                this.showToast(response.message || 'Failed to archive items', 'error');
            }
        } catch (error) {
            console.error('❌ Bulk archive error:', error);
            this.showToast('An error occurred', 'error');
        }
    }

    /**
     * Bulk Duplicate Handler
     */
    async handleDuplicate() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('📋 Bulk duplicating:', selectedUids);
        
        try {
            const response = await apiClient.post('/api/bulk-duplicate', {
                uids: selectedUids
            });
            
            if (response.success) {
                this.showToast(`Successfully duplicated ${selectedUids.length} item(s)`, 'success');
                this.refreshTables();
                this.clearAllSelections();
            } else {
                this.showToast(response.message || 'Failed to duplicate items', 'error');
            }
        } catch (error) {
            console.error('❌ Bulk duplicate error:', error);
            this.showToast('An error occurred', 'error');
        }
    }

    /**
     * Bulk Status Change Handler
     */
    async handleStatusChange(status) {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('🔄 Bulk status change:', selectedUids, 'to', status);
        
        try {
            const response = await apiClient.post('/api/bulk-status', {
                uids: selectedUids,
                status: status
            });
            
            if (response.success) {
                this.showToast(`Successfully updated status for ${selectedUids.length} item(s)`, 'success');
                this.refreshTables();
                this.clearAllSelections();
            } else {
                this.showToast(response.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('❌ Bulk status change error:', error);
            this.showToast('An error occurred', 'error');
        }
    }

    /**
     * Bulk Assign Handler
     */
    async handleAssign(assignTo) {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        console.log('👤 Bulk assigning:', selectedUids, 'to', assignTo);
        
        try {
            const response = await apiClient.post('/api/bulk-assign', {
                uids: selectedUids,
                assign_to: assignTo
            });
            
            if (response.success) {
                this.showToast(`Successfully assigned ${selectedUids.length} item(s)`, 'success');
                this.refreshTables();
                this.clearAllSelections();
            } else {
                this.showToast(response.message || 'Failed to assign items', 'error');
            }
        } catch (error) {
            console.error('❌ Bulk assign error:', error);
            this.showToast('An error occurred', 'error');
        }
    }

    /**
     * Show assign modal (placeholder)
     */
    showAssignModal() {
        // TODO: Implement user selection modal
        const email = prompt('Enter email address to assign to:');
        if (email) {
            this.handleAssign(email);
        }
    }

    /**
     * Mark as read handler
     */
    handleMarkAsRead() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;
        this.showToast(`Marked ${selectedUids.length} item(s) as read`, 'info');
    }

    /**
     * Mark as unread handler
     */
    handleMarkAsUnread() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;
        this.showToast(`Marked ${selectedUids.length} item(s) as unread`, 'info');
    }

    /**
     * Add star handler
     */
    handleStar() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;
        this.showToast(`Added star to ${selectedUids.length} item(s)`, 'info');
    }

    /**
     * Remove star handler
     */
    handleRemoveStar() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;
        this.showToast(`Removed star from ${selectedUids.length} item(s)`, 'info');
    }

    /**
     * Report spam handler
     */
    handleSpam() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;
        this.showToast(`Reported ${selectedUids.length} item(s) as spam`, 'info');
    }

    /**
     * Clear all selections across all tables
     */
    clearAllSelections() {
        // Clear regular table checkboxes
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.checked = false;
        });
        
        // Clear select-all checkboxes
        document.querySelectorAll('#select-all-table, #select-all-inbox').forEach(cb => {
            cb.checked = false;
            cb.indeterminate = false;
        });
        
        // Update UI
        this.updateUI(0);
        
        console.log('✨ Selection cleared');
    }

    // ---------------------------
    // 🛠️ UTILITY METHODS
    // ---------------------------

    /**
     * Simple toast notification helper
     */
    showToast(message, type = 'info') {
        // Check if apiClient has toast support
        if (typeof apiClient !== 'undefined' && apiClient.showToast) {
            apiClient.showToast(message, type);
            return;
        }

        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ---------------------------
// 🌍 GLOBAL INSTANCE
// ---------------------------

// Create singleton instance
const bulkActionsManager = new BulkActionsManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Get entity name from the page
        const entityElement = document.querySelector('h5.fs-6');
        const entityName = entityElement ? entityElement.textContent.replace('List view of ', '').trim() : null;
        bulkActionsManager.init(entityName);
    });
} else {
    // DOM already loaded
    const entityElement = document.querySelector('h5.fs-6');
    const entityName = entityElement ? entityElement.textContent.replace('List view of ', '').trim() : null;
    bulkActionsManager.init(entityName);
}

// Export for external access if needed
window.bulkActionsManager = bulkActionsManager;
