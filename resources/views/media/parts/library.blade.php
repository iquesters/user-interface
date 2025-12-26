@php
if(!isset($options)){
$options = (object)([
'selectable' => false
]);
}
$medias = isset($medias) ? $medias : [];
@endphp
@push('styles')
<style>
    .dropbox__file,
    .dropbox__button,
    .dropbox__dragndrop,
    .dropbox__uploading,
    .dropbox__success,
    .dropbox__error {
        display: none;
    }

    .dropbox.has-advanced-upload {
        /* background-color: white; */
        background-color: var(--bs-body-bg);
        /* border: var(--bs-border-width) solid var(--bs-border-color); */
        border-radius: var(--bs-border-radius);
        outline: 2px dashed var(--bs-info-border-subtle);
        outline-offset: -8px;
    }

    .dropbox.has-advanced-upload .dropbox__dragndrop {
        display: block;
    }

    .dropbox.is-dragover {
        background-color: var(--bs-info-bg-subtle);
    }

    .dropbox.is-uploading .dropbox__input {
        visibility: none;
    }

    .dropbox.is-uploading .dropbox__uploading {
        display: block;
    }
</style>
@endpush
<div id="media-library" class="d-none">
    @if(!isset($options->selectable) || $options->selectable === true)
    <p>Upload new image from <a class="d-inline-block nav-link" href="{{ route('media.library') }}">Media Library</a></p>
    @endif
    <div id="grid-container" class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-4 g-2">
        @if(isset($options->selectable) && $options->selectable !== true)
        <div class="col-md-6 col-lg-6 media-dropbox-container">
            <div class="img-thumbnail h-100 d-flex align-items-center">
                <form class="dropbox h-100 w-100 d-flex align-items-center justify-contents-center" method="post" action="{{route('media.upload')}}" enctype="multipart/form-data">
                    @csrf
                    <div class="dropbox__input w-100 mx-3 text-center">
                        <input class="dropbox__file" type="file" name="media[]" id="media" data-multiple-caption="{count} files selected" multiple />
                        <label for="media" class="">
                            <a class="btn btn-sm btn-outline-secondary"> <i class="fas fa-fw fa-arrow-up-from-bracket"></i>
                                <span class="d-none d-md-inline-block">Upload new Media</span></a>
                        </label>
                        <span class="dropbox__dragndrop d-none d-md-block">or drop files here</span>
                        <button class="dropbox__button" type="submit">Upload</button>
                    </div>
                    <div class="dropbox__uploading">Uploading...</div>
                    <div class="dropbox__success">Done!</div>
                    <div class="dropbox__error">Error! <span></span>.</div>
                </form>
            </div>
        </div>
        @endif
        @foreach($medias as $media)
        <div class="col media-item-container">
            <div class="library-item img-thumbnail bg-light h-100 d-flex align-items-center justify-content-center position-relative" data-metadata="{{ json_encode($media) }}">
                @if(isset($options->selectable) && $options->selectable === true)

                @else
                <div class="dropdown position-absolute" style="top:4px;right:4px;">
                    <button class="btn btn-sm btn-secondary rounded-circle d-flex align-items-center opacity-50" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="height:24px;width:24px;">
                        <i class="fas fa-fw fa-ellipsis-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="{{ route('media.overview', $media->id) }}"><i class="far fa-fw fa-pen-to-square"></i> Edit Meta</a></li>
                        <hr class="dropdown-divider" />
                        <li><a class="dropdown-item text-danger" href="{{ route('media.destroy', $media->id) }}"><i class="far fa-fw fa-trash-can"></i> Delete</a></li>
                    </ul>
                </div>
                @endif
                <img class="img-fluid pe-none" style="max-height:150px!important;" src="{{ route('media.download', ['media_url'=>$media->media_url]) }}" alt="Media">
            </div>
        </div>
        @endforeach
    </div>
</div>
@pushonce('scripts')
<script>
    var isAdvancedUpload = function() {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }();

    var $dropboxForm = $('.dropbox');
    var $dropboxInput = $dropboxForm.find('input[type="file"]')
    if (isAdvancedUpload) {
        $dropboxForm.addClass('has-advanced-upload');

        var droppedFiles = false;

        $dropboxForm.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
            })
            .on('dragover dragenter', function() {
                $dropboxForm.addClass('is-dragover');
            })
            .on('dragleave dragend drop', function() {
                $dropboxForm.removeClass('is-dragover');
            })
            .on('drop', function(e) {
                droppedFiles = e.originalEvent.dataTransfer.files;

                if (droppedFiles) {
                    $dropboxInput.prop("files", droppedFiles);
                }

                $dropboxForm.trigger('submit');
            });
    }

    // when drag & drop is NOT supported or simply file is selected using explorer
    $dropboxInput.on('change', function(e) {
        $dropboxForm.trigger('submit');
    });
</script>
@endpushonce

@if(isset($options->selectable) && $options->selectable === true)
@pushonce('scripts')
<script>
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('library-item')) {
            event.target.classList.add("item-selected")

            Array.from(document.getElementsByClassName('library-item')).forEach(element => {
                element.classList.remove('border-3')
                element.classList.remove('border-info')
            })

            event.target.classList.add("border-3")
            event.target.classList.add("border-info")
        }
    });
</script>
@endpushonce
@endif