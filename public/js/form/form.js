let dtpOption

const DEFAULT_FORM_CONFIG = {
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    allowSubmit: true,
    allowCancel: true,
    renderMode: 'default',
    enctype: 'multipart/form-data',
    fields: [],
    actions: [],
};

function mergeFormConfigs(defaultConfig, schemaConfig = {}, userConfig = {}) {
    return {
        ...defaultConfig,
        ...schemaConfig,
        ...userConfig,
        header: mergeNestedFormObject(defaultConfig.header, schemaConfig.header, userConfig.header),
        info: mergeNestedFormObject(defaultConfig.info, schemaConfig.info, userConfig.info),
        placeholder: mergeNestedFormObject(defaultConfig.placeholder, schemaConfig.placeholder, userConfig.placeholder),
        fields: mergeFormFields(defaultConfig.fields || [], schemaConfig.fields || [], userConfig.fields || []),
        actions: mergeFormActions(defaultConfig.actions || [], schemaConfig.actions || [], userConfig.actions || []),
    };
}

function mergeNestedFormObject(defaultValue = {}, schemaValue = {}, userValue = {}) {
    return {
        ...(defaultValue || {}),
        ...(schemaValue || {}),
        ...(userValue || {}),
    };
}

function mergeFormFields(defaultFields, schemaFields, userFields) {
    return schemaFields.map((field, index) => {
        const fieldKey = field?.id ?? field?.name ?? index;
        const defaultField = defaultFields.find(item => (item?.id ?? item?.name) === fieldKey);
        const userField = userFields.find(item => (item?.id ?? item?.name) === fieldKey);

        return {
            ...(defaultField || {}),
            ...(field || {}),
            ...(userField || {}),
        };
    });
}

function mergeFormActions(defaultActions, schemaActions, userActions) {
    return schemaActions.map((action, index) => {
        const actionKey = action?.id ?? action?.route ?? action?.text ?? index;
        const defaultAction = defaultActions.find(item => (item?.id ?? item?.route ?? item?.text) === actionKey);
        const userAction = userActions.find(item => (item?.id ?? item?.route ?? item?.text) === actionKey);

        return {
            ...(defaultAction || {}),
            ...(action || {}),
            ...(userAction || {}),
            element: mergeNestedFormObject(defaultAction?.element, action?.element, userAction?.element),
        };
    });
}

function getUserFormPersonalization(formId) {
    return {};
}

function resolveFormMode(formElement, formMeta = {}) {
    const explicitMode = formElement.dataset.formMode || formMeta.formMode;
    if (explicitMode === 'view' || explicitMode === 'edit' || explicitMode === 'create' || explicitMode === 'delete') {
        return explicitMode;
    }

    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes('/view/')) {
        return 'view';
    }

    if (pathname.includes('/edit/')) {
        return formElement.dataset.entityUid ? 'edit' : 'create';
    }

    if (pathname.includes('/delete/')) {
        return 'delete';
    }

    if (formElement.closest('.inbox-detail-content')) {
        return 'view';
    }

    return 'edit';
}

function isFormReadOnly(formMeta = {}) {
    return formMeta.formMode === 'view';
}

/**
 * A field with "showIn": ["edit", "create"] only appears (and is only
 * submitted) in those modes, e.g. a "new password" field that has nothing to
 * show in view mode. Fields without "showIn" appear in every mode.
 */
function isFieldShownInMode(field, formMode = 'edit') {
    return !Array.isArray(field?.showIn) || field.showIn.includes(formMode || 'edit');
}

/**
 * "requiredIn": ["create"] makes a field required only in those modes, e.g. a
 * password that must be set when creating a user but can stay blank on edit.
 */
function applyModeRequired(field, formMode = 'edit') {
    if (Array.isArray(field?.requiredIn)) {
        field.required = field.requiredIn.includes(formMode || 'edit');
    }
}

function resolveModeConfig(formMeta = {}) {
    const formMode = formMeta.formMode || 'edit';
    const modes = formMeta.modes || {};
    return modes[formMode] || {};
}

function resolveFormHeaderConfig(formMeta = {}) {
    const modeConfig = resolveModeConfig(formMeta);
    const modeHeader = modeConfig.header || {};
    const baseHeader = formMeta.header || {};

    return {
        ...baseHeader,
        ...modeHeader,
        text: modeHeader.title || modeHeader.text || baseHeader.text || formMeta.heading,
    };
}

function resolveFormInfoConfig(formMeta = {}) {
    const modeConfig = resolveModeConfig(formMeta);
    const modeHeader = modeConfig.header || {};
    const baseInfo = formMeta.info || {};

    return {
        ...baseInfo,
        icon: baseInfo.icon,
        innerHTML: modeHeader.description || baseInfo.innerHTML || '',
    };
}

function resolveFormTransportConfig(formMeta = {}) {
    const modeConfig = resolveModeConfig(formMeta);

    return {
        method: modeConfig.method || formMeta.method || 'POST',
        endpoint: modeConfig.endpoint || formMeta.endpoint || null,
    };
}

function applyModeOverrides(formMeta = {}) {
    const modeConfig = resolveModeConfig(formMeta);
    const modePermissions = {
        create: {
            allowView: false,
            allowEdit: false,
            allowDelete: false,
            allowSubmit: true,
            allowCancel: true,
        },
        view: {
            allowView: true,
            allowEdit: true,
            allowDelete: true,
            allowSubmit: false,
            allowCancel: false,
        },
        edit: {
            allowView: true,
            allowEdit: true,
            allowDelete: true,
            allowSubmit: true,
            allowCancel: true,
        },
        delete: {
            allowView: true,
            allowEdit: false,
            allowDelete: true,
            allowSubmit: false,
            allowCancel: true,
        },
    };
    const overrideKeys = ['allowView', 'allowEdit', 'allowDelete', 'allowSubmit', 'allowCancel'];
    const activeMode = formMeta.formMode || 'edit';
    const defaultModePermissions = modePermissions[activeMode] || {};

    overrideKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(defaultModePermissions, key)) {
            formMeta[key] = defaultModePermissions[key];
        }
    });

    overrideKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(modeConfig, key)) {
            formMeta[key] = modeConfig[key];
        }
    });

    return formMeta;
}

/**
 * What this user may do with this record, from the record itself: a module's
 * data endpoint adds "_can": {"edit": bool, "delete": bool} to a row, and the
 * Edit / Delete buttons follow it (the endpoints still check).
 */
function applyRecordPermissions(formMeta, formElement) {
    let record = formElement.__entityDataCache || null;
    if (!record && formElement.dataset.formData) {
        try {
            record = JSON.parse(formElement.dataset.formData);
        } catch (error) {
            record = null;
        }
    }
    const can = record && typeof record === 'object' ? record._can : null;
    if (!can || typeof can !== 'object') {
        return;
    }
    if (can.edit === false) {
        formMeta.allowEdit = false;
    }
    if (can.delete === false) {
        formMeta.allowDelete = false;
    }
}

function buildFormRoute(formId, entityUid, mode = 'view') {
    if (!formId || !entityUid) {
        return null;
    }

    return `/${mode}/${formId}/${entityUid}`;
}

/**
 * Loading placeholder shaped like the form setupForm() will render, so the
 * swap to the real form doesn't jump: same card padding, header (title, plus
 * the Edit/Delete links in view mode), field grid (same column classes via
 * resolveFieldSizeConfig/addFieldSize), label height, value box / input /
 * textarea heights, and footer buttons only when the form will have them.
 *
 * @param {object|null} schema   form schema if known (cached); null → generic shape
 * @param {string}      formMode 'view' | 'edit' | 'create' | 'delete'
 * @returns {HTMLElement} element with class "form-skeleton"
 */
function buildFormSkeletonElement(schema = null, formMode = 'edit') {
    const meta = schema ? applyModeOverrides({ ...schema, formMode }) : { formMode };
    const readOnly = formMode === 'view';
    const bar = (classes, style) => `<div class="bg-info-subtle rounded ${classes}" style="${style}"></div>`;

    const skeleton = document.createElement(HTML_TAG.DIV);
    skeleton.className = 'form-skeleton placeholder-wave w-100 p-1';
    skeleton.dataset.shaped = schema ? '1' : '0';
    skeleton.setAttribute('aria-busy', 'true');

    // Header: title bar; view mode also shows the Edit / Delete links.
    const hasHeader = schema ? Boolean(resolveFormHeaderConfig(meta).text) : true;
    if (hasHeader) {
        const header = document.createElement(HTML_TAG.DIV);
        header.className = 'd-flex align-items-center justify-content-between gap-2 mb-2';
        header.style.minHeight = '31px';
        header.innerHTML = bar('', 'width: 40%; height: 1.1rem;')
            + (readOnly ? `<div class="d-flex gap-3">${bar('', 'width: 2.5rem; height: 0.9rem;')}${bar('', 'width: 3rem; height: 0.9rem;')}</div>` : '');
        skeleton.appendChild(header);
    }

    // Fields: real column classes; label line + control at its real height.
    const fields = schema && Array.isArray(schema.fields)
        ? schema.fields.filter((field) => field && field.type !== 'hidden' && isFieldShownInMode(field, formMode))
        : [{}, {}, {}, {}];
    const row = document.createElement(HTML_TAG.DIV);
    row.className = readOnly ? 'row g-2 gy-3' : 'row g-2';

    fields.forEach((field) => {
        const col = document.createElement(HTML_TAG.DIV);
        const isSpacer = typeof isSpacerField === 'function' && isSpacerField(field);
        const sizeConfig = isSpacer ? resolveSpacerSizeConfig(field) : resolveFieldSizeConfig(field, meta);
        addFieldSize({ _resolvedSize: sizeConfig }, col);

        if (!isSpacer && readOnly && field.type === 'image') {
            // Picture (renderReadOnlyImage): label line + square.
            const maxWidth = field.maxWidth || '240px';
            col.innerHTML = `<div class="py-1">${bar('col-3', 'height: 0.75rem;')}<div class="mt-2 bg-info-subtle rounded" style="max-width: ${maxWidth}; aspect-ratio: ${field.aspectRatio || '1 / 1'};"></div></div>`;
        } else if (!isSpacer && readOnly) {
            // Details grid (renderReadOnlyField): small label line, value line, no divider.
            col.innerHTML = `<div class="py-1">${bar('col-3', 'height: 0.75rem;')}<div class="mt-2">${bar('col-7', 'height: 1.1rem;')}</div></div>`;
        } else if (!isSpacer) {
            const rows = Math.max(1, parseInt(field.rows, 10) || 2);
            const controlHeight = (field.type === 'textarea'
                    ? `calc(${rows} * 1.5rem + 0.75rem + 2px)`     // textarea rows
                    : 'calc(1.5rem + 0.75rem + 2px)');             // .form-control
            const hasLabel = !schema || Boolean(field.label);

            col.innerHTML = (hasLabel
                ? `<div class="d-flex align-items-center mb-2" style="height: 1.5rem;">${bar('col-5', 'height: 1rem;')}</div>`
                : '')
                + bar('col-12', `height: ${controlHeight};`);
        }

        row.appendChild(col);
    });
    skeleton.appendChild(row);

    // Footer: none in view mode; otherwise the action/submit/cancel buttons.
    if (!readOnly) {
        const actions = Array.isArray(meta.actions) ? meta.actions : [];
        const buttonCount = actions.length > 0
            ? actions.length + (meta.allowCancel && !actions.some((a) => a?.type === 'cancel') ? 1 : 0)
            : (meta.allowCancel ? 1 : 0) + ((meta.submitButtonLabel || meta.allowSubmit) ? 1 : 0);
        const align = { start: 'justify-content-start', center: 'justify-content-center', end: 'justify-content-end' }[
            actions.map((a) => a?.align).find(Boolean)
        ] || 'justify-content-end';

        if (buttonCount > 0) {
            const footer = document.createElement(HTML_TAG.DIV);
            // As the real buttons: the action bar's gap and line above them (lab-form-actions), button-sized.
            footer.className = `d-flex align-items-center ${align} gap-2 lab-form-actions`;
            footer.innerHTML = Array.from({ length: buttonCount }, () => bar('', 'width: 96px; height: 2.5rem;')).join('');
            skeleton.appendChild(footer);
        }
    }

    return skeleton;
}

/**
 * Show a form-shaped skeleton in a container while a form loads.
 */
function showFormSkeleton(container, schema = null, formMode = 'edit') {
    container.innerHTML = '';
    container.appendChild(buildFormSkeletonElement(schema, formMode));
}

/**
 * Cached schema for a form id, if already fetched (no request).
 */
function getCachedFormSchema(formId) {
    return formId && typeof formSchemaCache !== 'undefined' ? formSchemaCache.get(formId) || null : null;
}

function resolveInboxDetailContext(formElement) {
    return formElement.closest('.inbox-detail-content')?.__detailContext || null;
}

function extractResultRecord(result) {
    return result?.data
        || result?.response_schema?.data
        || result?.response_schema?.record
        || null;
}

function mergeSubmittedDetailData(currentData, payload, result) {
    const resultRecord = extractResultRecord(result);
    if (resultRecord && typeof resultRecord === 'object') {
        return resultRecord;
    }

    const currentMeta = Array.isArray(currentData?.meta) ? currentData.meta : [];
    const payloadMeta = payload?.meta && typeof payload.meta === 'object' ? payload.meta : null;
    const mergedMeta = payloadMeta
        ? Object.entries(payloadMeta).map(([meta_key, meta_value]) => ({ meta_key, meta_value }))
        : currentMeta;

    return {
        ...(currentData || {}),
        ...(payload || {}),
        meta: mergedMeta,
    };
}

async function returnToPreferredInboxDetail(detailContext, overrides = {}) {
    if (!detailContext || typeof window.openInboxDetailInPreferredMode !== 'function') {
        console.warn('⚠️ Unable to return to preferred inbox detail mode because the shared detail bridge is unavailable.', {
            detailContext,
            overrides,
        });
        return false;
    }

    await window.openInboxDetailInPreferredMode(detailContext, overrides);
    return true;
}

/**
 * Fields shown only while another field has a value:
 *   {"id": "pass_price", ..., "showWhen": {"field": "is_paid", "equals": true}}
 * A checkbox compares its ticked state (true / false), other fields their value
 * ("equals" may be a list: any of them). Edit / create follow the input as it
 * changes; view mode uses the record's value. Hidden fields keep their value.
 */
function applyFieldVisibility(formElement, formMeta) {
    const rules = (formMeta?.fields || []).filter((field) => field?.showWhen?.field && field._domId);
    if (!rules.length) {
        return;
    }
    const scope = formElement.__formCard?.isConnected ? formElement.__formCard : formElement;
    const record = formElement.__entityDataCache || (() => {
        try {
            return JSON.parse(formElement.__pageFormData || '{}');
        } catch (e) {
            return {};
        }
    })();

    const currentValue = (name) => {
        const inputs = [...scope.querySelectorAll(`[name="${name}"], [name="${name}[]"]`)]
            .filter((el) => el.type !== 'hidden');
        if (!inputs.length) {
            return record?.[name];
        }
        if (inputs[0].type === 'checkbox' && inputs.length === 1) {
            return inputs[0].checked;
        }
        if (inputs[0].type === 'radio' || inputs[0].type === 'checkbox') {
            return inputs.find((el) => el.checked)?.value ?? null;
        }
        return inputs[0].value;
    };
    const matches = (value, expected) => {
        const list = Array.isArray(expected) ? expected : [expected];
        return list.some((want) => (typeof want === 'boolean'
            ? Boolean(value === true || value === 1 || value === '1' || value === 'true') === want
            : String(value ?? '') === String(want)));
    };
    // A field shows when its condition holds and the field it depends on shows too
    // (e.g. "Valid from" needs "Valid", which is hidden for a physical item).
    const ruleById = new Map(rules.map((field) => [field.id, field]));
    const isShown = (field, seen = new Set()) => {
        if (seen.has(field.id)) {
            return true; // a loop in the schema: don't hang
        }
        seen.add(field.id);
        if (!matches(currentValue(field.showWhen.field), field.showWhen.equals ?? true)) {
            return false;
        }
        const parent = ruleById.get(field.showWhen.field);

        return parent ? isShown(parent, seen) : true;
    };
    const update = (animate = true) => {
        rules.forEach((field) => {
            // Every field has its column "{domId}-field" (checkboxes and selects have no "-container").
            const find = (id) => scope.querySelector(`[id="${id}"]`) || document.getElementById(id);
            const container = find(field._domId + SUFFIX.CONTAINER);
            const show = isShown(field);
            const target = find(field._domId + SUFFIX.FIELD)
                || container?.closest('.col, [class*="col-"]')
                || container;
            if (!target) {
                return;
            }
            const wasHidden = target.style.display === 'none';
            target.style.display = show ? '' : 'none';
            // A hidden field isn't asked for: its "required" waits until it shows again.
            if (show) {
                target.querySelectorAll('[data-show-when-required]').forEach((el) => {
                    el.required = true;
                    delete el.dataset.showWhenRequired;
                });
            } else {
                target.querySelectorAll('[required]').forEach((el) => {
                    el.required = false;
                    el.dataset.showWhenRequired = '1';
                });
            }
            // Appearing fields fade in.
            if (show && wasHidden && animate) {
                target.style.transition = 'opacity .2s ease';
                target.style.opacity = '0';
                requestAnimationFrame(() => { target.style.opacity = '1'; });
            }
        });
    };

    update(false);
    const triggers = new Set(rules.map((field) => field.showWhen.field));
    triggers.forEach((name) => {
        scope.querySelectorAll(`[name="${name}"], [name="${name}[]"]`).forEach((el) => {
            el.addEventListener('change', update);
            el.addEventListener('input', update);
        });
    });
}

/**
 * Show a page's form again in another mode (view ↔ edit) with the values the
 * page gave it: a fresh <form> with the same id, record and values replaces
 * the old one and its card (and the schema label), then it is set up again.
 */
async function switchFormModeInPlace(formElement, nextMode) {
    const fresh = document.createElement('form');
    ['id', 'method', 'enctype'].forEach((name) => {
        const value = formElement.getAttribute(name);
        if (value) {
            fresh.setAttribute(name, value);
        }
    });
    fresh.className = 'lab-form';
    fresh.dataset.entityUid = formElement.dataset.entityUid || '';
    fresh.dataset.formMode = nextMode;
    fresh.dataset.formData = formElement.__pageFormData;
    fresh.__pageFormData = formElement.__pageFormData;
    // Cancel in edit goes back to view (not back in history) once switched here.
    fresh.__switchedInPlace = nextMode === 'edit';
    if (formElement.dataset.recaptchaAction) {
        fresh.dataset.recaptchaAction = formElement.dataset.recaptchaAction;
    }
    const token = formElement.querySelector('input[name="_token"]');
    if (token) {
        fresh.appendChild(token.cloneNode());
    }

    // The new form goes where the old card was; the card (with the old form,
    // its header and buttons) and the schema label go.
    const card = formElement.__formCard?.isConnected ? formElement.__formCard : null;
    const label = formElement.nextElementSibling?.classList?.contains('ui-form-schema-label')
        ? formElement.nextElementSibling
        : null;
    (card || formElement).before(fresh);
    label?.remove();
    (card || formElement).remove();

    await setupForm(fresh);
}

async function switchFormMode(formElement, nextMode, formMeta) {
    const entityUid = formElement.dataset.entityUid;
    const route = buildFormRoute(formMeta.id, entityUid, nextMode);
    const detailContainer = formElement.closest('.inbox-detail-content');
    const detailContext = resolveInboxDetailContext(formElement);
    const currentFormData = formElement.__entityDataCache || (() => {
        try {
            return formElement.dataset.formData ? JSON.parse(formElement.dataset.formData) : null;
        } catch (error) {
            return null;
        }
    })();

    if (!detailContainer || !entityUid) {
        // A form on its own page with the page's values (e.g. Payment settings):
        // switch here. The generic /edit page would load the record from the
        // entity API, which such forms don't have, and open empty.
        if (formElement.__pageFormData) {
            await switchFormModeInPlace(formElement, nextMode);
            return;
        }
        if (route) {
            window.location.href = route;
        }
        return;
    }

    if (detailContext?.componentBackedEdit && nextMode === 'view') {
        window.uiDebug?.('🔁 Returning inbox detail to component view from form mode.', {
            entity: detailContext.schema?.entity,
            uid: detailContext.data?.uid || detailContext.data?.id || null,
            nextMode,
        });

        detailContext.data = currentFormData || detailContext.data;
        await returnToPreferredInboxDetail(detailContext, {
            preferredMode: 'component',
            formMode: 'view',
        });
        return;
    }

    showFormSkeleton(detailContainer, getCachedFormSchema(formMeta.id), nextMode);

    // List page: the URL follows view ↔ edit (/list/{table}/{view|edit}/{form}/{uid}).
    if (typeof setTableUrlRecord === 'function') {
        setTableUrlRecord({ action: nextMode === 'edit' ? 'edit' : 'view', form: formMeta.id, uid: entityUid });
    }

    const result = await fetchHtmlComponent(formMeta.id, entityUid, 'userinterface::components.lab-form');

    if (!result?.success || !result?.html) {
        detailContainer.innerHTML = `
            <div class="alert alert-danger m-2">
                Unable to switch the form to ${nextMode} mode.
            </div>
        `;
        return;
    }

    detailContainer.innerHTML = result.html;

    const nextForm = detailContainer.querySelector('.lab-form, .shoz-form');
    if (!nextForm) {
        return;
    }

    if (currentFormData && typeof currentFormData === 'object') {
        nextForm.dataset.formData = JSON.stringify(currentFormData);
        nextForm.__entityDataCache = currentFormData;
    }

    nextForm.dataset.formMode = nextMode;

    const nextFormMeta = await setupForm(nextForm);
    if (typeof setupCoreFormElement === 'function') {
        setupCoreFormElement();
    }
    if (typeof initializeDetailViewScripts === 'function') {
        initializeDetailViewScripts(detailContainer);
    }

    return nextFormMeta;
}

async function handleFormDeleteAction(formElement, formMeta) {
    const entityUid = formElement.dataset.entityUid;
    if (!entityUid || !formMeta.entity) {
        return;
    }

    const confirmed = window.confirm('Delete this record? This action cannot be undone.');
    if (!confirmed) {
        return;
    }

    const endpoint = resolveDynamicFormEndpoint(
        {
            ...formMeta,
            method: 'DELETE',
        },
        formElement,
        'DELETE'
    );

    try {
        const result = await submitDynamicFormRequest(endpoint, 'DELETE', {}, formElement);
        if (!result?.success) {
            console.error('Delete request failed.', { endpoint, result });
            return;
        }

        const detailContainer = formElement.closest('.inbox-detail-content');
        const tableElement = document.querySelector('.lab-table');

        if (detailContainer) {
            detailContainer.innerHTML = `
                <div class="alert alert-success m-2">
                    Record deleted successfully.
                </div>
            `;
        }

        // A record open on the list page: drop it from the URL and refresh the list.
        if (detailContainer && tableElement?.__viewManager?.recordDeleted) {
            await tableElement.__viewManager.recordDeleted();
            return;
        }

        if (tableElement && typeof window.clearLabTableCache === 'function') {
            window.clearLabTableCache(tableElement);
        }

        if (tableElement && typeof $ !== 'undefined' && $.fn.DataTable && $.fn.DataTable.isDataTable(tableElement)) {
            $(tableElement).DataTable().ajax.reload(null, false);
            return;
        }

        window.location.reload();
    } catch (error) {
        console.error('Delete request failed.', error);
    }
}

async function handleFormCancelAction(formElement, formMeta) {
    const entityUid = formElement.dataset.entityUid;
    const detailContainer = formElement.closest('.inbox-detail-content');
    const detailContext = resolveInboxDetailContext(formElement);

    if (detailContext?.componentBackedEdit && formMeta.formMode === 'edit') {
        window.uiDebug?.('↩️ Canceling inbox detail edit and restoring component view.', {
            entity: detailContext.schema?.entity,
            uid: detailContext.data?.uid || detailContext.data?.id || null,
        });

        await returnToPreferredInboxDetail(detailContext, {
            preferredMode: 'component',
            formMode: 'view',
        });
        return;
    }

    if (detailContainer && entityUid && formMeta.formMode === 'edit') {
        await switchFormMode(formElement, 'view', formMeta);
        return;
    }

    // Opened with Edit on this page: Cancel shows the values again (read-only).
    if (formElement.__switchedInPlace && formMeta.formMode === 'edit') {
        await switchFormModeInPlace(formElement, 'view');
        return;
    }

    if (window.history.length > 1) {
        window.history.back();
        return;
    }

    const viewRoute = buildFormRoute(formMeta.id, entityUid, 'view');
    if (viewRoute) {
        window.location.href = viewRoute;
    }
}

function createHeaderIconButton(iconClasses, title, buttonClasses, clickHandler) {
    const button = document.createElement(HTML_TAG.BUTTON);
    button.type = 'button';
    button.className = buttonClasses;
    button.title = title;

    const icon = document.createElement('i');
    icon.className = iconClasses;
    button.appendChild(icon);

    button.addEventListener('click', clickHandler);
    return button;
}

function appendDefaultCancelButton(container, formElement, formMeta) {
    if (!formMeta.allowCancel) {
        return;
    }

    const cancelBtn = document.createElement(HTML_TAG.BUTTON);
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add(STYLE_CLASS.BTN, STYLE_CLASS.BTN_SM, STYLE_CLASS.BTN_OUTLINE_SECONDARY);
    cancelBtn.addEventListener('click', (event) => {
        event.preventDefault();
        handleFormCancelAction(formElement, formMeta);
    });
    container.insertBefore(cancelBtn, container.firstChild);
}

function appendViewModeActions(container, formMeta, formElement) {
    const entityUid = formElement.dataset.entityUid;
    if (!entityUid) {
        // Not an entity record: a view mode can still link to its edit page
        // ("modes.view.editUrl"), e.g. My Profile -> Settings.
        const editUrl = resolveModeConfig(formMeta).editUrl;
        if (formMeta.allowEdit && editUrl) {
            const link = createHeaderIconButton(
                'fas fa-pencil-alt',
                'Edit',
                'btn btn-sm btn-link text-dark text-decoration-none d-inline-flex align-items-center gap-1 px-0',
                (event) => {
                    event.preventDefault();
                    window.location.href = editUrl;
                }
            );
            container.appendChild(link);
        }
        return;
    }

    if (formMeta.allowEdit) {
        container.appendChild(
            createHeaderIconButton(
                'fas fa-pencil-alt',
                'Edit',
                'btn btn-sm btn-link text-dark text-decoration-none d-inline-flex align-items-center gap-1 px-0',
                (event) => {
                    event.preventDefault();
                    switchFormMode(formElement, 'edit', formMeta);
                }
            )
        );
    }

    if (formMeta.allowDelete) {
        container.appendChild(
            createHeaderIconButton(
                'fas fa-trash',
                'Delete',
                'btn btn-sm btn-link text-danger text-decoration-none d-inline-flex align-items-center gap-1 px-0',
                (event) => {
                    event.preventDefault();
                    handleFormDeleteAction(formElement, formMeta);
                }
            )
        );
    }
}

async function setupForm(formElement) {
    window.uiDebug?.("setuping lab-form...")
    window.uiDebug?.("formId = " + formElement.id)

    // The values the page gave (data-form-data, used up while rendering): kept so
    // Edit / Cancel can show the form again in the other mode with the same values.
    if (formElement.dataset.formData && formElement.__pageFormData === undefined) {
        formElement.__pageFormData = formElement.dataset.formData;
    }

    // The server renders a generic skeleton when it can't resolve the schema
    // (e.g. reusable form templates in the table split view). If the schema
    // is already cached, swap in the exact shape before the first paint.
    const serverSkeleton = formElement.querySelector('.form-skeleton');
    const cachedSchema = getCachedFormSchema(formElement.id);
    if (serverSkeleton && serverSkeleton.dataset.shaped !== '1' && cachedSchema) {
        serverSkeleton.replaceWith(buildFormSkeletonElement(cachedSchema, formElement.dataset.formMode || 'edit'));
    }

    let schemaMeta = formElement.dataset.formMeta
    if (schemaMeta) {
        schemaMeta = JSON.parse(schemaMeta)
        delete formElement.dataset.formMeta
    } else {
        schemaMeta = await getFormSchema(formElement.id)
    }

    if (!schemaMeta) {
        
        handleSchemaNotFound(formElement);
        // break the code
        return;
    }

    const formMeta = mergeFormConfigs(
        DEFAULT_FORM_CONFIG,
        schemaMeta,
        getUserFormPersonalization(formElement.id)
    );

    window.uiDebug?.("formMeta>>>>>>>>>>>", formMeta)


    //Skeleton remove
    const skeletonContainer = formElement.querySelector(".form-skeleton");
    if (skeletonContainer) {
        skeletonContainer.remove();
    }



    formMeta.id = formElement.id
    formMeta.formMode = resolveFormMode(formElement, formMeta);
    formElement.dataset.formMode = formMeta.formMode;
    applyModeOverrides(formMeta);
    applyRecordPermissions(formMeta, formElement);

    // ✅ Access check
    const hasAccess = checkFormAccess(formMeta,formElement);
    if (!hasAccess) {
        return;
    }

    const transportConfig = resolveFormTransportConfig(formMeta);
    formMeta.method = transportConfig.method;
    formMeta.endpoint = transportConfig.endpoint
        ? transportConfig.endpoint.replace('{uid}', formElement.dataset.entityUid || '')
        : null;
    formElement.__formMeta = formMeta;

    const renderMode = formElement.dataset.renderMode || formMeta.renderMode || 'default';
    formMeta.renderMode = renderMode;

    if (renderMode === 'modal') {
        await renderFormForModal(formElement, formMeta);
        applyFieldVisibility(formElement, formMeta);
        bindDynamicFormSubmit(formElement, formMeta);
        appendFormSchemaLabel(formElement, formMeta);
        return formMeta;
    }

    const cardProvider = new CardProvider(formMeta.placeholder);
    formElement.before(cardProvider.getCard());
    // The form's own card (the form ends up inside it): switchFormModeInPlace replaces it whole.
    formElement.__formCard = cardProvider.getCard();

    const resolvedHeader = resolveFormHeaderConfig(formMeta);
    // A read-only record needs the header row for its Edit / Delete buttons even
    // when the schema has no heading (e.g. a record section of a table).
    const readOnlyWithActions = isFormReadOnly(formMeta)
        && Boolean(formElement.dataset.entityUid)
        && (formMeta.allowEdit || formMeta.allowDelete);
    if (resolvedHeader.text || readOnlyWithActions) {
        const cardHeader = cardProvider.getCardHeader();
        setupFormHeader(cardHeader, formMeta, formElement);
    }

    // View mode with a component (schema "modes": {"view": {"component": "user.details"}}):
    // the component shows the record instead of the fields. In a table's
    // right panel the panel renders it (recordSource "table-row").
    const viewComponent = formMeta.formMode === 'view'
        && formElement.dataset.recordSource !== 'table-row'
        && formElement.dataset.entityUid
        ? (resolveModeConfig(formMeta).component || null)
        : null;
    const componentShown = viewComponent
        ? await renderFormViewComponent(cardProvider.getCardBody(), formMeta, formElement, viewComponent)
        : false;

    if (!componentShown && (formMeta.fields || formMeta.actions)) {
        if (formMeta.fields) {
            const cardBody = cardProvider.getCardBody();
            // Awaited: the fields wait for the record and remote options, and the
            // buttons below must come after them (else "Continue" sits above the input).
            await setupFormBody(cardBody, formMeta);
        }
        // Only real actions: an empty list ([] is truthy) would add a second footer
        // with just a Cancel under the default Cancel / Submit row.
        if (Array.isArray(formMeta.actions) && formMeta.actions.length > 0 && !isFormReadOnly(formMeta)) {
            const cardFooter = cardProvider.getCardFooter();
            cardFooter.classList.add('lab-form-actions');
            setupFormFooter(cardFooter, formMeta, formElement);
        }
    }

    const hasSchemaActions = Array.isArray(formMeta.actions) && formMeta.actions.length > 0;

    if (!isFormReadOnly(formMeta) && !hasSchemaActions && (formMeta.submitButtonLabel || formMeta.allowSubmit || formMeta.allowCancel)) {
        // create a container for buttons
        const btnContainer = document.createElement(HTML_TAG.DIV);
        btnContainer.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.GAP_2, 'lab-form-actions'); // sticky action bar (7-form-modern.css)


        // Cancel button
        if (formMeta.allowCancel) {
            btnContainer.classList.add(STYLE_CLASS.JUSTIFY_CONTENT_END);
            appendDefaultCancelButton(btnContainer, formElement, formMeta);
        }

        // Submit button
        if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
            window.uiDebug?.("Adding submit button with label:", formMeta.submitButtonLabel);
            const submitBtn = document.createElement(HTML_TAG.BUTTON);
            submitBtn.type = "submit";
            submitBtn.textContent = formMeta.submitButtonLabel || "Submit";
            submitBtn.classList.add(STYLE_CLASS.BTN, STYLE_CLASS.BTN_SM, STYLE_CLASS.BTN_OUTLINE_PRIMARY);
            btnContainer.classList.add(STYLE_CLASS.JUSTIFY_CONTENT_END);
            btnContainer.appendChild(submitBtn);
            
        }

        

        // append container to the form
        formElement.appendChild(btnContainer);
    }

    if (formMeta.cardElevation) {
        window.uiDebug?.("Applying Bootstrap card elevation styles");

        formElement.classList.add(
            STYLE_CLASS.SHADOW,
            STYLE_CLASS.ROUNDED_3,
            STYLE_CLASS.P_3,
            STYLE_CLASS.TRANSITION_ALL
        );

        // Optional hover animation
        formElement.addEventListener(CONSTANT.MOUSE_ENTER, () => {
            formElement.classList.replace(STYLE_CLASS.SHADOW, STYLE_CLASS.SHADOW_LG);
        });
        formElement.addEventListener(CONSTANT.MOUSE_LEAVE, () => {
            formElement.classList.replace(STYLE_CLASS.SHADOW_LG, STYLE_CLASS.SHADOW);
        });
    }

    // Skeleton screen rendering
    // if (formMeta.skeletonRender) {
    //     // window.uiDebug?.("Applying Bootstrap skeleton render styles", formMeta.skeletonRender);

    //     // ✅ Create skeleton container
    //     const skeletonWrapper = document.createElement(HTML_TAG.DIV);
    //     skeletonWrapper.classList.add(
    //         STYLE_CLASS.CARD, 
    //         STYLE_CLASS.P_4, 
    //         STYLE_CLASS.MB_3, 
    //         STYLE_CLASS.SHADOW_SM, 
    //         STYLE_CLASS.ROUNDED_3, 
    //         STYLE_CLASS.SKELETON_WRAPPER
    //     );

    //     // ✅ Create skeleton items dynamically based on fields
    //     if (Array.isArray(formMeta.fields)) {
    //         formMeta.fields.forEach(() => {
    //             const fieldGroup = document.createElement(HTML_TAG.DIV);
    //             fieldGroup.classList.add(STYLE_CLASS.MB_3);

    //             // Label placeholder
    //             const labelSkeleton = document.createElement(HTML_TAG.SPAN);
    //             labelSkeleton.classList.add(
    //                 STYLE_CLASS.PLACEHOLDER, 
    //                 STYLE_CLASS.COL_4, 
    //                 STYLE_CLASS.ROUNDED, 
    //                 STYLE_CLASS.PLACEHOLDER_GLOW, 
    //                 STYLE_CLASS.MB_1
    //             );

    //             // Input placeholder
    //             const inputSkeleton = document.createElement(HTML_TAG.SPAN);
    //             inputSkeleton.classList.add(
    //                 STYLE_CLASS.PLACEHOLDER, 
    //                 STYLE_CLASS.COLL_12, 
    //                 STYLE_CLASS.ROUNDED, 
    //                 STYLE_CLASS.PLACEHOLDER_WAVE
    //             );
    //             inputSkeleton.style.height = "2.5rem"; // optional height for input shape

    //             fieldGroup.appendChild(labelSkeleton);
    //             fieldGroup.appendChild(inputSkeleton);

    //             skeletonWrapper.appendChild(fieldGroup);
    //         });
    //     }

    //     // ✅ Add skeleton buttons if needed
    //     if (formMeta.submitButtonLabel || formMeta.allowCancel) {
    //         const btnContainer = document.createElement(HTML_TAG.DIV);
    //         btnContainer.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.JUSTIFY_CONTENT_END, STYLE_CLASS.GAP_2, STYLE_CLASS.MT_3);

    //         if (formMeta.allowCancel) {
    //             const cancelBtn = document.createElement(HTML_TAG.SPAN);
    //             cancelBtn.classList.add(STYLE_CLASS.PLACEHOLDER, STYLE_CLASS.BTN, STYLE_CLASS.BTN_SECONDARY, STYLE_CLASS.DISABLED, STYLE_CLASS.COL_3);
    //             btnContainer.appendChild(cancelBtn);
    //         }

    //         if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
    //             const submitBtn = document.createElement(HTML_TAG.SPAN);
    //             submitBtn.classList.add(STYLE_CLASS.PLACEHOLDER, STYLE_CLASS.BTN, STYLE_CLASS.BTN_SECONDARY, STYLE_CLASS.DISABLED, STYLE_CLASS.COL_3);
    //             btnContainer.appendChild(submitBtn);
    //         }

    //         skeletonWrapper.appendChild(btnContainer);
    //     }

    //     // ✅ Insert skeleton before form
    //     formElement.before(skeletonWrapper);

    //     // ✅ Hide real form initially
    //     formElement.classList.add("d-none");

    //     // ✅ Replace skeleton with real form after delay
    //     setTimeout(() => {
    //         skeletonWrapper.remove();
    //         formElement.classList.remove("d-none");
    //         // window.uiDebug?.("Skeleton render complete, real form displayed");
    //     }, formMeta.skeletonRenderDelay || 25000);
    // }





    // run prepare hook func if present
    // if (formMeta?.prepareHookFunc) {
    //     window[formMeta?.prepareHookFunc](formElement?.id);
    // }

    // removing placeholder
    cardProvider.getCard().classList.remove(...['placeholder-glow', 'placeholder-wave']);

    applyFieldVisibility(formElement, formMeta);
    bindDynamicFormSubmit(formElement, formMeta);
    appendFormSchemaLabel(formElement, formMeta);
    return formMeta;
}

/**
 * While debugging (APP_DEBUG): a line under every form the engine draws, pages,
 * modals and record sections alike, naming its form schema. A form without it
 * is hand-written.
 */
function appendFormSchemaLabel(formElement, formMeta) {
    // Super-admins only (set by the layout: debug and the super-admin role).
    if (!window.USER_INTERFACE_CONFIG?.showFormSchemaLabel || !formElement?.parentNode) {
        return;
    }
    const next = formElement.nextElementSibling;
    if (next?.classList?.contains('ui-form-schema-label')) {
        return;
    }
    const slug = String(formMeta?.slug || formElement.id || '');
    const label = document.createElement('div');
    label.className = 'ui-form-schema-label small text-muted text-end p-1';
    label.append('Form Rendered by Form Schema' + (slug ? ': ' : ''));
    if (slug) {
        const code = document.createElement('code');
        code.textContent = slug;
        label.appendChild(code);
    }
    formElement.after(label);
}

/**
 * A form's view mode component (e.g. on /view/{form}/{uid}): the record from
 * the form's dataEndpoint (else the entity API), shown with the registered
 * component. False when the component can't be loaded: the fields show.
 */
async function renderFormViewComponent(container, formMeta, formElement, componentName) {
    if (typeof fetchComponentTemplate !== 'function' || typeof hydrateComponentTemplate !== 'function') {
        return false;
    }

    const uid = formElement.dataset.entityUid;
    container.innerHTML = typeof renderComponentSkeleton === 'function' ? renderComponentSkeleton() : '';

    const endpoint = formMeta.dataEndpoint
        ? formMeta.dataEndpoint.replace('{uid}', encodeURIComponent(uid))
        : (formMeta.entity && typeof entityRecordUrl === 'function' ? entityRecordUrl('show', formMeta.entity, uid) : null);

    const [template, record] = await Promise.all([
        fetchComponentTemplate(componentName, null),
        endpoint && typeof fetchSessionJsonData === 'function' ? fetchSessionJsonData(endpoint) : null,
    ]);

    if (!template?.success || !template.html) {
        console.warn('View mode component could not be loaded; showing the fields.', { componentName });
        container.innerHTML = '';
        return false;
    }

    const row = record && typeof record === 'object' && !Array.isArray(record) ? { uid, ...record } : { uid };
    container.innerHTML = hydrateComponentTemplate(template.html, template.bindings || {}, row);

    if (typeof initializeDetailViewScripts === 'function') {
        initializeDetailViewScripts(container);
    }

    return true;
}

async function renderFormForModal(formElement, formMeta) {
    if (!formElement.querySelector(`input[name="${INPUT_TYPE.FORMID}"]`)) {
        const formIdInput = document.createElement(HTML_TAG.INPUT);
        formIdInput.type = INPUT_TYPE.HIDDEN;
        formIdInput.name = INPUT_TYPE.FORMID;
        formIdInput.value = formMeta.id;
        formIdInput.setAttribute(ATTR_CONS.AUTOCOMPLETE, ATTR_CONS.OFF);
        formElement.appendChild(formIdInput);
    }

    formElement.setAttribute(ATTR_CONS.METHOD, formMeta.method || 'POST');
    if (formMeta.endpoint) {
        formElement.setAttribute('action', formMeta.endpoint);
    }
    formElement.setAttribute(ATTR_CONS.ENTYPE, formMeta.enctype || 'multipart/form-data');
    formElement.classList.add(STYLE_CLASS.ROW, STYLE_CLASS.ROW_COLS_1, STYLE_CLASS.G_2, STYLE_CLASS.NEEDS_VALIDATION);

    let formData = formElement.dataset.formData;
    if (formData) {
        formData = JSON.parse(formData);
        delete formElement.dataset.formData;
    }

    const entityUId = formElement.dataset.entityUid;
    let entityData = formElement.__entityDataCache || null;

    // A table row is not the record of a form with its own dataEndpoint (other keys): load it.
    if (isTableRowForOwnRecord(formElement, formMeta)) {
        formData = null;
        entityData = null;
    }

    if (!entityData && formData && typeof formData === 'object' && !Array.isArray(formData)) {
        entityData = formData;
    }

    if (!entityData && entityUId) {
        entityData = await fetchFormRecord(formMeta, entityUId);
    }

    if (entityData) {
        formElement.__entityDataCache = entityData;
    }

    await loadRemoteFieldOptions(formMeta, formElement.dataset.entityUid || null);

    if (Array.isArray(formMeta.fields)) {
        // As on a page (setupFormBlock): a section is a heading panel, and the
        // fields after it go inside it. Before, a modal drew it as a text box.
        let target = formElement;
        formMeta.fields.forEach((field, index) => {
            if (!isFieldShownInMode(field, formMeta.formMode)) {
                return;
            }
            applyModeRequired(field, formMeta.formMode);
            // Same responsive widths as page forms (e.g. defaultFieldSize "auto").
            field._resolvedSize = resolveFieldSizeConfig(field, formMeta);
            field._renderIndex = index;
            field._domId = buildFieldDomId(formMeta, field, index);
            field.value = withFieldDefault(field, resolveFieldValue(field.id, formData, entityData), formMeta);
            if (isSectionField(field)) {
                target = renderFormSection(field, formElement);
                return;
            }
            addField(field, target, formMeta);
        });
    }

    if (entityData) {
        renderEntityDataToForm(formElement, entityData);
    }
}

function handleSchemaNotFound(formElement) {
    console.error("Form schema not found for:", formElement.id);
    formElement.dataset.schemaState = 'not-found';

    // Clear form content
    formElement.innerHTML = "";

    // Create alert
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
        STYLE_CLASS.ALERT,
        STYLE_CLASS.ALERT_DANGER,
        STYLE_CLASS.TEXT_CENTER,
        STYLE_CLASS.MT_3
    );

    alertDiv.textContent = "Form schema not found. Please contact administrator.";

    formElement.appendChild(alertDiv);
}

function bindDynamicFormSubmit(formElement, formMeta) {
    if (formElement.dataset.dynamicSubmitBound === '1') {
        return;
    }

    formElement.dataset.dynamicSubmitBound = '1';
    formElement.__formMeta = formMeta;
    formElement.addEventListener('submit', event => handleDynamicFormSubmit(event, formMeta));
}

/**
 * Tells the page what happened. "lab-form:submitted" is cancelable: a page that
 * shows the result itself (e.g. the next step of sign-in) calls
 * event.preventDefault(), and the form then doesn't reload the page; a
 * redirect_url from the server is still followed. Returns false when prevented.
 */
function dispatchDynamicFormEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail, cancelable: eventName === 'lab-form:submitted' });
    window.dispatchEvent(event);

    if (eventName === 'lab-form:submitted') {
        window.dispatchEvent(new CustomEvent('shoz-form:submitted', { detail }));
    }

    if (eventName === 'lab-form:submit-failed') {
        window.dispatchEvent(new CustomEvent('shoz-form:submit-failed', { detail }));
    }

    return !event.defaultPrevented;
}

function resolveDynamicFormMessage(result, fallbackMessage) {
    return result?.message
        || result?.response_schema?.message
        || result?.response_schema?.title
        || fallbackMessage;
}

function escapeFieldSelector(fieldName) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(fieldName);
    }

    return String(fieldName)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
}

function normalizeFieldErrorMessages(messages, fieldLabel) {
    const list = Array.isArray(messages) ? messages : [messages];

    return list
        .filter(Boolean)
        .map((message) => {
            // apiClient's parse-failure fallback returns errors as
            // [{ message: '...' }] rather than plain strings — String() on
            // an object produces the literal text "[object Object]", so
            // pull .message out first when present.
            const messageText = (message && typeof message === 'object' && typeof message.message === 'string')
                ? message.message
                : message;
            const rawMessage = String(messageText).trim();

            if (!rawMessage) {
                return `${fieldLabel} is invalid.`;
            }

            if (/^the\s+/i.test(rawMessage)) {
                return rawMessage.replace(/^the\s+[\w.]+\s+field/i, fieldLabel);
            }

            if (/meta_value/i.test(rawMessage)) {
                return `${fieldLabel} cannot be empty. Fill it in before submitting.`;
            }

            return rawMessage;
        });
}

function buildFriendlySubmitMessage(message, generalErrors = []) {
    if (generalErrors.length > 0) {
        return generalErrors[0];
    }

    if (/meta_value/i.test(message || '')) {
        return 'Some metadata fields are empty. Fill them in before submitting again.';
    }

    return message || 'Unable to submit the form. Please review the highlighted fields and try again.';
}

function normalizeDynamicFormErrors(errors, formMeta, payload = {}) {
    const normalizedErrors = {};
    const generalErrors = [];
    const fields = Array.isArray(formMeta?.fields) ? formMeta.fields : [];
    const metaPayload = payload?.meta && typeof payload.meta === 'object' ? payload.meta : {};

    Object.entries(errors || {}).forEach(([rawKey, messages]) => {
        // The entity API names meta field errors "meta.batch": show them under the Batch field.
        const metaKey = /^meta[.[]([^\]]+)\]?$/.exec(rawKey)?.[1];
        const errorKey = metaKey && fields.some((item) => item?.id === metaKey && item?.meta === true) ? metaKey : rawKey;
        const field = fields.find((item) => item?.id === errorKey);

        if (field) {
            normalizedErrors[errorKey] = normalizeFieldErrorMessages(messages, field.label || errorKey);
            return;
        }

        if (errorKey === 'meta_value') {
            const emptyMetaFields = fields.filter((item) => {
                if (item?.meta !== true || !Object.prototype.hasOwnProperty.call(metaPayload, item.id)) {
                    return false;
                }

                const value = metaPayload[item.id];
                return value === null || value === undefined || value === '';
            });

            if (emptyMetaFields.length > 0) {
                emptyMetaFields.forEach((item) => {
                    normalizedErrors[item.id] = [
                        `${item.label || item.id} cannot be empty. Fill it in before submitting.`,
                    ];
                });
                return;
            }
        }

        const fallbackLabel = errorKey.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        generalErrors.push(...normalizeFieldErrorMessages(messages, fallbackLabel));
    });

    return {
        fieldErrors: normalizedErrors,
        generalErrors,
    };
}

function clearDynamicFormSubmitErrors(form) {
    if (!form) {
        return;
    }

    // The top-of-form summary banner is a one-off node, removed and
    // re-added as needed. Per-field messages are a different, persistent
    // slot per field (see getOrCreateFieldMessageSlot) — cleared in place
    // below rather than removed, so their reserved space never collapses.
    form.querySelectorAll('[data-server-error="true"]').forEach((node) => node.remove());

    form.querySelectorAll('[id$="-message-slot"]').forEach((slot) => {
        slot.textContent = '';
        slot.removeAttribute('title');
        slot.style.visibility = 'hidden';
    });

    form.querySelectorAll('.is-invalid').forEach((input) => {
        input.classList.remove('is-invalid');

        if (typeof input.setCustomValidity === 'function') {
            input.setCustomValidity('');
        }
    });
}

function clearDynamicFormValidationState(form) {
    if (!form) {
        return;
    }

    form.classList.remove(STYLE_CLASS.WAS_VALIDATED);

    form.querySelectorAll('.is-valid').forEach((input) => {
        input.classList.remove('is-valid');
    });
}

function getDynamicFormFieldElements(form, fieldId) {
    const escapedFieldId = escapeFieldSelector(fieldId);
    const inputs = Array.from(form.querySelectorAll(`[name="${escapedFieldId}"], [name="${escapedFieldId}[]"]`));

    if (inputs.length > 0) {
        return inputs;
    }

    const byId = form.querySelector(`#${escapedFieldId}`);
    return byId ? [byId] : [];
}

function appendDynamicFormFieldError(form, field, message) {
    const fieldElements = getDynamicFormFieldElements(form, field.id);

    if (fieldElements.length === 0) {
        console.warn('Unable to map backend validation error to a rendered field.', {
            formId: form.id,
            fieldId: field.id,
            message,
        });
        return false;
    }

    const fieldDomId = typeof getFieldDomId === 'function' ? getFieldDomId(field) : field.id;

    fieldElements.forEach((element) => {
        element.classList.add('is-invalid');
        if (typeof element.setCustomValidity === 'function') {
            element.setCustomValidity(message);
        }

        const clearServerErrorState = () => {
            element.classList.remove('is-invalid');
            if (typeof element.setCustomValidity === 'function') {
                element.setCustomValidity('');
            }

            setFieldMessage(fieldDomId, '');
        };

        element.addEventListener('input', clearServerErrorState, { once: true });
        element.addEventListener('change', clearServerErrorState, { once: true });
    });

    const fieldContainer = fieldElements[0].closest('.form-floating')
        || fieldElements[0].closest('.form-check-group')
        || fieldElements[0].parentElement
        || fieldElements[0].closest('.col');

    return setFieldMessage(fieldDomId, message, fieldContainer);
}

/**
 * Show a form-level error (one not tied to a field) as an error toast.
 * Falls back to the inline banner at the top of the form only when toasts
 * aren't available or the schema opted out (disableSnackbar).
 */
function appendDynamicFormSubmitSummary(form, message, generalErrors = []) {
    const lines = [message, ...generalErrors.filter((item) => item && item !== message)].filter(Boolean);
    const formMeta = form?.__formMeta || null;

    if (typeof window.showSnackbar === 'function' && !formMeta?.disableSnackbar) {
        window.showSnackbar(lines.join(' '), 'error');
        return;
    }

    const summary = document.createElement('div');
    summary.classList.add(STYLE_CLASS.ALERT, STYLE_CLASS.ALERT_DANGER, STYLE_CLASS.MB_3);
    summary.dataset.serverError = 'true';

    lines.forEach((line) => {
        const row = document.createElement('div');
        row.textContent = line;
        summary.appendChild(row);
    });

    form.prepend(summary);
}

function applyDynamicFormSubmitErrors(form, formMeta, errors, message, payload) {
    clearDynamicFormSubmitErrors(form);

    const { fieldErrors, generalErrors } = normalizeDynamicFormErrors(errors, formMeta, payload);
    const fields = Array.isArray(formMeta?.fields) ? formMeta.fields : [];
    const unresolvedMessages = [];
    const mappedFieldErrorKeys = Object.keys(fieldErrors);

    window.formErrors = fieldErrors;

    Object.entries(fieldErrors).forEach(([fieldId, fieldMessages]) => {
        const field = fields.find((item) => item?.id === fieldId);
        const errorMessage = Array.isArray(fieldMessages) ? fieldMessages[0] : fieldMessages;

        if (!field || !appendDynamicFormFieldError(form, field, errorMessage)) {
            unresolvedMessages.push(errorMessage);
        }
    });

    const summaryLines = [...generalErrors, ...unresolvedMessages];
    const shouldShowSummary = summaryLines.length > 0 || mappedFieldErrorKeys.length === 0;

    if (shouldShowSummary) {
        const summaryMessage = buildFriendlySubmitMessage(message, summaryLines);
        appendDynamicFormSubmitSummary(form, summaryMessage, summaryLines);
    }
}

/**
 * Show a snackbar for a dynamic form outcome, if snackbar.js is loaded and
 * the schema hasn't opted out via 'disableSnackbar' => true. Applies to
 * every schema-driven form by default — no per-endpoint wiring needed.
 *
 * Only called for the success case — every failure path already renders its
 * message visibly inline (per-field errors and/or a summary banner), so a
 * failure snackbar would just duplicate text already on screen.
 */
function notifyDynamicFormOutcome(formMeta, type, message) {
    if (formMeta?.disableSnackbar || typeof window.showSnackbar !== 'function' || !message) {
        return;
    }

    window.showSnackbar(message, type);
}

/**
 * AJAX equivalent of recaptcha.js's native-form flow. recaptcha.js only
 * wires up [data-recaptcha-action] elements present at DOMContentLoaded, so
 * it never sees these forms (rendered later, from an async schema fetch) —
 * this fetches a v3 token the same way, for handleDynamicFormSubmit to
 * attach to the payload instead of a real page submit.
 *
 * Resolves null (rather than throwing) when grecaptcha/site key aren't
 * available or the token request fails, matching recaptcha.js's own
 * fail-through behavior: the submit still proceeds without a token, and the
 * backend's own recaptcha_token validation is what actually rejects it.
 */
function getDynamicFormRecaptchaToken(action) {
    if (typeof grecaptcha === 'undefined' || !window.recaptchaSiteKey) {
        return Promise.resolve(null);
    }

    return new Promise(resolve => {
        grecaptcha.ready(function () {
            grecaptcha.execute(window.recaptchaSiteKey, { action: action })
                .then(resolve)
                .catch(function () {
                    resolve(null);
                });
        });
    });
}

async function handleDynamicFormSubmit(event, formMeta) {
    const form = event.currentTarget;
    clearDynamicFormValidationState(form);
    clearDynamicFormSubmitErrors(form);
    window.formErrors = {};

    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add(STYLE_CLASS.WAS_VALIDATED);
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Already sending (e.g. Enter pressed again): one submit at a time.
    if (form.__submitting) {
        return;
    }

    const method = resolveDynamicFormMethod(formMeta, form);
    const endpoint = resolveDynamicFormEndpoint(formMeta, form, method);

    if (!endpoint) {
        console.error('Dynamic form submit skipped: no endpoint available.', { formMeta });
        return;
    }

    // Busy at once (before image crops and reCAPTCHA), with a word for what is happening.
    setDynamicFormSubmitting(form, true, resolveSubmittingLabel(formMeta, form, method));
    let isRedirecting = false;
    let payload = {};
    try {
        if (typeof waitForImageCrops === 'function') {
            await waitForImageCrops(form);
        }
        payload = serializeDynamicFormPayload(form, formMeta);

        const recaptchaAction = form.dataset.recaptchaAction;
        if (recaptchaAction) {
            const recaptchaToken = await getDynamicFormRecaptchaToken(recaptchaAction);
            if (recaptchaToken) {
                payload.recaptcha_token = recaptchaToken;
            }
        }

        const result = await submitDynamicFormRequest(endpoint, method, payload, form);
        const errors = result?.errors || result?.response_schema?.errors || null;
        const detailContext = resolveInboxDetailContext(form);

        if (!result?.success) {
            console.error('Dynamic form submit failed.', {
                endpoint,
                method,
                payload,
                result,
            });

            // No snackbar here — applyDynamicFormSubmitErrors()/
            // appendDynamicFormSubmitSummary() already render this same
            // message visibly inline (per-field and/or a summary banner), so
            // a snackbar would just duplicate it.
            if (errors) {
                const errorMessage = resolveDynamicFormMessage(result, 'Unable to submit the form. Please review the highlighted fields and try again.');
                applyDynamicFormSubmitErrors(form, formMeta, errors, errorMessage, payload);
            } else {
                const errorMessage = resolveDynamicFormMessage(result, 'Unable to submit the form. Please try again.');
                // `error` is only sent by the server in debug mode (APP_DEBUG).
                const detail = result?.detail || (typeof result?.error === 'string' ? result.error : null);
                const debugDetail = detail ? [`Details: ${detail}`] : [];
                appendDynamicFormSubmitSummary(form, errorMessage, debugDetail);
            }

            dispatchDynamicFormEvent('lab-form:submit-failed', {
                formId: form.id,
                endpoint,
                method,
                payload,
                response: result,
                errors,
                message: resolveDynamicFormMessage(result, 'Unable to submit the form. Please try again.'),
            });

            return;
        }

        const successMessage = resolveDynamicFormMessage(result, 'Form submitted successfully.');
        const pageLetsFormContinue = dispatchDynamicFormEvent('lab-form:submitted', {
            formId: form.id,
            endpoint,
            method,
            payload,
            response: result,
            message: successMessage,
        });
        // A server that returns a redirect_url (auth forms, or any other
        // fixed-endpoint form) is explicitly telling the client where to go
        // next — honor it before falling back to inbox/detail-view handling,
        // which only applies to entity-backed forms rendered inside a modal.
        // The page showing the result itself (it prevented "lab-form:submitted") keeps it: no reload.
        const redirectUrl = result?.redirect_url || result?.response_schema?.data?.redirect_url
            || (pageLetsFormContinue ? resolveSuccessRedirect(formMeta, form, detailContext) : null);
        if (redirectUrl) {
            isRedirecting = true;
            // The message shows on the next page (the snackbar would vanish with this one).
            // The button keeps its busy word (e.g. Saving…) until the next page opens.
            rememberDynamicFormFlash(formMeta, successMessage);
            if (redirectUrl === 'reload') {
                window.location.reload();
            } else {
                window.location.href = redirectUrl;
            }
            return;
        }
        notifyDynamicFormOutcome(formMeta, 'success', successMessage);

        if (detailContext?.componentBackedEdit && method !== 'DELETE') {
            const nextDetailData = mergeSubmittedDetailData(
                form.__entityDataCache || detailContext.data || null,
                payload,
                result
            );

            window.uiDebug?.('✅ Form submitted from inbox detail; restoring component-backed detail view.', {
                entity: detailContext.schema?.entity,
                uid: nextDetailData?.uid || detailContext.data?.uid || null,
                method,
            });

            detailContext.data = nextDetailData;
            if (typeof window.syncInboxSummaryRow === 'function') {
                window.syncInboxSummaryRow(detailContext, nextDetailData);
            }
            await returnToPreferredInboxDetail(detailContext, {
                preferredMode: 'component',
                formMode: 'view',
            });
        } else if (detailContext && method !== 'DELETE' && form.dataset.entityUid && form.closest('.inbox-detail-content')) {
            // A record edited in the table's side panel (e.g. a product): show it again, saved and
            // read-only, and update its row. Before, the panel stayed in edit mode after saving.
            const nextDetailData = mergeSubmittedDetailData(form.__entityDataCache || detailContext.data || null, payload, result);
            detailContext.data = nextDetailData;
            form.__entityDataCache = nextDetailData;
            form.dataset.formData = JSON.stringify(nextDetailData);
            if (typeof window.syncInboxSummaryRow === 'function') {
                window.syncInboxSummaryRow(detailContext, nextDetailData);
            }
            await switchFormMode(form, 'view', formMeta);
        }
    } catch (error) {
        console.error('Dynamic form submit error.', error);
        const errorMessage = error?.message || 'Something went wrong while submitting the form.';
        clearDynamicFormSubmitErrors(form);
        appendDynamicFormSubmitSummary(form, errorMessage, []);

        dispatchDynamicFormEvent('lab-form:submit-failed', {
            formId: form.id,
            endpoint,
            method,
            payload,
            error,
            message: errorMessage,
        });
    } finally {
        // Leave the button in its loading state when navigating away — the
        // browser hasn't actually left the page yet at this point (finally
        // runs synchronously right after the `return` above), so resetting
        // here would flash the button back to normal for a moment before
        // the redirect actually takes effect.
        if (!isRedirecting) {
            setDynamicFormSubmitting(form, false);
        }
    }
}

/**
 * Injects the loading-dots keyframes once (idempotent) rather than
 * depending on a separate stylesheet being loaded/coordinated — self
 * contained so setDynamicFormSubmitting() works regardless of CSS load order.
 */
function ensureLoadingDotsStyle() {
    if (document.getElementById('lab-form-loading-dots-style')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'lab-form-loading-dots-style';
    style.textContent = `
        .lab-form-loading-dots span {
            animation: labFormLoadingDotBlink 1.4s infinite both;
        }
        .lab-form-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .lab-form-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes labFormLoadingDotBlink {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Disable the submit button and show "Verifying..." (animated) while a
 * dynamic form submission is in flight, restoring its original state
 * afterward. No-op if the form has no submit button (e.g. read-only view
 * mode).
 */
/**
 * The word on the busy button: the schema's (or its mode's) "submittingLabel",
 * else from the button's text (Log in / Verify → Verifying, Save → Saving,
 * Delete → Deleting, Upload → Uploading, Send → Sending, Register →
 * Registering, pay → Processing), else from the method (PUT → Saving,
 * DELETE → Deleting, POST → Submitting).
 */
function resolveSubmittingLabel(formMeta, form, method) {
    const mode = form?.dataset?.formMode;
    const own = formMeta?.modes?.[mode]?.submittingLabel || formMeta?.submittingLabel;
    if (own) {
        return own;
    }
    const button = form?.__submitButton
        || form?.querySelector('button[type="submit"]')
        || document.querySelector(`button[type="submit"][form="${form?.id}"]`);
    const text = String(button?.textContent || formMeta?.submitButtonLabel || '').toLowerCase();
    // First match wins (e.g. "Save payment settings" is Saving, not Processing).
    const byText = [
        [/log ?in|sign ?in|verif|otp/, 'Verifying'],
        [/record/, 'Recording'],
        [/save|update/, 'Saving'],
        [/delete/, 'Deleting'],
        [/cancel/, 'Cancelling'],
        [/remove/, 'Removing'],
        [/upload/, 'Uploading'],
        [/send/, 'Sending'],
        [/register|sign ?up|join|apply/, 'Registering'],
        [/pay/, 'Processing'],
        [/set |create|add|change/, 'Saving'],
    ].find(([pattern]) => pattern.test(text));
    if (byText) {
        return byText[1];
    }

    return { PUT: 'Saving', PATCH: 'Saving', DELETE: 'Deleting' }[method] || 'Submitting';
}

/**
 * Where to go after a successful submit when the server sent no redirect_url:
 * the schema's "successRedirect" ("reload", "none", or a URL with {uid}), else,
 * for a form standing on its own page (not in a modal, a table record or an
 * inbox detail, which refresh themselves), a reload of the page, so it shows
 * the saved state.
 */
function resolveSuccessRedirect(formMeta, form, detailContext) {
    const mode = form?.dataset?.formMode;
    const setting = formMeta?.modes?.[mode]?.successRedirect ?? formMeta?.successRedirect;
    if (setting === 'none' || setting === false) {
        return null;
    }
    if (typeof setting === 'string' && setting !== '') {
        return setting === 'reload' ? 'reload' : setting.replace('{uid}', encodeURIComponent(form?.dataset?.entityUid || ''));
    }
    const standalone = !form?.closest('.modal')
        && form?.dataset?.recordSource !== 'record-section'
        && !detailContext;

    return standalone ? 'reload' : null;
}

const DYNAMIC_FORM_FLASH_KEY = 'lab-form:flash';

/** Keep the success message for the next page (unless the schema has no snackbar). */
function rememberDynamicFormFlash(formMeta, message) {
    if (formMeta?.disableSnackbar || !message) {
        return;
    }
    try {
        sessionStorage.setItem(DYNAMIC_FORM_FLASH_KEY, JSON.stringify({ message, type: 'success', at: Date.now() }));
    } catch (e) {
        // Storage blocked: the message is just not shown.
    }
}

/** On load: the message a form left before redirecting (at most a minute old). */
function showDynamicFormFlash() {
    let flash = null;
    try {
        flash = JSON.parse(sessionStorage.getItem(DYNAMIC_FORM_FLASH_KEY) || 'null');
        sessionStorage.removeItem(DYNAMIC_FORM_FLASH_KEY);
    } catch (e) {
        return;
    }
    if (!flash?.message || Date.now() - (flash.at || 0) > 60000) {
        return;
    }
    // Shown once: now if the snackbar script is ready, else when the page has loaded.
    // (showSnackbar returns nothing, so success can't be read from its result.)
    const show = () => {
        if (typeof window.showSnackbar !== 'function') {
            return false;
        }
        window.showSnackbar(flash.message, flash.type || 'success');
        return true;
    };
    if (!show()) {
        window.addEventListener('load', show, { once: true });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showDynamicFormFlash, { once: true });
} else {
    showDynamicFormFlash();
}

function setDynamicFormSubmitting(form, isSubmitting, label = 'Submitting') {
    // Buttons rendered via the footer's actions array (setupFormFooter)
    // live in the card, a DOM sibling of <form>, not a descendant — they
    // associate back to it via the HTML5 form="..." attribute instead. A
    // plain form.querySelector() only ever finds the older auto-generated
    // inline submit button (a true descendant), so it silently found
    // nothing once a schema started defining explicit actions.
    // A modal's footer button submits its form through form.__submitButton (modal.js).
    form.__submitting = isSubmitting;
    const submitBtn = form.__submitButton
        || form.querySelector('button[type="submit"]')
        || document.querySelector(`button[type="submit"][form="${form.id}"]`);
    if (!submitBtn) {
        return;
    }

    if (isSubmitting) {
        ensureLoadingDotsStyle();
        if (submitBtn.dataset.originalHtml === undefined) {
            submitBtn.dataset.originalHtml = submitBtn.innerHTML;
        }
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        // Keeps the original label to restore (set only once).
        const word = document.createElement('span');
        word.textContent = label;
        submitBtn.innerHTML = word.innerHTML + '<span class="lab-form-loading-dots">'
            + '<span>.</span><span>.</span><span>.</span></span>';
        return;
    }

    submitBtn.removeAttribute('aria-busy');

    submitBtn.disabled = false;
    if (submitBtn.dataset.originalHtml !== undefined) {
        submitBtn.innerHTML = submitBtn.dataset.originalHtml;
        delete submitBtn.dataset.originalHtml;
    }
}

async function submitDynamicFormRequest(endpoint, method, payload, form) {
    const csrfToken = form.querySelector('input[name="_token"]')?.value;
    const options = csrfToken
        ? { headers: { 'X-CSRF-TOKEN': csrfToken } }
        : {};

    // JSON can't carry files; use multipart when the form has file fields.
    if (method !== 'DELETE' && payloadHasFiles(payload)) {
        return submitMultipartFormRequest(endpoint, method, payload, csrfToken);
    }

    if (typeof apiClient !== 'undefined' && apiClient) {
        switch (method) {
            case 'PUT':
                return apiClient.put(endpoint, payload, options);
            case 'PATCH':
                return apiClient.patch(endpoint, payload, options);
            case 'DELETE':
                return apiClient.delete(endpoint, options);
            case 'POST':
            default:
                return apiClient.post(endpoint, payload, options);
        }
    }

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    const response = await fetch(endpoint, {
        method,
        headers,
        credentials: 'same-origin',
        body: method === 'DELETE' ? null : JSON.stringify(payload),
    });

    return response.json().catch(() => ({
        success: response.ok,
        status: response.status,
    }));
}

function resolveDynamicFormMethod(formMeta, form) {
    return (formMeta.method || form.getAttribute('method') || 'POST').toUpperCase();
}

function resolveDynamicFormEndpoint(formMeta, form, method) {
    if (formMeta.endpoint) {
        return formMeta.endpoint;
    }

    if (!formMeta.entity) {
        return null;
    }

    const entityUid = form.dataset.entityUid;

    if ((method === 'PUT' || method === 'PATCH') && entityUid) {
        return entityRecordUrl('update', formMeta.entity, entityUid);
    }

    if (method === 'DELETE' && entityUid) {
        return entityRecordUrl('delete', formMeta.entity, entityUid);
    }

    return entityRecordUrl('store', formMeta.entity);
}

function serializeDynamicFormPayload(form, formMeta) {
    const payload = {};
    const metaPayload = {};
    const fields = Array.isArray(formMeta.fields) ? formMeta.fields : [];

    fields.forEach(field => {
        // Not shown in this mode ("showIn"), or a layout spacer: not part of the submission.
        if (!isFieldShownInMode(field, formMeta.formMode)
            || (typeof isLayoutField === 'function' ? isLayoutField(field) : (typeof isSpacerField === 'function' && isSpacerField(field)))) {
            return;
        }

        const value = getSerializedFieldValue(form, field);

        // "omitIfEmpty": a blank value means "leave unchanged" (e.g. a new password).
        if (field.omitIfEmpty === true && (value === null || value === '')) {
            return;
        }

        const target = field.meta === true ? metaPayload : payload;
        target[field.id] = value;
    });

    if (Object.keys(metaPayload).length > 0) {
        payload.meta = metaPayload;
    }

    return payload;
}

function getSerializedFieldValue(form, field) {
    const fieldName = field.id;
    const escapedName = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(fieldName)
        : fieldName;

    // Repeatable group (repeater-field.js): the whole list of rows.
    if (field.type === 'repeater' && typeof collectRepeaterValue === 'function') {
        return collectRepeaterValue(form, field);
    }

    if (field.type === 'checkbox') {
        const checkboxInputs = form.querySelectorAll(`[name="${escapedName}"], [name="${escapedName}[]"]`);

        if (Array.isArray(field.options) && field.options.length > 0) {
            return Array.from(checkboxInputs)
                .filter(input => input.checked)
                .map(input => input.value);
        }

        return Array.from(checkboxInputs).some(input => input.checked);
    }

    if (field.type === 'radio') {
        const checkedRadio = form.querySelector(`[name="${escapedName}"]:checked`);
        return checkedRadio ? checkedRadio.value : null;
    }

    const input = form.querySelector(`[name="${escapedName}"]`);

    // File inputs: send the File objects (multipart), not the fake "C:\fakepath\..." value.
    if (input && input.type === 'file') {
        // Cropped image ("crop" fields, image-crop-field.js) replaces the original.
        if (input.__croppedFile) {
            return input.multiple ? [input.__croppedFile] : input.__croppedFile;
        }
        const files = Array.from(input.files || []);
        return input.multiple ? files : (files[0] || null);
    }

    return input ? input.value : null;
}

function payloadHasFiles(value) {
    if (typeof File !== 'undefined' && value instanceof File) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some(payloadHasFiles);
    }

    if (value && typeof value === 'object') {
        return Object.values(value).some(payloadHasFiles);
    }

    return false;
}

// Flattens a payload into FormData using PHP's bracket notation (meta[key], tags[]).
function appendToFormData(formData, key, value) {
    if (value === null || value === undefined) {
        formData.append(key, '');
    } else if (typeof File !== 'undefined' && value instanceof File) {
        formData.append(key, value, value.name);
    } else if (Array.isArray(value)) {
        // Indexed (key[0][level], key[0][year], key[1][...]): with "key[]" PHP starts a
        // new row at every field, so a repeater's rows arrived split one field per row.
        value.forEach((item, index) => appendToFormData(formData, `${key}[${index}]`, item));
    } else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => appendToFormData(formData, `${key}[${subKey}]`, subValue));
    } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
    } else {
        formData.append(key, value);
    }
}

/**
 * Submit a payload that contains files as multipart/form-data. PUT/PATCH are
 * sent as POST with _method, because PHP only parses multipart bodies on POST.
 */
async function submitMultipartFormRequest(endpoint, method, payload, csrfToken) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => appendToFormData(formData, key, value));

    if (method !== 'POST') {
        formData.append('_method', method);
    }

    const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
    }
    const apiToken = document.querySelector('meta[name="sanctum-token"]')?.content;
    if (apiToken) {
        headers['Authorization'] = `Bearer ${apiToken}`;
    }

    // No Content-Type header: the browser sets the multipart boundary.
    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: formData,
    });

    const result = await response.json().catch(() => ({}));

    return {
        ...result,
        success: result?.success ?? response.ok,
        status: result?.status ?? response.status,
    };
}


/**
 * 
 * @param {*} cardHeader 
 * @param {*} formMeta 
 */
function setupFormHeader(cardHeader, formMeta, formElement) {

    const fragment = document.createElement(HTML_TAG.DIV);
    fragment.id = cardHeader.id + "-item"
    fragment.classList.add(...[STYLE_CLASS.D_FLEX,STYLE_CLASS.ALIGN_ITEMS_CENTER,STYLE_CLASS.JUSTIFY_CONTENT_BETWEEN,STYLE_CLASS.GAP_2]);
    if (formMeta.placeholder) {
        fragment.classList.add(...[STYLE_CLASS.PLACEHOLDER, formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardHeader.appendChild(fragment)

    const resolvedHeader = resolveFormHeaderConfig(formMeta);

    const headingDiv = document.createElement(HTML_TAG.DIV)
    headingDiv.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_2])

    // adding icon
    if(resolvedHeader.icon){
        const headingIcon = document.createElement('i')
        headingIcon.classList.add(...["fa-fw"])
        headingIcon.className += (" " + resolvedHeader.icon)
        headingDiv.appendChild(headingIcon)
    }
    // adding text
    const headingText = document.createElement('h6')
    headingText.id = `form-heading-text-${formMeta.id}`;
    headingText.classList.add(...[STYLE_CLASS.MB_0, STYLE_CLASS.MT_1]);
    headingText.textContent = resolvedHeader.text;
    headingDiv.appendChild(headingText)


     // ✅ Add pencil icon if formEdit is true
    if (formMeta.formEdit === false) {
        const editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-pencil-alt');
        editIcon.title = 'Edit Form';
        editIcon.style.fontSize = '1rem';
        editIcon.style.marginLeft = '15rem';

        // ✅ On click handler
        editIcon.addEventListener('click', function () {
            window.uiDebug?.('Edit icon clicked');
        });
        headingDiv.appendChild(editIcon);
    }

    fragment.appendChild(headingDiv)

    // adding header actions
    if (resolvedHeader.actions) {
        const headingActionDiv = document.createElement(HTML_TAG.DIV)
        headingActionDiv.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_2])

        resolvedHeader.actions.forEach(action => {
            addAction(action, headingActionDiv);
        })

        fragment.appendChild(headingActionDiv)
    }

    if (isFormReadOnly(formMeta)) {
        const viewModeActionDiv = document.createElement(HTML_TAG.DIV);
        viewModeActionDiv.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_3);
        appendViewModeActions(viewModeActionDiv, formMeta, formElement);

        if (viewModeActionDiv.childNodes.length > 0) {
            fragment.appendChild(viewModeActionDiv);
        }
    }

    // removing placeholder
    fragment.classList.remove(...['placeholder', 'bg-secondary']);
}

/**
 * 
 * @param {*} cardBody 
 * @param {*} formMeta 
 */
async function setupFormBody(cardBody, formMeta) {
    // <div class="row row-cols-1 g-2">

    const fragment = document.createElement('div');
    fragment.id = cardBody.id + "-item"
        fragment.classList.add(...[STYLE_CLASS.ROW, STYLE_CLASS.ROW_COLS_1, STYLE_CLASS.G_2]);
    // if (formMeta.placeholder) {
    //     fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
    // }
    cardBody.appendChild(fragment)

    const infoCol = document.createElement('div');
    infoCol.classList.add(STYLE_CLASS.COL);
    fragment.appendChild(infoCol)

    if (resolveFormInfoConfig(formMeta).innerHTML) {
        setupInfoBlock(infoCol, formMeta);
    }

    const formCol = document.createElement('div');
    formCol.classList.add(STYLE_CLASS.COL);
    fragment.appendChild(formCol)

    if (formMeta.fields) {
        await setupFormBlock(formCol, formMeta);
    }

    // removing placeholder
    fragment.classList.remove(...['placeholder', 'bg-secondary']);
}

/**
 * 
 * @param {*} cardFooter 
 * @param {*} formMeta 
 */
function setupFormFooter(cardFooter, formMeta, formElement) {
    const actions = Array.isArray(formMeta.actions) ? formMeta.actions : [];
    const hasCancelAction = actions.some((action) => {
        const actionText = String(action?.text || '').trim().toLowerCase();
        return action?.type === 'cancel' || actionText === 'cancel';
    });

    // Opt-in multi-row layout: give any action a numeric 'row', and each
    // distinct row renders as its own space-between flex line (a lone
    // action sits at the left, a pair splits to opposite ends) — lets a
    // schema replicate a classic multi-line footer (e.g. a link above the
    // submit row). Forms that never set 'row' fall through to the single
    // end-aligned row below, unchanged from before.
    const usesRows = actions.some((action) => action?.row !== undefined && action?.row !== null);

    if (usesRows) {
        const rows = new Map();
        actions.forEach((action) => {
            const rowKey = action.row ?? 0;
            if (!rows.has(rowKey)) {
                rows.set(rowKey, []);
            }
            rows.get(rowKey).push(action);
        });

        const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
        let lastRowFragment = null;

        sortedRowKeys.forEach((rowKey) => {
            const rowActions = rows.get(rowKey);
            // A lone action in a row has nothing to space between, so it
            // reads better centered than pinned to the left.
            // An action may set align: 'start' | 'center' | 'end' to override this.
            const ALIGN_CLASSES = { start: 'justify-content-start', center: 'justify-content-center', end: 'justify-content-end' };
            const requestedAlign = rowActions.map(a => a.align).find(a => ALIGN_CLASSES[a]);
            const rowJustify = requestedAlign
                ? ALIGN_CLASSES[requestedAlign]
                : (rowActions.length === 1 ? 'justify-content-center' : 'justify-content-between');

            const rowFragment = document.createElement('div');
            rowFragment.id = `${cardFooter.id}-item-row-${rowKey}`;
            rowFragment.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, rowJustify, STYLE_CLASS.GAP_2, 'mb-3']);
            // Keep the first action row from touching the last field.
            if (rowKey === sortedRowKeys[0]) {
                rowFragment.classList.add('mt-2');
            }
            cardFooter.appendChild(rowFragment);

            rowActions.forEach((action) => {
                action.form = formMeta.id;
                addAction(action, rowFragment);
            });

            lastRowFragment = rowFragment;
        });

        if (formMeta.allowCancel && !isFormReadOnly(formMeta) && !hasCancelAction && lastRowFragment) {
            appendDefaultCancelButton(lastRowFragment, formElement, formMeta);
        }

        return;
    }

    const fragment = document.createElement('div');
    fragment.id = cardFooter.id + "-item"
    fragment.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.JUSTIFY_CONTENT_END, STYLE_CLASS.GAP_2]);
    if (formMeta.placeholder) {
        fragment.classList.add(...['placeholder', formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardFooter.appendChild(fragment)

    actions.forEach(action => {
        action.form = formMeta.id
        addAction(action, fragment);
    })

    if (formMeta.allowCancel && !isFormReadOnly(formMeta) && !hasCancelAction) {
        appendDefaultCancelButton(fragment, formElement, formMeta);
    }

    // removing placeholder
    fragment.classList.remove(...['placeholder', 'bg-secondary']);
}

// const SUPPORTED_ACTION_ELEMENT_TYPES = ['a', 'button']
// const DEFAULT_ACTION_ELEMENT_TYPE = 'a'

// const SUPPORTED_ACTION_ELEMENT_SIZES = ['sm', 'lg']
// const DEFAULT_ACTION_ELEMENT_SIZE = 'sm'

// const SUPPORTED_ACTION_ELEMENT_COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
// const DEFAULT_ACTION_ELEMENT_COLOR = 'secondary'

// const SUPPORTED_ACTION_ELEMENT_VARIANTS = ['outline', 'link']
// const DEFAULT_ACTION_ELEMENT_VARIANT = 'outline'

function addAction(action, addTo) {
    if (action.route && (action.icon || action.text)) {
        // if action.element is provided it is good to go else defaulting element to []
        action.element = action.element ? action.element : []

        // if action.element.type is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_TYPE
        action.element.type =
            (action.element.type && STYLE_CLASS.SUPPORTED_ACTION_ELEMENT_TYPES.includes(action.element.type)) ?
                action.element.type : STYLE_CLASS.DEFAULT_ACTION_ELEMENT_TYPE

        // if action.element.size is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_SIZE
        action.element.size =
            (action.element.size && STYLE_CLASS.SUPPORTED_ACTION_ELEMENT_SIZES.includes(action.element.size)) ?
                action.element.size : STYLE_CLASS.DEFAULT_ACTION_ELEMENT_SIZE

        // if action.element.color is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_COLOR
        action.element.color =
            (action.element.color && STYLE_CLASS.SUPPORTED_ACTION_ELEMENT_COLORS.includes(action.element.color))
                ? action.element.color
                : (action.type === 'submit' ? 'primary' : STYLE_CLASS.DEFAULT_ACTION_ELEMENT_COLOR)

        // if action.element.variant is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_VARIANT
        action.element.variant =
            (action.element.variant && STYLE_CLASS.SUPPORTED_ACTION_ELEMENT_VARIANTS.includes(action.element.variant)) ?
                action.element.variant : STYLE_CLASS.DEFAULT_ACTION_ELEMENT_VARIANT




        // let actionElement;

        // // ✅ CHANGE HERE: If action.type is "submit", create input instead of button
        // if (action.element.type === "button" && action.type === "submit") {
        //     actionElement = document.createElement("input");
        //     actionElement.type = "submit"; // native submit
        //     actionElement.value = action.text ?? "Submit"; // text goes into value


        //     // actionElement.addEventListener("click", (e) => {
        //     //     window.uiDebug?.("Submit button clicked for form:");
        //     // });


        // } else {
        //     actionElement = document.createElement(action.element.type);
        // }
        




        // creating action element
        const actionElement = document.createElement(action.element.type)
        actionElement.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_2])
        actionElement.classList.add(STYLE_CLASS.BTN)
        actionElement.classList.add('btn-' + action.element.size);
        if ('link' === action.element.variant) {
            actionElement.classList.add('btn-' + action.element.variant, 'text-decoration-none');
        } else if ('outline' === action.element.variant) {
            let eleColorVariant = (action.element.variant ? '-' + action.element.variant : '') + (action.element.color ? '-' + action.element.color : '')
            eleColorVariant ? actionElement.classList.add('btn' + eleColorVariant) : '';
        }

        if (action.route) {
            // @TODO still not sure need to test
            if ('a' === action.element.type) {
                actionElement.href = action.route ? action.route : '#'
            }
            else if ('button' === action.element.type) {
                actionElement.href = action.route ? action.route : '#'
            }
        }

        if (action.form) {
            actionElement.setAttribute('form', action.form)
        }

        if (action.type === 'submit' && action.element.type === 'button') {
            actionElement.type = 'submit';
        }

        if (action.type === 'cancel') {
            actionElement.type = 'button';
            actionElement.addEventListener('click', (event) => {
                event.preventDefault();
                const formElement = action.form ? document.getElementById(action.form) : null;
                if (!formElement) {
                    return;
                }

                handleFormCancelAction(formElement, formElement.__formMeta || {
                    id: action.form,
                    formMode: formElement.dataset.formMode || 'edit',
                });
            });
        }

        if (action.icon && action.type !== 'submit') {
            const actionElementIcon = document.createElement('i')
            actionElementIcon.classList.add(...["fa-fw"])
            actionElementIcon.className += (" " + action.icon)
            actionElement.appendChild(actionElementIcon)
        }

        const fallbackActionText =
            action.type === 'submit'
                ? 'Submit'
                : (action.type || action.element.type || 'Action');

        const actionText = action.text || fallbackActionText;
        const actionElementText = document.createTextNode(actionText)
        actionElement.appendChild(actionElementText)

        addTo.appendChild(actionElement)
    }
}

/**
 * 
 * @param {*} infoCol 
 * @param {*} formMeta 
 */
function setupInfoBlock(infoCol, formMeta) {
    const resolvedInfo = resolveFormInfoConfig(formMeta);

    if (resolvedInfo.innerHTML) {
        const fragment = document.createElement('div')
        fragment.id = infoCol.id + "-item"
        fragment.classList.add(...['info-block', STYLE_CLASS.ROUNDED, STYLE_CLASS.MB_2]);
        if (formMeta.placeholder) {
            fragment.classList.add(...['placeholder', formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
        }
        infoCol.appendChild(fragment)

        const para = document.createElement('p')
        para.classList.add(STYLE_CLASS.CARD_TEXT);
        fragment.appendChild(para)

        if (resolvedInfo.icon) {
            const infoBlockIcon = document.createElement('i')
            infoBlockIcon.classList.add(...["fa-fw"])
            infoBlockIcon.className += (" " + resolvedInfo.icon)
            infoBlockIcon.classList.add(STYLE_CLASS.PE_1)
            para.appendChild(infoBlockIcon)
        }

        const infoBlockHTML = document.createElement('span')
        infoBlockHTML.id = `form-info-block-${formMeta.id}`;
        // Reads as a form description by default (matches the classic
        // forms' plain text-muted intro paragraph) rather than small
        // caption text; a schema can opt back into the compact style with
        // info.small === true.
        infoBlockHTML.classList.add("form-info-block", resolvedInfo.small ? STYLE_CLASS.SMALL : 'text-muted')
        infoBlockHTML.innerHTML = resolvedInfo.innerHTML

        para.appendChild(infoBlockHTML)

        // removing placeholder
        fragment.classList.remove(...['placeholder', 'bg-secondary']);

    }
}

function addFieldHelpInfo(field, addTo) {
    if (field && addTo) {
        if (field.info) {
            const fieldHelpInfoBlock = document.createElement('div')
            fieldHelpInfoBlock.classList.add(...['help-info', STYLE_CLASS.SMALL, STYLE_CLASS.TEXT_SECONDARY]);
            addTo.appendChild(fieldHelpInfoBlock)

            const infoSpanHTML = document.createElement('span')
            infoSpanHTML.classList.add(STYLE_CLASS.SMALL)
            infoSpanHTML.innerHTML = field.info.innerHTML
            fieldHelpInfoBlock.appendChild(infoSpanHTML)
        }
    }
}

function addFieldFeedback(feedback, addTo) {
    if (feedback && addTo) {
        if (feedback.valid) {
            const fieldFeedbackValidBlock = document.createElement('div')
            fieldFeedbackValidBlock.classList.add(STYLE_CLASS.VALID_FEEDBACK);
            fieldFeedbackValidBlock.textContent = feedback.valid
            addTo.appendChild(fieldFeedbackValidBlock)
        }
        if (feedback.invalid) {
            const fieldFeedbackInvalidBlock = document.createElement('div')
            fieldFeedbackInvalidBlock.classList.add(STYLE_CLASS.INVALID_FEEDBACK);
            fieldFeedbackInvalidBlock.textContent = feedback.invalid
            addTo.appendChild(fieldFeedbackInvalidBlock)
        }
    }
}


function setupCoreFormElement() {
    window.uiDebug?.("setuping lab-form-elements ...")
    $('.shoz-form-element').each(function (e) {
        setupOneCoreFormElement(this)
    })
}

function setupOneCoreFormElement(element) {
    element = $(element)

    if (element.hasClass('form-control')) {
    } else {
        element.wrap(INPUT_TYPE.FORM_GROUP_CONTAINER) // wrap element with
        // form-group-has-feedback

        element.addClass("form-control") // add form-control class

        // checking if label is provided in the data-label attr
        // Attribute values are set as text/attributes, never parsed as HTML.
        if (element.attr('data-label')) {
            element.parent().append(
                $('<label>')
                    .addClass(STYLE_CLASS.FORM_LABEL)
                    .attr({ for: element.attr('id'), title: element.attr('data-label') })
                    .text(element.attr('data-label'))
            )
        }

        // checking if additional info is provided in the data-help-info attr
        if (element.attr('data-help-info')) {
            element.parent().append(
                $('<p>')
                    .addClass('shoz-help-text ' + STYLE_CLASS.SMALL + ' ' + STYLE_CLASS.TEXT_MUTED)
                    .text(element.attr('data-help-info'))
            )
        }

        // check if select option or not
        if (element.prop("tagName") == 'SELECT') {
            let defaultOption = element.attr('data-default')
            if (defaultOption) {
                // do nothing
            } else {
                defaultOption = "-- select an option --"
            }
            //window.uiDebug?.("Selected Option: "element.val())
            // create new option element

            let selectedFlag = "selected"
            if (element.children('option[selected]').length > 0) selectedFlag = ""

            element.prepend(
                $('<option>', { value: 'selectone', disabled: true, selected: selectedFlag === 'selected' })
                    .text(defaultOption)
            )
        }

        // checking if type is given
        if (element.attr('type')) {
            let type = element.attr('type') // get the given type of the input element
            window.uiDebug?.("type::" + type)

            //password type
            if (type == INPUT_TYPE.TYPE_PASSWORD) {
                element.addClass('hidden-password')
                element.wrap(INPUT_TYPE.INPUT_GROUP_CONTAINER) // wrap element with INPUT_GROUP_CONTAINER
                element.after("<div class=\"input-group-btn\"><button type=\"button\" class=\"btn btn-default show-pass-btn\"><span class=\"fa fa-fw fa-eye-slash\"></span></button></div>")
            }
        }

        // checking if data-type is given
        if (element.attr('data-type')) {
            // TODO: if data-datetime then make input group for icon
            let dataType = element.attr('data-type') // get the given
            // overruled data-type
            // of shoz-form-element
            window.uiDebug?.("dataType::" + dataType)

            if (dataType == INPUT_TYPE.DATA_TYPE_DATETIME) {
                //TODO: Send datetime field value format along with it's value in the hidden input field
                // element.attr("readonly",true)

                element.after("<span class=\"input-group-addon\"><span class=\"fa fa-fw fa-calendar\"></span></span>")
                element.next('span').andSelf().wrapAll(INPUT_TYPE.INPUT_GROUP_CONTAINER)

                element.parent().addClass('date') // add class date to parent
                // input-group div
                element.parent().attr('id', element.attr('id') + "-datetimepicker")


                /* if value is there then set it to date time picker */
                let dateValue
                if (element.val()) {
                    window.uiDebug?.("value = " + element.val())
                    let value = element.val()
                    if ($.isNumeric(value)) {
                        window.uiDebug?.("value isNumeric - and in milliseconds")
                        dateValue = new Date()
                        dateValue.setTime(value)
                    } //TODO else if other formats 
                }

                if (element.attr('data-datetime-format')) {
                    let dateTimeFormat = element.attr('data-datetime-format')

                    if (dateTimeFormat == INPUT_TYPE.DTP_VIEW_MODE_YEARS) {
                        dtpOption = {
                            viewMode: INPUT_TYPE.DTP_VIEW_MODE_YEARS,
                            format: INPUT_TYPE.DTP_FORMAT_YEAR
                        }
                    } else if (dateTimeFormat == INPUT_TYPE.DTP_VIEW_MODE_MONTHS) {
                        dtpOption = {
                            viewMode: INPUT_TYPE.DTP_VIEW_MODE_MONTHS,
                            format: INPUT_TYPE.DTP_FORMAT_MONTH
                        }
                    } else if (dateTimeFormat == INPUT_TYPE.DTP_VIEW_MODE_DATE) {
                        dtpOption = {
                            format: INPUT_TYPE.DTP_FORMAT_DATE
                        }
                    } else if (dateTimeFormat == INPUT_TYPE.DTP_VIEW_MODE_TIME) {
                        dtpOption = {
                            format: INPUT_TYPE.DTP_FORMAT_TIME
                        }
                    } else if (dateTimeFormat == INPUT_TYPE.DTP_VIEW_MODE_DATE_TIME) {
                        dtpOption = { format: INPUT_TYPE.DTP_FORMAT_DATE_TIME }
                    }
                } else {
                    /* treating it as datetime so setting no format */
                    dtpOption = { format: INPUT_TYPE.DTP_FORMAT_DATE_TIME }
                }

                window.uiDebug?.("dtpOption:: " + JSON.stringify(dtpOption))
                window.uiDebug?.("parent: " + element.parent().attr('class'))
                let dateTimePickerId = element.attr('id') + "-datetimepicker"
                $('#' + dateTimePickerId).datetimepicker(dtpOption).on('dp.change', function () {
                    //TODO
                    element.find('input').trigger("change")
                })

                /* if value is there then set it to date time picker */
                if (dateValue) {
                    $('#' + dateTimePickerId).data("DateTimePicker").date(dateValue)
                }

                /* if data-min-date is there then set it to date time picker */
                if (element.attr('data-min-date')) {
                    let minDate = element.attr('data-min-date')
                    //dtpOption.minDate(minDate)
                    $('#' + dateTimePickerId).data("DateTimePicker").minDate(minDate)
                }

                /* if data-max-date is there then set it to date time picker */
                if (element.attr('data-max-date')) {
                    let maxDate = element.attr('data-max-date')
                    //dtpOption.maxDate(maxDate)
                    $('#' + dateTimePickerId).data("DateTimePicker").maxDate(maxDate)
                }

            }

        } else {
            //do nothing here
        }
        element.removeClass("shoz-form-element")
    }

}

function setupCoreFormBtn() {
    // setting up the form buttons
    $('.shoz-form-btn').each(function (e) {
        $(this).addClass("btn").addClass("btn-sm").addClass("btn-default")
    })

    // setting up the modal buttons
    $('.shoz-modal-btn').each(function (e) {
        $(this).addClass("btn").addClass("btn-sm").addClass("btn-default")
    })
}

function wrapElement(toWrap, wrapper = document.createElement('div')) {
    // toWrap.before(wrapper);
    return wrapper.appendChild(toWrap);
}


// Form access check (view or edit permissions)
function checkFormAccess(formMeta, formElement) {
    const { allowView = true, allowEdit = true } = formMeta;
    const mode = resolveFormMode(formElement, formMeta);

    const noAccess =
        (mode === 'edit' && !allowEdit) ||
        (mode === 'view' && !allowView);

    if (noAccess) {
        const msg = document.createElement('p');
        msg.textContent = 'You are not supposed to view this page';
        msg.classList.add(STYLE_CLASS.ALERT,
            STYLE_CLASS.ALERT_DANGER,
            STYLE_CLASS.TEXT_CENTER,
            STYLE_CLASS.MT_3);
        formElement.innerHTML = '';
        formElement.appendChild(msg);
        return false;
    }

    return true;
}





// setupCoreFormElement()

(() => {
    'use strict'
    document.addEventListener('readystatechange', () => {
        window.uiDebug?.("document.readyState>>>>>>>>>>>>>>", document.readyState);
        if (document.readyState === "complete") {
            // Fetch all the forms marked as lab-form
            const forms = document.querySelectorAll('.lab-form, .shoz-form')
            // window.uiDebug?.("forms>>>>>>>>>>>>>>>>>>>>>",forms);
            // Loop over them and set them up
            Array.from(forms).forEach(form => {
                setupForm(form)
            })
        }
    })
})();

(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            var invalidOptions = document.querySelectorAll(".form-control:invalid");
            invalidOptions.forEach(function (element) {
                element.parentNode.childNodes.forEach(function (node) {
                    if (node.className == 'valid-feedback') {
                        node.classList.add('d-none');
                    }
                });
            });

            var validOptions = document.querySelectorAll(".form-control:valid");
            invalidOptions.forEach(function (element) {
                element.parentNode.childNodes.forEach(function (node) {
                    if (node.className == 'invalid-feedback') {
                        node.classList.remove('d-none');

                    }

                });
            });

        form.classList.add(STYLE_CLASS.WAS_VALIDATED)
        }, false)
    })
})();
