function setupCustomValidation(formMeta, formElement) {
    if (!formMeta || !formMeta.fields) return;

    // Always validate on submit (default behavior)
    formElement.addEventListener('submit', e => {
        let valid = true;

        formMeta.fields.forEach(field => {
            const input = formElement.querySelector(`#${field.id}`);
            if (!input || !field.validation) return;
            if (!validateField(input, field.validation)) valid = false;
        });

        if (!valid) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

function validateField(input, validation) {
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback');
        input.parentNode.appendChild(feedback);
    }

    let errMsg = "";

    if (validation.required && !input.value) {
        errMsg = validation.errMsg?.required || "This field is required.";
    } else if (validation.minLength && input.value.length < validation.minLength) {
        errMsg = validation.errMsg?.minLength || `Minimum ${validation.minLength} characters required.`;
    } else if (validation.maxLength && input.value.length > validation.maxLength) {
        errMsg = validation.errMsg?.maxLength || `Maximum ${validation.maxLength} characters allowed.`;
    } else if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(input.value)) {
            errMsg = validation.errMsg?.pattern || "Invalid format.";
        }
    }

    if (errMsg) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        feedback.textContent = errMsg;
        feedback.style.display = 'block';
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        feedback.textContent = "";
        feedback.style.display = 'none';
        return true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll('.shoz-form');
    forms.forEach(form => {
        const formData = JSON.parse(form.dataset.formData || "{}");
        if (formData?.parent?.schema) {
            const formMeta = JSON.parse(formData.parent.schema);
            setupCustomValidation(formMeta, form);
        }
    });
});
