function clearInboxRowSelection(tableElement) {
    if (!tableElement) {
        return;
    }

    tableElement.querySelectorAll(TABLE_SELECTOR_SELECTED_ROW).forEach((row) => {
        row.classList.remove(TABLE_CLASS_BG_PRIMARY_SUBTLE);
        row.querySelectorAll(TABLE_SELECTOR_TABLE_CELLS).forEach((cell) => {
            cell.classList.remove(TABLE_CLASS_BG_PRIMARY_SUBTLE);
        });
    });
}

function syncInboxRowSelection(tableElement) {
    if (!tableElement) {
        return;
    }

    clearInboxRowSelection(tableElement);

    tableElement.querySelectorAll(`${TABLE_SELECTOR_ROW_CHECKBOX}:checked`).forEach((checkbox) => {
        const rowElement = checkbox.closest('tr');

        if (!rowElement) {
            return;
        }

        rowElement.classList.add(TABLE_CLASS_BG_PRIMARY_SUBTLE);
        rowElement.querySelectorAll(TABLE_SELECTOR_TABLE_CELLS).forEach((cell) => {
            cell.classList.add(TABLE_CLASS_BG_PRIMARY_SUBTLE);
        });
    });
}

function setInboxRowSelection(rowElement) {
    if (!rowElement) {
        return;
    }

    const tableElement = rowElement.closest(TABLE_SELECTOR_TABLE);
    clearInboxRowSelection(tableElement);

    rowElement.classList.add(TABLE_CLASS_BG_PRIMARY_SUBTLE);
    rowElement.querySelectorAll(TABLE_SELECTOR_TABLE_CELLS).forEach((cell) => {
        cell.classList.add(TABLE_CLASS_BG_PRIMARY_SUBTLE);
    });
}

function styleInboxRows(tableElement) {
    if (!tableElement) {
        return;
    }

    tableElement.querySelectorAll(TABLE_SELECTOR_THEAD_ROWS).forEach((row) => {
        row.classList.add(TABLE_CLASS_BORDER_BOTTOM, TABLE_CLASS_BORDER_2, TABLE_CLASS_BORDER_LIGHT_SUBTLE);
        row.querySelectorAll(TABLE_SELECTOR_TABLE_CELLS).forEach((cell) => {
            cell.classList.add(TABLE_CLASS_BORDER_BOTTOM, TABLE_CLASS_BORDER_LIGHT_SUBTLE);
        });
    });

    tableElement.querySelectorAll(TABLE_SELECTOR_TBODY_ROWS).forEach((row) => {
        row.classList.add(TABLE_CLASS_BORDER_BOTTOM, TABLE_CLASS_BORDER_2, TABLE_CLASS_BORDER_LIGHT_SUBTLE);
        row.querySelectorAll(TABLE_SELECTOR_TABLE_CELLS).forEach((cell) => {
            cell.classList.add(TABLE_CLASS_BORDER_BOTTOM, TABLE_CLASS_BORDER_LIGHT_SUBTLE);
        });
    });
}

// ---------------------------
// 📧 INBOX VIEW RENDERING
// ---------------------------
function renderInboxView(tableElement, cache, dtConfig, entityName, schema, targetParent = null) {
    console.log(TABLE_LOG_RENDER_INBOX_VIEW, entityName);
    
    const { columns = [] } = dtConfig;
    
    // Create inbox container with proper Bootstrap classes
    const container = document.createElement('div');
    container.className = `${TABLE_SELECTOR_INBOX_VIEW_CONTAINER.slice(1)} ${TABLE_CLASS_W_100}`;
    container.style.cssText = TABLE_STYLE_INBOX_CONTAINER;
    
    console.log(TABLE_LOG_CREATED_INBOX_CONTAINER);
    
    // Left panel (list view) - flex container with flex-column
    const leftPanel = document.createElement('div');
    leftPanel.className = `${TABLE_CLASS_INBOX_LEFT_PANEL} ${TABLE_CLASS_P_1} ${TABLE_CLASS_D_FLEX} ${TABLE_CLASS_FLEX_COLUMN} ${TABLE_CLASS_BORDER_END}`;
    leftPanel.style.overflow = TABLE_STYLE_INBOX_LEFT_PANEL_OVERFLOW;
    leftPanel.style.width = `${DEFAULT_LEFT_PANEL_WIDTH}%`;
    
    // Resizer
    const resizer = document.createElement('div');
    resizer.className = `${TABLE_CLASS_INBOX_RESIZER} ${TABLE_CLASS_BG_LIGHT} ${TABLE_CLASS_BORDER_START} ${TABLE_CLASS_BORDER_END} ${TABLE_CLASS_BORDER_LIGHT_SUBTLE}`;
    resizer.style.cssText = TABLE_STYLE_RESIZER;
    resizer.title = TABLE_MESSAGE_RESIZE_PANEL;
    
    // Right panel (detail view)
    const rightPanelEle = document.createElement('div');
    rightPanelEle.className = TABLE_CLASS_INBOX_RIGHT_PANEL;
    rightPanelEle.style.cssText = TABLE_STYLE_INBOX_RIGHT_PANEL;
    rightPanelEle.innerHTML = `<div class="${TABLE_CLASS_TEXT_CENTER} ${TABLE_CLASS_TEXT_MUTED} ${TABLE_CLASS_PY_5}">${TABLE_MESSAGE_EMPTY_DETAIL}</div>`;
    
    container.appendChild(leftPanel);
    container.appendChild(resizer);
    container.appendChild(rightPanelEle);
    
    console.log(TABLE_LOG_ASSEMBLED_INBOX_CONTAINER);
    
    // Use provided parent or fall back to table's parent
    const parentNode = targetParent || tableElement.parentNode;
    
    if (!parentNode) {
        console.error(TABLE_LOG_INBOX_PARENT_MISSING);
        return;
    }
    
    console.log(TABLE_LOG_PARENT_NODE_FOUND, parentNode.className);
    
    // Check if table is actually a child of parentNode
    if (tableElement.parentNode === parentNode) {
        // Table is in the parent, insert before it
        console.log(TABLE_LOG_INSERTING_CONTAINER_BEFORE_TABLE);
        parentNode.insertBefore(container, tableElement);
    } else {
        // Table is not in parent (or was removed), just append container
        console.log(TABLE_LOG_APPENDING_CONTAINER);
        parentNode.appendChild(container);
    }
    
    // Hide the table
    tableElement.style.display = 'none';
    
    console.log(TABLE_LOG_INBOX_CONTAINER_INSERTED);
    console.log(TABLE_LOG_CONTAINER_PARENT, container.parentNode?.className);
    
    // Create DataTable
    const listTable = document.createElement('table');
    listTable.__sourceTable = tableElement;
    listTable.className = `table table-bordered table-hover ${TABLE_SELECTOR_INBOX_LIST.slice(1)}`;
    listTable.style.cssText = TABLE_STYLE_LIST_TABLE;
    
    // Format entity name nicely
    const formattedEntityName = entityName
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    listTable.innerHTML = `
        <thead>
            <tr>
                <th class="${TABLE_SELECTOR_CHECKBOX_COLUMN.slice(1)}">
                    <input type="checkbox" id="${TABLE_ID_SELECT_ALL_INBOX}" style="cursor: pointer; margin: 0 auto; display: block;">
                </th>
                <th class="${TABLE_CLASS_TEXT_UPPERCASE}">
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
            className: TABLE_SELECTOR_CHECKBOX_COLUMN.slice(1),
            render: (row) => `<input type="checkbox" class="${TABLE_SELECTOR_ROW_CHECKBOX.slice(1)}" data-uid="${row.uid || row.id}" style="cursor: pointer;">`
        },
        {
            data: null,
            orderable: false,
            render: (row) => renderInboxRow(row, columns, schema)
        }
    ];
    
    console.log(TABLE_LOG_INITIALIZING_INBOX_DATATABLE);
    
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
                width: TABLE_VALUE_CHECKBOX_COLUMN_WIDTH
            }
        ],
        select: {
            style: TABLE_OPTION_SELECT_STYLE_SINGLE,
            info: false,
            className: TABLE_CLASS_DT_SELECT_ACTIVE
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
            syncInboxRowSelection(listTable);
        },
        drawCallback: function (...args) {
            if (typeof dtConfig.drawCallback === 'function') {
                dtConfig.drawCallback.apply(this, args);
            }

            styleInboxRows(listTable);
            applyInboxStickyStyles(leftPanel);
            initializeInboxSummaryComponents(listTable);
            syncInboxRowSelection(listTable);
        },
    });

    styleInboxRows(listTable);
    applyInboxStickyStyles(leftPanel);
    initializeInboxSummaryComponents(listTable);
    syncInboxRowSelection(listTable);

    // Setup resizer
    setupResizer(resizer, leftPanel, rightPanelEle, container);

    // Setup checkbox handlers
    setupCheckboxHandlers(listTable, true);

    console.log(`${TABLE_LOG_INBOX_VIEW_READY} ${entityName}`);

    // Handle row selection
    $(listTable).on('click', TABLE_SELECTOR_INBOX_ROW, function(e) {
        // Don't trigger if clicking checkbox or the responsive/detail toggle control
        if (
            $(e.target).hasClass(TABLE_SELECTOR_ROW_CHECKBOX.slice(1)) ||
            $(e.target).closest(TABLE_SELECTOR_CHECKBOX_COLUMN).length ||
            $(e.target).closest('button, a, .dtr-control, .dt-control, .details-control').length
        ) {
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
    
    console.log(`${TABLE_LOG_INBOX_VIEW_FULLY_READY} ${entityName}`);
    
    // Force a reflow to ensure rendering
    container.offsetHeight;
}

/**
 * Apply sticky positioning to DataTables elements in inbox view
 */
function applyInboxStickyStyles(leftPanel) {
    console.log(TABLE_LOG_APPLYING_INBOX_STICKY);
    
    // Find the DataTables container that was created by DataTables
    const dtContainer = leftPanel.querySelector(TABLE_SELECTOR_DT_CONTAINER);
    if (!dtContainer) {
        console.warn(TABLE_LOG_DT_CONTAINER_MISSING);
        return;
    }
    
    console.log(TABLE_LOG_DT_CONTAINER_FOUND);
    
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
        el.classList.contains(TABLE_CLASS_DT_LAYOUT_ROW) || el.classList.contains(TABLE_CLASS_DT_LAYOUT_TABLE)
    );
    
    console.log(`${TABLE_LOG_LAYOUT_ELEMENTS_FOUND} ${layoutRows.length}`);
    
    // Identify each row by its content
    layoutRows.forEach((row, index) => {
        const hasSearch = row.querySelector(TABLE_SELECTOR_DT_SEARCH_OR_INPUT);
        const hasLength = row.querySelector(TABLE_SELECTOR_DT_LENGTH_OR_SELECT);
        const hasTable = row.querySelector(TABLE_SELECTOR_TABLE);
        const hasPagination = row.querySelector(TABLE_SELECTOR_DT_PAGING_OR_PAGINATE);
        const hasInfo = row.querySelector(TABLE_SELECTOR_DT_INFO_OR_INFO);
        
        console.log(`${TABLE_LOG_ROW_LAYOUT} ${index}:`, {
            hasSearch: !!hasSearch,
            hasLength: !!hasLength,
            hasTable: !!hasTable,
            hasPagination: !!hasPagination,
            hasInfo: !!hasInfo,
            classes: row.className
        });
        
        // Top row: Contains search or page length controls
        if ((hasSearch || hasLength) && !hasTable && !hasPagination) {
            row.classList.add(TABLE_CLASS_FLEX_SHRINK_0, TABLE_CLASS_STICKY_TOP, TABLE_CLASS_Z_3, TABLE_CLASS_BORDER_BOTTOM);
            console.log(`${TABLE_LOG_STYLED_TOP_CONTROLS} ${index}`);
        }
        
        // Table row: Contains the actual table
        else if (hasTable) {
            row.style.setProperty('--bs-gutter-x', TABLE_STYLE_GUTTER_X_ZERO);
            row.style.marginLeft = TABLE_STYLE_MARGIN_ZERO;
            row.style.marginRight = TABLE_STYLE_MARGIN_ZERO;
            row.style.flex = TABLE_STYLE_FLEX_AUTO;
            row.style.overflow = TABLE_STYLE_OVERFLOW_HIDDEN;
            row.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;
            row.style.height = TABLE_STYLE_GUTTER_X_ZERO;
            row.style.position = TABLE_STYLE_POSITION_RELATIVE;
            row.classList.add(TABLE_CLASS_BORDER_TOP, TABLE_CLASS_BORDER_BOTTOM);

            const tableCell = row.querySelector(`${TABLE_SELECTOR_DT_LAYOUT_CELL}, ${TABLE_SELECTOR_DT_LAYOUT_FULL}`);
            if (tableCell) {
                let scrollFrame = row.querySelector('.inbox-scroll-frame');
                if (!scrollFrame) {
                    scrollFrame = document.createElement('div');
                    scrollFrame.className = TABLE_SELECTOR_INBOX_SCROLL_FRAME.slice(1);
                    scrollFrame.style.display = TABLE_STYLE_DISPLAY_FLEX;
                    scrollFrame.style.flexDirection = TABLE_STYLE_FLEX_DIRECTION_COLUMN;
                    scrollFrame.style.flex = TABLE_STYLE_FLEX_AUTO;
                    scrollFrame.style.height = TABLE_STYLE_HEIGHT_FULL;
                    scrollFrame.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;
                    scrollFrame.style.overflowX = TABLE_STYLE_OVERFLOW_X_AUTO;
                    scrollFrame.style.overflowY = TABLE_STYLE_OVERFLOW_Y_SCROLL;
                    scrollFrame.style.scrollbarGutter = TABLE_STYLE_SCROLLBAR_GUTTER_STABLE;
                    row.appendChild(scrollFrame);
                }

                if (tableCell.parentElement !== scrollFrame) {
                    scrollFrame.appendChild(tableCell);
                }

                tableCell.style.display = TABLE_STYLE_DISPLAY_FLEX;
                tableCell.style.flexDirection = TABLE_STYLE_FLEX_DIRECTION_COLUMN;
                tableCell.style.flex = TABLE_STYLE_FLEX_AUTO;
                tableCell.style.height = TABLE_STYLE_HEIGHT_FULL;
                tableCell.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;
                tableCell.style.overflow = TABLE_STYLE_OVERFLOW_VISIBLE;
                tableCell.style.paddingLeft = TABLE_STYLE_MARGIN_ZERO;
                tableCell.style.paddingRight = TABLE_STYLE_MARGIN_ZERO;
            }
            
            // Make thead sticky within this scrollable container
            const thead = row.querySelector(TABLE_SELECTOR_THEAD);
            if (thead) {
                thead.style.position = TABLE_STYLE_POSITION_STICKY;
                thead.style.top = TABLE_STYLE_TOP_ZERO;
                thead.style.zIndex = TABLE_STYLE_ZINDEX_STICKY;
            }
            console.log(`${TABLE_LOG_STYLED_SCROLL_TABLE} ${index}`);
        }
        
        // Bottom row: Contains pagination or info
        else if (hasPagination || hasInfo) {
            row.classList.add(TABLE_CLASS_FLEX_SHRINK_0, TABLE_CLASS_POSITION_STICKY, TABLE_CLASS_BOTTOM_0, TABLE_CLASS_Z_3, TABLE_CLASS_BORDER_TOP);
            console.log(`${TABLE_LOG_STYLED_BOTTOM_PAGINATION} ${index}`);
        }
    });
    
    applyCompactDataTableControls(dtContainer);

    console.log(TABLE_LOG_STICKY_STYLES_COMPLETE);
}

function applyTableModeLayout(tableElement) {
    const shell = tableElement.closest(TABLE_SELECTOR_LAB_TABLE_SHELL);
    if (!shell) {
        return;
    }

    const dtContainer = shell.querySelector(TABLE_SELECTOR_DT_CONTAINER);
    if (!dtContainer) {
        return;
    }

    shell.classList.add(TABLE_CLASS_OVERFLOW_HIDDEN);
    shell.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;

    dtContainer.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, TABLE_CLASS_OVERFLOW_HIDDEN);
    dtContainer.classList.remove(TABLE_CLASS_H_AUTO);
    dtContainer.classList.add(TABLE_CLASS_FLEX_GROW_1);
    dtContainer.style.height = TABLE_STYLE_HEIGHT_FULL;
    dtContainer.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;

    const layoutRows = Array.from(dtContainer.children).filter((element) =>
        element.classList.contains(TABLE_CLASS_DT_LAYOUT_ROW) || element.classList.contains(TABLE_CLASS_DT_LAYOUT_TABLE)
    );

    layoutRows.forEach((row) => {
        const hasSearch = row.querySelector(TABLE_SELECTOR_DT_SEARCH_OR_INPUT);
        const hasLength = row.querySelector(TABLE_SELECTOR_DT_LENGTH_OR_SELECT);
        const hasTable = row.querySelector(TABLE_SELECTOR_TABLE);
        const hasPagination = row.querySelector(TABLE_SELECTOR_DT_PAGING_OR_PAGINATE);
        const hasInfo = row.querySelector(TABLE_SELECTOR_DT_INFO_OR_INFO);

        if ((hasSearch || hasLength) && !hasTable) {
            row.classList.add(TABLE_CLASS_FLEX_SHRINK_0);
            return;
        }

        if (hasTable) {
            row.style.setProperty('--bs-gutter-x', TABLE_STYLE_GUTTER_X_ZERO);
            row.style.marginLeft = TABLE_STYLE_MARGIN_ZERO;
            row.style.marginRight = TABLE_STYLE_MARGIN_ZERO;
            row.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, TABLE_CLASS_FLEX_GROW_1, TABLE_CLASS_OVERFLOW_HIDDEN);
            row.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;

            const tableCell = row.querySelector(TABLE_SELECTOR_DT_LAYOUT_CELL);
            if (tableCell) {
                tableCell.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, TABLE_CLASS_FLEX_GROW_1, TABLE_CLASS_OVERFLOW_HIDDEN);
                tableCell.style.height = TABLE_STYLE_HEIGHT_FULL;
                tableCell.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;
                tableCell.style.paddingLeft = TABLE_STYLE_MARGIN_ZERO;
                tableCell.style.paddingRight = TABLE_STYLE_MARGIN_ZERO;
            }

            const scrollHost = row.querySelector(TABLE_SELECTOR_TABLE_RESPONSIVE)
                || row.querySelector(TABLE_SELECTOR_DT_SCROLL_BODY)
                || tableElement.parentElement;

            if (scrollHost) {
                scrollHost.classList.add(TABLE_CLASS_FLEX_GROW_1);
                scrollHost.style.height = TABLE_STYLE_HEIGHT_FULL;
                scrollHost.style.minHeight = TABLE_STYLE_MIN_HEIGHT_ZERO;
                scrollHost.style.overflowX = TABLE_STYLE_OVERFLOW_X_AUTO;
                scrollHost.style.overflowY = TABLE_STYLE_OVERFLOW_Y_SCROLL;
                scrollHost.style.scrollbarGutter = TABLE_STYLE_SCROLLBAR_GUTTER_STABLE;
            }

            const thead = row.querySelector(TABLE_SELECTOR_THEAD);
            if (thead) {
                thead.style.position = TABLE_STYLE_POSITION_STICKY;
                thead.style.top = TABLE_STYLE_TOP_ZERO;
                thead.style.zIndex = TABLE_STYLE_ZINDEX_STICKY;
                thead.style.background = TABLE_STYLE_BACKGROUND_INHERIT;
            }

            return;
        }

        if (hasPagination || hasInfo) {
            row.classList.add(TABLE_CLASS_FLEX_SHRINK_0);
        }
    });

    applyCompactDataTableControls(dtContainer);
}

