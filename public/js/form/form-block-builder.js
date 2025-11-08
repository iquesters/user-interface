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

        form.setAttribute(ATTR_CONS.METHOD, formMeta.method)
        // form.setAttribute('action', formMeta.action)
        form.setAttribute(ATTR_CONS.ENTYPE, formMeta.enctype)
        // form.classList.add(...['row', 'row-cols-1', 'row-cols-md-4', 'g-2', 'needs-validation'])
        form.classList.add(...[STYLE_CLASS.ROW, STYLE_CLASS.ROW_COLS_1, STYLE_CLASS.G_2, STYLE_CLASS.NEEDS_VALIDATION])

        // get form data
        let formData = form.dataset.formData
        if (formData) {
            formData = JSON.parse(formData)
            delete form.dataset.formData
        } else {
            console.log("data-form-data is not provided")
        }
        console.log("formData = " + formData)

        // add fields to form
        if (formMeta.fields && formMeta.fields.length > 0) {
            formMeta.fields.forEach(field => {
                field.value = formData && formData.hasOwnProperty(field.id) ? formData[field.id] : ""
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

        // Fetch and render entity data if entity and entityUId are provided
        const entityUId = form.dataset.entityUid;
        const getentityResponse = await getfetchEntityData(formMeta.entity, entityUId); 
        renderEntityDataToForm('.shoz-form', getentityResponse.data);

    }
}


async function addField(field, addTo,formMeta) {
    if (field.type === INPUT_TYPE.RADIO) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        // if (field.label) {
        //     const groupLabel = document.createElement(HTML_TAG.LABEL);
        //     groupLabel.textContent = field.label;
        //     groupLabel.classList.add(STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD);
        //     fragment.appendChild(groupLabel);
        // }

        // if (field.options && Array.isArray(field.options)) {
        //     field.options.forEach(opt => {
        //         const div = document.createElement(HTML_TAG.DIV);
        //         div.classList.add(STYLE_CLASS.FORM_CHECK);

        //         const input = document.createElement(HTML_TAG.INPUT);
        //         input.type = INPUT_TYPE.RADIO;
        //         input.id = field.id + "-" + opt.value;
        //         input.name = field.id;
        //         input.value = opt.value;
        //         input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
        //         if (field.value && field.value === opt.value) {
        //             input.checked = true;
        //         }

        //         // Apply Frontend validation to each radio input
        //         // applyFieldValidation(field, input);

        //         const label = document.createElement(HTML_TAG.LABEL);
        //         label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
        //         label.setAttribute(ATTR_CONS.FOR, input.id);
        //         label.textContent = opt.label;

        //         div.append(input,label);
        //         // div.appendChild(label);
        //         fragment.appendChild(div);
        //     });
            
        // }

        if (field.label) {
            fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD]));
        }

        if (Array.isArray(field.options)) {
            field.options.forEach(opt => fragment.appendChild(createOptionInput(field, opt, INPUT_TYPE.RADIO)));
        }
        // ✅ Add helper text below radio group
        createHelperText(field, fragment);


        // ✅ Laravel backend validation error for the radio group
        // if (window.formErrors && window.formErrors[field.id]) {
        //     const errorDiv = document.createElement("div");
        //     errorDiv.classList.add("invalid-feedback", "d-block"); // d-block so it shows for group
        //     errorDiv.id = `${field.id}-error`;
        //     errorDiv.textContent = window.formErrors[field.id][0]; // first error message
        //     fragment.appendChild(errorDiv);

        //     // Optionally mark all radio inputs as invalid
        //     fragment.querySelectorAll(`input[name="${field.id}"]`).forEach(radio => {
        //         radio.classList.add('is-invalid');
        //     });
        // }
        appendBackendError(field, fragment);
    }
    
    
    else if (field.type === INPUT_TYPE.SELECT || field.element === INPUT_TYPE.SELECT) {
        const fragment = createFieldFragment(field, addTo);
        

        // const formFloating = document.createElement(HTML_TAG.DIV);
        // formFloating.classList.add(STYLE_CLASS.FORM_FLOATING);
        // fragment.appendChild(formFloating);

        // const select = document.createElement(HTML_TAG.SELECT);
        // select.id = field.id;
        // select.name = field.id;
        // select.classList.add(STYLE_CLASS.FORM_SELECT);

        // if (field.options && Array.isArray(field.options)) {
        //     field.options.forEach(opt => {
        //         const option = document.createElement(HTML_TAG.OPTION);
        //         option.value = opt.value;
        //         option.textContent = opt.label;
        //         if (field.value && field.value === opt.value) {
        //             option.selected = true;
        //         }
        //         select.appendChild(option);
        //     });
        // }
        // formFloating.appendChild(select);

        // const label = document.createElement(HTML_TAG.LABEL);
        // label.setAttribute(ATTR_CONS.FOR, field.id);
        // label.textContent = field.label;
        // formFloating.appendChild(label);


        // ✅ Label (same as radio & checkbox)
        if (field.label) {
            fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD]));
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
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = window.formErrors[field.id][0]; // first error message
            formFloating.appendChild(errorDiv);
        }

        createHelperText(field, fragment);
    }
    
    
    else if (field.type === INPUT_TYPE.CHECKBOX) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        // if (field.options && Array.isArray(field.options)) {
        //     // ✅ Multiple checkboxes
        //     if (field.label) {
        //         const groupLabel = document.createElement(HTML_TAG.LABEL);
        //         groupLabel.textContent = field.label;
        //         groupLabel.classList.add(STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD);
        //         fragment.appendChild(groupLabel);
        //     }

        //     field.options.forEach(opt => {
        //         const div = document.createElement(HTML_TAG.DIV);
        //         div.classList.add(STYLE_CLASS.FORM_CHECK);

        //         const input = document.createElement(HTML_TAG.INPUT);
        //         input.type = INPUT_TYPE.CHECKBOX;
        //         input.id = field.id + "-" + opt.value;
        //         input.name = field.id + "[]";
        //         input.value = opt.value;
        //         input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
        //         if (field.value && Array.isArray(field.value) && field.value.includes(opt.value)) {
        //             input.checked = true;
        //         }


        //         // Apply Frontend validation to each checkbox input
        //         // applyFieldValidation(field, input);

        //         const label = document.createElement(HTML_TAG.LABEL);
        //         label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
        //         label.setAttribute(ATTR_CONS.FOR, input.id);
        //         label.textContent = opt.text; // ✅ use text instead of label

        //         div.append(input,label);
        //         // div.appendChild(label);
        //         fragment.appendChild(div);
        //     });
        // } else {
        //     // ✅ Single checkbox
        //     const div = document.createElement(HTML_TAG.DIV);
        //     div.classList.add(STYLE_CLASS.FORM_CHECK);

        //     const input = document.createElement(HTML_TAG.INPUT);
        //     input.type = INPUT_TYPE.CHECKBOX;
        //     input.id = field.id;
        //     input.name = field.id;
        //     input.value = 1;
        //     input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
        //     if (field.value && (field.value === true || field.value === 1 || field.value === "1")) {
        //         input.checked = true;
        //     }

        //     // Apply Frontend validation to each checkbox input
        //     // applyFieldValidation(field, input);

        //     const label = document.createElement(HTML_TAG.LABEL);
        //     label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
        //     label.setAttribute(ATTR_CONS.FOR, input.id);
        //     label.textContent = field.label;

        //     div.append(input,label);
        //     // div.appendChild(label);
        //     fragment.appendChild(div);
        // }

        // ✅ Add helper text below checkbox or group
        
        if (Array.isArray(field.options)) {
            if (field.label) {
                fragment.appendChild(createLabel(field.label, null, [STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD]));
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
        formContainer.appendChild(textarea);

        // ✅ ERROR HANDLING: Same for both structures
        if (window.formErrors && window.formErrors[field.id]) {
            textarea.classList.add('is-invalid');
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${field.id}-error`;
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
        input.setAttribute(ATTR_CONS.LIST, `${field.id}${SUFFIX.LIST}`);
        fragment.appendChild(formContainer);

        const datalist = document.createElement(HTML_TAG.DATALIST);
        datalist.id = `${field.id}${SUFFIX.LIST}`;

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
            errorDiv.id = `${field.id}-error`;
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
            fragment.appendChild(valueDiv);
            addTo.appendChild(fragment);
            return;
        }
        
        // // ✅ CONDITIONAL: Create container with appropriate class
        const { formContainer, inputElement: input } = createFormFieldContainer(field, useFloatingLabel);
        input.type = field.type;
        input.value = field.value || "";
        fragment.appendChild(formContainer);

        // // Frontend validation
        applyFieldValidation(field, input);
        // // formContainer.appendChild(input);
       
        
 
        createHelperText(field, fragment);

        // Add info and feedback together
        appendFieldInfoAndFeedback(field, formContainer);
    }




}

// function addField(field, addTo) {
//     if (field.type && !field.label) {
//         const input = document.createElement("input");
//         input.type = field.type;
//         if (field.type === 'file' && field?.accept) {
//             input.accept = field?.accept;
//         }
//         input.id = field.id;
//         input.name = field.id;
//         input.value = field.value || "";
//         input.classList.add("form-control");
//         input.setAttribute("placeholder", field.label);
//         addTo.appendChild(input);
//     } else if (field.type && field.label) {
//         const fragment = document.createElement("div");
//         fragment.id = addTo.id + "-field";
//         // fragment.classList.add();
//         // fragment.classList.add(...[]);
//         // fragment.classList.add('col-md-6');
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         const formFloating = document.createElement("div");
//         formFloating.id = field.id + "-container";
//         formFloating.classList.add(...["form-floating"]);
//         fragment.appendChild(formFloating);

//         const input = document.createElement("input");
//         input.type = field.type;
//         if (field.type === 'file' && field?.accept) {
//             input.accept = field?.accept;
//         }
//         input.id = field.id;
//         input.name = field.id;
//         input.value = field.value || "";
//         input.classList.add("form-control");
//         input.setAttribute("placeholder", field.label);
//         formFloating.appendChild(input);

//         const label = document.createElement("label");
//         label.id = field.id + "-label";
//         label.setAttribute("for", field.id);
//         label.textContent = field.label;
//         formFloating.appendChild(label);

//         if (field.info) {
//             addFieldHelpInfo(field, formFloating);
//         }

//         if (field.feedback) {
//             addFieldFeedback(field.feedback, formFloating);
//         }
//     }
// }


function addFieldSize(field, elementToSize) {
    let sizeClasses = []
    if (field.size) {
        if (typeof field.size === 'number') {
            if (field.size >= 1 && field.size <= 12) {
                sizeClasses.push("col-" + field.size)
            }
        } else if (field.size.constructor.name === 'Object') {
            Object.keys(field.size).forEach((sizeKey) => {
                // console.log(sizeKey);
                if ('xs' === sizeKey) {
                    sizeClasses.push("col-" + field.size[sizeKey])
                } else if ('sm' === sizeKey || 'md' === sizeKey || 'lg' === sizeKey || 'xl' === sizeKey || 'xxl' === sizeKey) {
                    sizeClasses.push("col-" + sizeKey + "-" + field.size[sizeKey])
                } else {

                }
            })
        } else {
            console.log();
            sizeClasses.push("col")
        }
    } else if (field.gridSize) { //Schema has gridSize property
        // if (typeof field.gridSize === 'number' && field.gridSize >= 1 && field.gridSize <= 12) {
        //     sizeClasses.push("col-" + field.gridSize)
        // } else {
        //     sizeClasses.push("col")
        // }

        if (typeof field.gridSize === "number" && field.gridSize >= 1 && field.gridSize <= 12) {
            // ✅ Numeric grid size (e.g. 12)
            sizeClasses.push("col-" + field.gridSize);
        } 
        else if (typeof field.gridSize === "object") {
            // ✅ Responsive grid size (e.g. { sm: 4, xs: 12 })
            Object.keys(field.gridSize).forEach((breakpoint) => {
                const value = field.gridSize[breakpoint];
                if (value >= 1 && value <= 12) {
                    sizeClasses.push(`col-${breakpoint}-${value}`);
                }
            });
        } 
        else {
            // ✅ Fallback if invalid
            sizeClasses.push("col");
        }




    } else {
        console.log();
        sizeClasses.push("col")
    }

    elementToSize.classList.add(...sizeClasses);
}




function createFieldFragment(field, addTo, addClass = null) {
    const fragment = document.createElement(HTML_TAG.DIV);
    fragment.id = addTo.id + SUFFIX.FIELD;
    addFieldSize(field, fragment);
    
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
        const helper = document.createElement(HTML_TAG.DIV);
        helper.classList.add(STYLE_CLASS.FORM_TEXT);
        helper.id = `${field.id}${SUFFIX.HELP}`;
        helper.textContent = field.helpertext || field.helperText;
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
    formContainer.id = `${field.id}${SUFFIX.CONTAINER}`;

    // ✅ Add structure classes
    if (useFloatingLabel) {
        formContainer.classList.add(STYLE_CLASS.FORM_FLOATING, STYLE_CLASS.MB_3);
    } else {
        formContainer.classList.add(STYLE_CLASS.MB_3);
    }
    

    // ✅ Create label (for both structures)
    const label = document.createElement(HTML_TAG.LABEL);
    label.id = `${field.id}${SUFFIX.LABEL}`;
    label.setAttribute(ATTR_CONS.FOR, field.id);
    label.classList.add(STYLE_CLASS.FORM_LABEL);
    label.textContent = field.label;

    // ✅ Create input or textarea
    const inputElement = document.createElement(inputTag);
    inputElement.id = field.id;
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
    input.type = type;
    input.id = field.id + "-" + opt.value;
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
    select.id = field.id;
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

        errorDiv.id = `${field.id}-error`;
        errorDiv.textContent = errorMsg;
        container.appendChild(errorDiv);
    }
}

/**
 * Fetch entity data from Laravel API with Sanctum token
 */
async function getfetchEntityData(entity,entityUId) {
    try {
        const token = getSanctumToken();
        console.log('Using token for API call11111111111111:', token ? token : 'No token');
        const res = await fetch(`/api/entity/${entity}/${entityUId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
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

/**
 * 
 * Render fetched entity data into form fields 
 */
async function renderEntityDataToForm(formSelector, entityResponse) {
    const form = document.querySelector(formSelector);
    const entityData = entityResponse?.[0];

    if (!form || !entityData) return;

    for (const [key, value] of Object.entries(entityData)) {
        const field = form.querySelector(`#${key}`);
        if (field) field.value = value ?? "";
    }
}











