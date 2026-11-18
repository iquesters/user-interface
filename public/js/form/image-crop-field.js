/**
 * Crop for schema file fields: { "type": "file", "crop": { "aspectRatio": 1 } }.
 *
 * After an image is chosen, it is shown with a crop box (drag to move, drag
 * the corner to resize; mouse and touch; ratio kept). The cropped area is
 * what gets submitted: getSerializedFieldValue() sends input.__croppedFile,
 * and the submit handler waits for input.__cropPromise first.
 */
function attachImageCrop(input, field, container) {
    const ratio = Number(field?.crop?.aspectRatio) > 0 ? Number(field.crop.aspectRatio) : 1;
    const maxOutput = Number(field?.crop?.maxSize) > 0 ? Number(field.crop.maxSize) : 1024;

    const stage = document.createElement('div');
    stage.className = 'lab-crop-stage position-relative d-none mt-2 mx-auto';
    stage.style.maxWidth = '100%';
    stage.style.width = 'fit-content';
    stage.style.touchAction = 'none';
    stage.style.userSelect = 'none';

    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '320px';
    stage.appendChild(img);

    const box = document.createElement('div');
    box.className = 'lab-crop-box position-absolute';
    box.style.cssText += 'border:2px solid #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.5);cursor:move;';
    stage.appendChild(box);

    const handle = document.createElement('div');
    handle.className = 'lab-crop-handle position-absolute';
    // Inside the box, so it stays fully visible (and easy to grab) when the box fills the image.
    handle.style.cssText = 'width:22px;height:22px;right:2px;bottom:2px;background:#fff;border:2px solid #0d6efd;border-radius:50%;cursor:nwse-resize;';
    box.appendChild(handle);

    const hint = document.createElement('div');
    hint.className = 'form-text small text-center d-none';
    hint.textContent = 'Drag the box to choose the area; drag its corner to resize.';

    container.appendChild(stage);
    container.appendChild(hint);
    stage.style.overflow = 'hidden';

    // Crop box in displayed pixels.
    let crop = { x: 0, y: 0, w: 0, h: 0 };
    let drag = null;

    const display = () => ({ w: img.clientWidth, h: img.clientHeight });

    function layout() {
        box.style.left = `${crop.x}px`;
        box.style.top = `${crop.y}px`;
        box.style.width = `${crop.w}px`;
        box.style.height = `${crop.h}px`;
    }

    function resetCrop() {
        const { w, h } = display();
        // Largest box of the ratio that fits, centred.
        let cw = w;
        let ch = cw / ratio;
        if (ch > h) {
            ch = h;
            cw = ch * ratio;
        }
        crop = { x: (w - cw) / 2, y: (h - ch) / 2, w: cw, h: ch };
        layout();
        scheduleRender();
    }

    function clamp() {
        const { w, h } = display();
        crop.w = Math.min(crop.w, w);
        crop.h = crop.w / ratio;
        if (crop.h > h) {
            crop.h = h;
            crop.w = crop.h * ratio;
        }
        crop.x = Math.max(0, Math.min(crop.x, w - crop.w));
        crop.y = Math.max(0, Math.min(crop.y, h - crop.h));
    }

    function point(event) {
        const rect = stage.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    box.addEventListener('pointerdown', event => {
        event.preventDefault();
        const p = point(event);
        drag = { mode: event.target === handle ? 'resize' : 'move', start: p, from: { ...crop } };
        box.setPointerCapture(event.pointerId);
    });

    box.addEventListener('pointermove', event => {
        if (!drag) return;
        const p = point(event);
        const dx = p.x - drag.start.x;
        const dy = p.y - drag.start.y;

        if (drag.mode === 'move') {
            crop.x = drag.from.x + dx;
            crop.y = drag.from.y + dy;
        } else {
            const size = Math.max(40, drag.from.w + Math.max(dx, dy * ratio));
            crop.w = size;
            crop.h = size / ratio;
            crop.x = drag.from.x;
            crop.y = drag.from.y;
        }

        clamp();
        layout();
    });

    const endDrag = () => {
        if (!drag) return;
        drag = null;
        scheduleRender();
    };
    box.addEventListener('pointerup', endDrag);
    box.addEventListener('pointercancel', endDrag);

    // Produce the cropped File (async); the submit waits for input.__cropPromise.
    function scheduleRender() {
        input.__cropPromise = new Promise(resolve => {
            requestAnimationFrame(() => {
                const scale = img.naturalWidth / img.clientWidth;
                const sw = Math.round(crop.w * scale);
                const sh = Math.round(crop.h * scale);
                const outW = Math.min(sw, maxOutput);
                const outH = Math.round(outW / ratio);

                const canvas = document.createElement('canvas');
                canvas.width = outW;
                canvas.height = outH;
                canvas.getContext('2d').drawImage(img, Math.round(crop.x * scale), Math.round(crop.y * scale), sw, sh, 0, 0, outW, outH);

                canvas.toBlob(blob => {
                    const name = (input.__originalName || 'image').replace(/\.[^.]+$/, '') + '.png';
                    input.__croppedFile = blob ? new File([blob], name, { type: 'image/png' }) : null;
                    resolve(input.__croppedFile);
                }, 'image/png');
            });
        });
    }

    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        input.__croppedFile = null;
        input.__cropPromise = null;

        if (!file || !file.type.startsWith('image/')) {
            stage.classList.add('d-none');
            hint.classList.add('d-none');
            return;
        }

        input.__originalName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
            img.onload = () => {
                stage.classList.remove('d-none');
                hint.classList.remove('d-none');
                requestAnimationFrame(resetCrop);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

/** Wait until every cropped image in the form is ready (before serializing). */
async function waitForImageCrops(form) {
    const pending = Array.from(form.querySelectorAll('input[type="file"]'))
        .map(input => input.__cropPromise)
        .filter(Boolean);

    await Promise.all(pending);
}
