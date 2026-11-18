{{--
    Picture with a camera button: "Change image" (upload / camera + crop, from
    media.parts.dropbox) and, when $options->removable, "Remove image" (from
    media.parts.remove-image). Include both parts on the page.
    Behaviour: public/js/image-changer.js.
--}}
<div class="position-relative">
    @include('userinterface::utils.image', ['options' => $options])
    <div id="imgEdit" class="dropdown position-absolute bottom-0 end-0 mb-1 me-1"
         data-remove-url="{{ Route::has('profile.picture.remove') ? route('profile.picture.remove') : '' }}">
        <button id="imgEditToggleEle" class="btn btn-secondary rounded p-1 d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Change picture">
            <div class="d-flex align-items-center justify-content-center" style="width:24px;height:24px;">
                <i class="fas fa-fw fa-camera"></i>
            </div>
        </button>
        <div id="imgEditContent" class="dropdown-menu shadow">
            <button id="img-change" class="dropdown-item" type="button"><i class="fas fa-fw fa-upload me-1"></i>Change image</button>
            @if ($options->removable ?? true)
                <button id="remove-image" class="dropdown-item text-danger" type="button"><i class="fas fa-fw fa-trash me-1"></i>Remove image</button>
            @endif
        </div>
    </div>
</div>
