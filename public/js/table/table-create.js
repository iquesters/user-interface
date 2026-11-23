/**
 * List page "Create" button (table schema "create": {"form", "label"}):
 * opens that form schema in create mode in a modal; after a successful save
 * the modal closes and the table reloads so the new record shows up.
 *
 * The URL follows: /list/{table}/create/{form} while the form is open (a
 * reload or a shared link opens it again); closing it returns to the list.
 */
let createFormOpenFromUrl = false;

function openCreateForm(formId, { push = true } = {}) {
    const button = document.getElementById('createRecordBtn');
    if (!formId || typeof showModal !== 'function') {
        return;
    }

    if (typeof setTableUrlRecord === 'function') {
        setTableUrlRecord({ action: 'create', form: formId }, { push });
    }
    createFormOpenFromUrl = true;

    showModal({
        formId,
        formMode: 'create',
        title: button?.dataset.form === formId ? (button.dataset.label || 'Create') : 'Create',
        submitLabel: 'Create',
    });
}

/**
 * Back / Forward or page load: open or close the create form as the URL says.
 * The URL names the form by uid; the Create button's own form (by slug) is
 * used when it is the same form, so its label and the reload after saving apply.
 */
async function applyCreateFormUrl(state) {
    const modalElement = document.getElementById('labModal');

    if (state?.action === 'create' && state.form) {
        if (!modalElement?.classList.contains('show')) {
            const buttonForm = document.getElementById('createRecordBtn')?.dataset.form;
            const sameForm = buttonForm && typeof tableUrlFormUid === 'function'
                && (await tableUrlFormUid(buttonForm)) === state.form;
            openCreateForm(sameForm ? buttonForm : state.form, { push: false });
        }
        return;
    }

    if (createFormOpenFromUrl && modalElement?.classList.contains('show')) {
        bootstrap.Modal.getInstance(modalElement)?.hide();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('createRecordBtn');
    const modalElement = document.getElementById('labModal');

    // Closing the create form (Cancel, ×, Esc or after saving) leaves the create URL.
    modalElement?.addEventListener('hidden.bs.modal', function () {
        if (!createFormOpenFromUrl) {
            return;
        }
        createFormOpenFromUrl = false;

        if (typeof parseTableUrl === 'function' && parseTableUrl()?.action === 'create') {
            setTableUrlRecord(null);
        }
    });

    if (!button || typeof showModal !== 'function') {
        return;
    }

    const formId = button.dataset.form;

    button.addEventListener('click', function () {
        openCreateForm(formId);
    });

    window.addEventListener('lab-form:submitted', function (event) {
        if (event.detail?.formId !== formId) {
            return;
        }

        // Same as the Refresh button: clear the cache and reload.
        document.getElementById('refreshTableBtn')?.click();
    });
});
