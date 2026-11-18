/**
 * List page "Create" button (table schema "create": {"form", "label"}):
 * opens that form schema in create mode in a modal; after a successful save
 * the modal closes and the table reloads so the new record shows up.
 */
document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('createRecordBtn');
    if (!button || typeof showModal !== 'function') {
        return;
    }

    const formId = button.dataset.form;

    button.addEventListener('click', function () {
        showModal({
            formId,
            formMode: 'create',
            title: button.dataset.label || 'Create',
            submitLabel: 'Create',
        });
    });

    window.addEventListener('lab-form:submitted', function (event) {
        if (event.detail?.formId !== formId) {
            return;
        }

        // Same as the Refresh button: clear the cache and reload.
        document.getElementById('refreshTableBtn')?.click();
    });
});
