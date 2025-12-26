<div class="position-relative">
    @include('userinterface::utils.image', ['options' => $options])
    <div id="imgEdit" class="dropdown position-absolute bottom-0 end-0 mb-1 me-1">
        <button id="imgEditToggleEle" class="btn btn-secondary rounded p-1 d-flex align-items-center" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            <div class="d-flex align-items-center justify-content-center" style="width:24px;height:24px;">
                <i class="fas fa-fw fa-camera"></i>
            </div>
        </button>
        <div id="imgEditContent" class="dropdown-menu shadow" data-bs-popper="static">
            <a id="img-change" class="dropdown-item" href="#" title="Change current image">Change image</a>
            <!-- <hr class="dropdown-divider" /> -->
            <a id="remove-image" class="dropdown-item" href="#" title="Remove current image">Remove image</a>
        </div>
    </div>
</div>
@php
$library_options = (object)(['selectable'=>true]);
@endphp
{{-- @include('userinterface::media.parts.library', ['options' => $library_options]) --}}

@pushonce('scripts')
<script type="text/javascript">
    function updateLogo(mediaURL) {
        let logoUpdateForm = document.createElement('form');
        logoUpdateForm.id = "{{ $options?->form?->id }}"
        logoUpdateForm.action = "{{ $options?->form?->action }}"
        logoUpdateForm.method = "post"

        const csrfToken = document.querySelector('meta[name="csrf-token"]').content
        const csrfInput = document.createElement('input')
        csrfInput.type = "hidden"
        csrfInput.name = "_token"
        csrfInput.value = csrfToken
        csrfInput.setAttribute('autocomplete', "off")
        logoUpdateForm.appendChild(csrfInput)

        let metaLogoInput = document.createElement('input')
        metaLogoInput.type = "hidden"
        metaLogoInput.name = "{{ $options?->form?->field_name ?? 'logo' }}"
        metaLogoInput.value = mediaURL
        logoUpdateForm.appendChild(metaLogoInput)

        const formIdInput = document.createElement('input')
        formIdInput.type = "hidden"
        formIdInput.name = "formId"
        formIdInput.value = '{{ $options?->form?->id }}'
        logoUpdateForm.appendChild(formIdInput);

        document.body.appendChild(logoUpdateForm);
        logoUpdateForm.submit();
    }

    function removeProfilePicture() {

        let form = document.createElement('form');
        form.action = "/remove-profile-picture"; // your route
        form.method = "post";

        // CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const csrfInput = document.createElement('input');
        csrfInput.type = "hidden";
        csrfInput.name = "_token";
        csrfInput.value = csrfToken;
        csrfInput.setAttribute('autocomplete', "off");
        form.appendChild(csrfInput);

        // OPTIONAL: if backend expects any extra field
        const actionInput = document.createElement('input');
        actionInput.type = "hidden";
        actionInput.name = "action";
        actionInput.value = "remove";
        form.appendChild(actionInput);

        // Append + submit
        document.body.appendChild(form);
        form.submit();
        document.getElementById('shozModal').style.display = 'none';
        setTimeout(() => {
            window.location.href = "/myprofile";
        }, 50);
    }


    // let mediaContent = document.getElementById("media-library").innerHTML

    let dropboxContent = document.getElementById("media-dropbox")
        
    let orgImageChangeBtn = document.getElementById('img-change')


    const modalHeaderHTML = `
            <div id="headerStep1">
                <h5 class="mb-0 mt-1 text-center">Change Profile Picture</h5>
            </div>
        `;



    orgImageChangeBtn.addEventListener('click', () => {
        showModal({
            header: {
                enabled: true,
                content: modalHeaderHTML
            },
            body: {
                enabled: true,
                content: dropboxContent
            },
            footer: {
                enabled: true,
                allowCancel: true,
                actions: [{
                    label: "Save",
                    action: () => {
                        saveCroppedImage()
                    }
                }]
            }

            
        });

        Array.from(document.getElementsByClassName('library-item')).forEach(element => {
            element.addEventListener('click', (event) => {
                let imgMetaData = JSON.parse(event.target.dataset.metadata)
                console.log(imgMetaData)
                let imgContent = '<img class="img-fluid pe-none" style="max-height:150px!important;" src="<?php echo route('media.download', ['media_url' => '%media_url%']); ?>" alt="Media">'
                let modalBodyContent = "You're selecting the below image as profile picture.<br/>"
                modalBodyContent += decodeURI(imgContent)?.replace('%media_url%', imgMetaData?.media_url)

                let mediaURL = "<?php echo route('media.download', ['media_url' => '%media_url%']); ?>"
                mediaURL = decodeURI(mediaURL)?.replace('%media_url%', imgMetaData?.media_url)

                showModal({
                    header: {
                        enabled: true,
                        content: '<h5 class="mb-0 mt-1">Choose or Upload</h5>'
                    },
                    body: {
                        enabled: true,
                        content: modalBodyContent
                    },
                    footer: {
                        enabled: true,
                        allowCancel: true,
                        actions: [{
                            label: "update media",
                            action: () => {
                                updateLogo(mediaURL)
                            }
                        }]
                    }
                });
            });
        });
    })





    // Remove image functionality
    let removeImageChangeBtn = document.getElementById('remove-image')
    let removeImageDropboxContent = document.getElementById("remove-image-dropbox").innerHTML
    removeImageChangeBtn.addEventListener('click', () => {
        showModal({
            header: {
                enabled: true,
                content: '<h5 class="mb-0 mt-1">Remove Image</h5>'
            },
            body: {
                enabled: true,
                content: removeImageDropboxContent
            },
            footer: {
                enabled: true,
                allowCancel: true,
                actions: [{
                    label: "Remove",
                    action: () => {
                        removeProfilePicture()
                    }
                }]
            }
        });
    })
</script>
@endpushonce