/**
 * bulk-actions.js — Bulk Actions Handler for DataTables
 * ✅ Handles selection tracking across multiple tables
 * ✅ Provides bulk operations (edit, delete, export, etc.)
 * ✅ Integrates with API client
 * ✅ Works with both table and inbox views
 */

// ---------------------------
// 🎯 BULK ACTIONS MANAGER
// ---------------------------

class BulkActionsManager {
    constructor() {
        this.selectedUids = new Set();
        this.bulkActionsBar = null;
        this.selectionCountEl = null;
        this.initialized = false;
    }

    /**
     * Initialize bulk actions UI and handlers
     */
    init() {
        if (this.initialized) {
            console.warn('⚠️ Bulk actions already initialized');
            return;
        }

        console.log('🎯 Initializing bulk actions');

        this.bulkActionsBar = document.getElementById('bulkActionsBar');
        this.selectionCountEl = document.getElementById('selectionCount');

        if (!this.bulkActionsBar) {
            console.warn('⚠️ Bulk actions bar not found in DOM');
            return;
        }

        // Listen for selection changes on both document and individual tables
        document.addEventListener('rowSelectionChanged', (e) => {
            console.log('📢 Selection changed event received:', e.detail);
            this.handleSelectionChange(e.detail);
        });

        // Also listen on window for good measure
        window.addEventListener('rowSelectionChanged', (e) => {
            console.log('📢 Selection changed event received on window:', e.detail);
            this.handleSelectionChange(e.detail);
        });

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
            'bulkDuplicateBtn': () => this.handleDuplicate(),
            'bulkStatusBtn': () => this.handleStatusChange(),
            'bulkAssignBtn': () => this.handleAssign(),
            'bulkClearSelectionBtn': () => this.clearAllSelections()
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
        if (!this.bulkActionsBar || !this.selectionCountEl) return;

        if (count > 0) {
            // Show the bar with animation
            this.bulkActionsBar.style.display = 'block';
            this.selectionCountEl.textContent = `${count} selected`;
            
            // Optional: Add animation on first show
            if (!this.bulkActionsBar.classList.contains('shown')) {
                this.bulkActionsBar.classList.add('shown');
                this.bulkActionsBar.style.animation = 'fadeIn 0.3s ease-in';
            }
        } else {
            // Hide the bar
            this.bulkActionsBar.style.display = 'none';
            this.bulkActionsBar.classList.remove('shown');
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
    setButtonLoading(buttonId, isLoading, loadingText = 'Processing...') {
        const btn = document.getElementById(buttonId);
        if (!btn) return;

        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
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
        // Refresh regular tables
        $('.lab-table').each(function() {
            const dt = $(this).DataTable();
            if (dt) dt.ajax.reload(null, false); // false = stay on current page
        });
        
        // Refresh inbox tables
        $('.inbox-list-table').each(function() {
            const dt = $(this).DataTable();
            if (dt) dt.ajax.reload(null, false);
        });
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
        
        // TODO: Implement your bulk edit logic here
        // Option 1: Open a modal with bulk edit form
        // Option 2: Redirect to bulk edit page
        // Option 3: Show inline edit interface
        
        this.showToast(`Ready to edit ${selectedUids.length} item(s)`, 'info');
        
        // Example: Redirect to bulk edit page
        // window.location.href = `/bulk-edit?uids=${selectedUids.join(',')}`;
        
        // Example: Open modal (if you have a modal function)
        // openBulkEditModal(selectedUids);
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
            this.setButtonLoading('bulkDeleteBtn', true, 'Deleting...');
            
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
            this.setButtonLoading('bulkExportBtn', true, 'Exporting...');
            
            // TODO: Replace with your actual API endpoint
            const response = await apiClient.post('/api/bulk-export', {
                uids: selectedUids,
                format: 'csv' // or 'xlsx', 'pdf', etc.
            });
            
            if (response.success && response.data?.download_url) {
                // Download the file
                window.location.href = response.data.download_url;
                this.showToast(`Exporting ${selectedUids.length} item(s)`, 'success');
            } else if (response.success && response.data?.file_content) {
                // Handle direct file content
                this.downloadFile(response.data.file_content, response.data.filename || 'export.csv');
                this.showToast(`Exported ${selectedUids.length} item(s)`, 'success');
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
            // TODO: Replace with your actual API endpoint
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
    async handleStatusChange() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        // TODO: Replace prompt with a proper modal/select component
        const newStatus = prompt('Enter new status (e.g., active, inactive, pending):');
        
        if (!newStatus) return;

        console.log('🔄 Bulk status change:', selectedUids, 'to', newStatus);
        
        try {
            const response = await apiClient.post('/api/bulk-status', {
                uids: selectedUids,
                status: newStatus
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
    async handleAssign() {
        const selectedUids = this.validateSelection();
        if (!selectedUids) return;

        // TODO: Replace prompt with a proper user selection modal
        const assignTo = prompt('Enter user ID or email to assign to:');
        
        if (!assignTo) return;

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
     * Download file helper
     */
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Simple toast notification helper
     */
    showToast(message, type = 'info') {
        // Check if apiClient has toast support
        if (typeof apiClient !== 'undefined' && apiClient.showToast) {
            apiClient.showToast(message, type);
            return;
        }

        // Fallback: console log
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // TODO: Integrate with your toast library
        // Examples:
        
        // Bootstrap 5 Toast:
        /*
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        const toastContainer = document.getElementById('toastContainer') || createToastContainer();
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        */
        
        // Or use alert as simple fallback
        // alert(message);
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
        bulkActionsManager.init();
    });
} else {
    // DOM already loaded
    bulkActionsManager.init();
}

// Export for external access if needed
window.bulkActionsManager = bulkActionsManager;