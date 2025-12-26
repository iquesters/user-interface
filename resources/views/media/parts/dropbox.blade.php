<?php 
$optionsCrop = (object)array(
    'img' => (object)array(
        'id' => 'cropImage',
        'src' => null,
        'alt' => 'Image',
        'width' => '100%',
        'class' => 'rounded',
        'container_class' => '',
        'aspect_ratio' => ''
    ),
);
?>

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

    .dropbox {
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
    }


    #resize-handle {
        width: 12px;
        height: 12px;
        background: red;
        position: absolute;
        right: -6px;
        bottom: -6px;
        cursor: se-resize;
        border-radius: 50%;
    }
</style>
@endpush


<div id = "media-dropbox" class="d-none">

    <div id="headerStep2" class="d-none topButton"> 
        <!-- Back Icon -->
        <button id="backBtn" 
            class="btn btn-light btn-sm"
            style="position: absolute; top: 10px; left: 80px; z-index: 999;">
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <h5 class="mb-0 mt-1 text-center">Crop and rotate</h5>

        <!-- Undo Icon -->
        <button id="undoBtn" 
            class="btn btn-light btn-sm"
            style="position: absolute; top: 10px; right: 80px; z-index: 999;">
            <i class="fa-solid fa-rotate-left"></i>
        </button>
    </div>

    <div id="headerStep3" class="d-none">
        <!-- Back Icon -->
        <button id="backBtn2" 
            class="btn btn-light btn-sm"
            style="position: absolute; top: 10px; left: 80px; z-index: 999;">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h5 class="mb-0 mt-1 text-center">Cropped Preview</h5>
    </div>

    <div id="uploadMediaSection" class="col-md-6 col-lg-6 media-dropbox-container d-flex justify-content-center align-items-center w-100">
        <div class="img-thumbnail h-100 d-flex align-items-center row" style="width: 70%">
            <div class="col-md-6">
                <form class="dropbox h-100 w-100 d-flex align-items-center justify-contents-center"
                    {{-- method="post" --}}
                    {{-- action="{{ route('media.upload') }}" --}}
                    enctype="multipart/form-data">
                    @csrf
                    <div class="dropbox__input w-100 mx-3 text-center">
                        <input class="dropbox__file" type="file" name="media[]" 
                            id="modal-media-upload" data-multiple-caption="{count} files selected" accept="image/*" multiple />
                        <label for="modal-media-upload">
                            <a class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-fw fa-arrow-up-from-bracket"></i>
                                <span class="d-none d-md-inline-block">Upload new Media</span>
                            </a>
                        </label>
                        <span class="dropbox__dragndrop d-none d-md-block">or drop files here</span>
                        <button class="dropbox__button" type="submit">Upload</button>
                    </div>

                    <div class="dropbox__uploading">Uploading...</div>
                    <div class="dropbox__success">Done!</div>
                    <div class="dropbox__error">Error! <span></span>.</div>

                </form>
            </div>


            <!-- Open Camera -->
            <div class="col-md-6 text-center p-3">
                {{-- <h6>Take Photo</h6> --}}

                <form method="post" action="{{ route('media.upload') }}" enctype="multipart/form-data">
                    @csrf

                    <input type="file" 
                        name="media[]" 
                        accept="image/*" 
                        capture="environment" 
                        id="cameraInput"
                        class="d-none">

                    <label for="cameraInput">
                        <a class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-camera fa-arrow-up-from-bracket"></i>
                            <span class="d-none d-md-inline-block">Take a picture</span> 
                        </a>
                    </label>
                </form>

                <div class="mt-3">
                    <video id="liveCamera" autoplay playsinline 
                        style="width:100%;border:1px solid #ccc;border-radius:8px; display:none;">
                    </video>

                    <button id="captureFromCamera" 
                            class="btn btn-primary btn-sm mt-2"
                            style="display:none;">
                        Capture
                    </button>
                </div>
            </div>


        </div>
    </div>

    
    {{-- Image Preview and Crop Area --}}
    <div id="image-container" style="position: relative; display: none;">
        
        <div id="imageWrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            {{-- <img id="image" src="" alt="" style="max-width: 100%; display: block;"> --}}
           <div id="imageContainer" style="width:400px;height:400px;">
                @include('userinterface::utils.image', ['options' => $optionsCrop])
            </div>
             <!-- Rotate Button (Crop Button) -->
            <button id="rotateBtn" class="btn btn-outline-dark btn-sm mt-2" style="display: none;">
                <i class="fa-solid fa-rotate-right"></i> Rotate
            </button>
            <!-- Put crop button below image -->
            <button id="cropBtn" class="btn btn-outline-primary btn-sm mt-5" style="display: none;">
                Next
            </button>
        </div>

        <div id="crop-area" 
            style="position: absolute; border: 2px dashed red; background-color: rgba(255,0,0,0.15); cursor: move; display: none;">
            <div id="resize-handle"></div>
        </div>
    </div>

    {{-- Cropped Image Preview --}}
    <div id="cropImgPreview" class="text-center w-100">
        <canvas id="canvas" class="mx-auto" style="display:none"></canvas>
        {{-- <button id="saveBtn" class="btn btn-success btn-sm mt-2 d-none">Save Cropped Image</button> --}}
    </div>
    

</div>


@pushonce('scripts')
<script>
// // ---- Crop UI variables and initial values ----
const imageContainer = document.getElementById('image-container');
const image = document.getElementById('cropImage');
const cropArea = document.getElementById('crop-area');
const resizeHandle = document.getElementById('resize-handle');
const cropBtn = document.getElementById('cropBtn');
const rotateBtn = document.getElementById('rotateBtn');
const canvas = document.getElementById('canvas');
// const saveBtn = document.getElementById('saveBtn');

let startX, startY, isDragging = false, isResizing = false;
let cropX = 50, cropY = 50, cropWidth = 100, cropHeight = 100;

const cameraInput = document.getElementById("cameraInput");
const video = document.getElementById("liveCamera");
const captureBtn = document.getElementById("captureFromCamera");

let initialCrop = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
};

// Dropzone Initialization
function initDropzones() {
    $('.dropbox').each(function () {
        setupSingleDropzone($(this));
    });
}

function setupSingleDropzone($form) {
    const $input = $form.find('input[type="file"]');

    if (!isAdvancedUploadSupported()) return;
    $form.addClass('has-advanced-upload');

    $form.on('drag dragstart dragend dragover dragenter dragleave drop', stopDragDefaults);
    $form.on('dragover dragenter', () => $form.addClass('is-dragover'));
    $form.on('dragleave dragend drop', () => $form.removeClass('is-dragover'));

    $form.on('drop', function (e) {
        handleFileDrop(e, $input);
    });
}

function isAdvancedUploadSupported() {
    const div = document.createElement('div');
    return (
        ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
        'FormData' in window &&
        'FileReader' in window
    );
}

function stopDragDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFileDrop(e, $input) {
    const dt = e.originalEvent.dataTransfer;
    if (!dt || dt.files.length === 0) return;

    const file = dt.files[0];
    if (!file.type.startsWith('image/')) return;

    try { $input[0].files = dt.files; } catch {}

    readImageFile(file, showImageForCropping);
}

// File Reader
function readImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (ev) => callback(ev.target.result);
    reader.readAsDataURL(file);
}

// Setup Crop UI
function showImageForCropping(src) {
    image.src = src;

    image.onload = () => {
        prepareCropUI();
        resetCropBox();
    };
}

function prepareCropUI() {
    // document.getElementById('shozModalHeader').style.display = "none";
    document.getElementById('uploadMediaSection').classList.add("d-none");

    // document.getElementById("headerStep1").classList.add("d-none");
    document.getElementById("headerStep2").classList.remove("d-none");
    document.getElementById("headerStep3").classList.add("d-none");


    imageContainer.style.display = "flex";
    imageContainer.style.justifyContent = "center";
    imageContainer.style.alignItems = "center";

    cropBtn.style.display = "inline-block";
    rotateBtn.style.display = "inline-block";
    canvas.style.display = "none";

    document.getElementById("backBtn").onclick = goBackStepUploadArea;
    document.getElementById('undoBtn').onclick = undoCrop;
}

function resetCropBox() {
    cropWidth = Math.max(100, image.width / 3);
    cropHeight = Math.max(100, image.height / 3);

    cropX = (image.width - cropWidth) / 2;
    cropY = (image.height - cropHeight) / 2;

    initialCrop = {
        x: cropX,
        y: cropY,
        w: cropWidth,
        h: cropHeight
    };

    updateCropAreaUI();
}

function updateCropAreaUI() {
    const imgRect = image.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    // cropArea should be positioned relative to image (not container)
    cropArea.style.left = (imgRect.left - containerRect.left + cropX) + "px";
    cropArea.style.top  = (imgRect.top - containerRect.top + cropY) + "px";

    cropArea.style.width = cropWidth + "px";
    cropArea.style.height = cropHeight + "px";
    cropArea.style.display = "block";
    cropArea.style.zIndex = 10;
}


// Crop Area Drag + Resize
function enableCropDragging() {
    cropArea.addEventListener('mousedown', startDragCrop);
    resizeHandle.addEventListener('mousedown', startResizeCrop);

    document.addEventListener('mousemove', cropMouseMove);
    document.addEventListener('mouseup', stopCropActions);
}

function startDragCrop(e) {
    if (e.target === resizeHandle) return;

    isDragging = true;
    // startX = e.clientX - cropArea.offsetLeft;
    // startY = e.clientY - cropArea.offsetTop;
    const rect = cropArea.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    document.body.style.userSelect = "none";
}

function startResizeCrop(e) {
    e.stopPropagation();
    isResizing = true;
}

function cropMouseMove(e) {
    if (isDragging) dragCrop(e);
    if (isResizing) resizeCrop(e);
}

function dragCrop(e) {
    const imgRect = image.getBoundingClientRect();

    let newX = e.clientX - imgRect.left - startX;
    let newY = e.clientY - imgRect.top - startY;

    newX = Math.max(0, Math.min(newX, imgRect.width - cropWidth));
    newY = Math.max(0, Math.min(newY, imgRect.height - cropHeight));

    cropX = newX;
    cropY = newY;

    updateCropAreaUI();
}


function resizeCrop(e) {
    const imgRect = image.getBoundingClientRect();

    const maxWidth  = imgRect.width  - cropX;
    const maxHeight = imgRect.height - cropY;

    const newW = e.clientX - cropArea.getBoundingClientRect().left;
    const newH = e.clientY - cropArea.getBoundingClientRect().top;

    cropWidth  = Math.max(50, Math.min(newW, maxWidth));
    cropHeight = Math.max(50, Math.min(newH, maxHeight));

    updateCropAreaUI();
}



function stopCropActions() {
    isDragging = false;
    isResizing = false;
    document.body.style.userSelect = "";
}


// Cropping
function cropImage() {
    if (!image.src) return;

    const img = new Image();
    img.src = image.src;

    img.onload = () => drawCroppedImage(img);
}

function drawCroppedImage(img) {
    const scaleX = img.naturalWidth / image.width;
    const scaleY = img.naturalHeight / image.height;

    // canvas.width = cropWidth * scaleX;
    // canvas.height = cropHeight * scaleY;

    [canvas.width, canvas.height] = (cropWidth * scaleX > 400 || cropHeight * scaleY > 400)
    ? [cropWidth * scaleX, cropHeight * scaleY].map(v => v * (400 / Math.max(cropWidth * scaleX, cropHeight * scaleY)))
    : [cropWidth * scaleX, cropHeight * scaleY];

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        img,
        cropX * scaleX,
        cropY * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
        0, 0,
        canvas.width, canvas.height
    );

    showCropResult();
}

function showCropResult() {
    canvas.style.display = "block";
    // document.getElementById("saveBtn").classList.remove("d-none");
    // document.getElementById("headerStep1").classList.add("d-none");
    document.getElementById("headerStep2").classList.add("d-none");
    document.getElementById("headerStep3").classList.remove("d-none");
    imageContainer.style.display = "none";
    
    document.getElementById("backBtn2").onclick = goBackStepCropArea;
}


// Save Cropped Image
function saveCroppedImage() {
    canvas.toBlob(function (blob) {
        const form = buildUploadForm(blob);
        document.body.appendChild(form);
        form.submit();
    }, 'image/png');
}

function buildUploadForm(blob) {
    let form = document.createElement('form');
    form.method = "POST";
    form.action = "{{ route('media.upload') }}";
    form.enctype = "multipart/form-data";

    form.appendChild(hiddenInput("_token", "{{ csrf_token() }}"));
    form.appendChild(buildFileInput(blob));

    return form;
}

function hiddenInput(name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    return input;
}

function buildFileInput(blob) {
    const input = document.createElement("input");
    input.type = "file";
    input.name = "media[]";

    const dt = new DataTransfer();
    dt.items.add(new File([blob], "cropped.png", { type: "image/png" }));
    input.files = dt.files;

    return input;
}

// Camera Functions
function initCamera() {
    document.querySelector('label[for="cameraInput"]').addEventListener("click", openCameraModal);
    captureBtn.addEventListener("click", capturePhoto);
}

function openCameraModal(e) {
    e.preventDefault();
    video.style.display = "block";
    captureBtn.style.display = "inline-block";
    openCameraStream();
}

async function openCameraStream() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Camera not available: " + err);
    }
}

function capturePhoto() {
    const capCanvas = document.createElement("canvas");
    capCanvas.width = video.videoWidth;
    capCanvas.height = video.videoHeight;

    capCanvas.getContext("2d").drawImage(video, 0, 0);
    showImageForCropping(capCanvas.toDataURL("image/jpeg"));
}


// Rotation functionality
// function initRotation() {
//     let rotation = 0;
//     rotateBtn.addEventListener("click", () => {
//         rotation = (rotation + 90) % 360;
//         image.style.transform = `rotate(${rotation}deg)`;
//     });
// }
function initRotation() {
    let rotation = 0;
    rotateBtn.addEventListener("click", () => {
        rotation = (rotation + 90) % 360;

        // Create temporary canvas
        const offCanvas = document.createElement('canvas');
        const ctx = offCanvas.getContext('2d');

        // Swap width/height for 90° or 270°
        if (rotation % 180 !== 0) {
            offCanvas.width = image.naturalHeight;
            offCanvas.height = image.naturalWidth;
        } else {
            offCanvas.width = image.naturalWidth;
            offCanvas.height = image.naturalHeight;
        }

        // Rotate around center
        ctx.translate(offCanvas.width / 2, offCanvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(
            image,
            -image.naturalWidth / 2,
            -image.naturalHeight / 2
        );

        // Update image source with rotated image
        image.src = offCanvas.toDataURL();

        
        image.style.height = "400px";
        image.style.width = "400px";
        image.style.objectFit = "contain";
        // Reset CSS transform
        image.style.transform = '';
    });
}



// Init All Functions on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    initDropzones();
    enableCropDragging();
    initCamera();
    initRotation();

    cropBtn.addEventListener("click", cropImage);
    // saveBtn.addEventListener("click", saveCroppedImage);

    document.getElementById('modal-media-upload')
        .addEventListener('change', function () {
            readImageFile(this.files[0], showImageForCropping);
        });
});

//Back button functionality
function goBackStepUploadArea() {
    imageContainer.style.display = "none";
    document.getElementById("uploadMediaSection").classList.remove("d-none");

    // document.getElementById("headerStep1").classList.remove("d-none");
    document.getElementById("headerStep2").classList.add("d-none");
    document.getElementById("headerStep3").classList.add("d-none");

    cropArea.style.display = "none";
    canvas.style.display = "none";
}

function goBackStepCropArea() {
    canvas.style.display = "none";
    // saveBtn.classList.add("d-none");

    imageContainer.style.display = "flex";
    cropArea.style.display = "block";

    // Header toggle
    // document.getElementById("headerStep1").classList.add("d-none");
    document.getElementById("headerStep2").classList.remove("d-none");
    document.getElementById("headerStep3").classList.add("d-none");
}

//Undo functionality
function undoCrop() {
    cropX = initialCrop.x;
    cropY = initialCrop.y;
    cropWidth = initialCrop.w;
    cropHeight = initialCrop.h;

    updateCropAreaUI();
}



</script>
@endpushonce


