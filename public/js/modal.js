
const DEFAULT_MODAL_OPTIONS = {}

const shozModal = new bootstrap.Modal('#shozModal', {...DEFAULT_MODAL_OPTIONS})
const shozModalHeader = document.getElementById('shozModalHeader')
const shozModalBody = document.getElementById('shozModalBody')
const shozModalFooter = document.getElementById('shozModalFooter')
const shozModalFooterActions = document.getElementById('shozModalFooterActions')

const shozModalCancelBtn = document.getElementById('shozModalCancelBtn')

const shozModalEl = document.getElementById('shozModal')
shozModalEl.addEventListener('hidden.bs.modal', event => {
    // do something...
    resetModalState()
})

const modalDismissBtnEl = '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'

function resetModalState() {
    shozModalHeader.innerHTML = ""
    shozModalHeader.style.display = "none"
    shozModalBody.innerHTML = "..."
    shozModalFooter.style.display = "none"
    shozModalCancelBtn.innerHTML = "Cancel"
    shozModalFooterActions.innerHTML = ""
}

function processModalActions(actions) {
    //'<button id="shozModalDoneBtn" type="button" class="btn btn-primary">Done</button>'
    let actionBtnEl = document.createElement('button')
    actionBtnEl.classList.add('btn', 'btn-dark')

    actions?.forEach(action => {
        actionBtnEl.id = action?.id || `modal-action-btn-${new Date().getTime()}`
        actionBtnEl.innerHTML = action?.label || 'unknown'
        actionBtnEl.onclick = () => {
            action?.action()
            resetModalState()
        }
        shozModalFooterActions.append(actionBtnEl)
    });
}

function showModal(modalContent) {
    if (shozModal) {
        let { header = { enabled: false }, body = { enabled: false }, footer = { enabled: false } } = modalContent
        if (header?.enabled) {
            shozModalHeader.innerHTML = header?.content
            shozModalHeader.style.display = "block"
        }
        if (body?.enabled) {
            shozModalBody.innerHTML = body?.content
        }
        if (footer?.enabled) {
            shozModalFooter.style.display = "flex"
            if (footer?.allowCancel) {
                shozModalCancelBtn.style.display = "block"
            }
            processModalActions(footer?.actions)
        }
    }
    shozModal.show()
}

resetModalState()