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

function buildFormRoute(formId, entityUid, mode = 'view') {
    if (!formId || !entityUid) {
        return null;
    }

    return `/${mode}/${formId}/${entityUid}`;
}

function getInlineLoaderHtml() {
    return `
        <div class="d-flex justify-content-center align-items-center gap-2 text-muted py-4">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span>Loading...</span>
        </div>
    `;
}

async function switchFormMode(formElement, nextMode, formMeta) {
    const entityUid = formElement.dataset.entityUid;
    const route = buildFormRoute(formMeta.id, entityUid, nextMode);
    const detailContainer = formElement.closest('.inbox-detail-content');

    if (!detailContainer || !entityUid) {
        if (route) {
            window.location.href = route;
        }
        return;
    }

    detailContainer.innerHTML = getInlineLoaderHtml();

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

    const nextForm = detailContainer.querySelector('.shoz-form');
    if (!nextForm) {
        return;
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

    if (detailContainer && entityUid && formMeta.formMode === 'edit') {
        await switchFormMode(formElement, 'view', formMeta);
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
    console.log("setuping shoz-form...")
    console.log("formId = " + formElement.id)

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

    console.log("formMeta>>>>>>>>>>>", formMeta)


    //Skeleton remove
    const skeletonContainer = formElement.querySelector(".form-skeleton");
    if (skeletonContainer) {
        skeletonContainer.remove();
    }



    formMeta.id = formElement.id
    formMeta.formMode = resolveFormMode(formElement, formMeta);
    formElement.dataset.formMode = formMeta.formMode;
    applyModeOverrides(formMeta);

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
        bindDynamicFormSubmit(formElement, formMeta);
        return formMeta;
    }

    const cardProvider = new CardProvider(formMeta.placeholder);
    formElement.before(cardProvider.getCard());

    const resolvedHeader = resolveFormHeaderConfig(formMeta);
    if (resolvedHeader.text) {
        const cardHeader = cardProvider.getCardHeader();
        setupFormHeader(cardHeader, formMeta, formElement);
    }

    if (formMeta.fields || formMeta.actions) {
        if (formMeta.fields) {
            const cardBody = cardProvider.getCardBody();
            setupFormBody(cardBody, formMeta);
        }
        if (formMeta.actions && !isFormReadOnly(formMeta)) {
            const cardFooter = cardProvider.getCardFooter();
            setupFormFooter(cardFooter, formMeta, formElement);
        }
    }

    const hasSchemaActions = Array.isArray(formMeta.actions) && formMeta.actions.length > 0;

    if (!isFormReadOnly(formMeta) && !hasSchemaActions && (formMeta.submitButtonLabel || formMeta.allowSubmit || formMeta.allowCancel)) {
        // create a container for buttons
        const btnContainer = document.createElement(HTML_TAG.DIV);
        btnContainer.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.GAP_2); // Bootstrap flex + spacing


        // Cancel button
        if (formMeta.allowCancel) {
            btnContainer.classList.add(STYLE_CLASS.JUSTIFY_CONTENT_END);
            appendDefaultCancelButton(btnContainer, formElement, formMeta);
        }

        // Submit button
        if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
            console.log("Adding submit button with label:", formMeta.submitButtonLabel);
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
        console.log("Applying Bootstrap card elevation styles");

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
    //     // console.log("Applying Bootstrap skeleton render styles", formMeta.skeletonRender);

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
    //         // console.log("Skeleton render complete, real form displayed");
    //     }, formMeta.skeletonRenderDelay || 25000);
    // }





    // run prepare hook func if present
    // if (formMeta?.prepareHookFunc) {
    //     window[formMeta?.prepareHookFunc](formElement?.id);
    // }

    // removing placeholder
    cardProvider.getCard().classList.remove(...['placeholder-glow', 'placeholder-wave']);

    bindDynamicFormSubmit(formElement, formMeta);
    return formMeta;
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
    let entityData = null;

    if (formMeta.entity && entityUId) {
        const getentityResponse = await getfetchEntityData(formMeta.entity, entityUId);
        entityData = getentityResponse?.data || null;
    }

    if (Array.isArray(formMeta.fields)) {
        formMeta.fields.forEach((field, index) => {
            field._renderIndex = index;
            field._domId = buildFieldDomId(formMeta, field, index);
            field.value = resolveFieldValue(field.id, formData, entityData);
            addField(field, formElement, formMeta);
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

function dispatchDynamicFormEvent(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function resolveDynamicFormMessage(result, fallbackMessage) {
    return result?.message
        || result?.response_schema?.message
        || result?.response_schema?.title
        || fallbackMessage;
}

async function handleDynamicFormSubmit(event, formMeta) {
    const form = event.currentTarget;

    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add(STYLE_CLASS.WAS_VALIDATED);
        return;
    }

    event.preventDefault();
    event.stopPropagation();
        form.classList.add(STYLE_CLASS.WAS_VALIDATED);

    const method = resolveDynamicFormMethod(formMeta, form);
    const endpoint = resolveDynamicFormEndpoint(formMeta, form, method);

    if (!endpoint) {
        console.error('Dynamic form submit skipped: no endpoint available.', { formMeta });
        return;
    }

    const payload = serializeDynamicFormPayload(form, formMeta);
    try {
        const result = await submitDynamicFormRequest(endpoint, method, payload, form);
        const errors = result?.errors || result?.response_schema?.errors || null;

        if (!result?.success) {
            console.error('Dynamic form submit failed.', {
                endpoint,
                method,
                payload,
                result,
            });

            if (errors) {
                window.formErrors = errors;
            }

            dispatchDynamicFormEvent('shoz-form:submit-failed', {
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

        dispatchDynamicFormEvent('shoz-form:submitted', {
            formId: form.id,
            endpoint,
            method,
            payload,
            response: result,
            message: resolveDynamicFormMessage(result, 'Form submitted successfully.'),
        });
    } catch (error) {
        console.error('Dynamic form submit error.', error);

        dispatchDynamicFormEvent('shoz-form:submit-failed', {
            formId: form.id,
            endpoint,
            method,
            payload,
            error,
            message: error?.message || 'Something went wrong while submitting the form.',
        });
    }
}

async function submitDynamicFormRequest(endpoint, method, payload, form) {
    const csrfToken = form.querySelector('input[name="_token"]')?.value;
    const options = csrfToken
        ? { headers: { 'X-CSRF-TOKEN': csrfToken } }
        : {};

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
        return `/api/entity/update/${formMeta.entity}/${entityUid}`;
    }

    if (method === 'DELETE' && entityUid) {
        return `/api/entity/delete/${formMeta.entity}/${entityUid}`;
    }

    return `/api/entity/store/${formMeta.entity}`;
}

function serializeDynamicFormPayload(form, formMeta) {
    const payload = {};
    const metaPayload = {};
    const fields = Array.isArray(formMeta.fields) ? formMeta.fields : [];

    fields.forEach(field => {
        const value = getSerializedFieldValue(form, field);
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
    return input ? input.value : null;
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
            console.log('Edit icon clicked');
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
function setupFormBody(cardBody, formMeta) {
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
        setupFormBlock(formCol, formMeta);
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

    const fragment = document.createElement('div');
    fragment.id = cardFooter.id + "-item"
    fragment.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.JUSTIFY_CONTENT_END, STYLE_CLASS.GAP_2]);
    if (formMeta.placeholder) {
        fragment.classList.add(...['placeholder', formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardFooter.appendChild(fragment)

    if (formMeta.actions) {
        formMeta.actions.forEach(action => {
            action.form = formMeta.id
            addAction(action, fragment);
        })
    }

    const hasCancelAction = Array.isArray(formMeta.actions)
        && formMeta.actions.some((action) => {
            const actionText = String(action?.text || '').trim().toLowerCase();
            return action?.type === 'cancel' || actionText === 'cancel';
        });

    if (!isFormReadOnly(formMeta) && !hasCancelAction) {
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
        //     //     console.log("Submit button clicked for form:");
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
            actionElement.classList.add('btn-' + action.element.variant);
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
        infoBlockHTML.classList.add("form-info-block", STYLE_CLASS.SMALL)
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
    console.log("setuping shoz-form-elements ...")
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
        if (element.attr('data-label')) {
            element.parent().append("<label class=\"" + STYLE_CLASS.FORM_LABEL + "\" for=\"" + element.attr('id') + "\" title=\"" + element.attr('data-label') + "\">" + element.attr('data-label') + "</label>")
        }

        // checking if additional info is provided in the data-help-info attr
        if (element.attr('data-help-info')) {
            element.parent().append("<p class=\"shoz-help-text " + STYLE_CLASS.SMALL + " " + STYLE_CLASS.TEXT_MUTED + "\">" + element.attr('data-help-info') + "</p>")
        }

        // check if select option or not
        if (element.prop("tagName") == 'SELECT') {
            let defaultOption = element.attr('data-default')
            if (defaultOption) {
                // do nothing
            } else {
                defaultOption = "-- select an option --"
            }
            //console.log("Selected Option: "element.val())
            // create new option element

            let selectedFlag = "selected"
            if (element.children('option[selected]').length > 0) selectedFlag = ""

            element.prepend("<option value='selectone' " + selectedFlag + " disabled>" + defaultOption + "</option>")
        }

        // checking if type is given
        if (element.attr('type')) {
            let type = element.attr('type') // get the given type of the input element
            console.log("type::" + type)

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
            console.log("dataType::" + dataType)

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
                    console.log("value = " + element.val())
                    let value = element.val()
                    if ($.isNumeric(value)) {
                        console.log("value isNumeric - and in milliseconds")
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

                console.log("dtpOption:: " + JSON.stringify(dtpOption))
                console.log("parent: " + element.parent().attr('class'))
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
        console.log("document.readyState>>>>>>>>>>>>>>", document.readyState);
        if (document.readyState === "complete") {
            // Fetch all the forms marked as shoz-form
            const forms = document.querySelectorAll('.shoz-form')
            // console.log("forms>>>>>>>>>>>>>>>>>>>>>",forms);
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
