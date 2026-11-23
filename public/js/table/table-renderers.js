function applyCompactDataTableControls(container) {
    if (!container) {
        return;
    }

    container.querySelectorAll(TABLE_SELECTOR_DT_PAGING_PAGINATION).forEach((pagination) => {
        pagination.classList.add('pagination-sm', TABLE_CLASS_MB_0);
    });

    container.querySelectorAll(TABLE_SELECTOR_DT_PAGE_LINK).forEach((link) => {
        link.classList.add('py-1', TABLE_CLASS_PX_2, TABLE_CLASS_SMALL);
    });

    container.querySelectorAll(TABLE_SELECTOR_DT_LENGTH_SELECT).forEach((select) => {
        select.classList.add('form-select-sm');
    });

    container.querySelectorAll(TABLE_SELECTOR_DT_SEARCH_INPUT).forEach((input) => {
        input.classList.add('form-control-sm');
    });

    container.querySelectorAll(TABLE_SELECTOR_DT_INFO_BLOCKS).forEach((element) => {
        element.classList.add(TABLE_CLASS_SMALL);
    });
}

/**
 * Render inbox row with "Label: Value" in one line (Bootstrap only)
 */
function renderFallbackInboxRow(row, columns) {
    const visibleColumns = columns.filter(
        col =>
            col.visible !== false &&
            col.data &&
            !col.data.startsWith('meta.')
    );

    return `
        <div class="d-flex flex-column">
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

function getSchemaConfigValue(schema = {}, keys = []) {
    for (const key of keys) {
        const topLevelValue = schema?.[key];
        if (topLevelValue !== undefined && topLevelValue !== null && topLevelValue !== '') {
            return topLevelValue;
        }

        const dtValue = schema?.["dt-options"]?.[key];
        if (dtValue !== undefined && dtValue !== null && dtValue !== '') {
            return dtValue;
        }
    }

    return null;
}

function getComponentSchemaIdentifier(schema = {}) {
    return schema?.uid
        || schema?.id
        || schema?.slug
        || schema?.table_schema_id
        || schema?.entity
        || null;
}

function getRowMetaMap(row = {}) {
    const metaEntries = Array.isArray(row?.meta) ? row.meta : [];
    return metaEntries.reduce((acc, item) => {
        const key = item?.meta_key || item?.key;
        if (key) {
            acc[key] = item?.meta_value ?? item?.value ?? null;
        }
        return acc;
    }, {});
}

function getFirstRowValue(row = {}, metaMap = {}, paths = [], fallback = '') {
    for (const path of paths) {
        let value = '';

        if (path.startsWith('meta:')) {
            value = metaMap[path.slice(5)];
        } else if (path.includes('.')) {
            value = path.split('.').reduce((acc, key) => acc?.[key], row);
        } else {
            value = row?.[path];
        }

        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }

    return fallback;
}

function getInitialsFromValue(value = '') {
    const initialSource = String(value || 'U').trim();
    const parts = initialSource.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    return parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function resolveAssetUrl(value = '') {
    if (!value) {
        return '';
    }

    if (/^(https?:)?\/\//.test(value) || String(value).startsWith('data:')) {
        return value;
    }

    const normalizedPath = String(value).replace(/^\/+/, '');
    const origin = window.location.origin.replace(/\/$/, '');

    return `${origin}/${normalizedPath}`;
}

function applyBindingTransform(value, transformName) {
    if (!transformName) {
        return value;
    }

    switch (transformName) {
        case 'asset_url':
            return resolveAssetUrl(value);
        case 'initials':
            return getInitialsFromValue(value);
        default:
            return value;
    }
}

/**
 * "prefix": put before a value that is only a name or a relative path
 * (e.g. a stored file name: "/profile-picture/" + "abc.png"); full URLs,
 * data: URIs and paths starting with "/" are left as they are.
 */
function applyBindingPrefix(value, prefix) {
    if (!prefix || typeof value !== 'string' || value === '' || /^(https?:|data:|\/)/i.test(value)) {
        return value;
    }

    return `${prefix}${value}`;
}

function resolveBindingFieldValue(row = {}, metaMap = {}, fieldConfig = {}) {
    const rawValue = getFirstRowValue(
        row,
        metaMap,
        Array.isArray(fieldConfig.paths) ? fieldConfig.paths : [],
        fieldConfig.fallback ?? ''
    );

    return applyBindingTransform(applyBindingPrefix(rawValue, fieldConfig.prefix), fieldConfig.transform);
}

function replaceTemplateTokens(template = '', values = {}) {
    let output = template;

    Object.entries(values).forEach(([key, value]) => {
        const token = `__${String(key).toUpperCase()}__`;
        output = output.replaceAll(token, escapeDetailHtml(value ?? ''));
    });

    return output;
}

function renderTemplateBinding(binding = {}, row = {}, metaMap = {}) {
    const values = {};

    Object.entries(binding.fields || {}).forEach(([fieldName, fieldConfig]) => {
        values[fieldName] = resolveBindingFieldValue(row, metaMap, fieldConfig);
    });

    const conditionField = binding.condition;
    const hasConditionValue = !conditionField || (values[conditionField] !== null && values[conditionField] !== undefined && values[conditionField] !== '');
    const template = hasConditionValue ? (binding.template || '') : (binding.fallback_template || '');

    return replaceTemplateTokens(template, values);
}

function renderKeyValueRowsBinding(binding = {}, row = {}, metaMap = {}) {
    const rows = Array.isArray(binding.rows) ? binding.rows : [];
    const rowTemplate = binding.row_template || '<div><strong>__LABEL__</strong>: __VALUE__</div>';
    const renderedRows = rows
        .map((item) => {
            const value = getFirstRowValue(row, metaMap, item.paths || [], item.fallback ?? '');

            if (value === null || value === undefined || value === '') {
                return '';
            }

            return rowTemplate
                .replaceAll('__LABEL__', escapeDetailHtml(item.label || ''))
                .replaceAll('__VALUE__', escapeDetailHtml(value));
        })
        .filter(Boolean)
        .join('');

    if (renderedRows) {
        return renderedRows;
    }

    return binding.fallback_template || '';
}

/**
 * "type": "badges": a value or a list (e.g. a business entity's
 * "labels.roles") as one badge per item, inserted as text.
 *   {"type": "badges", "paths": ["labels.roles"], "class": "badge text-bg-light border",
 *    "template": "<div>__BADGES__</div>", "fallback_template": ""}
 */
function renderBadgesBinding(binding = {}, row = {}, metaMap = {}) {
    const value = getFirstRowValue(row, metaMap, binding.paths || [], null);
    const items = (Array.isArray(value) ? value : [value])
        .filter((item) => item !== null && item !== undefined && item !== '');

    if (items.length === 0) {
        return binding.fallback_template || '';
    }

    const className = escapeDetailHtml(binding.class || 'badge text-bg-light border me-1 mb-1');
    const badges = items.map((item) => `<span class="${className}">${escapeDetailHtml(item)}</span>`).join('');

    return (binding.template || '__BADGES__').replace('__BADGES__', badges);
}

function renderBindingValue(binding = {}, row = {}, metaMap = {}) {
    switch (binding.type) {
        case 'template':
            return renderTemplateBinding(binding, row, metaMap);
        case 'key_value_rows':
            return renderKeyValueRowsBinding(binding, row, metaMap);
        case 'badges':
            return renderBadgesBinding(binding, row, metaMap);
        case 'text':
        default:
            return escapeDetailHtml(getFirstRowValue(row, metaMap, binding.paths || [], binding.fallback ?? ''));
    }
}

function hydrateComponentTemplate(templateHtml, bindings = {}, row = {}) {
    if (!templateHtml) {
        return '';
    }

    const metaMap = getRowMetaMap(row);
    let hydratedHtml = templateHtml;

    Object.entries(bindings || {}).forEach(([placeholder, binding]) => {
        hydratedHtml = hydratedHtml.replaceAll(placeholder, renderBindingValue(binding, row, metaMap));
    });

    return hydratedHtml;
}

function renderInboxRow(row, columns, schema = {}) {
    const summaryComponent = getSchemaConfigValue(schema, TABLE_SCHEMA_KEY_SUMMARY_COMPONENT);
    if (!summaryComponent) {
        return renderFallbackInboxRow(row, columns);
    }

    if (schema.__summaryComponentTemplate?.html) {
        return `
            <div class="inbox-summary-component">
                ${hydrateComponentTemplate(
                    schema.__summaryComponentTemplate.html,
                    schema.__summaryComponentTemplate.bindings || {},
                    row
                )}
            </div>
        `;
    }

    return renderFallbackInboxRow(row, columns);
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

function escapeDetailHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDetailLabel(key) {
    return String(key)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function formatFallbackDetailValue(value) {
    if (value === null || value === undefined || value === '') {
        return `<span class="${TABLE_CLASS_TEXT_MUTED}">-</span>`;
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
        return `<pre class="${TABLE_CLASS_MB_0} ${TABLE_CLASS_SMALL} text-wrap">${escapeDetailHtml(JSON.stringify(value, null, 2))}</pre>`;
    }

    return escapeDetailHtml(value);
}

function renderFallbackDetailComponent(data = {}) {
    const rows = [];
    const recordEntries = Object.entries(data).filter(([key]) => key !== 'meta');

    recordEntries.forEach(([key, value]) => {
        rows.push(`
            <tr>
                <th scope="row" class="${TABLE_CLASS_TEXT_MUTED} fw-semibold" style="width: 32%;">${escapeDetailHtml(formatDetailLabel(key))}</th>
                <td class="text-break">${formatFallbackDetailValue(value)}</td>
            </tr>
        `);
    });

    const metaEntries = Array.isArray(data.meta) ? data.meta : [];
    metaEntries.forEach((item) => {
        const metaKey = item?.meta_key || item?.key || 'Meta';
        const metaValue = item?.meta_value ?? item?.value ?? item;

        rows.push(`
            <tr>
                <th scope="row" class="${TABLE_CLASS_TEXT_MUTED} fw-semibold" style="width: 32%;">${escapeDetailHtml(`M / ${formatDetailLabel(metaKey)}`)}</th>
                <td class="text-break">${formatFallbackDetailValue(metaValue)}</td>
            </tr>
        `);
    });

    if (rows.length === 0) {
        rows.push(`
            <tr>
                <td colspan="2" class="${TABLE_CLASS_TEXT_CENTER} ${TABLE_CLASS_TEXT_MUTED} py-4">${TABLE_MESSAGE_NO_DETAILS_AVAILABLE}</td>
            </tr>
        `);
    }

    return `
        <div class="${TABLE_CLASS_D_FLEX} ${TABLE_CLASS_ALIGN_ITEMS_CENTER} ${TABLE_CLASS_JUSTIFY_CONTENT_BETWEEN} ${TABLE_CLASS_MB_2} ${TABLE_CLASS_PT_3} ${TABLE_CLASS_PX_2}">
            <h6 class="${TABLE_CLASS_MB_0} fw-semibold ${TABLE_CLASS_TEXT_MUTED}">${TABLE_MESSAGE_RECORD_INFO}</h6>
        </div>
        <div class="table-responsive ${TABLE_CLASS_ROUNDED} ${TABLE_CLASS_P_1}">
            <table class="table table-sm table-hover ${TABLE_CLASS_MB_0} align-middle" style="--bs-table-bg: transparent;">
                <colgroup><col style="width: 32%;"><col></colgroup>
                <tbody>
                    ${rows.join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Loading placeholder while a details component loads: the usual record
 * layout (picture, title, subtitle, a few label/value rows), like the form
 * skeleton does for forms.
 */
function renderComponentSkeleton() {
    const row = () => `
        <div class="d-flex flex-column flex-sm-row gap-1 gap-sm-3 py-1">
            <span class="placeholder col-4 col-sm-3 rounded"></span>
            <span class="placeholder col-7 col-sm-6 rounded"></span>
        </div>`;

    return `
        <div class="component-skeleton placeholder-glow px-3 px-lg-4 pb-3" aria-hidden="true">
            <div class="d-flex align-items-center gap-3 mb-4">
                <span class="placeholder rounded-circle flex-shrink-0" style="width: 72px; height: 72px;"></span>
                <div class="flex-grow-1">
                    <span class="placeholder col-6 rounded mb-2 d-block" style="height: 1.25rem;"></span>
                    <span class="placeholder col-4 rounded d-block"></span>
                </div>
            </div>
            ${row()}${row()}${row()}${row()}${row()}
        </div>`;
}

/**
 * Loading placeholder for a whole record panel (header, actions row,
 * component), shown while the record itself loads, e.g. a record URL opened
 * by a reload. Matches the record placeholder in ui/inc/list-skeleton.
 */
function renderRecordSkeleton() {
    return `
        <div class="placeholder-glow d-flex flex-column w-100" aria-hidden="true">
            <div class="d-flex justify-content-between align-items-center pt-2 pb-1 px-3 border-bottom">
                <div class="flex-grow-1">
                    <span class="placeholder col-5 col-md-3 rounded d-block mb-1" style="height: 1rem;"></span>
                    <span class="placeholder col-3 col-md-2 rounded d-block" style="height: 0.6rem;"></span>
                </div>
                <span class="placeholder rounded" style="width: 1rem; height: 1rem;"></span>
            </div>
            <div class="d-flex gap-2 px-3 py-2">
                <span class="placeholder rounded" style="width: 3.5rem; height: 1.25rem;"></span>
                <span class="placeholder rounded" style="width: 4rem; height: 1.25rem;"></span>
            </div>
            <div class="pt-2">${renderComponentSkeleton()}</div>
        </div>`;
}

/**
 * The record a details component shows: the table row plus the full record
 * from the record source, so a component can show what the list doesn't
 * load (e.g. a user's roles from a business entity: "labels.roles").
 *
 * Record source, in order:
 * - table schema "details_source": an entity or "business-entity/{slug}";
 * - the "dataEndpoint" of the table's form (form_schema_uid);
 * - none: the row alone (as before).
 * A failed fetch also falls back to the row.
 */
async function loadDetailRecord(schema = {}, detailConfig = {}, row = {}) {
    const uid = row?.uid;

    if (!uid) {
        return row;
    }

    let url = null;
    const source = getSchemaConfigValue(schema, ['details_source', 'details-source']);

    if (source && typeof entityRecordUrl === 'function') {
        url = entityRecordUrl('show', source, uid);
    } else if (detailConfig.formSchemaUid && typeof getFormSchema === 'function') {
        const formSchema = await getFormSchema(detailConfig.formSchemaUid);
        const dataEndpoint = formSchema?.dataEndpoint ?? formSchema?.schema?.dataEndpoint ?? null;
        url = dataEndpoint ? dataEndpoint.replace('{uid}', encodeURIComponent(uid)) : null;
    }

    if (!url || typeof fetchSessionJsonData !== 'function') {
        return row;
    }

    const record = await fetchSessionJsonData(url);

    return record && typeof record === 'object' && !Array.isArray(record) ? mergeDetailRecord(row, record) : row;
}

/**
 * Row + record: the record's values win, but "meta" lists are combined, so
 * the row's meta (e.g. a user's profile_picture) survives a record that has
 * other meta, or none.
 */
function mergeDetailRecord(row = {}, record = {}) {
    const merged = { ...row, ...record };
    const rowMeta = Array.isArray(row.meta) ? row.meta : [];
    const recordMeta = Array.isArray(record.meta) ? record.meta : [];

    if (rowMeta.length > 0 || recordMeta.length > 0) {
        const recordKeys = new Set(recordMeta.map((item) => item?.meta_key));
        merged.meta = [...rowMeta.filter((item) => !recordKeys.has(item?.meta_key)), ...recordMeta];
    }

    return merged;
}

/**
 * The component a form shows in view mode: form schema
 * "modes": {"view": {"component": "user.details"}}. Null when none.
 */
async function resolveFormViewComponent(formSchemaUid) {
    if (!formSchemaUid || typeof getFormSchema !== 'function') {
        return null;
    }

    const formSchema = await getFormSchema(formSchemaUid);
    const modes = formSchema?.modes ?? formSchema?.schema?.modes ?? {};

    return modes?.view?.component || null;
}

/**
 * Which form and components a table's records use. The record's component
 * comes from its form (modes.view.component, set by loadDetailComponent);
 * the table's own "details_component" is the deprecated fallback.
 */
function resolveDetailConfig(schema = {}) {
    const columns = schema?.["dt-options"]?.columns || [];
    const columnWithFormSchema = columns.find((column) => column?.["form-schema-uid"]);

    return {
        summaryComponent: getSchemaConfigValue(schema, TABLE_SCHEMA_KEY_SUMMARY_COMPONENT),
        detailsComponent: getSchemaConfigValue(schema, ['details_component', 'details-component']),
        formSchemaUid: getSchemaConfigValue(schema, ['form_schema_uid', 'form-schema-uid'])
            || columnWithFormSchema?.["form-schema-uid"]
            || null,
        componentSchemaId: getComponentSchemaIdentifier(schema),
    };
}

function resolvePreferredDetailRenderMode(detailConfig = {}, requestedMode = null) {
    if (requestedMode === DETAIL_RENDER_MODE_FORM && detailConfig.formSchemaUid) {
        return DETAIL_RENDER_MODE_FORM;
    }

    if (requestedMode === DETAIL_RENDER_MODE_COMPONENT && detailConfig.detailsComponent) {
        return DETAIL_RENDER_MODE_COMPONENT;
    }

    if (detailConfig.detailsComponent) {
        return DETAIL_RENDER_MODE_COMPONENT;
    }

    if (detailConfig.formSchemaUid) {
        return DETAIL_RENDER_MODE_FORM;
    }

    return null;
}

function buildDetailAttempts(detailConfig = {}, preferredMode = null) {
    const attempts = [];
    const orderedModes = preferredMode === DETAIL_RENDER_MODE_FORM
        ? [DETAIL_RENDER_MODE_FORM, DETAIL_RENDER_MODE_COMPONENT]
        : [DETAIL_RENDER_MODE_COMPONENT, DETAIL_RENDER_MODE_FORM];

    orderedModes.forEach((mode) => {
        if (mode === DETAIL_RENDER_MODE_COMPONENT && detailConfig.detailsComponent) {
            attempts.push({
                type: DETAIL_RENDER_MODE_COMPONENT,
                componentName: detailConfig.detailsComponent,
                schemaId: detailConfig.componentSchemaId,
            });
        }

        if (mode === DETAIL_RENDER_MODE_FORM && detailConfig.formSchemaUid) {
            attempts.push({
                type: DETAIL_RENDER_MODE_FORM,
                componentName: TABLE_COMPONENT_LAB_FORM,
                schemaId: detailConfig.formSchemaUid,
            });
        }
    });

    return attempts;
}

function createDetailContext(rightPanelEle, contentContainer, schema, data, detailConfig, preferredMode, requestedFormMode = 'view') {
    const context = {
        rightPanelEle,
        contentContainer,
        schema,
        data,
        detailConfig,
        preferredMode,
        requestedFormMode,
        componentBackedEdit: !!detailConfig.detailsComponent && !!detailConfig.formSchemaUid,
    };

    contentContainer.__detailContext = context;

    return context;
}

function syncInboxSummaryRow(detailContext, nextRowData) {
    const entity = detailContext?.schema?.entity;
    const entityUid = nextRowData?.uid || detailContext?.data?.uid || null;
    if (!entity || !entityUid || !nextRowData) {
        console.warn(TABLE_LOG_SKIP_SUMMARY_SYNC, {
            entity,
            entityUid,
            hasNextRowData: !!nextRowData,
        });
        return;
    }

    const cache = entityCaches.get(entity);
    cache?.updateRowByUid(entityUid, nextRowData);

    const listTable = detailContext.rightPanelEle
        ?.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER)
        ?.querySelector(TABLE_SELECTOR_INBOX_LIST);

    if (!listTable || typeof $ === 'undefined' || !$.fn.DataTable || !$.fn.DataTable.isDataTable(listTable)) {
        console.warn(TABLE_LOG_SKIP_SUMMARY_DT_UPDATE, {
            entity,
            entityUid,
        });
        return;
    }

    const dt = $(listTable).DataTable();
    let updatedRow = false;

    dt.rows().every(function () {
        const rowData = this.data();
        const rowUid = rowData?.uid || rowData?.id || null;
        if (rowUid === entityUid) {
            this.data(nextRowData);
            updatedRow = true;
        }
    });

    if (updatedRow) {
        dt.draw(false);
        window.uiDebug?.(TABLE_LOG_SUMMARY_SYNC_COMPLETE, {
            entity,
            entityUid,
        });
        return;
    }

    console.warn(TABLE_LOG_SUMMARY_ROW_NOT_FOUND, {
        entity,
        entityUid,
    });
}

async function openDetailInPreferredMode(context, overrides = {}) {
    if (!context?.rightPanelEle || !context?.schema || !context?.data) {
        console.warn(TABLE_LOG_SKIP_DETAIL_MODE_SWITCH, { context, overrides });
        return;
    }

    const nextPreferredMode = overrides.preferredMode || context.preferredMode;
    const nextFormMode = overrides.formMode || 'view';

    window.uiDebug?.(TABLE_LOG_SWITCHING_DETAIL_MODE, {
        entity: context.schema?.entity,
        uid: context.data?.uid || context.data?.id || null,
        preferredMode: nextPreferredMode,
        formMode: nextFormMode,
    });

    return loadDetailComponent(context.rightPanelEle, context.schema, context.data, {
        preferredMode: nextPreferredMode,
        formMode: nextFormMode,
    });
}

function appendHybridDetailEditButton(header, detailContext) {
    if (!detailContext?.componentBackedEdit) {
        return;
    }

    const actionWrapper = document.createElement('div');
    actionWrapper.className = `${TABLE_CLASS_D_FLEX} ${TABLE_CLASS_ALIGN_ITEMS_CENTER} ms-auto me-2`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = TABLE_CLASS_BTN_LINK_EDIT;
    editButton.innerHTML = '<i class="fas fa-pencil-alt"></i><span>Edit</span>';
    editButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        window.uiDebug?.(TABLE_LOG_OPENING_DETAIL_EDITOR, {
            entity: detailContext.schema?.entity,
            uid: detailContext.data?.uid || detailContext.data?.id || null,
            formSchemaUid: detailContext.detailConfig?.formSchemaUid || null,
        });

        await openDetailInPreferredMode(detailContext, {
            preferredMode: DETAIL_RENDER_MODE_FORM,
            formMode: 'edit',
        });
    });

    header.insertBefore(actionWrapper, header.lastElementChild);
    actionWrapper.appendChild(editButton);
}

function createDetailHeaderActionButton(iconClasses, title, buttonClasses, clickHandler, label = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = buttonClasses;
    button.title = title;

    const icon = document.createElement('i');
    icon.className = iconClasses;
    button.appendChild(icon);

    if (label) {
        const text = document.createElement('span');
        text.textContent = label;
        button.appendChild(text);
    }

    button.addEventListener('click', clickHandler);
    return button;
}

async function handleHybridDetailDelete(detailContext) {
    const entity = detailContext?.schema?.entity;
    const entityUid = detailContext?.data?.uid;

    if (!entity || !entityUid) {
        console.warn(TABLE_LOG_SKIP_DETAIL_DELETE, {
            entity,
            entityUid,
        });
        return;
    }

    const confirmed = window.confirm(TABLE_MESSAGE_CONFIRM_DELETE);
    if (!confirmed) {
        window.uiDebug?.(TABLE_LOG_DETAIL_DELETE_CANCELLED, { entity, entityUid });
        return;
    }

    const endpoint = entityRecordUrl('delete', entity, entityUid);
    window.uiDebug?.(TABLE_LOG_DELETING_DETAIL_RECORD, {
        entity,
        entityUid,
        endpoint,
    });

    try {
        const result = typeof apiClient !== 'undefined' && apiClient
            ? await apiClient.delete(endpoint)
            : await fetch(endpoint, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            }).then((response) => response.json().catch(() => ({
                success: response.ok,
                status: response.status,
            })));

        if (!result?.success) {
            console.error(TABLE_LOG_DETAIL_DELETE_FAILED, {
                entity,
                entityUid,
                endpoint,
                result,
            });
            return;
        }

        const rightPanelEle = detailContext.rightPanelEle;
        const parentContainer = rightPanelEle?.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER);
        const listTable = parentContainer?.querySelector(TABLE_SELECTOR_INBOX_LIST);
        const rootTable = document.querySelector(TABLE_SELECTOR_LAB_TABLE);
        // The record is gone: back to the list on small screens.
        setInboxDetailOpen(rightPanelEle, false);

        // Out of the URL; a full width record (table mode) returns to the table.
        const deletedFromManager = parentContainer?.__listTable?.__sourceTable?.__viewManager;
        if (deletedFromManager?.recordFull) {
            await deletedFromManager.recordDeleted();
            return;
        }
        deletedFromManager?.recordDeleted?.({ reloadList: false });

        if (rootTable && typeof window.clearLabTableCache === 'function') {
            window.clearLabTableCache(rootTable);
        }

        if (rightPanelEle) {
            rightPanelEle.innerHTML = '';
            rightPanelEle.className = rightPanelEle.className
                .split(' ')
                .filter(cls => !cls.includes('inbox-') && cls !== 'bg-white' && cls !== 'bg-light')
                .join(' ');
            rightPanelEle.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, TABLE_CLASS_OVERFLOW_HIDDEN, TABLE_CLASS_P_0, TABLE_CLASS_M_0);

            const emptyState = document.createElement('div');
            emptyState.className = TABLE_CLASS_EMPTY_STATE;
            emptyState.innerHTML = TABLE_MESSAGE_EMPTY_DETAIL;
            rightPanelEle.appendChild(emptyState);
        }

        if (listTable) {
            clearInboxRowSelection(listTable);

            if (typeof $ !== 'undefined' && $.fn.DataTable && $.fn.DataTable.isDataTable(listTable)) {
                $(listTable).DataTable().ajax.reload(null, false);
            }
        }

        window.uiDebug?.(TABLE_LOG_DETAIL_DELETE_SUCCESS, {
            entity,
            entityUid,
        });
    } catch (error) {
        console.error(TABLE_LOG_DETAIL_DELETE_REQUEST_FAILED, {
            entity,
            entityUid,
            endpoint,
            error,
        });
    }
}

function appendHybridDetailActions(rightPanelEle, contentContainer, detailContext) {
    if (!detailContext?.componentBackedEdit) {
        return;
    }

    const existingActionRow = rightPanelEle?.querySelector('.inbox-detail-actions');
    if (existingActionRow) {
        existingActionRow.remove();
    }

    // Keep component-backed detail actions aligned with lab-form view actions, but render them below the shared header.
    const actionWrapper = document.createElement('div');
    actionWrapper.className = TABLE_CLASS_DETAIL_ACTIONS;

    const editButton = createDetailHeaderActionButton(
        'fas fa-pencil-alt',
        'Edit',
        TABLE_CLASS_BTN_LINK_EDIT,
        async (event) => {
            event.preventDefault();
            event.stopPropagation();

            window.uiDebug?.(TABLE_LOG_OPENING_DETAIL_EDITOR, {
                entity: detailContext.schema?.entity,
                uid: detailContext.data?.uid || detailContext.data?.id || null,
                formSchemaUid: detailContext.detailConfig?.formSchemaUid || null,
            });

            await openDetailInPreferredMode(detailContext, {
                preferredMode: DETAIL_RENDER_MODE_FORM,
                formMode: 'edit',
            });
        }
    );

    const deleteButton = createDetailHeaderActionButton(
        'fas fa-trash',
        'Delete',
        TABLE_CLASS_BTN_LINK_DELETE,
        async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await handleHybridDetailDelete(detailContext);
        }
    );

    actionWrapper.appendChild(editButton);
    actionWrapper.appendChild(deleteButton);
    rightPanelEle.insertBefore(actionWrapper, contentContainer);
}

function getNestedDetailValue(source, paths = []) {
    for (const path of paths) {
        let value = source;
        for (const key of path) {
            value = value?.[key];
        }
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }
    return null;
}

/** Split view on small screens: show the record over the list, or the list again. */
function setInboxDetailOpen(rightPanelEle, open) {
    rightPanelEle?.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER)?.classList.toggle('inbox-detail-open', open);
}

async function loadDetailComponent(rightPanelEle, schema, data, options = {}) {
    // Phones/tablets: the record covers the list (CSS .inbox-detail-open).
    setInboxDetailOpen(rightPanelEle, true);

    window.uiDebug?.(TABLE_LOG_LOADING_DETAIL_PANEL, {
        entity: schema?.entity,
        uid: data?.uid || data?.id || null,
        requestedPreferredMode: options?.preferredMode || null,
        requestedFormMode: options?.formMode || null,
    });

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
    
    rightPanelEle.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, 'h-100', TABLE_CLASS_OVERFLOW_HIDDEN, TABLE_CLASS_P_0, TABLE_CLASS_M_0);
    
    // Restore width settings if they existed
    if (currentWidth) rightPanelEle.style.width = currentWidth;
    if (currentFlex) rightPanelEle.style.flex = currentFlex;
    
    // Create header - using Bootstrap classes
    const header = document.createElement('div');
    header.className = `inbox-detail-header ${TABLE_CLASS_D_FLEX} ${TABLE_CLASS_JUSTIFY_CONTENT_BETWEEN} ${TABLE_CLASS_ALIGN_ITEMS_CENTER} ${TABLE_CLASS_W_100} pt-2 pb-1 px-3 flex-shrink-0 border-bottom`;
    
    // Title on left
    const titleWrapper = document.createElement('div');
    titleWrapper.className = `${TABLE_CLASS_D_FLEX} flex-column`;

    const entityLabel = document.createElement('small');
    entityLabel.className = `${TABLE_CLASS_SMALL} ${TABLE_CLASS_TEXT_MUTED}`;
    entityLabel.style.fontSize = '0.7rem';
    entityLabel.textContent = formatDetailLabel(schema?.entity || 'Details');

    const title = document.createElement('p');
    title.className = `${TABLE_CLASS_MB_0} fw-medium text-primary`;
    
    // Try to get a meaningful title from the data
    let titleText = TABLE_MESSAGE_DETAILS;
    if (data) {
        const matchedField = TABLE_DETAIL_TITLE_FIELDS.find((field) => data[field]);
        if (matchedField) titleText = `${data[matchedField]}`;
    }
    title.textContent = titleText;
    titleWrapper.appendChild(title);
    titleWrapper.appendChild(entityLabel);

    const metaWrapper = document.createElement('div');
    metaWrapper.className = `${TABLE_CLASS_D_FLEX} flex-column align-items-end`;

    const metaUser = document.createElement('small');
    metaUser.className = `${TABLE_CLASS_SMALL} ${TABLE_CLASS_TEXT_MUTED}`;
    metaUser.style.fontSize = '0.7rem';
    metaUser.style.display = 'none';

    const metaDate = document.createElement('small');
    metaDate.className = `${TABLE_CLASS_SMALL} ${TABLE_CLASS_TEXT_MUTED}`;
    metaDate.style.fontSize = '0.7rem';
    metaDate.style.display = 'none';
    
    // Cross icon on right - using Bootstrap btn-close
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = `${TABLE_CLASS_BTN} ${TABLE_CLASS_BTN_SM} btn-close opacity-50-hover`;
    closeButton.setAttribute('aria-label', TABLE_MESSAGE_CLOSE);
    closeButton.onclick = (e) => {
        e.stopPropagation();

        // Closing the details returns to the table (and the list URL).
        const parentContainer = rightPanelEle.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER);
        setInboxDetailOpen(rightPanelEle, false);
        const viewManager = parentContainer?.__listTable?.__sourceTable?.__viewManager;
        if (viewManager?.closeRecord) {
            viewManager.closeRecord();
            return;
        }

        // No view manager (detail shown elsewhere): just clear the panel.
        const currentWidth = rightPanelEle.style.width;
        const currentFlex = rightPanelEle.style.flex;
        
        rightPanelEle.innerHTML = '';
        rightPanelEle.className = rightPanelEle.className
            .split(' ')
            .filter(cls => !cls.includes('inbox-') && cls !== 'bg-white' && cls !== 'bg-light')
            .join(' ');
        
        rightPanelEle.classList.add(TABLE_CLASS_D_FLEX, TABLE_CLASS_FLEX_COLUMN, TABLE_CLASS_OVERFLOW_HIDDEN, TABLE_CLASS_P_0, TABLE_CLASS_M_0);
        
        // Restore width settings
        if (currentWidth) rightPanelEle.style.width = currentWidth;
        if (currentFlex) rightPanelEle.style.flex = currentFlex;
        
        const emptyState = document.createElement('div');
        emptyState.className = TABLE_CLASS_EMPTY_STATE;
        emptyState.innerHTML = TABLE_MESSAGE_EMPTY_DETAIL;
        rightPanelEle.appendChild(emptyState);
        
        // Remove active class from selected row
        const listTable = parentContainer?.querySelector(TABLE_SELECTOR_INBOX_LIST);
        if (listTable) {
            clearInboxRowSelection(listTable);
        }
    };
    
    header.appendChild(titleWrapper);
    header.appendChild(metaWrapper);
    header.appendChild(closeButton);

    const displayBy = getNestedDetailValue(data, [
        ['detail_summary', 'user_name'],
        ['updater', 'name'],
        ['updatedBy', 'name'],
        ['updated_by_user', 'name'],
        ['updated_by_name'],
        ['creator', 'name'],
        ['createdBy', 'name'],
        ['created_by_user', 'name'],
        ['created_by_name'],
    ]);
    const displayAt = getNestedDetailValue(data, [
        ['detail_summary', 'display_datetime'],
        ['updated_at'],
        ['updatedAt'],
        ['created_at'],
        ['createdAt'],
    ]);

    if (displayBy || displayAt) {
        metaUser.textContent = displayBy || '-';
        metaDate.textContent = displayAt || '-';
        metaUser.style.display = 'block';
        metaDate.style.display = 'block';
        metaWrapper.appendChild(metaUser);
        metaWrapper.appendChild(metaDate);
    }
    
    // Content container - using Bootstrap classes
    const contentContainer = document.createElement('div');
    contentContainer.className = `${TABLE_SELECTOR_DETAIL_CONTENT.slice(1)} flex-grow-1 ${TABLE_CLASS_W_100} overflow-auto p-2`;
    // Form-shaped skeleton (no spinner); refined below once the schema is known.
    const detailFormMode = options.formMode || 'view';
    showFormSkeleton(contentContainer, null, detailFormMode);

    // Assemble the panel
    rightPanelEle.appendChild(header);
    rightPanelEle.appendChild(contentContainer);
    
    try {
        const detailConfig = resolveDetailConfig(schema);
        // The form's view mode component wins over the table's deprecated details_component.
        detailConfig.detailsComponent = (await resolveFormViewComponent(detailConfig.formSchemaUid))
            || detailConfig.detailsComponent;

        // On the list page, the URL names the open record: /list/{table}/{view|edit}/{form}/{uid}.
        const viewManager = rightPanelEle.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER)?.__listTable?.__sourceTable?.__viewManager;
        if (viewManager && data?.uid && detailConfig.formSchemaUid) {
            viewManager.openUid = String(data.uid);
            if (typeof setTableUrlRecord === 'function') {
                setTableUrlRecord({
                    action: options.formMode === 'edit' ? 'edit' : 'view',
                    form: detailConfig.formSchemaUid,
                    uid: data.uid,
                });
            }
        }

        const preferredMode = resolvePreferredDetailRenderMode(detailConfig, options.preferredMode);
        const detailContext = createDetailContext(
            rightPanelEle,
            contentContainer,
            schema,
            data,
            detailConfig,
            preferredMode,
            options.formMode || 'view'
        );
        const detailAttempts = buildDetailAttempts(detailConfig, preferredMode);

        // A component renders first: a record-shaped skeleton, not a form's.
        const componentFirst = detailAttempts[0]?.type === DETAIL_RENDER_MODE_COMPONENT;
        if (componentFirst) {
            contentContainer.innerHTML = renderComponentSkeleton();
            // The Edit/Delete row goes above the component: add it now, so the
            // skeleton sits where the component will (no jump when it renders).
            appendHybridDetailActions(rightPanelEle, contentContainer, detailContext);
        }

        // Shape the skeleton like the form that will render: use the cached
        // schema now, or fetch it in parallel with the template (setupForm
        // then gets it from the same cache / pending request).
        const skeletonSchemaId = componentFirst
            ? null
            : detailAttempts.find((attempt) => attempt.type === DETAIL_RENDER_MODE_FORM)?.schemaId;
        if (skeletonSchemaId) {
            const cachedSchema = getCachedFormSchema(skeletonSchemaId);
            if (cachedSchema) {
                showFormSkeleton(contentContainer, cachedSchema, detailFormMode);
            } else {
                getFormSchema(skeletonSchemaId).then((schema) => {
                    const placeholder = contentContainer.firstElementChild;
                    if (schema && placeholder?.classList.contains('form-skeleton') && placeholder.dataset.shaped !== '1') {
                        showFormSkeleton(contentContainer, schema, detailFormMode);
                    }
                });
            }
        }

        window.uiDebug?.(TABLE_LOG_RESOLVED_DETAIL_STRATEGY, {
            entity: schema?.entity,
            uid: data?.uid || data?.id || null,
            preferredMode,
            requestedFormMode: detailContext.requestedFormMode,
            attempts: detailAttempts.map((attempt) => `${attempt.type}:${attempt.componentName}`),
        });

        if (!detailAttempts.length) {
            console.warn(TABLE_LOG_NO_DETAIL_RENDERER, {
                entity: schema?.entity,
                uid: data?.uid || data?.id || null,
            });
            contentContainer.innerHTML = renderFallbackDetailComponent(data);
            initializeDetailViewScripts(contentContainer);
            return;
        }

        let rendered = false;

        for (const attempt of detailAttempts) {
            window.uiDebug?.(`${TABLE_LOG_LOADING_DETAIL_ATTEMPT} ${attempt.type}: ${attempt.componentName}`);

            let result = null;

            if (attempt.type === DETAIL_RENDER_MODE_COMPONENT) {
                const [template, record] = await Promise.all([
                    fetchComponentTemplate(attempt.componentName, attempt.schemaId),
                    loadDetailRecord(schema, detailConfig, data),
                ]);

                result = template.success
                    ? {
                        success: true,
                        html: hydrateComponentTemplate(template.html, template.bindings || {}, record),
                    }
                    : template;
            } else {
                result = await fetchHtmlComponent(
                    attempt.schemaId,
                    data.uid,
                    attempt.componentName
                );
            }

            if (!result.success || !result.html) {
                console.warn(`${TABLE_LOG_FAILED_DETAIL_ATTEMPT} ${attempt.type}: ${attempt.componentName}`, result.error || result.message);
                continue;
            }

            contentContainer.innerHTML = result.html;
            
            // Ensure loaded content respects container width using Bootstrap classes
            const contentChildren = contentContainer.children;
            for (let child of contentChildren) {
                if (child.style) {
                    child.classList.add(TABLE_CLASS_W_100);
                    child.style.boxSizing = 'border-box'; // Bootstrap doesn't have a class for this
                }
            }
            
            const form = contentContainer.querySelector(TABLE_SELECTOR_DETAIL_FORM);
            if (form && typeof setupForm === 'function') {
                form.dataset.formData = JSON.stringify(data);
                form.__entityDataCache = data;
                // The list row: a form with its own dataEndpoint loads its record instead.
                form.dataset.recordSource = 'table-row';
                form.dataset.formMode = attempt.type === DETAIL_RENDER_MODE_FORM
                    ? detailContext.requestedFormMode
                    : 'view';
                const formMeta = await setupForm(form);

                if (!formMeta && form.dataset.schemaState === 'not-found') {
                    console.warn(`${TABLE_LOG_MISSING_FORM_SCHEMA} ${attempt.type}`);
                    continue;
                }
            }

            if (attempt.type === DETAIL_RENDER_MODE_COMPONENT) {
                appendHybridDetailActions(rightPanelEle, contentContainer, detailContext);
            } else {
                // A form has its own actions: drop the row added for the component.
                rightPanelEle.querySelector('.inbox-detail-actions')?.remove();
            }

            if (typeof setupCoreFormElement === 'function') {
                setupCoreFormElement();
            }
            
            initializeDetailViewScripts(contentContainer);
            
            window.uiDebug?.(`${TABLE_LOG_DETAIL_COMPONENT_LOADED} ${data.uid}`);
            rendered = true;
            break;
        }

        if (!rendered) {
            console.warn(TABLE_LOG_ALL_DETAIL_RENDERERS_FAILED, {
                entity: schema?.entity,
                uid: data?.uid || data?.id || null,
                preferredMode,
            });
            rightPanelEle.querySelector('.inbox-detail-actions')?.remove();
            contentContainer.innerHTML = renderFallbackDetailComponent(data);
            initializeDetailViewScripts(contentContainer);
        }

    } catch (error) {
        console.error(TABLE_LOG_DETAIL_COMPONENT_ERROR, {
            entity: schema?.entity,
            uid: data?.uid || data?.id || null,
            error,
        });
        contentContainer.innerHTML = renderFallbackDetailComponent(data);
        initializeDetailViewScripts(contentContainer);
    }
}

// Update showDetailError to use Bootstrap classes
function showDetailError(container, message) {
    container.innerHTML = `
        <div class="${TABLE_CLASS_ALERT} ${TABLE_CLASS_ALERT_DANGER} m-0 ${TABLE_CLASS_W_100}">
            <h5>${TABLE_MESSAGE_ERROR_LOADING_DETAILS}</h5>
            <p class="${TABLE_CLASS_MB_2}">${message}</p>
            <button class="${TABLE_CLASS_BTN} ${TABLE_CLASS_BTN_SM} btn-outline-danger" onclick="location.reload()">
                ${TABLE_MESSAGE_RELOAD_PAGE}
            </button>
        </div>
    `;
}

function initializeInboxSummaryComponents(container) {
    const summaryNodes = container.querySelectorAll(TABLE_SELECTOR_SUMMARY_NODES);
    summaryNodes.forEach((node) => {
        node.dataset.summaryInitialized = 'true';
        executeComponentScripts(node);
    });
}

function initializeDetailViewScripts(container) {
    executeComponentScripts(container);
    
    const event = new CustomEvent(TABLE_EVENT_INBOX_DETAIL_LOADED, { 
        bubbles: true,
        detail: { container }
    });
    container.dispatchEvent(event);
}

function shouldWarnBeforeReplacingDetail(rightPanelEle) {
    const activeEditForm = rightPanelEle?.querySelector(TABLE_SELECTOR_ACTIVE_EDIT_FORM);
    return !!activeEditForm;
}

function confirmDetailReplacement(rightPanelEle) {
    if (!shouldWarnBeforeReplacingDetail(rightPanelEle)) {
        return true;
    }

    return window.confirm(TABLE_MESSAGE_CONFIRM_UNSAVED);
}

