function executeComponentScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function setupResizer(resizer, leftPanel, rightPanel, container) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    const setResizerState = (isActive) => {
        resizer.classList.toggle('bg-info', isActive);
        resizer.classList.toggle('border-info', isActive);
        resizer.classList.toggle('bg-light', !isActive);
        resizer.classList.toggle('border-light-subtle', !isActive);
    };

    setResizerState(false);

    resizer.addEventListener('mouseenter', () => {
        if (!isResizing) {
            setResizerState(true);
        }
    });

    resizer.addEventListener('mouseleave', () => {
        if (!isResizing) {
            setResizerState(false);
        }
    });
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        setResizerState(true);
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
            setResizerState(resizer.matches(':hover'));
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
    checkboxTh.innerHTML = `<input type="checkbox" id="${TABLE_ID_SELECT_ALL}" style="cursor: pointer;">`;
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
        render: (row) => `<input type="checkbox" class="${TABLE_SELECTOR_ROW_CHECKBOX.slice(1)}" data-uid="${row.uid || row.id}" style="cursor: pointer;">`
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
        initComplete: function (...args) {
            if (typeof dtConfig.initComplete === 'function') {
                dtConfig.initComplete.apply(this, args);
            }

            applyTableModeLayout(tableElement);
        },
        drawCallback: function (...args) {
            if (typeof dtConfig.drawCallback === 'function') {
                dtConfig.drawCallback.apply(this, args);
            }

            applyTableModeLayout(tableElement);
        },
    });

    applyTableModeLayout(tableElement);

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
async function handleAjaxFetch(params, callback, cache, entityName, tableElement, schema = null) {
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
            prefetchNextBatch(cache, entityName, start, length, schema);
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
            prefetchNextBatch(cache, entityName, start, length, schema);
        }
    } else {
        callback({
            draw: params.draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
        });
        showErrorMessage(tableElement, result.message || TABLE_MESSAGE_FAILED_LOAD_DATA);
    }
}

// ---------------------------
// 🔮 PREDICTIVE PREFETCH
// ---------------------------
async function prefetchNextBatch(cache, entityName, currentStart, currentLength, schema = null) {
    const nextOffset = currentStart + currentLength;
    const prefetchKey = `${entityName}-${nextOffset}`;

    if (cache.prefetchPromises.has(prefetchKey)) return;
    if (nextOffset >= cache.total) return;
    if (cache.hasRange(nextOffset, currentLength)) return;

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

    if (tableElement.classList.contains(TABLE_SELECTOR_INBOX_LIST.slice(1))) {
        tbody.innerHTML = `
            <tr class="border-bottom border-2 border-light-subtle">
                <td class="checkbox-column border-bottom border-light-subtle"></td>
                <td class="border-bottom border-light-subtle">
                    <div class="d-flex justify-content-center align-items-center gap-2 text-muted py-4">
                        <div class="spinner-border spinner-border-sm" role="status"></div>
                        <span>${TABLE_MESSAGE_LOADING}</span>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="100%" class="text-center py-4">
                <div class="d-flex justify-content-center align-items-center gap-2 text-muted">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                    <span>${TABLE_MESSAGE_LOADING}</span>
                </div>
            </td>
        </tr>`;
}

function showAuthWarning() {
    document.querySelectorAll(TABLE_SELECTOR_LAB_TABLE).forEach(t => {
        removeTableSkeleton(t);
        t.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">
                <div class="alert alert-warning">
                    <h5>${TABLE_MESSAGE_AUTH_REQUIRED}</h5>
                    <p>${TABLE_MESSAGE_LOGIN_REQUIRED}</p>
                    <a href="${TABLE_ROUTE_LOGIN}" class="btn btn-primary">Login</a>
                </div>
            </td>
        </tr>`;
    });
}

function showErrorMessage(table, msg) {
    removeTableSkeleton(table);
    table.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">${msg}</td></tr>`;
}

// ---------------------------
// ✅ CHECKBOX HANDLERS
// ---------------------------
function setupCheckboxHandlers(tableElement, isInboxView = false) {
    const selectAllId = isInboxView ? TABLE_ID_SELECT_ALL_INBOX : TABLE_ID_SELECT_ALL;
    const selectAllCheckbox = document.getElementById(selectAllId);
    
    if (!selectAllCheckbox) return;
    
    // Select/Deselect all
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = tableElement.querySelectorAll(TABLE_SELECTOR_ROW_CHECKBOX);
        checkboxes.forEach(cb => {
            cb.checked = this.checked;
        });
        updateSelectionCount(tableElement);
    });
    
    // Handle individual checkbox changes
    $(tableElement).on('change', TABLE_SELECTOR_ROW_CHECKBOX, function() {
        const allCheckboxes = tableElement.querySelectorAll(TABLE_SELECTOR_ROW_CHECKBOX);
        const checkedCount = tableElement.querySelectorAll(`${TABLE_SELECTOR_ROW_CHECKBOX}:checked`).length;
        
        selectAllCheckbox.checked = checkedCount === allCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < allCheckboxes.length;
        
        updateSelectionCount(tableElement);
    });
    
    // Also listen for clicks on the checkbox itself (for when it's clicked directly)
    $(tableElement).on('click', TABLE_SELECTOR_ROW_CHECKBOX, function(e) {
        // Small delay to allow the checkbox state to update
        setTimeout(() => {
            updateSelectionCount(tableElement);
        }, 10);
    });
}

function updateSelectionCount(tableElement) {
    const checkedBoxes = tableElement.querySelectorAll(`${TABLE_SELECTOR_ROW_CHECKBOX}:checked`);
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
    const checkedBoxes = tableElement.querySelectorAll(`${TABLE_SELECTOR_ROW_CHECKBOX}:checked`);
    return Array.from(checkedBoxes).map(cb => cb.dataset.uid);
}

