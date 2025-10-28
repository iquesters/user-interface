/**
 * Generic reCAPTCHA handler for all forms
 * Usage: add `data-recaptcha-action="login"` attribute to the form
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof grecaptcha === "undefined") return;

    const forms = document.querySelectorAll('[data-recaptcha-action]');

    forms.forEach(form => {
        const action = form.dataset.recaptchaAction;
        const submitButton = form.querySelector('[type="submit"]');
        const errorDiv = form.querySelector('#recaptcha-client-error');

        if (!submitButton) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

            grecaptcha.ready(function () {
                grecaptcha.execute(window.recaptchaSiteKey, { action: action })
                    .then(function (token) {
                        const hiddenInput = form.querySelector('input[name="recaptcha_token"]');
                        if (hiddenInput) hiddenInput.value = token;
                        form.submit();
                    })
                    .catch(function () {
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalText;

                        if (errorDiv) {
                            errorDiv.textContent = 'Security verification failed. Please try again.';
                            errorDiv.classList.remove('d-none');
                        }
                    });
            });
        });
    });
});