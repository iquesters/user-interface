// Picture changer (resources/views/utils/image-changer.blade.php): "Change image"
// opens the upload/crop dialog (media.parts.dropbox), "Remove image" confirms
// and posts to the URL in #imgEdit[data-remove-url]. Does nothing on pages
// without a picture changer.
document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('imgEdit');
    if (!menu) {
        return;
    }

    // The modal moves the node it is given into itself and clears its body on
    // close, so keep a reference and hand the same node back each time.
    const uploadTemplate = document.getElementById('media-dropbox');
    const removeTemplate = document.getElementById('remove-image-dropbox');
    const removeUrl = menu.dataset.removeUrl;

    document.getElementById('img-change')?.addEventListener('click', function () {
        if (!uploadTemplate) {
            return;
        }

        showModal({
            header: { enabled: true, content: '<h5 class="modal-title">Change profile picture</h5>' },
            body: { enabled: true, content: uploadTemplate },
            footer: {
                enabled: true,
                allowCancel: true,
                actions: [{ label: 'Save', className: 'btn btn-primary', action: () => saveCroppedImage() }],
            },
        });
    });

    document.getElementById('remove-image')?.addEventListener('click', function () {
        if (!removeTemplate || !removeUrl) {
            return;
        }

        showModal({
            header: { enabled: true, content: '<h5 class="modal-title">Remove profile picture?</h5>' },
            body: { enabled: true, content: removeTemplate.innerHTML },
            footer: {
                enabled: true,
                allowCancel: true,
                actions: [{ label: 'Remove', className: 'btn btn-danger', action: submitRemove }],
            },
        });
    });

    function submitRemove() {
        const form = document.createElement('form');
        form.method = 'post';
        form.action = removeUrl;

        const token = document.createElement('input');
        token.type = 'hidden';
        token.name = '_token';
        token.value = document.querySelector('meta[name="csrf-token"]')?.content || '';
        form.appendChild(token);

        document.body.appendChild(form);
        form.submit();
    }
});
