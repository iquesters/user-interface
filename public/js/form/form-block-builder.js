/**
 * form block builder functions setupFormBlock and addField ,addFieldSize functions
 */

/**
 * 
 * @param {*} formCol 
 * @param {*} formMeta 
*/
async function setupFormBlock(formCol, formMeta) {
    if (formMeta.fields) {
        const fragment = document.createElement(HTML_TAG.DIV)
        fragment.id = formCol.id + "-item"
        fragment.classList.add(STYLE_CLASS.FORM_BLOCK);
        // if (formMeta.placeholder) {
        //     fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
        // }
        formCol.appendChild(fragment)

        const form = document.getElementById(formMeta.id)
        wrapElement(form, fragment)

        // add formId hidden field
        const formIdInput = document.createElement(HTML_TAG.INPUT)
        formIdInput.type = INPUT_TYPE.HIDDEN
        formIdInput.name = INPUT_TYPE.FORMID
        formIdInput.value = formMeta.id
        formIdInput.setAttribute(ATTR_CONS.AUTOCOMPLETE,ATTR_CONS.OFF)
        form.appendChild(formIdInput)

        form.setAttribute(ATTR_CONS.METHOD, formMeta.method || 'POST')
        if (formMeta.endpoint) {
            form.setAttribute('action', formMeta.endpoint)
        }
        form.setAttribute(ATTR_CONS.ENTYPE, formMeta.enctype)
        // Suppress the browser's own validation popups so every error
        // — native constraint failures included — always renders through
        // our own error UI (applyDynamicFormFieldError / the submit
        // summary banner) instead of the browser's default bubble.
        form.noValidate = true
        // Single spacing source between stacked fields: g-1 on the row,
        // no per-field margin (see createFieldFragment) — avoids the two
        // stacking and producing an inconsistent-looking gap.
        form.classList.add(...[STYLE_CLASS.ROW, STYLE_CLASS.ROW_COLS_1, 'g-2', STYLE_CLASS.NEEDS_VALIDATION])
        // View mode: no divider lines, so give rows more air.
        if (typeof isFormReadOnly === 'function' && isFormReadOnly(formMeta)) {
            form.classList.add('gy-3');
        }

        // get form data
        let formData = form.dataset.formData
        if (formData) {
            formData = JSON.parse(formData)
            delete form.dataset.formData
        } else {
            window.uiDebug?.("data-form-data is not provided")
        }
        window.uiDebug?.("formData = " + formData)

        const entityUId = form.dataset.entityUid;
        let entityData = form.__entityDataCache || null;

        if (!entityData && formData && typeof formData === 'object' && !Array.isArray(formData)) {
            entityData = formData;
        }

        if (!entityData && entityUId) {
            entityData = await fetchFormRecord(formMeta, entityUId);
        }

        if (entityData) {
            form.__entityDataCache = entityData;
        }

        await loadRemoteFieldOptions(formMeta);

        // add fields to form
        if (formMeta.fields && formMeta.fields.length > 0) {
            formMeta.fields.forEach((field, index) => {
                if (!isFieldShownInMode(field, formMeta.formMode)) {
                    return;
                }
                applyModeRequired(field, formMeta.formMode);
                field._renderIndex = index;
                field._domId = buildFieldDomId(formMeta, field, index);
                field._resolvedSize = resolveFieldSizeConfig(field, formMeta);
                field.value = resolveFieldValue(field.id, formData, entityData);
                addField(field, form, formMeta);
            });
        } else {
            if (APP_ENV === 'dev') {
                const errorMessageContainer = document.getElementById("form-error-message");
                console.warn("No fields defined in formMeta for form:", formMeta.id);
                errorMessageContainer.classList.add('alert', 'alert-warning');
                errorMessageContainer.textContent = `⚠️ No fields defined in form: ${formMeta.id}`;
            }
        }

        if (entityData) {
            renderEntityDataToForm(form, entityData);
        }

    }
}


async function addField(field, addTo,formMeta) {
    if (isSpacerField(field)) {
        renderFormSpacer(field, addTo);
        return;
    }

    if (field.type === INPUT_TYPE.HIDDEN) {
        const input = document.createElement(HTML_TAG.INPUT);
        input.type = INPUT_TYPE.HIDDEN;
        input.id = getFieldDomId(field);
        input.name = field.id;
        input.value = field.value || field.default || "";
        input.setAttribute(ATTR_CONS.AUTOCOMPLETE, ATTR_CONS.OFF);
        applyFieldValidation(field, input);
        addTo.appendChild(input);
        return;
    }

    // Repeatable group (repeater-field.js): its own edit and view rendering.
    if (typeof isRepeaterField === 'function' && isRepeaterField(field)) {
        renderRepeaterField(field, addTo, typeof isFormReadOnly === 'function' && isFormReadOnly(formMeta));
        return;
    }

    if (typeof isFormReadOnly === 'function' && isFormReadOnly(formMeta)) {
        renderReadOnlyField(field, addTo);
        return;
    }

    if (field.type === INPUT_TYPE.RADIO) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        if (field.label) {
            fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL]));
        }

        if (Array.isArray(field.options)) {
            field.options.forEach(opt => fragment.appendChild(createOptionInput(field, opt, INPUT_TYPE.RADIO)));
        }
        // ✅ Add helper text below radio group
        createHelperText(field, fragment);

        appendBackendError(field, fragment);
    }
    
    
    else if (field.type === INPUT_TYPE.SELECT || field.element === INPUT_TYPE.SELECT) {
        const fragment = createFieldFragment(field, addTo);
        
        // ✅ Label (same as radio & checkbox)
        if (field.label) {
            fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL]));
        }

        // ✅ Create select element
        const select = createSelectInput(field);
        fragment.appendChild(select);

        // Apply select Frontend validation
        // applySelectValidation(field, select);

        // ✅ Laravel backend validation error
        if (window.formErrors && window.formErrors[field.id]) {
            select.classList.add('is-invalid'); // Bootstrap red border
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${getFieldDomId(field)}-error`;
            errorDiv.textContent = window.formErrors[field.id][0]; // first error message
            formFloating.appendChild(errorDiv);
        }

        createHelperText(field, fragment);
    }
    
    
    else if (field.type === INPUT_TYPE.CHECKBOX) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        // ✅ Add helper text below checkbox or group
        
        if (Array.isArray(field.options)) {
            if (field.label) {
            fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL]));
            }
            field.options.forEach(opt => fragment.appendChild(createOptionInput(field, opt, INPUT_TYPE.CHECKBOX)));
        } else {
            const div = createOptionInput(field, { value: 1, label: field.label }, INPUT_TYPE.CHECKBOX);
            fragment.appendChild(div);
        }
        createHelperText(field, fragment);
        
    }

    else if (field.type === INPUT_TYPE.TEXTAREA) {
        const fragment = createFieldFragment(field, addTo);
        

        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel = formMeta.floatinglabel === true;

        const { formContainer, inputElement: textarea } = createFormFieldContainer(field, useFloatingLabel, HTML_TAG.TEXTAREA);
        fragment.appendChild(formContainer);
        

        // Apply textarea Frontend validation
        // applyTextareaValidation(field, textarea);
        if (field.rows) {
            textarea.setAttribute('rows', field.rows);
        }
        formContainer.appendChild(textarea);

        // ✅ ERROR HANDLING: Same for both structures
        if (window.formErrors && window.formErrors[field.id]) {
            textarea.classList.add('is-invalid');
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${getFieldDomId(field)}-error`;
            errorDiv.textContent = window.formErrors[field.id][0];
            formContainer.appendChild(errorDiv);
        }

        // ✅ HELPER TEXT: Conditional placement
        createHelperText(field, fragment);

        // Add info and feedback together
        appendFieldInfoAndFeedback(field, formContainer);
    }

    // For Datalist
    else if (field.type === INPUT_TYPE.DATALIST) {
        const fragment = createFieldFragment(field, addTo);
        

        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel = formMeta.floatinglabel === true;
        
    
        const { formContainer, inputElement: input } = createFormFieldContainer(field, useFloatingLabel);
        input.setAttribute(ATTR_CONS.LIST, `${getFieldDomId(field)}${SUFFIX.LIST}`);
        fragment.appendChild(formContainer);

        const datalist = document.createElement(HTML_TAG.DATALIST);
        datalist.id = `${getFieldDomId(field)}${SUFFIX.LIST}`;

        if (Array.isArray(field.options)) {
            field.options.forEach(opt => {
                const option = document.createElement(HTML_TAG.OPTION);
                option.value = opt;
                datalist.appendChild(option);
            });
        }

        formContainer.appendChild(datalist);

        // ✅ VALIDATION: Apply datalist validation
        // if (typeof applyDatalistValidation === "function") {
        //     // applyDatalistValidation(field, input, datalist);
        // }


        // ✅ ERROR HANDLING: Same for both structures
        if (window.formErrors && window.formErrors[field.id]) {
            input.classList.add('is-invalid');
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${getFieldDomId(field)}-error`;
            errorDiv.textContent = window.formErrors[field.id][0];
            formContainer.appendChild(errorDiv);
        }

        // ✅ HELPER TEXT: Conditional placement
        createHelperText(field, fragment);

        // Add info and feedback together
        appendFieldInfoAndFeedback(field, formContainer);
    }

    // For all other input types (text, email, password, number, date, file, etc.)
    else if (field.type && field.label) {
        const fragment = createFieldFragment(field, addTo);

        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel =  formMeta.floatinglabel === true;


         // ✅ READ-ONLY MODE: show only value, no input/label
        if (formMeta.formEdit === false) {
            const valueDiv = document.createElement(HTML_TAG.DIV);
            valueDiv.textContent = field.value || "—";
            valueDiv.dataset.fieldId = field.id;
            valueDiv.classList.add('form-control-plaintext');
            fragment.appendChild(valueDiv);
            addTo.appendChild(fragment);
            return;
        }
        
        // // ✅ CONDITIONAL: Create container with appropriate class
        const { formContainer, inputElement: input } = createFormFieldContainer(field, useFloatingLabel);
        input.type = field.type;
        input.value = field.value || "";
        // "readonly": shown in edit mode but not editable (e.g. the account email).
        if (field.readonly === true) {
            input.readOnly = true;
            input.classList.add('bg-body-tertiary');
        }
        fragment.appendChild(formContainer);

        // "crop": choose the area of an image before it is uploaded.
        if (field.type === 'file' && field.crop && typeof attachImageCrop === 'function') {
            attachImageCrop(input, field, fragment);
        }

        // ✅ Password fields get a show/hide toggle, matching the classic
        // auth forms. The click handling itself is a shared, delegated
        // listener (see layouts/common/script.blade.php) that looks for
        // .toggle-password buttons anywhere in the document.
        if (field.type === INPUT_TYPE.PASSWORD) {
            const inputGroup = document.createElement(HTML_TAG.DIV);
            inputGroup.classList.add('input-group');
            input.replaceWith(inputGroup);
            inputGroup.appendChild(input);

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.classList.add('btn', 'btn-outline-secondary', 'toggle-password');
            const toggleIcon = document.createElement('i');
            toggleIcon.classList.add('fas', 'fa-eye-slash');
            toggleBtn.appendChild(toggleIcon);
            inputGroup.appendChild(toggleBtn);
        }

        // Reserve this field's message space up front (before any error or
        // live hint ever appears) so showing/clearing one later never
        // shifts the form's height.
        getOrCreateFieldMessageSlot(getFieldDomId(field), fragment);

        // // Frontend validation
        applyFieldValidation(field, input);
        // // formContainer.appendChild(input);
       
        
 
        createHelperText(field, fragment);

        // Add info and feedback together
        appendFieldInfoAndFeedback(field, formContainer);
    }

}

function isSpacerField(field = {}) {
    return field?.type === INPUT_TYPE.SPACER || field?.type === CONSTANT.FORM_LAYOUT_SPACER_TYPE;
}

function renderFormSpacer(field, addTo) {
    const spacerField = {
        ...field,
        _resolvedSize: resolveSpacerSizeConfig(field),
    };
    const spacer = createFieldFragment(spacerField, addTo, STYLE_CLASS.FORM_SPACER);
    const spacerHeight = typeof field.height === 'string' && field.height.trim()
        ? field.height.trim()
        : CONSTANT.DEFAULT_FORM_SPACER_HEIGHT;

    spacer.setAttribute('aria-hidden', 'true');
    spacer.dataset.layoutType = CONSTANT.FORM_LAYOUT_SPACER_TYPE;

    if (spacerHeight !== CONSTANT.DEFAULT_FORM_SPACER_HEIGHT) {
        spacer.style.minHeight = spacerHeight;
    }
}

/**
 * View mode: a details grid (small muted label above the value, spacing
 * instead of divider lines), not a disabled-looking input. The value element keeps the field's DOM id
 * and data-field-id, which renderEntityDataToForm() fills in later.
 */
function renderReadOnlyField(field, addTo) {
    const fragment = createFieldFragment(field, addTo);
    const fieldDomId = getFieldDomId(field);
    const formContainer = document.createElement(HTML_TAG.DIV);
    formContainer.id = `${fieldDomId}${SUFFIX.CONTAINER}`;
    formContainer.classList.add('lab-view-field', 'py-1');
    fragment.appendChild(formContainer);

    if (field.label) {
        const label = document.createElement(HTML_TAG.DIV);
        label.id = `${fieldDomId}${SUFFIX.LABEL}`;
        label.classList.add('lab-view-label', 'small', 'text-body-secondary', 'mb-1');
        label.textContent = field.label;
        formContainer.appendChild(label);
    }

    if (field.type === 'image') {
        renderReadOnlyImage(field, formContainer, fieldDomId);
        createHelperText(field, fragment);
        return;
    }

    const valueDiv = document.createElement(HTML_TAG.DIV);
    valueDiv.id = fieldDomId;
    valueDiv.dataset.fieldId = field.id;
    valueDiv.classList.add('lab-view-value', 'fw-medium', 'text-break');
    if (field.display === 'badge' || field.display === 'status') {
        valueDiv.dataset.display = field.display;
    }
    setReadOnlyValue(valueDiv, field, getReadOnlyFieldDisplayValue(field), field.value);
    formContainer.appendChild(valueDiv);

    appendFieldActions(field, formContainer);
    createHelperText(field, fragment);
}

/**
 * Write a view-mode value.
 *   "display": "status" -> the same badge as <x-userinterface::status>:
 *                          `badge text-bg-{value}` (colours in bootstrap-override.css),
 *                          labelled with the option label.
 *   "display": "badge"  -> each value (or list item) as a neutral badge, e.g. roles.
 */
function setReadOnlyValue(valueDiv, field, text, rawValue) {
    const display = valueDiv.dataset.display;

    if (display === 'status' && text !== '—') {
        // Same class contract as the Blade status/badge components.
        const variant = String(rawValue ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'secondary';
        const badge = document.createElement('span');
        badge.className = `badge text-bg-${variant}`;
        badge.textContent = text;
        valueDiv.textContent = '';
        valueDiv.appendChild(badge);
        return;
    }

    if (display !== 'badge' || text === '—') {
        valueDiv.textContent = text;
        return;
    }

    valueDiv.textContent = '';
    String(text).split(', ').filter(Boolean).forEach(item => {
        const badge = document.createElement('span');
        badge.className = 'badge text-bg-light border me-1';
        badge.textContent = item;
        valueDiv.appendChild(badge);
    });
}

/**
 * "type": "image" in view mode: the picture (value = URL), square by default.
 * "actions" on the field (see appendFieldActions) open other forms, e.g.
 * "Change picture" -> the upload form in a modal.
 */
function renderReadOnlyImage(field, container, fieldDomId) {
    const wrapper = document.createElement(HTML_TAG.DIV);
    wrapper.className = 'position-relative d-inline-block w-100';
    wrapper.style.maxWidth = field.maxWidth || '240px';

    const img = document.createElement('img');
    img.id = fieldDomId;
    img.dataset.fieldId = field.id;
    img.alt = field.label || '';
    img.className = 'img-thumbnail rounded w-100';
    img.style.aspectRatio = field.aspectRatio || '1 / 1';
    img.style.objectFit = 'cover';
    if (field.value) {
        img.src = field.value;
    }
    wrapper.appendChild(img);
    container.appendChild(wrapper);

    appendFieldActions(field, wrapper, true);
}

/**
 * Field-level actions in view mode:
 *   "actions": [{"label": "Change picture", "icon": "fas fa-camera", "form": "user-profile-picture", "title": "..."}]
 * Each opens that form schema in a modal (showModal({formId})). On an image
 * they sit in a camera menu over the picture; otherwise as small links.
 */
function appendFieldActions(field, container, overlay = false) {
    const actions = Array.isArray(field.actions) ? field.actions.filter(a => a?.form) : [];
    if (actions.length === 0 || typeof showModal !== 'function') {
        return;
    }

    const open = action => showModal({
        formId: action.form,
        title: action.title || action.label || '',
        submitLabel: action.submitLabel || 'Save',
    });

    if (!overlay) {
        const bar = document.createElement(HTML_TAG.DIV);
        bar.className = 'd-flex gap-3 mt-1';
        actions.forEach(action => {
            const link = document.createElement(HTML_TAG.BUTTON);
            link.type = 'button';
            link.className = `btn btn-link btn-sm p-0 text-decoration-none ${action.danger ? 'text-danger' : ''}`;
            link.innerHTML = `${action.icon ? `<i class="${action.icon} me-1"></i>` : ''}`;
            link.append(document.createTextNode(action.label || ''));
            link.addEventListener('click', () => open(action));
            bar.appendChild(link);
        });
        container.appendChild(bar);
        return;
    }

    const menu = document.createElement(HTML_TAG.DIV);
    menu.className = 'dropdown position-absolute bottom-0 end-0 mb-2 me-2';

    const toggle = document.createElement(HTML_TAG.BUTTON);
    toggle.type = 'button';
    toggle.className = 'btn btn-secondary btn-sm rounded';
    toggle.dataset.bsToggle = 'dropdown';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.title = field.actionsLabel || 'Change';
    toggle.innerHTML = '<i class="fas fa-fw fa-camera"></i>';
    menu.appendChild(toggle);

    const list = document.createElement(HTML_TAG.DIV);
    list.className = 'dropdown-menu shadow';
    actions.forEach(action => {
        const item = document.createElement(HTML_TAG.BUTTON);
        item.type = 'button';
        item.className = `dropdown-item ${action.danger ? 'text-danger' : ''}`;
        item.dataset.formAction = action.form;
        item.innerHTML = action.icon ? `<i class="${action.icon} fa-fw me-1"></i>` : '';
        item.append(document.createTextNode(action.label || ''));
        item.addEventListener('click', () => open(action));
        list.appendChild(item);
    });
    menu.appendChild(list);
    container.appendChild(menu);
}

function getReadOnlyFieldDisplayValue(field) {
    const value = field.value;

    if (Array.isArray(value)) {
        // Several picked options (checkboxes): their labels.
        const options = Array.isArray(field.options) ? field.options : [];
        const labels = value.map(item => {
            const option = options.find(opt => String(opt?.value ?? '') === String(item ?? ''));
            return option ? (option.label || option.text || item) : item;
        });
        return labels.length > 0 ? labels.join(', ') : '—';
    }

    if (field.type === INPUT_TYPE.CHECKBOX && !Array.isArray(field.options)) {
        return value ? 'Yes' : 'No';
    }

    // Select/radio: show the option's label, not its stored value.
    if (Array.isArray(field.options) && field.options.length > 0) {
        const option = field.options.find(opt => String(opt?.value ?? '') === String(value ?? ''));
        if (option && (option.label || option.text)) {
            return option.label || option.text;
        }
    }

    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return value;
}


function addFieldSize(field, elementToSize) {
    let sizeClasses = [];
    const resolvedSize = field._resolvedSize ?? field.size ?? field.gridSize;

    if (typeof resolvedSize === 'number') {
        if (resolvedSize >= 1 && resolvedSize <= 12) {
            sizeClasses.push(`col-${resolvedSize}`);
        }
    } else if (resolvedSize && resolvedSize.constructor?.name === 'Object') {
        Object.keys(resolvedSize).forEach((sizeKey) => {
            const value = resolvedSize[sizeKey];
            if (value < 1 || value > 12) {
                return;
            }

            if (sizeKey === 'xs') {
                sizeClasses.push(`col-${value}`);
                return;
            }

            if (['sm', 'md', 'lg', 'xl', 'xxl'].includes(sizeKey)) {
                sizeClasses.push(`col-${sizeKey}-${value}`);
            }
        });
    }

    if (sizeClasses.length === 0) {
        sizeClasses.push('col-12');
    }

    elementToSize.classList.add(...sizeClasses);
}

function resolveFieldSizeConfig(field = {}, formMeta = {}) {
    const fieldSize = getUsableSizeConfig(field.size);
    if (fieldSize !== null) {
        return fieldSize;
    }

    const gridSize = getUsableSizeConfig(field.gridSize);
    if (gridSize !== null) {
        return gridSize;
    }

    const formDefault = formMeta.defaultFieldSize
        || formMeta.default_field_size
        || formMeta.fieldDefaultSize
        || formMeta.field_default_size;

    // "auto": responsive by field type (see autoFieldSize).
    if (formDefault === 'auto') {
        return autoFieldSize(field);
    }

    const formDefaultSize = getUsableSizeConfig(formDefault);

    return formDefaultSize || CONSTANT.DEFAULT_FORM_FIELD_SIZE;
}

/**
 * "defaultFieldSize": "auto": one column on phones; from md up, short inputs
 * sit two per row and wide content (textarea, file, image, option groups)
 * keeps the full width. Mirrors the server-rendered skeleton in
 * components/form.blade.php.
 */
function autoFieldSize(field = {}) {
    const wide = ['textarea', 'file', 'image', 'radio', 'json', 'editor', 'richtext', 'repeater'].includes(field.type)
        || (field.type === 'checkbox' && Array.isArray(field.options))
        || Boolean(field.optionsFrom?.url && field.type === 'checkbox');

    return wide ? { xs: 12 } : { xs: 12, md: 6 };
}

function resolveSpacerSizeConfig(field = {}) {
    const spacerSize = getUsableSizeConfig(field.size ?? field.gridSize);
    if (spacerSize !== null) {
        return spacerSize;
    }

    return CONSTANT.DEFAULT_FORM_SPACER_SIZE;
}

function getUsableSizeConfig(sizeConfig) {
    if (typeof sizeConfig === 'number') {
        return sizeConfig;
    }

    if (!sizeConfig || sizeConfig.constructor?.name !== 'Object') {
        return null;
    }

    return Object.keys(sizeConfig).length > 0 ? sizeConfig : null;
}




function createFieldFragment(field, addTo, addClass = null) {
    const fragment = document.createElement(HTML_TAG.DIV);
    fragment.id = `${getFieldDomId(field)}${SUFFIX.FIELD}`;
    addFieldSize(field, fragment);
    // No per-field margin — the row's own g-1 gap (setupFormBlock) is now
    // the single source of spacing between fields, so it stays consistent
    // regardless of a field's own content height.

    // optional extra class (for things like 'form-check-group')
    if (addClass) {
        if (Array.isArray(addClass)) {
            fragment.classList.add(...addClass);
        } else {
            fragment.classList.add(addClass);
        }
    }

    addTo.appendChild(fragment);
    return fragment;
}


function createHelperText(field, container) {
    if (field.helpertext || field.helperText) {
        const helperText = field.helpertext || field.helperText;
        const helper = document.createElement(HTML_TAG.DIV);
        helper.classList.add(STYLE_CLASS.FORM_TEXT, STYLE_CLASS.SMALL, STYLE_CLASS.TEXT_MUTED);
        helper.style.fontSize = STYLE_CLASS.HELPER_TEXT_FONT_SIZE;
        helper.style.display = 'block';
        helper.style.overflow = 'hidden';
        helper.style.textOverflow = 'ellipsis';
        helper.style.whiteSpace = 'nowrap';
        helper.id = `${getFieldDomId(field)}${SUFFIX.HELP}`;
        helper.textContent = helperText;
        helper.title = helperText;
        container.appendChild(helper);
    }
}



/**
 * Creates a form container with label and handles floating label layout.
 * 
 * @param {Object} field - Field schema containing id, label, placeholder, etc.
 * @param {boolean} useFloatingLabel - Whether form uses floating label layout.
 * @param {string} inputTag - The tag name of the input element (e.g. "input", "textarea").
 * @returns {Object} { container, inputElement }
 */
function createFormFieldContainer(field, useFloatingLabel, inputTag = HTML_TAG.INPUT) {
    const formContainer = document.createElement(HTML_TAG.DIV);
    const fieldDomId = getFieldDomId(field);
    formContainer.id = `${fieldDomId}${SUFFIX.CONTAINER}`;

    // ✅ Add structure classes
    if (useFloatingLabel) {
        formContainer.classList.add(STYLE_CLASS.FORM_FLOATING);
    }
    

    // ✅ Create label (for both structures)
    const label = document.createElement(HTML_TAG.LABEL);
    label.id = `${fieldDomId}${SUFFIX.LABEL}`;
    label.setAttribute(ATTR_CONS.FOR, fieldDomId);
    label.classList.add(STYLE_CLASS.FORM_LABEL);
    label.textContent = field.label;

    // ✅ Create input or textarea
    const inputElement = document.createElement(inputTag);
    inputElement.id = fieldDomId;
    inputElement.name = field.id;
    inputElement.classList.add(STYLE_CLASS.FORM_CONTROL);

    // ✅ Placeholder logic
    if (useFloatingLabel) {
        inputElement.setAttribute(ATTR_CONS.PLACEHOLDER, field.placeholder || field.label);
    } else if (field.placeholder) {
        inputElement.setAttribute(ATTR_CONS.PLACEHOLDER, field.placeholder);
    }

    // ✅ Structure order
    if (useFloatingLabel) {
        formContainer.append(inputElement,label);
    } else {
        formContainer.append(label,inputElement);
    }

    return { formContainer, inputElement };
}



/**
 * Appends optional field info and feedback to the form container.
 *
 * @param {Object} field - Field schema object
 * @param {HTMLElement} formContainer - The container element (e.g., div.form-floating)
 */
function appendFieldInfoAndFeedback(field, formContainer) {
    switch (true) {
        case field.info:
            addFieldHelpInfo(field, formContainer);
            break;
        case field.feedback:
            addFieldFeedback(field.feedback, formContainer);
            break;
        default:
            break;
    }
}


// ✅ Create <label> element
function createLabel(text, forId = null, classList = []) {
    const label = document.createElement(HTML_TAG.LABEL);
    label.textContent = text;
    if (forId) label.setAttribute(ATTR_CONS.FOR, forId);
    if (classList.length) label.classList.add(...classList);
    return label;
}


// ✅ Create radio/checkbox option div
function createOptionInput(field, opt, type) {
    const div = document.createElement(HTML_TAG.DIV);
    div.classList.add(STYLE_CLASS.FORM_CHECK);

    const input = document.createElement(HTML_TAG.INPUT);
    const fieldDomId = getFieldDomId(field);
    input.type = type;
    input.id = `${fieldDomId}-${opt.value}`;
    input.name = type === INPUT_TYPE.CHECKBOX ? field.id + "[]" : field.id;
    input.value = opt.value;
    input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);

    if (type === INPUT_TYPE.RADIO && field.value === opt.value) {
        input.checked = true;
    } else if (type === INPUT_TYPE.CHECKBOX && Array.isArray(field.value) && field.value.includes(opt.value)) {
        input.checked = true;
    }

    const label = createLabel(opt.label || opt.text, input.id, [STYLE_CLASS.FORM_CHECK_LABEL]);
    div.append(input, label);
    return div;
}


function createSelectInput(field) {
    const select = document.createElement(HTML_TAG.SELECT);
    select.id = getFieldDomId(field);
    select.name = field.id;
    select.classList.add(STYLE_CLASS.FORM_SELECT);

    if (Array.isArray(field.options)) {
        field.options.forEach(opt => {
            const option = document.createElement(HTML_TAG.OPTION);
            option.value = opt.value;
            option.textContent = opt.label || opt.text || '';
            if (field.value && field.value === opt.value) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    return select;
}



function appendBackendError(field, container, input = null) {
    if (window.formErrors && window.formErrors[field.id]) {
        const errorMsg = window.formErrors[field.id][0]; // first error

        // ✅ If single input provided — mark it invalid
        if (input) {
            input.classList.add('is-invalid');
        } else {
            // ✅ Else mark all form controls inside container invalid
            container.querySelectorAll('input, select, textarea').forEach(el => {
                el.classList.add('is-invalid');
            });
        }

        // ✅ Create error div
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("invalid-feedback");

        // For grouped fields (radio/checkbox), force visibility
        if (
            field.type === INPUT_TYPE.RADIO ||
            field.type === INPUT_TYPE.CHECKBOX
        ) {
            errorDiv.classList.add("d-block");
        }

        errorDiv.id = `${getFieldDomId(field)}-error`;
        errorDiv.textContent = errorMsg;
        container.appendChild(errorDiv);
    }
}

function buildFieldDomId(formMeta, field, index) {
    const formId = formMeta?.id || 'form';
    const fallbackFieldId = field?.type === INPUT_TYPE.SPACER
        ? `${CONSTANT.FORM_LAYOUT_SPACER_TYPE}-${index + 1}`
        : 'field';
    const fieldId = field?.id || fallbackFieldId;
    return `${sanitizeDomIdSegment(formId)}-${sanitizeDomIdSegment(fieldId)}-${index + 1}`;
}

function getFieldDomId(field) {
    return field?._domId || field?.id;
}

/**
 * One persistent message slot per field, shared by both the live-typing
 * hints (input-field-validation.js) and submit-time/backend errors
 * (appendDynamicFormFieldError in form.js). Created once — normally here,
 * during initial field rendering, so its space is reserved before any
 * message ever appears — and reused after that. Showing or clearing a
 * message only ever toggles visibility/text on this same element, never
 * adds/removes nodes, so the field's height never shifts.
 *
 * Truncates to one line (text-truncate) with the full text available via
 * the native title-attribute tooltip on hover.
 */
function getOrCreateFieldMessageSlot(fieldDomId, fallbackContainer) {
    if (!fieldDomId) {
        return null;
    }

    const slotId = `${fieldDomId}-message-slot`;
    let slot = document.getElementById(slotId);
    if (slot) {
        return slot;
    }

    const fieldWrapper = document.getElementById(fieldDomId + SUFFIX.FIELD) || fallbackContainer;
    if (!fieldWrapper) {
        return null;
    }

    slot = document.createElement(HTML_TAG.DIV);
    slot.id = slotId;
    slot.classList.add(STYLE_CLASS.INVALID_FEEDBACK, STYLE_CLASS.SMALL, 'd-block', 'text-truncate');
    slot.style.fontSize = STYLE_CLASS.HELPER_TEXT_FONT_SIZE;
    // line-height is pinned explicitly, not left to inherit Bootstrap's
    // body default (1.5) — an empty block-level element still gets a line
    // box sized by its line-height even with no text, so an inherited 1.5
    // line-height was reserving noticeably more space than the min-height
    // alone suggested.
    slot.style.lineHeight = '0.9rem';
    slot.style.minHeight = '0.9rem';
    slot.style.visibility = 'hidden';
    fieldWrapper.appendChild(slot);

    return slot;
}

/**
 * Show or clear a field's message through its shared slot. Passing an empty
 * message hides the slot (visibility, not display — the reserved space
 * stays) without removing it.
 */
function setFieldMessage(fieldDomId, message, fallbackContainer) {
    const slot = getOrCreateFieldMessageSlot(fieldDomId, fallbackContainer);
    if (!slot) {
        return false;
    }

    if (!message) {
        slot.textContent = '';
        slot.removeAttribute('title');
        slot.style.visibility = 'hidden';
        return true;
    }

    slot.textContent = message;
    slot.title = message;
    slot.style.visibility = 'visible';
    return true;
}

function sanitizeDomIdSegment(value) {
    return String(value)
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'field';
}

/**
 * Fetch entity data from Laravel API with Sanctum token
 */
async function getfetchEntityData(entity,entityUId) {
    try {
        if (!entity || !entityUId) {
            return { success: false, error: 'Missing entity or entity UID' };
        }

        const showUrl = entityRecordUrl('show', entity, entityUId);

        if (typeof apiClient !== 'undefined' && apiClient) {
            return await apiClient.get(showUrl);
        }

        const res = await fetch(showUrl, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
        });
        
        if (res.status === 401) {
            handleUnauthorized();
            return { success: false, error: 'Authentication required' };
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
    } catch (err) {
        console.error("🔥 Entity data fetch failed:", err);
        return { success: false, error: err.message };
    }
}

function resolveFieldValue(fieldId, formData, entityData) {
    if (formData && Object.prototype.hasOwnProperty.call(formData, fieldId)) {
        return formData[fieldId];
    }

    if (!entityData) {
        return "";
    }

    if (Object.prototype.hasOwnProperty.call(entityData, fieldId)) {
        return entityData[fieldId] ?? "";
    }

    const metaEntries = Array.isArray(entityData.meta) ? entityData.meta : [];
    const metaItem = metaEntries.find((item) => item?.meta_key === fieldId);

    return metaItem ? (metaItem.meta_value ?? "") : "";
}

/**
 * 
 * Render fetched entity data into form fields 
 */
async function renderEntityDataToForm(formSelector, entityResponse) {
    const form = typeof formSelector === 'string'
        ? document.querySelector(formSelector)
        : formSelector;
    const entityData = entityResponse || null;

    if (!form || !entityData) return;

    for (const [key, value] of Object.entries(entityData)) {
        const escapedKey = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
            ? CSS.escape(key)
            : String(key).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const field = form.querySelector(`#${escapedKey}, [name="${escapedKey}"]`);
        const readOnlyField = form.querySelector(`[data-field-id="${escapedKey}"]`);

        if (field) {
            if (field.type === 'checkbox') {
                field.checked = Boolean(Number(value)) || value === true || value === '1';
            } else {
                field.value = value ?? "";
            }
        }

        if (readOnlyField) {
            if (readOnlyField.tagName === 'IMG') {
                if (value) readOnlyField.src = value;
            } else {
                setReadOnlyValue(readOnlyField, null, readOnlyDisplayText(form, key, value), value);
            }
        }
    }

    const metaEntries = Array.isArray(entityData.meta) ? entityData.meta : [];
    metaEntries.forEach((item) => {
        const metaKey = item?.meta_key;
        if (!metaKey) {
            return;
        }

        const metaValue = item?.meta_value ?? "";
        const escapedKey = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
            ? CSS.escape(metaKey)
            : String(metaKey).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const field = form.querySelector(`#${escapedKey}, [name="${escapedKey}"]`);
        const readOnlyField = form.querySelector(`[data-field-id="${escapedKey}"]`);

        if (field) {
            field.value = metaValue;
        }

        if (readOnlyField) {
            readOnlyField.textContent = readOnlyDisplayText(form, metaKey, metaValue);
        }
    });
}

/**
 * View-mode text for a value, using the field's schema when known (so a
 * select shows its option label and empty values show "—"), the same as
 * renderReadOnlyField() does on first render.
 */
function readOnlyDisplayText(form, fieldId, value) {
    const fieldDef = (form.__formMeta?.fields || []).find(f => f?.id === fieldId);

    return String(getReadOnlyFieldDisplayValue({ ...(fieldDef || {}), value }));
}
