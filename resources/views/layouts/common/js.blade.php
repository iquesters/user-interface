<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Get all toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the associated password input (previous sibling)
                const passwordInput = this.parentNode.querySelector('input');
                
                if (passwordInput) {
                    // Toggle password visibility
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                    
                    // Toggle icon
                    const icon = this.querySelector('i');
                    icon.classList.toggle('fa-eye-slash');
                    icon.classList.toggle('fa-eye');
                }
            });
        });
    });
</script>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

<!-- Bootstrap 5 JS (includes Popper.js) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

<!-- DataTables JS -->
<script src="https://cdn.datatables.net/v/bs5/jq-3.7.0/moment-2.29.4/jszip-3.10.1/dt-2.2.2/af-2.7.0/b-3.2.2/b-colvis-3.2.2/b-html5-3.2.2/b-print-3.2.2/cr-2.0.4/date-1.5.5/fc-5.0.4/fh-4.0.1/kt-2.12.1/r-3.0.4/rg-1.5.1/rr-1.5.0/sc-2.4.3/sb-1.8.2/sp-2.3.3/sl-3.0.0/sr-1.4.1/datatables.min.js" integrity="sha384-pdpncyjMFzkxj3N8+5wWQGxGZCFzkWFpInHw4/e5Eg98sIg19W5HYwuEocBQGTtO" crossorigin="anonymous"></script>

<!-- JSON Editor -->
<script src="https://cdn.jsdelivr.net/npm/jsoneditor@10.1.0/dist/jsoneditor.min.js"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl() }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/custom-element.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/production-performance.js') }}"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/recaptcha.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/entity-utils.js') }}"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/containers.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/data-providers.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/form.js') }}"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/form-block-builder.js') }}"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/constant/input-type-constant.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/constant/style-class-constant.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/constant/html-tag-constant.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/constant/attribute-constant.js') }}"></script>

<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/form-constant.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/validation/input-field-validation.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/validation/select-validation.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/validation/datalist-validation.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/validation/textarea-validation.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/form/validation/customValidationMessage.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/table/table.js') }}"></script>
<script src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('js/modal.js') }}"></script>

<script src="{{ Iquesters\UserManagement\UserManagementServiceProvider::getJsUrl('js/password-validation.js') }}"></script>
<!-- Dynamic JavaScript inclusion ENDS -->
@stack('scripts')