function clearInboxRowSelection(tableElement) {
    if (!tableElement) {
        return;
    }

    tableElement.querySelectorAll('tbody tr.bg-primary-subtle').forEach((row) => {
        row.classList.remove('bg-primary-subtle');
        row.querySelectorAll('td, th').forEach((cell) => {
            cell.classList.remove('bg-primary-subtle');
        });
    });
}

function setInboxRowSelection(rowElement) {
    if (!rowElement) {
        return;
    }

    const tableElement = rowElement.closest('table');
    clearInboxRowSelection(tableElement);

    rowElement.classList.add('bg-primary-subtle');
    rowElement.querySelectorAll('td, th').forEach((cell) => {
        cell.classList.add('bg-primary-subtle');
    });
}

function styleInboxRows(tableElement) {
    if (!tableElement) {
        return;
    }

    tableElement.querySelectorAll('thead tr').forEach((row) => {
        row.classList.add('border-bottom', 'border-2', 'border-light-subtle');
        row.querySelectorAll('th, td').forEach((cell) => {
            cell.classList.add('border-bottom', 'border-light-subtle');
        });
    });

    tableElement.querySelectorAll('tbody tr').forEach((row) => {
        row.classList.add('border-bottom', 'border-2', 'border-light-subtle');
        row.querySelectorAll('td, th').forEach((cell) => {
            cell.classList.add('border-bottom', 'border-light-subtle');
        });
    });
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
    container.style.cssText = 'display: flex !important; height: 100%; min-height: 0; position: relative;';
    
    console.log('📦 Created inbox container');
    
    // Left panel (list view) - flex container with flex-column
    const leftPanel = document.createElement('div');
    leftPanel.className = 'inbox-left-panel p-1 d-flex flex-column border-end';
    leftPanel.style.overflow = 'hidden';
    leftPanel.style.width = `${DEFAULT_LEFT_PANEL_WIDTH}%`;
    
    // Resizer
    const resizer = document.createElement('div');
    resizer.className = 'inbox-resizer bg-light border-start border-end border-light-subtle';
    resizer.style.cssText = `
        width: 2px;
        cursor: col-resize;
        user-select: none;
        transition: background-color 0.15s ease, border-color 0.15s ease;
    `;
    resizer.title = 'Drag to resize';
    
    // Right panel (detail view)
    const rightPanelEle = document.createElement('div');
    rightPanelEle.className = 'inbox-right-panel';
    rightPanelEle.style.cssText = `flex: 1; overflow: auto;`;
    rightPanelEle.innerHTML = `<div class="text-center text-muted py-5">${TABLE_MESSAGE_EMPTY_DETAIL}</div>`;
    
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
    listTable.__sourceTable = tableElement;
    listTable.className = `table table-bordered table-hover ${TABLE_SELECTOR_INBOX_LIST.slice(1)}`;
    listTable.style.cssText = 'margin: 0; cursor: pointer; width: 100%;';
    
    // Format entity name nicely
    const formattedEntityName = entityName
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    listTable.innerHTML = `
        <thead>
            <tr>
                <th class="checkbox-column">
                    <input type="checkbox" id="${TABLE_ID_SELECT_ALL_INBOX}" style="cursor: pointer;">
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
            render: (row) => `<input type="checkbox" class="${TABLE_SELECTOR_ROW_CHECKBOX.slice(1)}" data-uid="${row.uid || row.id}" style="cursor: pointer;">`
        },
        {
            data: null,
            orderable: false,
            render: (row) => renderInboxRow(row, columns, schema)
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
            info: false,
            className: 'bg-primary bg-opacity-10'
        },
        ajax: (params, callback) =>
            handleAjaxFetch(params, callback, cache, entityName, listTable, schema),
        initComplete: function (...args) {
            if (typeof dtConfig.initComplete === 'function') {
                dtConfig.initComplete.apply(this, args);
            }

            styleInboxRows(listTable);
            applyInboxStickyStyles(leftPanel);
            initializeInboxSummaryComponents(listTable);
        },
        drawCallback: function (...args) {
            if (typeof dtConfig.drawCallback === 'function') {
                dtConfig.drawCallback.apply(this, args);
            }

            styleInboxRows(listTable);
            applyInboxStickyStyles(leftPanel);
            initializeInboxSummaryComponents(listTable);
        },
    });

    styleInboxRows(listTable);
    applyInboxStickyStyles(leftPanel);
    initializeInboxSummaryComponents(listTable);

    // Setup resizer
    setupResizer(resizer, leftPanel, rightPanelEle, container);

    // Setup checkbox handlers
    setupCheckboxHandlers(listTable, true);

    console.log(`✅ Inbox view ready for: ${entityName}`);

    // Handle row selection
    $(listTable).on('click', 'tbody tr', function(e) {
        // Don't trigger if clicking checkbox
        if ($(e.target).hasClass(TABLE_SELECTOR_ROW_CHECKBOX.slice(1)) || $(e.target).closest('.checkbox-column').length) {
            return;
        }

        if (!confirmDetailReplacement(rightPanelEle)) {
            return;
        }
        
        const data = dt.row(this).data();
        if (data) {
            loadDetailComponent(rightPanelEle, schema, data);
            setInboxRowSelection(this);
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
    dtContainer.style.minHeight = '0';
    leftPanel.style.height = '100%';
    leftPanel.style.minHeight = '0';
    
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
            row.classList.add('flex-shrink-0', 'sticky-top', 'z-3', 'border-bottom');
            console.log(`✅ Styled top controls at row ${index}`);
        }
        
        // Table row: Contains the actual table
        else if (hasTable) {
            row.style.setProperty('--bs-gutter-x', '0');
            row.style.marginLeft = '0';
            row.style.marginRight = '0';
            row.style.flex = '1 1 auto';
            row.style.overflow = 'hidden';
            row.style.minHeight = '0';
            row.style.height = '0';
            row.style.position = 'relative';
            row.classList.add('border-top', 'border-bottom');

            const tableCell = row.querySelector('.dt-layout-cell, .dt-layout-full');
            if (tableCell) {
                let scrollFrame = row.querySelector('.inbox-scroll-frame');
                if (!scrollFrame) {
                    scrollFrame = document.createElement('div');
                    scrollFrame.className = 'inbox-scroll-frame';
                    scrollFrame.style.display = 'flex';
                    scrollFrame.style.flexDirection = 'column';
                    scrollFrame.style.flex = '1 1 auto';
                    scrollFrame.style.height = '100%';
                    scrollFrame.style.minHeight = '0';
                    scrollFrame.style.overflowX = 'auto';
                    scrollFrame.style.overflowY = 'scroll';
                    scrollFrame.style.scrollbarGutter = 'stable';
                    row.appendChild(scrollFrame);
                }

                if (tableCell.parentElement !== scrollFrame) {
                    scrollFrame.appendChild(tableCell);
                }

                tableCell.style.display = 'flex';
                tableCell.style.flexDirection = 'column';
                tableCell.style.flex = '1 1 auto';
                tableCell.style.height = '100%';
                tableCell.style.minHeight = '0';
                tableCell.style.overflow = 'visible';
                tableCell.style.paddingLeft = '0';
                tableCell.style.paddingRight = '0';
            }
            
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
            row.classList.add('flex-shrink-0', 'position-sticky', 'bottom-0', 'z-3', 'border-top');
            console.log(`✅ Styled bottom pagination at row ${index}`);
        }
    });
    
    applyCompactDataTableControls(dtContainer);

    console.log('✅ Sticky styles application complete');
}

function applyTableModeLayout(tableElement) {
    const shell = tableElement.closest(TABLE_SELECTOR_LAB_TABLE_SHELL);
    if (!shell) {
        return;
    }

    const dtContainer = shell.querySelector('.dt-container');
    if (!dtContainer) {
        return;
    }

    shell.classList.add('overflow-hidden');
    shell.style.minHeight = '0';

    dtContainer.classList.add('d-flex', 'flex-column', 'overflow-hidden');
    dtContainer.classList.remove('h-auto');
    dtContainer.classList.add('flex-grow-1');
    dtContainer.style.height = '100%';
    dtContainer.style.minHeight = '0';

    const layoutRows = Array.from(dtContainer.children).filter((element) =>
        element.classList.contains('dt-layout-row') || element.classList.contains('dt-layout-table')
    );

    layoutRows.forEach((row) => {
        const hasSearch = row.querySelector('.dt-search, input[type="search"]');
        const hasLength = row.querySelector('.dt-length, select');
        const hasTable = row.querySelector('table');
        const hasPagination = row.querySelector('.dt-paging, .dataTables_paginate');
        const hasInfo = row.querySelector('.dt-info, .dataTables_info');

        if ((hasSearch || hasLength) && !hasTable) {
            row.classList.add('flex-shrink-0');
            return;
        }

        if (hasTable) {
            row.style.setProperty('--bs-gutter-x', '0');
            row.style.marginLeft = '0';
            row.style.marginRight = '0';
            row.classList.add('d-flex', 'flex-column', 'flex-grow-1', 'overflow-hidden');
            row.style.minHeight = '0';

            const tableCell = row.querySelector('.dt-layout-cell');
            if (tableCell) {
                tableCell.classList.add('d-flex', 'flex-column', 'flex-grow-1', 'overflow-hidden');
                tableCell.style.height = '100%';
                tableCell.style.minHeight = '0';
                tableCell.style.paddingLeft = '0';
                tableCell.style.paddingRight = '0';
            }

            const scrollHost = row.querySelector('.table-responsive')
                || row.querySelector('.dt-scroll-body')
                || tableElement.parentElement;

            if (scrollHost) {
                scrollHost.classList.add('flex-grow-1');
                scrollHost.style.height = '100%';
                scrollHost.style.minHeight = '0';
                scrollHost.style.overflowX = 'auto';
                scrollHost.style.overflowY = 'scroll';
                scrollHost.style.scrollbarGutter = 'stable';
            }

            const thead = row.querySelector('thead');
            if (thead) {
                thead.style.position = 'sticky';
                thead.style.top = '0';
                thead.style.zIndex = '10';
                thead.style.background = 'inherit';
            }

            return;
        }

        if (hasPagination || hasInfo) {
            row.classList.add('flex-shrink-0');
        }
    });

    applyCompactDataTableControls(dtContainer);
}

