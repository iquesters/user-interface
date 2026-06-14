/**
 * table.js
 *
 * Main table orchestration entrypoint.
 * Heavy implementations are split into focused files under `public/js/table/`,
 * but startup and top-level shared exports live here.
 */

function registerTableGlobals() {
    window.loadInboxDetailComponent = loadDetailComponent;
    window.openInboxDetailInPreferredMode = openDetailInPreferredMode;
    window.syncInboxSummaryRow = syncInboxSummaryRow;
    window.clearLabTableCache = clearTableCache;
    window.initLabTable = initLabTable;
}

async function initializeLabTables() {
    console.log('📄 DOM Ready - Initializing tables from main entry.', {
        tableSelector: TABLE_SELECTOR_LAB_TABLE,
    });

    if (typeof apiClient === 'undefined') {
        console.error('❌ API Client not loaded in table.js entrypoint.');
        showAuthWarning();
        return;
    }

    document.querySelectorAll(TABLE_SELECTOR_LAB_TABLE).forEach(initLabTable);
}

registerTableGlobals();

document.addEventListener("DOMContentLoaded", initializeLabTables);
