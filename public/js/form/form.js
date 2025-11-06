let dtpOption

async function setupForm(formElement) {
    console.log("setuping shoz-form...")
    console.log("formId = " + formElement.id)

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

    // ✅ Access check
    const hasAccess = checkFormAccess(formMeta,formElement);
    if (!hasAccess) {
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

    if ((formMeta.submitButtonLabel || formMeta.allowCancel) && (formMeta.formEdit ?? true)) {
        // create a container for buttons
        const btnContainer = document.createElement(HTML_TAG.DIV);
        btnContainer.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.GAP_2); // Bootstrap flex + spacing


        // Cancel button
        if (formMeta.allowCancel) {
            // console.log("Adding cancel button with label:", formMeta.allowCancel);
            const cancelBtn = document.createElement(HTML_TAG.BUTTON);
            cancelBtn.type = "button";
            cancelBtn.textContent = "Cancel";
            cancelBtn.classList.add(STYLE_CLASS.BTN, STYLE_CLASS.BTN_SECONDARY);
            btnContainer.classList.add(STYLE_CLASS.JUSTIFY_CONTENT_END);
            btnContainer.appendChild(cancelBtn);
            
        }

        // Submit button
        if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
            console.log("Adding submit button with label:", formMeta.submitButtonLabel);
            const submitBtn = document.createElement(HTML_TAG.BUTTON);
            submitBtn.type = "submit";
            submitBtn.textContent = formMeta.submitButtonLabel || "Submit";
            submitBtn.classList.add(STYLE_CLASS.BTN, STYLE_CLASS.BTN_PRIMARY);
            btnContainer.classList.add(STYLE_CLASS.JUSTIFY_CONTENT_END);
            btnContainer.appendChild(submitBtn);
            
        }

        

        // append container to the form
        formElement.appendChild(btnContainer);
    }

    if (formMeta.cardElevation) {
        console.log("Applying Bootstrap card elevation styles");

        formElement.classList.add(
            STYLE_CLASS.CARD,
            STYLE_CLASS.SHADOW,
            STYLE_CLASS.BG_WHITE,
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
    if (formMeta.skeletonRender) {
        // console.log("Applying Bootstrap skeleton render styles", formMeta.skeletonRender);

        // ✅ Create skeleton container
        const skeletonWrapper = document.createElement(HTML_TAG.DIV);
        skeletonWrapper.classList.add(
            STYLE_CLASS.CARD, 
            STYLE_CLASS.P_4, 
            STYLE_CLASS.MB_3, 
            STYLE_CLASS.SHADOW_SM, 
            STYLE_CLASS.ROUNDED_3, 
            STYLE_CLASS.SKELETON_WRAPPER
        );

        // ✅ Create skeleton items dynamically based on fields
        if (Array.isArray(formMeta.fields)) {
            formMeta.fields.forEach(() => {
                const fieldGroup = document.createElement(HTML_TAG.DIV);
                fieldGroup.classList.add(STYLE_CLASS.MB_3);

                // Label placeholder
                const labelSkeleton = document.createElement(HTML_TAG.SPAN);
                labelSkeleton.classList.add(
                    STYLE_CLASS.PLACEHOLDER, 
                    STYLE_CLASS.COL_4, 
                    STYLE_CLASS.ROUNDED, 
                    STYLE_CLASS.PLACEHOLDER_GLOW, 
                    STYLE_CLASS.MB_1
                );

                // Input placeholder
                const inputSkeleton = document.createElement(HTML_TAG.SPAN);
                inputSkeleton.classList.add(
                    STYLE_CLASS.PLACEHOLDER, 
                    STYLE_CLASS.COLL_12, 
                    STYLE_CLASS.ROUNDED, 
                    STYLE_CLASS.PLACEHOLDER_WAVE
                );
                inputSkeleton.style.height = "2.5rem"; // optional height for input shape

                fieldGroup.appendChild(labelSkeleton);
                fieldGroup.appendChild(inputSkeleton);

                skeletonWrapper.appendChild(fieldGroup);
            });
        }

        // ✅ Add skeleton buttons if needed
        if (formMeta.submitButtonLabel || formMeta.allowCancel) {
            const btnContainer = document.createElement(HTML_TAG.DIV);
            btnContainer.classList.add(STYLE_CLASS.D_FLEX, STYLE_CLASS.JUSTIFY_CONTENT_END, STYLE_CLASS.GAP_2, STYLE_CLASS.MT_3);

            if (formMeta.allowCancel) {
                const cancelBtn = document.createElement(HTML_TAG.SPAN);
                cancelBtn.classList.add(STYLE_CLASS.PLACEHOLDER, STYLE_CLASS.BTN, STYLE_CLASS.BTN_SECONDARY, STYLE_CLASS.DISABLED, STYLE_CLASS.COL_3);
                btnContainer.appendChild(cancelBtn);
            }

            if (formMeta.submitButtonLabel || formMeta.allowSubmit) {
                const submitBtn = document.createElement(HTML_TAG.SPAN);
                submitBtn.classList.add(STYLE_CLASS.PLACEHOLDER, STYLE_CLASS.BTN, STYLE_CLASS.BTN_SECONDARY, STYLE_CLASS.DISABLED, STYLE_CLASS.COL_3);
                btnContainer.appendChild(submitBtn);
            }

            skeletonWrapper.appendChild(btnContainer);
        }

        // ✅ Insert skeleton before form
        formElement.before(skeletonWrapper);

        // ✅ Hide real form initially
        formElement.classList.add("d-none");

        // ✅ Replace skeleton with real form after delay
        setTimeout(() => {
            skeletonWrapper.remove();
            formElement.classList.remove("d-none");
            // console.log("Skeleton render complete, real form displayed");
        }, formMeta.skeletonRenderDelay || 2500);
    }





    // run prepare hook func if present
    // if (formMeta?.prepareHookFunc) {
    //     window[formMeta?.prepareHookFunc](formElement?.id);
    // }

    // removing placeholder
    cardProvider.getCard().classList.remove(...['placeholder-glow', 'placeholder-wave']);
}

/**
 * 
 * @param {*} cardHeader 
 * @param {*} formMeta 
 */
function setupFormHeader(cardHeader, formMeta) {

    const fragment = document.createElement(HTML_TAG.DIV);
    fragment.id = cardHeader.id + "-item"
    fragment.classList.add(...[STYLE_CLASS.D_FLEX,STYLE_CLASS.ALIGN_ITEMS_CENTER,STYLE_CLASS.JUSTIFY_CONTENT_BETWEEN,STYLE_CLASS.GAP_2]);
    if (formMeta.placeholder) {
        fragment.classList.add(...[STYLE_CLASS.PLACEHOLDER, formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
    }
    cardHeader.appendChild(fragment)

    const headingDiv = document.createElement(HTML_TAG.DIV)
    headingDiv.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_2])

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
    headingText.classList.add(...[STYLE_CLASS.MB_0, STYLE_CLASS.MT_1]);
    headingText.textContent = (formMeta.header && formMeta.header.text) || formMeta.heading;
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
    if (formMeta.header && formMeta.header.actions) {
        const headingActionDiv = document.createElement(HTML_TAG.DIV)
        headingActionDiv.classList.add(...[STYLE_CLASS.D_FLEX, STYLE_CLASS.ALIGN_ITEMS_CENTER, STYLE_CLASS.GAP_2])

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
        fragment.classList.add(...['placeholder', formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
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
            (action.element.color && STYLE_CLASS.SUPPORTED_ACTION_ELEMENT_COLORS.includes(action.element.color)) ?
                action.element.color : STYLE_CLASS.DEFAULT_ACTION_ELEMENT_COLOR

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
            fragment.classList.add(...['placeholder', formMeta.placeholder.color || STYLE_CLASS.DEFAULT_PLACEHOLDER_COLOR]);
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
        element.wrap(INPUT_TYPE.FORM_GROUP_CONTAINER) // wrap element with
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
    const currentURL = new URL(window.location.href);
    const pathname = currentURL.pathname.toLowerCase();

    console.log("Checking access for:", pathname);

    // ✅ Default to true if keys are missing
    const allowView = formMeta.allowView ?? true;
    const allowEdit = formMeta.allowEdit ?? true;


    // ✅ Allow only if URL contains 'view' or 'edit' and formMeta allows view
    const isAllowedRoute = pathname.includes('view') || pathname.includes('edit');

    // if (!isAllowedRoute || (!allowView && !allowEdit)) {
    if(!allowView){
        const message = document.createElement(HTML_TAG.P);
        message.textContent = 'You are not supposed to view this page';
        message.classList.add(
            STYLE_CLASS.ALERT,
            STYLE_CLASS.ALERT_DANGER,
            STYLE_CLASS.TEXT_CENTER,
            STYLE_CLASS.MT_3
        );

        // ✅ Clear only form content, not the whole page
        formElement.innerHTML = '';
        formElement.appendChild(message);
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

            form.classList.add('was-validated')
        }, false)
    })
})();

