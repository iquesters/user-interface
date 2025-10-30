/**
 * form block builder functions setupFormBlock and addField ,addFieldSize functions
 */

/**
 * 
 * @param {*} formCol 
 * @param {*} formMeta 
*/
function setupFormBlock(formCol, formMeta) {
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
        formIdInput.type = "hidden"
        formIdInput.name = "formId"
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
        // console.log("formData = " + formData)

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

    }
}


function addField(field, addTo,formMeta) {
    if (field.type === INPUT_TYPE.RADIO) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        if (field.label) {
            const groupLabel = document.createElement(HTML_TAG.LABEL);
            groupLabel.textContent = field.label;
            groupLabel.classList.add(STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD);
            fragment.appendChild(groupLabel);
        }

        if (field.options && Array.isArray(field.options)) {
            field.options.forEach(opt => {
                const div = document.createElement(HTML_TAG.DIV);
                div.classList.add(STYLE_CLASS.FORM_CHECK);

                const input = document.createElement(HTML_TAG.INPUT);
                input.type = INPUT_TYPE.RADIO;
                input.id = field.id + "-" + opt.value;
                input.name = field.id;
                input.value = opt.value;
                input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
                if (field.value && field.value === opt.value) {
                    input.checked = true;
                }

                // Apply Frontend validation to each radio input
                applyFieldValidation(field, input);

                const label = document.createElement(HTML_TAG.LABEL);
                label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
                label.setAttribute(ATTR_CONS.FOR, input.id);
                label.textContent = opt.label;

                div.appendChild(input);
                div.appendChild(label);
                fragment.appendChild(div);
            });
            
        }


        // ✅ Add helper text below the group
        if (field.helpertext || field.helperText) {
            const helper = document.createElement(HTML_TAG.DIV);
            helper.classList.add(STYLE_CLASS.FORM_TEXT);
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            fragment.appendChild(helper);
        }


        // ✅ Laravel backend validation error for the radio group
        if (window.formErrors && window.formErrors[field.id]) {
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback", "d-block"); // d-block so it shows for group
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = window.formErrors[field.id][0]; // first error message
            fragment.appendChild(errorDiv);

            // Optionally mark all radio inputs as invalid
            fragment.querySelectorAll(`input[name="${field.id}"]`).forEach(radio => {
                radio.classList.add('is-invalid');
            });
        }
    }
    
    
    else if (field.type === INPUT_TYPE.SELECT || field.element === INPUT_TYPE.SELECT) {
        const fragment = createFieldFragment(field, addTo);
        

        const formFloating = document.createElement(HTML_TAG.DIV);
        formFloating.classList.add(STYLE_CLASS.FORM_FLOATING);
        fragment.appendChild(formFloating);

        const select = document.createElement(HTML_TAG.SELECT);
        select.id = field.id;
        select.name = field.id;
        select.classList.add(STYLE_CLASS.FORM_SELECT);

        if (field.options && Array.isArray(field.options)) {
            field.options.forEach(opt => {
                const option = document.createElement(HTML_TAG.OPTION);
                option.value = opt.value;
                option.textContent = opt.label;
                if (field.value && field.value === opt.value) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
        formFloating.appendChild(select);

        const label = document.createElement(HTML_TAG.LABEL);
        label.setAttribute(ATTR_CONS.FOR, field.id);
        label.textContent = field.label;
        formFloating.appendChild(label);

        // Apply select Frontend validation
        applySelectValidation(field, select);

        // ✅ Laravel backend validation error
        if (window.formErrors && window.formErrors[field.id]) {
            select.classList.add('is-invalid'); // Bootstrap red border
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = window.formErrors[field.id][0]; // first error message
            formFloating.appendChild(errorDiv);
        }

        // ✅ Add helper text below select (outside form-floating)
        if (field.helpertext || field.helperText) {
            const helper = document.createElement("div");
            helper.classList.add("form-text");
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            fragment.appendChild(helper);
        }
    }
    
    
    else if (field.type === INPUT_TYPE.CHECKBOX) {
        const fragment = createFieldFragment(field, addTo, [STYLE_CLASS.COLL_12, STYLE_CLASS.FORM_CHECK_GROUP]);

        if (field.options && Array.isArray(field.options)) {
            // ✅ Multiple checkboxes
            if (field.label) {
                const groupLabel = document.createElement(HTML_TAG.LABEL);
                groupLabel.textContent = field.label;
                groupLabel.classList.add(STYLE_CLASS.FORM_LABEL, STYLE_CLASS.FW_BOLD);
                fragment.appendChild(groupLabel);
            }

            field.options.forEach(opt => {
                const div = document.createElement(HTML_TAG.DIV);
                div.classList.add(STYLE_CLASS.FORM_CHECK);

                const input = document.createElement(HTML_TAG.INPUT);
                input.type = INPUT_TYPE.CHECKBOX;
                input.id = field.id + "-" + opt.value;
                input.name = field.id + "[]";
                input.value = opt.value;
                input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
                if (field.value && Array.isArray(field.value) && field.value.includes(opt.value)) {
                    input.checked = true;
                }


                // Apply Frontend validation to each checkbox input
                applyFieldValidation(field, input);

                const label = document.createElement(HTML_TAG.LABEL);
                label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
                label.setAttribute(ATTR_CONS.FOR, input.id);
                label.textContent = opt.text; // ✅ use text instead of label

                div.appendChild(input);
                div.appendChild(label);
                fragment.appendChild(div);
            });
        } else {
            // ✅ Single checkbox
            const div = document.createElement(HTML_TAG.DIV);
            div.classList.add(STYLE_CLASS.FORM_CHECK);

            const input = document.createElement(HTML_TAG.INPUT);
            input.type = INPUT_TYPE.CHECKBOX;
            input.id = field.id;
            input.name = field.id;
            input.value = 1;
            input.classList.add(STYLE_CLASS.FORM_CHECK_INPUT);
            if (field.value && (field.value === true || field.value === 1 || field.value === "1")) {
                input.checked = true;
            }

            // Apply Frontend validation to each checkbox input
            applyFieldValidation(field, input);

            const label = document.createElement(HTML_TAG.LABEL);
            label.classList.add(STYLE_CLASS.FORM_CHECK_LABEL);
            label.setAttribute(ATTR_CONS.FOR, input.id);
            label.textContent = field.label;

            div.appendChild(input);
            div.appendChild(label);
            fragment.appendChild(div);
        }

        // ✅ Add helper text below checkbox or group
        if (field.helpertext || field.helperText) {
            const helper = document.createElement("div");
            helper.classList.add("form-text");
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            fragment.appendChild(helper);
        }
        
    }

    else if (field.type === INPUT_TYPE.TEXTAREA) {
        const fragment = createFieldFragment(field, addTo);
        

        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel = formMeta.floatinglabel === true;
        
        // ✅ CONDITIONAL: Create container with appropriate class
        const formContainer = document.createElement(HTML_TAG.DIV);
        formContainer.id = field.id + "-container";
        
        if (useFloatingLabel) {
            // Floating label structure
            formContainer.classList.add(STYLE_CLASS.FORM_FLOATING, STYLE_CLASS.MB_3);
        } else {
            // Normal label structure  
            formContainer.classList.add(STYLE_CLASS.MB_3);
        }
        
        fragment.appendChild(formContainer);

        // ✅ CONDITIONAL: Label placement for normal structure
        if (!useFloatingLabel) {
            // Normal structure: Label comes FIRST
            const label = document.createElement("label");
            label.id = field.id + "-label";
            label.setAttribute("for", field.id);
            label.classList.add("form-label");
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

        // ✅ TEXTAREA: Create textarea element
        const textarea = document.createElement(HTML_TAG.TEXTAREA);
        textarea.id = field.id;
        textarea.name = field.id;
        textarea.value = field.value || "";
        textarea.classList.add(STYLE_CLASS.FORM_CONTROL);
        
        // ✅ HEIGHT: Handle rows vs CSS height properly
        if (useFloatingLabel) {
            // For floating labels, use CSS height instead of rows attribute
            if (field.rows) {
                const heightInPx = (field.rows * 24) + 16; // Approximate line height
                textarea.style.height = heightInPx + "px";
            } else {
                textarea.style.height = "100px"; // Default height for floating
            }
            // Floating labels require placeholder for CSS to work
            textarea.setAttribute("placeholder", field.placeholder || field.label);
        } else {
            // For normal labels, rows attribute works fine
            textarea.rows = field.rows || 4; // default to 4 rows if not provided
            if (field.placeholder) {
                textarea.setAttribute("placeholder", field.placeholder);
            }
        }

        // Apply textarea Frontend validation
        applyTextareaValidation(field, textarea);
        formContainer.appendChild(textarea);

        // ✅ CONDITIONAL: Label placement for floating structure
        if (useFloatingLabel) {
            // Floating structure: Label comes AFTER textarea
            const label = document.createElement("label");
            label.id = field.id + "-label";
            label.setAttribute("for", field.id);
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

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
        if (field.helpertext || field.helperText) {
            const helper = document.createElement("div");
            helper.classList.add("form-text");
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            fragment.appendChild(helper);
            // if (useFloatingLabel) {
            //     // For floating labels, helper text goes outside container
            //     fragment.appendChild(helper);
            // } else {
            //     // For normal labels, helper text stays in container
            //     formContainer.appendChild(helper);
            // }
        }

        if (field.info) {
            addFieldHelpInfo(field, formContainer);
        }

        if (field.feedback) {
            addFieldFeedback(field.feedback, formContainer);
        }
    }

    // For Datalist
    else if (field.type === INPUT_TYPE.DATALIST) {
        const fragment = createFieldFragment(field, addTo);
        

        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel = formMeta.floatinglabel === true;
        
        // ✅ CONDITIONAL: Create container with appropriate class
        const formContainer = document.createElement(HTML_TAG.DIV);
        formContainer.id = field.id + "-container";
        
        if (useFloatingLabel) {
            // Floating label structure
            formContainer.classList.add(STYLE_CLASS.FORM_FLOATING, STYLE_CLASS.MB_3);
        } else {
            // Normal label structure  
            formContainer.classList.add(STYLE_CLASS.MB_3);
        }
        
        fragment.appendChild(formContainer);

        // ✅ CONDITIONAL: Label placement for normal structure
        if (!useFloatingLabel) {
            // Normal structure: Label comes FIRST
            const label = document.createElement("label");
            label.id = field.id + "-label";
            label.setAttribute("for", field.id);
            label.classList.add("form-label");
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

        // ✅ INPUT: Create input with list attribute
        const input = document.createElement(HTML_TAG.INPUT);
        input.id = field.id;
        input.name = field.id;
        input.type = INPUT_TYPE.TEXT;
        input.classList.add(STYLE_CLASS.FORM_CONTROL);
        input.setAttribute(ATTR_CONS.LIST, field.id + "-list"); // link to datalist
        
        // ✅ CONDITIONAL: Placeholder handling
        if (useFloatingLabel) {
            // Floating labels require placeholder for CSS to work
            input.setAttribute("placeholder", field.placeholder || field.label);
        } else if (field.placeholder) {
            // Normal labels can optionally have placeholder
            input.setAttribute("placeholder", field.placeholder);
        }

        formContainer.appendChild(input);

        // ✅ CREATE DATALIST: Same for both structures
        const datalist = document.createElement(HTML_TAG.DATALIST);
        datalist.id = field.id + "-list";

        if (field.options && Array.isArray(field.options)) {
            field.options.forEach(opt => {
                const option = document.createElement(HTML_TAG.OPTION);
                option.value = opt;
                datalist.appendChild(option);
            });
        }

        formContainer.appendChild(datalist);

        // ✅ VALIDATION: Apply datalist validation
        if (typeof applyDatalistValidation === "function") {
            applyDatalistValidation(field, input, datalist);
        }

        // ✅ CONDITIONAL: Label placement for floating structure
        if (useFloatingLabel) {
            // Floating structure: Label comes AFTER input and datalist
            const label = document.createElement("label");
            label.id = field.id + "-label";
            label.setAttribute("for", field.id);
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

        // ✅ ERROR HANDLING: Same for both structures
        if (window.formErrors && window.formErrors[field.id]) {
            input.classList.add('is-invalid');
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = window.formErrors[field.id][0];
            formContainer.appendChild(errorDiv);
        }

        // ✅ HELPER TEXT: Same for both structures
        if (field.helpertext || field.helperText) {
            const helper = document.createElement("div");
            helper.classList.add("form-text");
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            fragment.appendChild(helper);
            // if (useFloatingLabel) {
            //     // For floating labels, helper text goes outside container
            //     fragment.appendChild(helper);
            // } else {
            //     // For normal labels, helper text stays in container
            //     formContainer.appendChild(helper);
            // }
        }

        if (field.info) {
            addFieldHelpInfo(field, formContainer);
        }

        if (field.feedback) {
            addFieldFeedback(field.feedback, formContainer);
        }
    }



    else if (field.type === INPUT_TYPE.TEXT && field.options && Array.isArray(field.options)) {
        const fragment = createFieldFragment(field, addTo);
        fragment.style.position = "relative";
        

        // Input
        const input = document.createElement(HTML_TAG.INPUT);
        input.type = INPUT_TYPE.TEXT;
        input.name = field.id;
        input.value = field.value || "";
        input.placeholder = field.placeholder || field.label;
        input.classList.add(STYLE_CLASS.FORM_CONTROL);
        fragment.appendChild(input);

        //Frontend Validation
        applyFieldValidation(field, input);



        // ✅ Laravel backend validation error
        if (window.formErrors && window.formErrors[field.id]) {
            input.classList.add('is-invalid');
            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.id = `${field.id}-error`;
            errorDiv.textContent = window.formErrors[field.id][0]; // first error message
            fragment.appendChild(errorDiv);
        }

        // Dropdown menu
        const menu = document.createElement("div");
        menu.style.display = "block";
        menu.style.position = "absolute";
        menu.style.top = "100%";
        menu.style.left = "0";
        menu.style.width = "100%";
        menu.style.maxHeight = "0";
        menu.style.overflow = "hidden";
        menu.style.opacity = "0";
        menu.style.transition = "all 0.2s ease"; // ✅ smooth transition
        menu.style.background = "#fff";
        menu.style.border = "1px solid #ccc";
        menu.style.zIndex = "1000";
        fragment.appendChild(menu);

        // Populate
        field.options.forEach(opt => {
            const item = document.createElement("div");
            item.textContent = opt.label;
            item.style.padding = "6px 10px";
            item.style.cursor = "pointer";
            item.addEventListener("mouseover", () => item.style.background = "#f0f0f0");
            item.addEventListener("mouseout", () => item.style.background = "#fff");
            item.addEventListener("click", () => {
                input.value = opt.label;
                input.dataset.value = opt.value;
                closeMenu();
                input.reportValidity();
            });
            menu.appendChild(item);
        });

        // Open/close functions
        function openMenu() {
            menu.style.maxHeight = "500px"; // expands smoothly
            menu.style.opacity = "1";
        }

        function closeMenu() {
            menu.style.maxHeight = "0";
            menu.style.opacity = "0";
        }

        // Toggle on input click
        input.addEventListener("click", () => {
            if (menu.style.maxHeight === "0px" || menu.style.opacity === "0") {
                openMenu();
            } else {
                closeMenu();
            }
        });

        // Filter items
        input.addEventListener("input", () => {
            const filter = input.value.toLowerCase();
            Array.from(menu.children).forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(filter) ? "block" : "none";
            });
            openMenu();
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!fragment.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // For all other input types (text, email, password, number, date, file, etc.)
    else if (field.type && field.label) {
        const fragment = createFieldFragment(field, addTo);

        // console.log("field",formMeta);
        // ✅ CHECK: Use floatinglabel from form schema to determine layout
        const useFloatingLabel =  formMeta.floatinglabel === true;
        
        // ✅ CONDITIONAL: Create container with appropriate class
        const formContainer = document.createElement(HTML_TAG.DIV);
        formContainer.id = field.id + "-container";
        
        if (useFloatingLabel) {
            // Floating label structure
            formContainer.classList.add("form-floating", "mb-3");
        } else {
            // Normal label structure  
            formContainer.classList.add("mb-3");
        }
        
        fragment.appendChild(formContainer);

        // ✅ CONDITIONAL: Label placement based on floating label setting
        if (!useFloatingLabel) {
            // Normal structure: Label comes FIRST
            const label = document.createElement(HTML_TAG.LABEL);
            label.id = field.id + "-label";
            label.setAttribute(ATTR_CONS.FOR, field.id);
            label.classList.add(STYLE_CLASS.FORM_LABEL);
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

        // ✅ INPUT: Always create input element
        const input = document.createElement(HTML_TAG.INPUT);
        input.type = field.type;
        if (field.type === INPUT_TYPE.FILE && field?.accept) {
            input.accept = field?.accept;
        }
        input.id = field.id;
        input.name = field.id;
        input.value = field.value || "";
        input.classList.add(STYLE_CLASS.FORM_CONTROL);

        // ✅ Date & Time restrictions
        if ([
            INPUT_TYPE.DATE,
            INPUT_TYPE.DATETIME_LOCAL,
            INPUT_TYPE.MONTH,
            INPUT_TYPE.WEEK,
            INPUT_TYPE.TIME
        ].includes(field.type)) {
            const now = new Date();

            // Helper formats
            const todayDate = now.toISOString().split("T")[0];              // YYYY-MM-DD
            const nowDateTime = now.toISOString().slice(0, 16);             // YYYY-MM-DDTHH:MM
            const currentMonth = now.toISOString().slice(0, 7);             // YYYY-MM
            const currentTime = now.toISOString().slice(11, 16);            // HH:MM

            // Compute current ISO week (e.g., 2025-W42)
            const year = now.getFullYear();
            const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
            const currentWeek = `${year}-W${week.toString().padStart(2, "0")}`;

            // ✅ Disable future / past logic
            if (field.disableFuture === true) {
                switch (field.type) {
                    case INPUT_TYPE.DATE:
                        input.setAttribute(ATTR_CONS.MAX, todayDate);
                        break;
                    case INPUT_TYPE.DATETIME_LOCAL:
                        input.setAttribute(ATTR_CONS.MAX, nowDateTime);
                        break;
                    case INPUT_TYPE.MONTH:
                        input.setAttribute(ATTR_CONS.MAX, currentMonth);
                        break;
                    case INPUT_TYPE.WEEK:
                        input.setAttribute(ATTR_CONS.MAX, currentWeek);
                        break;
                    case INPUT_TYPE.TIME:
                        input.setAttribute(ATTR_CONS.MAX, currentTime);
                        break;
                }
            } else if (field.disablePast === true) {
                switch (field.type) {
                    case INPUT_TYPE.DATE:
                        input.setAttribute(ATTR_CONS.MIN, todayDate);
                        break;
                    case INPUT_TYPE.DATETIME_LOCAL:
                        input.setAttribute(ATTR_CONS.MIN, nowDateTime);
                        break;
                    case INPUT_TYPE.MONTH:
                        input.setAttribute(ATTR_CONS.MIN, currentMonth);
                        break;
                    case INPUT_TYPE.WEEK:
                        input.setAttribute(ATTR_CONS.MIN, currentWeek);
                        break;
                    case INPUT_TYPE.TIME:
                        input.setAttribute(ATTR_CONS.MIN, currentTime);
                        break;
                }
            }

            // ✅ Prevent end date/time < start date/time
            if (field.id === "endDate" || field.id === "end_time" || field.name === "end_date") {
                const startInput =
                    document.getElementById("startDate") ||
                    document.getElementById("start_time") ||
                    document.querySelector("[name='start_date']");
                if (startInput) {
                    // Set dynamic min value
                    startInput.addEventListener("change", () => {
                        input.setAttribute("min", startInput.value);
                    });
                }
            }
        }

        
        // ✅ CONDITIONAL: Placeholder handling
        if (useFloatingLabel) {
            // Floating labels require placeholder for CSS to work
            input.setAttribute("placeholder", field.placeholder || field.label);
        } else if (field.placeholder) {
            // Normal labels can optionally have placeholder
            input.setAttribute("placeholder", field.placeholder);
        }

        // Frontend validation
        applyFieldValidation(field, input);
        formContainer.appendChild(input);
       
        // ✅ Handle dependencies.hide (e.g., hide endDate when isCurrent checked)
        if (field.dependencies && field.dependencies.hide) {
            // Delay until DOM is ready (so dependent field exists)
            setTimeout(() => {
                field.dependencies.hide.forEach(dep => {
                    const depInput = document.getElementById(dep.id);
                    if (depInput) {
                        const checkHideCondition = () => {
                            const depValue = depInput.type === INPUT_TYPE.CHECKBOX ? depInput.checked : depInput.value;
                            const shouldHide =
                                dep.operator === "===" ? depValue === dep.value :
                                dep.operator === "!==" ? depValue !== dep.value :
                                false;

                            const container = document.getElementById(field.id + "-container");
                            if (container) {
                                container.style.display = shouldHide ? "none" : "";
                            }

                            // optional: clear value when hidden
                            if (shouldHide) input.value = "";
                        };

                        // Initial check + bind listener
                        checkHideCondition();
                        depInput.addEventListener("change", checkHideCondition);
                    }
                });
            }, 0);
        }



        // ✅ CONDITIONAL: Label placement for floating labels
        if (useFloatingLabel) {
            // Floating structure: Label comes AFTER input
            const label = document.createElement("label");
            label.id = field.id + "-label";
            label.setAttribute("for", field.id);
            label.textContent = field.label;
            formContainer.appendChild(label);
        }

        // ✅ ERROR HANDLING: Same for both structures
        // if (window.formErrors && window.formErrors[field.id]) {
        //     input.classList.add('is-invalid');

        //     const errorDiv = document.createElement("div");
        //     errorDiv.classList.add("invalid-feedback");
        //     errorDiv.id = `${field.id}-error`;
        //     errorDiv.textContent = window.formErrors[field.id][0];
        //     formContainer.appendChild(errorDiv);
        // }

        // ✅ HELPER TEXT: Same for both structures
        if (field.helpertext || field.helperText) {
            const helper = document.createElement("div");
            helper.classList.add("form-text");
            helper.id = `${field.id}-help`;
            helper.textContent = field.helpertext || field.helperText;
            formContainer.appendChild(helper);
        }

        if (field.info) {
            addFieldHelpInfo(field, formContainer);
        }

        if (field.feedback) {
            addFieldFeedback(field.feedback, formContainer);
        }
    }




}


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
    const fragment = document.createElement("div");
    fragment.id = addTo.id + "-field";
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


