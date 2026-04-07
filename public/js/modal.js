
const DEFAULT_MODAL_OPTIONS = {}

const labModal = new bootstrap.Modal('#labModal', {...DEFAULT_MODAL_OPTIONS})
const labModalHeader = document.getElementById('labModalHeader')
const labModalBody = document.getElementById('labModalBody')
const labModalFooter = document.getElementById('labModalFooter')
const labModalFooterActions = document.getElementById('labModalFooterActions')

const labModalCancelBtn = document.getElementById('labModalCancelBtn')
let activeSchemaFormModalState = null

const labModalEl = document.getElementById('labModal')
labModalEl.addEventListener('hidden.bs.modal', event => {
    // do something...
    activeSchemaFormModalState = null
    resetModalState()
})

const modalDismissBtnEl = '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'

function resetModalState() {
    labModalHeader.innerHTML = ""
    labModalHeader.style.display = "none"
    labModalBody.innerHTML = "..."
    labModalFooter.style.display = "none"
    labModalCancelBtn.innerHTML = "Cancel"
    labModalFooterActions.innerHTML = ""
}

function processModalActions(actions) {
    actions?.forEach(action => {
        let actionBtnEl = document.createElement('button')
        actionBtnEl.classList.add('btn')

        if (action?.className) {
            actionBtnEl.className = action.className
        } else {
            actionBtnEl.classList.add('btn-dark')
        }

        actionBtnEl.id = action?.id || `modal-action-btn-${new Date().getTime()}`
        actionBtnEl.type = action?.type || 'button'
        actionBtnEl.innerHTML = action?.label || 'unknown'

        if (action?.form) {
            actionBtnEl.setAttribute('form', action.form)
        }

        if (action?.dismiss) {
            actionBtnEl.setAttribute('data-bs-dismiss', 'modal')
        }

        actionBtnEl.onclick = event => {
            if (typeof action?.action === 'function') {
                action.action(event)
            }
        }

        labModalFooterActions.append(actionBtnEl)
    });
}

function renderBasicModal(modalContent) {
    if (labModal) {
        let { header = { enabled: false }, body = { enabled: false }, footer = { enabled: false } } = modalContent
        if (header?.enabled) {
            labModalHeader.innerHTML = header?.content
            labModalHeader.style.display = "flex"
        }
        if (body?.enabled) {
            // labModalBody.innerHTML = body?.content
            labModalBody.innerHTML = "";
            if (body.content instanceof Node) {
                body.content.classList.remove("d-none");
                labModalBody.appendChild(body.content);  // MOVE DOM node
            } else {
                labModalBody.innerHTML = body.content;   // fallback for HTML string
            }
        }
        if (footer?.enabled) {
            labModalFooter.style.display = "flex"
            if (footer?.allowCancel) {
                labModalCancelBtn.style.display = "block"
            }
            processModalActions(footer?.actions)
        }
    }
    labModal.show()
}

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        || document.querySelector('input[name="_token"]')?.value
        || ''
}

function buildSchemaModalForm(formId, values = {}) {
    const form = document.createElement('form')
    form.id = formId
    form.method = 'POST'
    form.classList.add('shoz-form')
    form.dataset.renderMode = 'modal'

    Object.entries(values || {}).forEach(([key, value]) => {
        form.dataset[`prefill${key
            .split('_')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('')}`] = value ?? ''
    })

    const csrfToken = getCsrfToken()
    if (csrfToken) {
        const csrfInput = document.createElement('input')
        csrfInput.type = 'hidden'
        csrfInput.name = '_token'
        csrfInput.value = csrfToken
        csrfInput.setAttribute('autocomplete', 'off')
        form.appendChild(csrfInput)
    }

    return form
}

function populateSchemaModalFormValues(form, values = {}) {
    Object.entries(values || {}).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`)
        if (field) {
            field.value = value ?? ''
        }
    })
}

async function showSchemaFormModal(config = {}) {
    const {
        formId,
        values = {},
        title = 'Loading form...',
        submitLabel = 'Submit',
        closeOnSuccess = true,
        preferSchemaTitle = false,
    } = config

    if (!formId) {
        console.error('showSchemaFormModal: formId is required.')
        return
    }

    if (typeof setupForm !== 'function') {
        console.error('showSchemaFormModal: setupForm is not available.')
        return
    }

    const form = buildSchemaModalForm(formId, values)
    const host = document.createElement('div')
    host.appendChild(form)

    activeSchemaFormModalState = {
        formId,
        closeOnSuccess,
    }

    renderBasicModal({
        header: {
            enabled: true,
            content: `
                <h5 class="modal-title">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            `,
        },
        body: {
            enabled: true,
            content: host,
        },
        footer: {
            enabled: true,
            allowCancel: true,
            actions: [
                {
                    id: `${formId}-submit-btn`,
                    label: submitLabel,
                    type: 'submit',
                    form: formId,
                    className: 'btn btn-primary',
                },
            ],
        },
    })

    await new Promise(resolve => requestAnimationFrame(resolve))
    const formMeta = await setupForm(form)
    populateSchemaModalFormValues(form, values)

    const schemaTitle = formMeta?.header?.text || formMeta?.heading || ''
    const modalTitle = preferSchemaTitle && schemaTitle ? schemaTitle : title
    labModalHeader.innerHTML = `
        <h5 class="modal-title">${modalTitle}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    `
    labModalHeader.style.display = 'flex'

    return {
        form,
        formMeta,
    }
}

function showModal(modalContent = {}) {
    if (modalContent?.formId) {
        return showSchemaFormModal(modalContent)
    }

    return renderBasicModal(modalContent)
}

function showModalSnackbar(message, type = 'info') {
    const text = message || (type === 'error' ? 'Something went wrong.' : 'Action completed successfully.')

    if (typeof window !== 'undefined' && typeof window.showSnackbar === 'function') {
        window.showSnackbar(text, type, {
            duration: type === 'error' ? 4500 : 3000,
        })
        return
    }

    if (typeof apiClient !== 'undefined' && typeof apiClient.showToast === 'function') {
        apiClient.showToast(text, type, {
            duration: type === 'error' ? 4500 : 3000,
        })
        return
    }

    if (typeof Toastify !== 'undefined') {
        Toastify({
            text,
            duration: type === 'error' ? 4500 : 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: type === 'error' ? '#dc3545' : '#198754',
        }).showToast()
        return
    }

    if (typeof toastr !== 'undefined') {
        const toastrMethod = type === 'error' ? 'error' : 'success'
        toastr[toastrMethod](text)
        return
    }

    console.log(`[${type.toUpperCase()}] ${text}`)
}

window.addEventListener('shoz-form:submitted', event => {
    const { formId, message } = event.detail || {}

    if (!activeSchemaFormModalState || formId !== activeSchemaFormModalState.formId) {
        return
    }

    showModalSnackbar(message, 'success')

    if (activeSchemaFormModalState.closeOnSuccess) {
        bootstrap.Modal.getInstance(document.getElementById('labModal'))?.hide()
    }
})

window.addEventListener('shoz-form:submit-failed', event => {
    const { formId, message } = event.detail || {}

    if (!activeSchemaFormModalState || formId !== activeSchemaFormModalState.formId) {
        return
    }

    showModalSnackbar(message, 'error')
})

resetModalState()
