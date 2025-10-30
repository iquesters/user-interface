//Constants regarding shoz-form
const DEFAULT_PLACEHOLDER_COLOR = 'bg-secondary'

//Constants regarding shoz-form-element
//const FORM_GROUP_CONTAINER = "<div class=\"form-group has-feedback\"></div>"
// const FORM_GROUP_CONTAINER = "<div class=\"form-group\"></div>"
const FORM_GROUP_CONTAINER = "<div class=\"form-floating\"></div>"
const INPUT_GROUP_CONTAINER = "<div class=\"input-group\"></div>"

const TYPE_PASSWORD = "password"

const DATA_TYPE_DATETIME = "datetime"

const DTP_FORMAT_YEAR = "YYYY"
const DTP_FORMAT_MONTH = "MMM, YYYY"
const DTP_FORMAT_DATE = "MMM DD, YYYY"
const DTP_FORMAT_TIME = "HH:mm:ss"
const DTP_FORMAT_DATE_TIME = DTP_FORMAT_DATE + " " + DTP_FORMAT_TIME

/* datetime is default */
const DTP_VIEW_MODE_DATE_TIME = "datetime"
const DTP_VIEW_MODE_YEARS = "years"
const DTP_VIEW_MODE_MONTHS = "months"
const DTP_VIEW_MODE_DATE = "date"
const DTP_VIEW_MODE_TIME = "time"

let dtpOption

async function setupForm(formElement) {
    console.log("setuping shoz-form...")
    console.log("formId = " + formElement.id)

    // let formMeta = formElement.dataset.formMeta

    // let form = document.getElementById("mdm-create");
    // let formData = JSON.parse(form.dataset.formData);
    // console.log("formData>>>>>",formData);

    // // let formMeta = formData.parent.schema;
    // if (formMeta) {
    //     formMeta = JSON.parse(formMeta)
    //     delete formElement.dataset.formMeta
    // } else {
    //     formMeta = await getFormSchema(formElement.id)
    // }

    let formMeta = formElement.dataset.formMeta
    if (formMeta) {
        formMeta = JSON.parse(formMeta)
        delete formElement.dataset.formMeta
    } else {
        formMeta = await getFormSchema(formElement.id)
    }

    console.log("formMeta>>>>>>>>>>>", formMeta)
    if (!formMeta) {
        // break the code
        return;
    }
    formMeta.id = formElement.id

    const cardProvider = new CardProvider(formMeta.placeholder);
    formElement.before(cardProvider.getCard());

    if (formMeta.header || formMeta.heading) {
        const cardHeader = cardProvider.getCardHeader();
        setupFormHeader(cardHeader, formMeta);
    }

    if (formMeta.fields || formMeta.actions) {
        if (formMeta.fields) {
            const cardBody = cardProvider.getCardBody();
            setupFormBody(cardBody, formMeta);
        }
        if (formMeta.actions) {
            const cardFooter = cardProvider.getCardFooter();
            setupFormFooter(cardFooter, formMeta);
        }
    }

    if (formMeta.submitButtonLabel || formMeta.allowCancel) {
        // create a container for buttons
        const btnContainer = document.createElement("div");
        btnContainer.classList.add("d-flex", "gap-2"); // Bootstrap flex + spacing


        // Cancel button
        if (formMeta.allowCancel) {
            console.log("Adding cancel button with label:", formMeta.allowCancel);
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.textContent = "Cancel";
            cancelBtn.classList.add("btn", "btn-secondary");
            btnContainer.classList.add("justify-content-end");
            btnContainer.appendChild(cancelBtn);
            
        }

        // Submit button
        if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
            console.log("Adding submit button with label:", formMeta.submitButtonLabel);
            const submitBtn = document.createElement("button");
            submitBtn.type = "submit";
            submitBtn.textContent = formMeta.submitButtonLabel || "Submit";
            submitBtn.classList.add("btn", "btn-primary");
            btnContainer.classList.add("justify-content-end");
            btnContainer.appendChild(submitBtn);
            
        }

        

        // append container to the form
        formElement.appendChild(btnContainer);
    }

    if (formMeta.cardElevation) {
        console.log("Applying card elevation styles");
        formElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        formElement.style.borderRadius = "8px";
        formElement.style.padding = "1rem";
        formElement.style.backgroundColor = "#fff";
        formElement.style.transition = "box-shadow 0.3s ease";

        formElement.addEventListener("mouseover", () => {
            formElement.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";
        });
        formElement.addEventListener("mouseout", () => {
            formElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        });
    }

    
    // if (formMeta.skeletonRender) {
    //     console.log("Applying skeleton render styles", formMeta.skeletonRender);

    //     // ✅ Add skeleton CSS styles dynamically (only once)
    //     if (!document.getElementById("skeleton-style")) {
    //         const style = document.createElement("style");
    //         style.id = "skeleton-style";
    //         style.textContent = `
    //             .skeleton-container {
    //                 display: flex;
    //                 flex-direction: column;
    //                 gap: 0.75rem;
    //                 margin: 1rem 0;
    //             }
    //             .skeleton-line {
    //                 height: 14px;
    //                 width: 100%;
    //                 border-radius: 6px;
    //                 background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
    //                 background-size: 200% 100%;
    //                 animation: shimmer 1.5s infinite;
    //             }
    //             @keyframes shimmer {
    //                 0% { background-position: -200% 0; }
    //                 100% { background-position: 200% 0; }
    //             }
    //         `;
    //         document.head.appendChild(style);
    //     }else{
    //         console.log("Skeleton styles already applied");
    //     }

    //     // ✅ Create skeleton container
    //     const skeletonContainer = document.createElement("div");
    //     skeletonContainer.classList.add("skeleton-container");

    //     // ✅ Example skeleton lines (you can adjust count or add custom logic)
    //     for (let i = 0; i < 5; i++) {
    //         const skeletonLine = document.createElement("div");
    //         skeletonLine.classList.add("skeleton-line");
    //         skeletonContainer.appendChild(skeletonLine);
    //     }

    //     // ✅ Insert skeleton before actual form
    //     formElement.before(skeletonContainer);

    //     // ✅ Temporarily hide the real form until data is ready
    //     formElement.style.display = "none";

    //     // ✅ Simulate async delay or actual data loading
    //     setTimeout(() => {
    //         skeletonContainer.remove();
    //         formElement.style.display = "block";
    //         console.log("Skeleton render complete, form displayed");
    //     }, formMeta.skeletonRenderDelay || 2000); // default delay = 2s
    // }
    if (formMeta.skeletonRender) {
        console.log("Applying skeleton render styles", formMeta.skeletonRender);

        // ✅ Inject skeleton styles dynamically (only once)
        if (!document.getElementById("skeleton-style")) {
            const style = document.createElement("style");
            style.id = "skeleton-style";
            style.textContent = `
                .skeleton-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 1.2rem;
                    padding: 1rem;
                    border-radius: 8px;
                    background: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .skeleton-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem; /* 👈 gap between label and input */
                }
                .skeleton-label {
                    height: 12px;
                    width: 30%;
                    border-radius: 4px;
                    background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                .skeleton-input {
                    height: 38px;
                    width: 100%;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                .skeleton-button {
                    height: 40px;
                    width: 120px;
                    border-radius: 6px;
                    background: linear-gradient(90deg, #e0e0e0 25%, #d5d5d5 50%, #e0e0e0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    margin-top: 0.5rem;
                }
                .skeleton-btn-container {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.6rem;
                    margin-top: 0.5rem;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // ✅ Create skeleton container
        const skeletonWrapper = document.createElement("div");
        skeletonWrapper.classList.add("skeleton-wrapper");

        // ✅ Create skeleton items dynamically based on fields
        if (formMeta.fields && Array.isArray(formMeta.fields)) {
            formMeta.fields.forEach(field => {
                const fieldGroup = document.createElement("div");
                fieldGroup.classList.add("skeleton-field-group");

                // Label placeholder
                const labelSkeleton = document.createElement("div");
                labelSkeleton.classList.add("skeleton-label");
                fieldGroup.appendChild(labelSkeleton);

                // Input placeholder
                const inputSkeleton = document.createElement("div");
                inputSkeleton.classList.add("skeleton-input");
                fieldGroup.appendChild(inputSkeleton);

                skeletonWrapper.appendChild(fieldGroup);
            });
        }

        // ✅ Add skeleton buttons if needed
        if (formMeta.submitButtonLabel || formMeta.allowCancel) {
            const btnContainer = document.createElement("div");
            btnContainer.classList.add("skeleton-btn-container");

            if (formMeta.allowCancel) {
                const cancelBtnSkeleton = document.createElement("div");
                cancelBtnSkeleton.classList.add("skeleton-button");
                btnContainer.appendChild(cancelBtnSkeleton);
            }

            if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
                const submitBtnSkeleton = document.createElement("div");
                submitBtnSkeleton.classList.add("skeleton-button");
                btnContainer.appendChild(submitBtnSkeleton);
            }

            skeletonWrapper.appendChild(btnContainer);
        }

        // ✅ Insert skeleton before the real form
        formElement.before(skeletonWrapper);

        // ✅ Hide real form initially
        formElement.style.display = "none";

        // ✅ Replace skeleton with real form after delay
        setTimeout(() => {
            skeletonWrapper.remove();
            formElement.style.display = "block";
            console.log("Skeleton render complete, real form displayed");
        }, formMeta.skeletonRenderDelay || 2500);
    }




    // run prepare hook func if present
    if (formMeta?.prepareHookFunc) {
        window[formMeta?.prepareHookFunc](formElement?.id);
    }

    // removing placeholder
    cardProvider.getCard().classList.remove(...['placeholder-glow', 'placeholder-wave']);
}

/**
 * 
 * @param {*} cardHeader 
 * @param {*} formMeta 
 */
function setupFormHeader(cardHeader, formMeta) {

    const fragment = document.createElement('div');
    fragment.id = cardHeader.id + "-item"
    fragment.classList.add(...['d-flex', 'align-items-center', 'justify-content-between', 'gap-2']);
    if (formMeta.placeholder) {
        fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardHeader.appendChild(fragment)

    const headingDiv = document.createElement('div')
    headingDiv.classList.add(...['d-flex', 'align-items-center', 'gap-2'])

    // adding icon
    if(formMeta.header && formMeta.header.icon){
        const headingIcon = document.createElement('i')
        headingIcon.classList.add(...["fa-fw"])
        headingIcon.className += (" " + formMeta.header.icon)
        headingDiv.appendChild(headingIcon)
    }
    // adding text
    const headingText = document.createElement('h5')
    headingText.id = `form-heading-text-${formMeta.id}`;
    headingText.classList.add(...["mb-0", "mt-1"]);
    headingText.textContent = (formMeta.header && formMeta.header.text) || formMeta.heading;
    headingDiv.appendChild(headingText)

    fragment.appendChild(headingDiv)

    // adding header actions
    if (formMeta.header && formMeta.header.actions) {
        const headingActionDiv = document.createElement('div')
        headingActionDiv.classList.add(...['d-flex', 'align-items-center', 'gap-2'])

        formMeta.header.actions.forEach(action => {
            addAction(action, headingActionDiv);
        })

        fragment.appendChild(headingActionDiv)
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
    fragment.classList.add(...['row', 'row-cols-1', 'g-2']);
    // if (formMeta.placeholder) {
    //     fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
    // }
    cardBody.appendChild(fragment)

    const infoCol = document.createElement('div');
    infoCol.classList.add(...['col']);
    fragment.appendChild(infoCol)

    if (formMeta.info) {
        setupInfoBlock(infoCol, formMeta);
    }

    const formCol = document.createElement('div');
    formCol.classList.add(...['col']);
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
function setupFormFooter(cardFooter, formMeta) {

    const fragment = document.createElement('div');
    fragment.id = cardFooter.id + "-item"
    fragment.classList.add(...['d-flex', 'align-items-center', 'justify-content-end', 'gap-2']);
    if (formMeta.placeholder) {
        fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardFooter.appendChild(fragment)

    if (formMeta.actions) {
        formMeta.actions.forEach(action => {
            action.form = formMeta.id
            // addAction(action, fragment);
            const form = document.getElementById(formMeta.id);
            addAction(action, form);
        })
    }

    // removing placeholder
    fragment.classList.remove(...['placeholder', 'bg-secondary']);
}

const SUPPORTED_ACTION_ELEMENT_TYPES = ['a', 'button']
const DEFAULT_ACTION_ELEMENT_TYPE = 'a'

const SUPPORTED_ACTION_ELEMENT_SIZES = ['sm', 'lg']
const DEFAULT_ACTION_ELEMENT_SIZE = 'sm'

const SUPPORTED_ACTION_ELEMENT_COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
const DEFAULT_ACTION_ELEMENT_COLOR = 'secondary'

const SUPPORTED_ACTION_ELEMENT_VARIANTS = ['outline', 'link']
const DEFAULT_ACTION_ELEMENT_VARIANT = 'outline'

function addAction(action, addTo) {
    if (action.route && (action.icon || action.text)) {
        // if action.element is provided it is good to go else defaulting element to []
        action.element = action.element ? action.element : []

        // if action.element.type is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_TYPE
        action.element.type =
            (action.element.type && SUPPORTED_ACTION_ELEMENT_TYPES.includes(action.element.type)) ?
                action.element.type : DEFAULT_ACTION_ELEMENT_TYPE

        // if action.element.size is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_SIZE
        action.element.size =
            (action.element.size && SUPPORTED_ACTION_ELEMENT_SIZES.includes(action.element.size)) ?
                action.element.size : DEFAULT_ACTION_ELEMENT_SIZE

        // if action.element.color is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_COLOR
        action.element.color =
            (action.element.color && SUPPORTED_ACTION_ELEMENT_COLORS.includes(action.element.color)) ?
                action.element.color : DEFAULT_ACTION_ELEMENT_COLOR

        // if action.element.variant is provided and valid it is good to go
        //  else defaulting element type to DEFAULT_ACTION_ELEMENT_VARIANT
        action.element.variant =
            (action.element.variant && SUPPORTED_ACTION_ELEMENT_VARIANTS.includes(action.element.variant)) ?
                action.element.variant : DEFAULT_ACTION_ELEMENT_VARIANT




        let actionElement;

        // ✅ CHANGE HERE: If action.type is "submit", create input instead of button
        if (action.element.type === "button" && action.type === "submit") {
            actionElement = document.createElement("input");
            actionElement.type = "submit"; // native submit
            actionElement.value = action.text ?? "Submit"; // text goes into value


            // actionElement.addEventListener("click", (e) => {
            //     console.log("Submit button clicked for form:");
            // });


        } else {
            actionElement = document.createElement(action.element.type);
        }
        




        // creating action element
        // const actionElement = document.createElement(action.element.type)
        actionElement.classList.add(...['d-flex', 'align-items-center', 'gap-2'])
        actionElement.classList.add('btn')
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

        if (action.icon) {
            const actionElementIcon = document.createElement('i')
            actionElementIcon.classList.add(...["fa-fw"])
            actionElementIcon.className += (" " + action.icon)
            actionElement.appendChild(actionElementIcon)
        }

        if (action.text) {
            const actionElementText = document.createTextNode(action.text)
            actionElement.appendChild(actionElementText)
        } else {
            if (!action.icon) {
                // adding default text
                const actionElementText = document.createTextNode(action.element.type)
                actionElement.appendChild(actionElementText)
            }
        }

        addTo.appendChild(actionElement)
    }
}

/**
 * 
 * @param {*} infoCol 
 * @param {*} formMeta 
 */
function setupInfoBlock(infoCol, formMeta) {
    if (formMeta.info) {
        const fragment = document.createElement('div')
        fragment.id = infoCol.id + "-item"
        fragment.classList.add(...['info-block', 'bg-light-subtle', 'text-light-emphasis', 'rounded', 'p-2', 'mb-2']);
        if (formMeta.placeholder) {
            fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
        }
        infoCol.appendChild(fragment)

        const para = document.createElement('p')
        para.classList.add('card-text');
        fragment.appendChild(para)

        if (formMeta.info.icon) {
            const infoBlockIcon = document.createElement('i')
            infoBlockIcon.classList.add(...["fa-fw"])
            infoBlockIcon.className += (" " + formMeta.info.icon)
            infoBlockIcon.classList.add('pe-1')
            para.appendChild(infoBlockIcon)
        }

        const infoBlockHTML = document.createElement('span')
        infoBlockHTML.id = `form-info-block-${formMeta.id}`;
        infoBlockHTML.classList.add("form-info-block")
        infoBlockHTML.innerHTML = formMeta.info.innerHTML

        para.appendChild(infoBlockHTML)

        // removing placeholder
        fragment.classList.remove(...['placeholder', 'bg-secondary']);

    }
}


/**
 * 
 * @param {*} formCol 
 * @param {*} formMeta 
*/
// function setupFormBlock(formCol, formMeta) {
//     if (formMeta.fields) {
//         const fragment = document.createElement('div')
//         fragment.id = formCol.id + "-item"
//         fragment.classList.add('form-block');
//         // if (formMeta.placeholder) {
//         //     fragment.classList.add(...['placeholder', formMeta.placeholder.color || DEFAULT_PLACEHOLDER_COLOR]);
//         // }
//         formCol.appendChild(fragment)

//         const form = document.getElementById(formMeta.id)
//         wrapElement(form, fragment)

//         // add csrf hidden field
//         // const csrfToken = document.querySelector('meta[name="csrf-token"]').content
//         // const csrfInput = document.createElement('input')
//         // csrfInput.type = "hidden"
//         // csrfInput.name = "_token"
//         // csrfInput.value = csrfToken
//         // csrfInput.setAttribute('autocomplete', "off")
//         // form.appendChild(csrfInput)

//         // add formId hidden field
//         const formIdInput = document.createElement('input')
//         formIdInput.type = "hidden"
//         formIdInput.name = "formId"
//         formIdInput.value = formMeta.id
//         formIdInput.setAttribute('autocomplete', "off")
//         form.appendChild(formIdInput)

//         form.setAttribute('method', formMeta.method)
//         // form.setAttribute('action', formMeta.action)
//         form.setAttribute('enctype', formMeta.enctype)
//         // form.classList.add(...['row', 'row-cols-1', 'row-cols-md-4', 'g-2', 'needs-validation'])
//         form.classList.add(...['row', 'row-cols-1', 'g-2', 'needs-validation'])

//         // get form data
//         let formData = form.dataset.formData
//         if (formData) {
//             formData = JSON.parse(formData)
//             delete form.dataset.formData
//         } else {
//             console.log("data-form-data is not provided")
//         }
//         // console.log("formData = " + formData)

//         // formMeta.fields.forEach(field => {
//         //     // console.log(field);
//         //     field.value = formData && formData.hasOwnProperty(field.id) ? formData[field.id] : ""
//         //     // console.log(field);
//         //     addField(field, form,formMeta);
//         // })


//         if (formMeta.fields && formMeta.fields.length > 0) {
//             formMeta.fields.forEach(field => {
//                 field.value = formData && formData.hasOwnProperty(field.id) ? formData[field.id] : ""
//                 addField(field, form, formMeta);
//             });
//         } else {
//             if (APP_ENV === 'dev') {
//                 const errorMessageContainer = document.getElementById("form-error-message");
//                 console.warn("No fields defined in formMeta for form:", formMeta.id);
//                 errorMessageContainer.classList.add('alert', 'alert-warning');
//                 errorMessageContainer.textContent = `⚠️ No fields defined in form: ${formMeta.id}`;
//             }
//         }

//     }
// }




// function addField(field, addTo,formMeta) {
//     if (field.type === 'radio') {
//         const fragment = document.createElement("div");
//         fragment.classList.add("col-12", "form-check-group");
//         addTo.appendChild(fragment);

//         if (field.label) {
//             const groupLabel = document.createElement("label");
//             groupLabel.textContent = field.label;
//             groupLabel.classList.add("form-label", "fw-bold");
//             fragment.appendChild(groupLabel);
//         }

//         if (field.options && Array.isArray(field.options)) {
//             field.options.forEach(opt => {
//                 const div = document.createElement("div");
//                 div.classList.add("form-check");

//                 const input = document.createElement("input");
//                 input.type = "radio";
//                 input.id = field.id + "-" + opt.value;
//                 input.name = field.id;
//                 input.value = opt.value;
//                 input.classList.add("form-check-input");
//                 if (field.value && field.value === opt.value) {
//                     input.checked = true;
//                 }

//                 // Apply Frontend validation to each radio input
//                 applyFieldValidation(field, input);

//                 const label = document.createElement("label");
//                 label.classList.add("form-check-label");
//                 label.setAttribute("for", input.id);
//                 label.textContent = opt.label;

//                 div.appendChild(input);
//                 div.appendChild(label);
//                 fragment.appendChild(div);
//             });
            
//         }


//         // ✅ Add helper text below the group
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
//             fragment.appendChild(helper);
//         }


//         // ✅ Laravel backend validation error for the radio group
//         if (window.formErrors && window.formErrors[field.id]) {
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("invalid-feedback", "d-block"); // d-block so it shows for group
//             errorDiv.id = `${field.id}-error`;
//             errorDiv.textContent = window.formErrors[field.id][0]; // first error message
//             fragment.appendChild(errorDiv);

//             // Optionally mark all radio inputs as invalid
//             fragment.querySelectorAll(`input[name="${field.id}"]`).forEach(radio => {
//                 radio.classList.add('is-invalid');
//             });
//         }
//     }
    
    
//     else if (field.type === 'select' || field.element === 'select') {
//         const fragment = document.createElement("div");
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         const formFloating = document.createElement("div");
//         formFloating.classList.add("form-floating");
//         fragment.appendChild(formFloating);

//         const select = document.createElement("select");
//         select.id = field.id;
//         select.name = field.id;
//         select.classList.add("form-select");

//         if (field.options && Array.isArray(field.options)) {
//             field.options.forEach(opt => {
//                 const option = document.createElement("option");
//                 option.value = opt.value;
//                 option.textContent = opt.label;
//                 if (field.value && field.value === opt.value) {
//                     option.selected = true;
//                 }
//                 select.appendChild(option);
//             });
//         }
//         formFloating.appendChild(select);

//         const label = document.createElement("label");
//         label.setAttribute("for", field.id);
//         label.textContent = field.label;
//         formFloating.appendChild(label);

//         // Apply select Frontend validation
//         applySelectValidation(field, select);

//         // ✅ Laravel backend validation error
//         if (window.formErrors && window.formErrors[field.id]) {
//             select.classList.add('is-invalid'); // Bootstrap red border
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("invalid-feedback");
//             errorDiv.id = `${field.id}-error`;
//             errorDiv.textContent = window.formErrors[field.id][0]; // first error message
//             formFloating.appendChild(errorDiv);
//         }

//         // ✅ Add helper text below select (outside form-floating)
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
//             fragment.appendChild(helper);
//         }
//     }
    
    
//     else if (field.type === 'checkbox') {
//         const fragment = document.createElement("div");
//         fragment.classList.add("col-12", "form-check-group");
//         addTo.appendChild(fragment);

//         if (field.options && Array.isArray(field.options)) {
//             // ✅ Multiple checkboxes
//             if (field.label) {
//                 const groupLabel = document.createElement("label");
//                 groupLabel.textContent = field.label;
//                 groupLabel.classList.add("form-label", "fw-bold");
//                 fragment.appendChild(groupLabel);
//             }

//             field.options.forEach(opt => {
//                 const div = document.createElement("div");
//                 div.classList.add("form-check");

//                 const input = document.createElement("input");
//                 input.type = "checkbox";
//                 input.id = field.id + "-" + opt.value;
//                 input.name = field.id + "[]";
//                 input.value = opt.value;
//                 input.classList.add("form-check-input");
//                 if (field.value && Array.isArray(field.value) && field.value.includes(opt.value)) {
//                     input.checked = true;
//                 }


//                 // Apply Frontend validation to each checkbox input
//                 applyFieldValidation(field, input);

//                 const label = document.createElement("label");
//                 label.classList.add("form-check-label");
//                 label.setAttribute("for", input.id);
//                 label.textContent = opt.text; // ✅ use text instead of label

//                 div.appendChild(input);
//                 div.appendChild(label);
//                 fragment.appendChild(div);
//             });
//         } else {
//             // ✅ Single checkbox
//             const div = document.createElement("div");
//             div.classList.add("form-check");

//             const input = document.createElement("input");
//             input.type = "checkbox";
//             input.id = field.id;
//             input.name = field.id;
//             input.value = 1;
//             input.classList.add("form-check-input");
//             if (field.value && (field.value === true || field.value === 1 || field.value === "1")) {
//                 input.checked = true;
//             }

//             // Apply Frontend validation to each checkbox input
//             applyFieldValidation(field, input);

//             const label = document.createElement("label");
//             label.classList.add("form-check-label");
//             label.setAttribute("for", input.id);
//             label.textContent = field.label;

//             div.appendChild(input);
//             div.appendChild(label);
//             fragment.appendChild(div);
//         }

//         // ✅ Add helper text below checkbox or group
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
//             fragment.appendChild(helper);
//         }
        
//     }

//     else if (field.type === "textarea") {
//         const fragment = document.createElement("div");
//         fragment.id = addTo.id + "-field";
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         // ✅ CHECK: Use floatinglabel from form schema to determine layout
//         const useFloatingLabel = formMeta.floatinglabel === true;
        
//         // ✅ CONDITIONAL: Create container with appropriate class
//         const formContainer = document.createElement("div");
//         formContainer.id = field.id + "-container";
        
//         if (useFloatingLabel) {
//             // Floating label structure
//             formContainer.classList.add("form-floating", "mb-3");
//         } else {
//             // Normal label structure  
//             formContainer.classList.add("mb-3");
//         }
        
//         fragment.appendChild(formContainer);

//         // ✅ CONDITIONAL: Label placement for normal structure
//         if (!useFloatingLabel) {
//             // Normal structure: Label comes FIRST
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.classList.add("form-label");
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ TEXTAREA: Create textarea element
//         const textarea = document.createElement("textarea");
//         textarea.id = field.id;
//         textarea.name = field.id;
//         textarea.value = field.value || "";
//         textarea.classList.add("form-control");
        
//         // ✅ HEIGHT: Handle rows vs CSS height properly
//         if (useFloatingLabel) {
//             // For floating labels, use CSS height instead of rows attribute
//             if (field.rows) {
//                 const heightInPx = (field.rows * 24) + 16; // Approximate line height
//                 textarea.style.height = heightInPx + "px";
//             } else {
//                 textarea.style.height = "100px"; // Default height for floating
//             }
//             // Floating labels require placeholder for CSS to work
//             textarea.setAttribute("placeholder", field.placeholder || field.label);
//         } else {
//             // For normal labels, rows attribute works fine
//             textarea.rows = field.rows || 4; // default to 4 rows if not provided
//             if (field.placeholder) {
//                 textarea.setAttribute("placeholder", field.placeholder);
//             }
//         }

//         // Apply textarea Frontend validation
//         applyTextareaValidation(field, textarea);
//         formContainer.appendChild(textarea);

//         // ✅ CONDITIONAL: Label placement for floating structure
//         if (useFloatingLabel) {
//             // Floating structure: Label comes AFTER textarea
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ ERROR HANDLING: Same for both structures
//         if (window.formErrors && window.formErrors[field.id]) {
//             textarea.classList.add('is-invalid');
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("invalid-feedback");
//             errorDiv.id = `${field.id}-error`;
//             errorDiv.textContent = window.formErrors[field.id][0];
//             formContainer.appendChild(errorDiv);
//         }

//         // ✅ HELPER TEXT: Conditional placement
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
            
//             if (useFloatingLabel) {
//                 // For floating labels, helper text goes outside container
//                 fragment.appendChild(helper);
//             } else {
//                 // For normal labels, helper text stays in container
//                 formContainer.appendChild(helper);
//             }
//         }

//         if (field.info) {
//             addFieldHelpInfo(field, formContainer);
//         }

//         if (field.feedback) {
//             addFieldFeedback(field.feedback, formContainer);
//         }
//     }

//     // For Datalist
//     else if (field.type === "datalist") {
//         const fragment = document.createElement("div");
//         fragment.id = addTo.id + "-field";
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         // ✅ CHECK: Use floatinglabel from form schema to determine layout
//         const useFloatingLabel = formMeta.floatinglabel === true;
        
//         // ✅ CONDITIONAL: Create container with appropriate class
//         const formContainer = document.createElement("div");
//         formContainer.id = field.id + "-container";
        
//         if (useFloatingLabel) {
//             // Floating label structure
//             formContainer.classList.add("form-floating", "mb-3");
//         } else {
//             // Normal label structure  
//             formContainer.classList.add("mb-3");
//         }
        
//         fragment.appendChild(formContainer);

//         // ✅ CONDITIONAL: Label placement for normal structure
//         if (!useFloatingLabel) {
//             // Normal structure: Label comes FIRST
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.classList.add("form-label");
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ INPUT: Create input with list attribute
//         const input = document.createElement("input");
//         input.id = field.id;
//         input.name = field.id;
//         input.type = "text";
//         input.classList.add("form-control");
//         input.setAttribute("list", field.id + "-list"); // link to datalist
        
//         // ✅ CONDITIONAL: Placeholder handling
//         if (useFloatingLabel) {
//             // Floating labels require placeholder for CSS to work
//             input.setAttribute("placeholder", field.placeholder || field.label);
//         } else if (field.placeholder) {
//             // Normal labels can optionally have placeholder
//             input.setAttribute("placeholder", field.placeholder);
//         }

//         formContainer.appendChild(input);

//         // ✅ CREATE DATALIST: Same for both structures
//         const datalist = document.createElement("datalist");
//         datalist.id = field.id + "-list";

//         if (field.options && Array.isArray(field.options)) {
//             field.options.forEach(opt => {
//                 const option = document.createElement("option");
//                 option.value = opt;
//                 datalist.appendChild(option);
//             });
//         }

//         formContainer.appendChild(datalist);

//         // ✅ VALIDATION: Apply datalist validation
//         if (typeof applyDatalistValidation === "function") {
//             applyDatalistValidation(field, input, datalist);
//         }

//         // ✅ CONDITIONAL: Label placement for floating structure
//         if (useFloatingLabel) {
//             // Floating structure: Label comes AFTER input and datalist
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ ERROR HANDLING: Same for both structures
//         if (window.formErrors && window.formErrors[field.id]) {
//             input.classList.add('is-invalid');
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("invalid-feedback");
//             errorDiv.id = `${field.id}-error`;
//             errorDiv.textContent = window.formErrors[field.id][0];
//             formContainer.appendChild(errorDiv);
//         }

//         // ✅ HELPER TEXT: Same for both structures
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
            
//             if (useFloatingLabel) {
//                 // For floating labels, helper text goes outside container
//                 fragment.appendChild(helper);
//             } else {
//                 // For normal labels, helper text stays in container
//                 formContainer.appendChild(helper);
//             }
//         }

//         if (field.info) {
//             addFieldHelpInfo(field, formContainer);
//         }

//         if (field.feedback) {
//             addFieldFeedback(field.feedback, formContainer);
//         }
//     }



//     else if (field.type === "text" && field.options && Array.isArray(field.options)) {
//         const fragment = document.createElement("div");
//         fragment.id = addTo.id + "-field";
//         fragment.style.position = "relative"; // keep dropdown aligned
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         // Input
//         const input = document.createElement("input");
//         input.type = "text";
//         input.name = field.id;
//         input.value = field.value || "";
//         input.placeholder = field.placeholder || field.label;
//         input.classList.add("form-control");
//         fragment.appendChild(input);

//         //Frontend Validation
//         applyFieldValidation(field, input);



//         // ✅ Laravel backend validation error
//         if (window.formErrors && window.formErrors[field.id]) {
//             input.classList.add('is-invalid');
//             const errorDiv = document.createElement("div");
//             errorDiv.classList.add("invalid-feedback");
//             errorDiv.id = `${field.id}-error`;
//             errorDiv.textContent = window.formErrors[field.id][0]; // first error message
//             fragment.appendChild(errorDiv);
//         }

//         // Dropdown menu
//         const menu = document.createElement("div");
//         menu.style.display = "block";
//         menu.style.position = "absolute";
//         menu.style.top = "100%";
//         menu.style.left = "0";
//         menu.style.width = "100%";
//         menu.style.maxHeight = "0";
//         menu.style.overflow = "hidden";
//         menu.style.opacity = "0";
//         menu.style.transition = "all 0.2s ease"; // ✅ smooth transition
//         menu.style.background = "#fff";
//         menu.style.border = "1px solid #ccc";
//         menu.style.zIndex = "1000";
//         fragment.appendChild(menu);

//         // Populate
//         field.options.forEach(opt => {
//             const item = document.createElement("div");
//             item.textContent = opt.label;
//             item.style.padding = "6px 10px";
//             item.style.cursor = "pointer";
//             item.addEventListener("mouseover", () => item.style.background = "#f0f0f0");
//             item.addEventListener("mouseout", () => item.style.background = "#fff");
//             item.addEventListener("click", () => {
//                 input.value = opt.label;
//                 input.dataset.value = opt.value;
//                 closeMenu();
//                 input.reportValidity();
//             });
//             menu.appendChild(item);
//         });

//         // Open/close functions
//         function openMenu() {
//             menu.style.maxHeight = "500px"; // expands smoothly
//             menu.style.opacity = "1";
//         }

//         function closeMenu() {
//             menu.style.maxHeight = "0";
//             menu.style.opacity = "0";
//         }

//         // Toggle on input click
//         input.addEventListener("click", () => {
//             if (menu.style.maxHeight === "0px" || menu.style.opacity === "0") {
//                 openMenu();
//             } else {
//                 closeMenu();
//             }
//         });

//         // Filter items
//         input.addEventListener("input", () => {
//             const filter = input.value.toLowerCase();
//             Array.from(menu.children).forEach(item => {
//                 item.style.display = item.textContent.toLowerCase().includes(filter) ? "block" : "none";
//             });
//             openMenu();
//         });

//         // Close when clicking outside
//         document.addEventListener("click", (e) => {
//             if (!fragment.contains(e.target)) {
//                 closeMenu();
//             }
//         });
//     }

//     // For all other input types (text, email, password, number, date, file, etc.)
//     else if (field.type && field.label) {
//         const fragment = document.createElement("div");
//         fragment.id = addTo.id + "-field";
//         addFieldSize(field, fragment);
//         addTo.appendChild(fragment);

//         // console.log("field",formMeta);
//         // ✅ CHECK: Use floatinglabel from form schema to determine layout
//         const useFloatingLabel =  formMeta.floatinglabel === true;
        
//         // ✅ CONDITIONAL: Create container with appropriate class
//         const formContainer = document.createElement("div");
//         formContainer.id = field.id + "-container";
        
//         if (useFloatingLabel) {
//             // Floating label structure
//             formContainer.classList.add("form-floating", "mb-3");
//         } else {
//             // Normal label structure  
//             formContainer.classList.add("mb-3");
//         }
        
//         fragment.appendChild(formContainer);

//         // ✅ CONDITIONAL: Label placement based on floating label setting
//         if (!useFloatingLabel) {
//             // Normal structure: Label comes FIRST
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.classList.add("form-label");
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ INPUT: Always create input element
//         const input = document.createElement("input");
//         input.type = field.type;
//         if (field.type === 'file' && field?.accept) {
//             input.accept = field?.accept;
//         }
//         input.id = field.id;
//         input.name = field.id;
//         input.value = field.value || "";
//         input.classList.add("form-control");

//         // ✅ Date & Time restrictions
//         if (["date", "datetime-local", "month", "week", "time"].includes(field.type)) {
//             const now = new Date();

//             // Helper formats
//             const todayDate = now.toISOString().split("T")[0];              // YYYY-MM-DD
//             const nowDateTime = now.toISOString().slice(0, 16);             // YYYY-MM-DDTHH:MM
//             const currentMonth = now.toISOString().slice(0, 7);             // YYYY-MM
//             const currentTime = now.toISOString().slice(11, 16);            // HH:MM

//             // Compute current ISO week (e.g., 2025-W42)
//             const year = now.getFullYear();
//             const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
//             const currentWeek = `${year}-W${week.toString().padStart(2, "0")}`;

//             // ✅ Disable future / past logic
//             if (field.disableFuture === true) {
//                 switch (field.type) {
//                     case "date":
//                         input.setAttribute("max", todayDate);
//                         break;
//                     case "datetime-local":
//                         input.setAttribute("max", nowDateTime);
//                         break;
//                     case "month":
//                         input.setAttribute("max", currentMonth);
//                         break;
//                     case "week":
//                         input.setAttribute("max", currentWeek);
//                         break;
//                     case "time":
//                         input.setAttribute("max", currentTime);
//                         break;
//                 }
//             } else if (field.disablePast === true) {
//                 switch (field.type) {
//                     case "date":
//                         input.setAttribute("min", todayDate);
//                         break;
//                     case "datetime-local":
//                         input.setAttribute("min", nowDateTime);
//                         break;
//                     case "month":
//                         input.setAttribute("min", currentMonth);
//                         break;
//                     case "week":
//                         input.setAttribute("min", currentWeek);
//                         break;
//                     case "time":
//                         input.setAttribute("min", currentTime);
//                         break;
//                 }
//             }

//             // ✅ Prevent end date/time < start date/time
//             if (field.id === "endDate" || field.id === "end_time" || field.name === "end_date") {
//                 const startInput =
//                     document.getElementById("startDate") ||
//                     document.getElementById("start_time") ||
//                     document.querySelector("[name='start_date']");
//                 if (startInput) {
//                     // Set dynamic min value
//                     startInput.addEventListener("change", () => {
//                         input.setAttribute("min", startInput.value);
//                     });
//                 }
//             }
//         }

        
//         // ✅ CONDITIONAL: Placeholder handling
//         if (useFloatingLabel) {
//             // Floating labels require placeholder for CSS to work
//             input.setAttribute("placeholder", field.placeholder || field.label);
//         } else if (field.placeholder) {
//             // Normal labels can optionally have placeholder
//             input.setAttribute("placeholder", field.placeholder);
//         }

//         // Frontend validation
//         applyFieldValidation(field, input);
//         formContainer.appendChild(input);
       
//         // ✅ Handle dependencies.hide (e.g., hide endDate when isCurrent checked)
//         if (field.dependencies && field.dependencies.hide) {
//             // Delay until DOM is ready (so dependent field exists)
//             setTimeout(() => {
//                 field.dependencies.hide.forEach(dep => {
//                     const depInput = document.getElementById(dep.id);
//                     if (depInput) {
//                         const checkHideCondition = () => {
//                             const depValue = depInput.type === "checkbox" ? depInput.checked : depInput.value;
//                             const shouldHide =
//                                 dep.operator === "===" ? depValue === dep.value :
//                                 dep.operator === "!==" ? depValue !== dep.value :
//                                 false;

//                             const container = document.getElementById(field.id + "-container");
//                             if (container) {
//                                 container.style.display = shouldHide ? "none" : "";
//                             }

//                             // optional: clear value when hidden
//                             if (shouldHide) input.value = "";
//                         };

//                         // Initial check + bind listener
//                         checkHideCondition();
//                         depInput.addEventListener("change", checkHideCondition);
//                     }
//                 });
//             }, 0);
//         }



//         // ✅ CONDITIONAL: Label placement for floating labels
//         if (useFloatingLabel) {
//             // Floating structure: Label comes AFTER input
//             const label = document.createElement("label");
//             label.id = field.id + "-label";
//             label.setAttribute("for", field.id);
//             label.textContent = field.label;
//             formContainer.appendChild(label);
//         }

//         // ✅ ERROR HANDLING: Same for both structures
//         // if (window.formErrors && window.formErrors[field.id]) {
//         //     input.classList.add('is-invalid');

//         //     const errorDiv = document.createElement("div");
//         //     errorDiv.classList.add("invalid-feedback");
//         //     errorDiv.id = `${field.id}-error`;
//         //     errorDiv.textContent = window.formErrors[field.id][0];
//         //     formContainer.appendChild(errorDiv);
//         // }

//         // ✅ HELPER TEXT: Same for both structures
//         if (field.helpertext || field.helperText) {
//             const helper = document.createElement("div");
//             helper.classList.add("form-text");
//             helper.id = `${field.id}-help`;
//             helper.textContent = field.helpertext || field.helperText;
//             formContainer.appendChild(helper);
//         }

//         if (field.info) {
//             addFieldHelpInfo(field, formContainer);
//         }

//         if (field.feedback) {
//             addFieldFeedback(field.feedback, formContainer);
//         }
//     }




// }

// function addFieldSize(field, elementToSize) {
//     let sizeClasses = []
//     if (field.size) {
//         if (typeof field.size === 'number') {
//             if (field.size >= 1 && field.size <= 12) {
//                 sizeClasses.push("col-" + field.size)
//             }
//         } else if (field.size.constructor.name === 'Object') {
//             Object.keys(field.size).forEach((sizeKey) => {
//                 // console.log(sizeKey);
//                 if ('xs' === sizeKey) {
//                     sizeClasses.push("col-" + field.size[sizeKey])
//                 } else if ('sm' === sizeKey || 'md' === sizeKey || 'lg' === sizeKey || 'xl' === sizeKey || 'xxl' === sizeKey) {
//                     sizeClasses.push("col-" + sizeKey + "-" + field.size[sizeKey])
//                 } else {

//                 }
//             })
//         } else {
//             console.log();
//             sizeClasses.push("col")
//         }
//     } else if (field.gridSize) { //Schema has gridSize property
//         // if (typeof field.gridSize === 'number' && field.gridSize >= 1 && field.gridSize <= 12) {
//         //     sizeClasses.push("col-" + field.gridSize)
//         // } else {
//         //     sizeClasses.push("col")
//         // }

//         if (typeof field.gridSize === "number" && field.gridSize >= 1 && field.gridSize <= 12) {
//             // ✅ Numeric grid size (e.g. 12)
//             sizeClasses.push("col-" + field.gridSize);
//         } 
//         else if (typeof field.gridSize === "object") {
//             // ✅ Responsive grid size (e.g. { sm: 4, xs: 12 })
//             Object.keys(field.gridSize).forEach((breakpoint) => {
//                 const value = field.gridSize[breakpoint];
//                 if (value >= 1 && value <= 12) {
//                     sizeClasses.push(`col-${breakpoint}-${value}`);
//                 }
//             });
//         } 
//         else {
//             // ✅ Fallback if invalid
//             sizeClasses.push("col");
//         }




//     } else {
//         console.log();
//         sizeClasses.push("col")
//     }

//     elementToSize.classList.add(...sizeClasses);
// }

function addFieldHelpInfo(field, addTo) {
    if (field && addTo) {
        if (field.info) {
            const fieldHelpInfoBlock = document.createElement('div')
            fieldHelpInfoBlock.classList.add(...['help-info', 'small', 'text-secondary']);
            addTo.appendChild(fieldHelpInfoBlock)

            const infoSpanHTML = document.createElement('span')
            infoSpanHTML.classList.add('small')
            infoSpanHTML.innerHTML = field.info.innerHTML
            fieldHelpInfoBlock.appendChild(infoSpanHTML)
        }
    }
}

function addFieldFeedback(feedback, addTo) {
    if (feedback && addTo) {
        if (feedback.valid) {
            const fieldFeedbackValidBlock = document.createElement('div')
            fieldFeedbackValidBlock.classList.add('valid-feedback');
            fieldFeedbackValidBlock.textContent = feedback.valid
            addTo.appendChild(fieldFeedbackValidBlock)
        }
        if (feedback.invalid) {
            const fieldFeedbackInvalidBlock = document.createElement('div')
            fieldFeedbackInvalidBlock.classList.add('invalid-feedback');
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
        element.wrap(FORM_GROUP_CONTAINER) // wrap element with
        // form-group-has-feedback

        element.addClass("form-control") // add form-control class

        // checking if label is provided in the data-label attr
        if (element.attr('data-label')) {
            element.parent().append("<label class=\"control-label\" for=\"" + element.attr('id') + "\" title=\"" + element.attr('data-label') + "\">" + element.attr('data-label') + "</label>")
        }

        // checking if additional info is provided in the data-help-info attr
        if (element.attr('data-help-info')) {
            element.parent().append("<p class=\"shoz-help-text small text-muted\">" + element.attr('data-help-info') + "</p>")
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
            if (type == TYPE_PASSWORD) {
                element.addClass('hidden-password')
                element.wrap(INPUT_GROUP_CONTAINER) // wrap element with INPUT_GROUP_CONTAINER
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

            if (dataType == DATA_TYPE_DATETIME) {
                //TODO: Send datetime field value format along with it's value in the hidden input field
                // element.attr("readonly",true)

                element.after("<span class=\"input-group-addon\"><span class=\"fa fa-fw fa-calendar\"></span></span>")
                element.next('span').andSelf().wrapAll(INPUT_GROUP_CONTAINER)

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

                    if (dateTimeFormat == DTP_VIEW_MODE_YEARS) {
                        dtpOption = {
                            viewMode: DTP_VIEW_MODE_YEARS,
                            format: DTP_FORMAT_YEAR
                        }
                    } else if (dateTimeFormat == DTP_VIEW_MODE_MONTHS) {
                        dtpOption = {
                            viewMode: DTP_VIEW_MODE_MONTHS,
                            format: DTP_FORMAT_MONTH
                        }
                    } else if (dateTimeFormat == DTP_VIEW_MODE_DATE) {
                        dtpOption = {
                            format: DTP_FORMAT_DATE
                        }
                    } else if (dateTimeFormat == DTP_VIEW_MODE_TIME) {
                        dtpOption = {
                            format: DTP_FORMAT_TIME
                        }
                    } else if (dateTimeFormat == DTP_VIEW_MODE_DATE_TIME) {
                        dtpOption = { format: DTP_FORMAT_DATE_TIME }
                    }
                } else {
                    /* treating it as datetime so setting no format */
                    dtpOption = { format: DTP_FORMAT_DATE_TIME }
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

            form.classList.add('was-validated')
        }, false)
    })
})();

