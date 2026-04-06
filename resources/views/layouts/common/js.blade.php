<script>
    @php
        $uiConf = \Iquesters\Foundation\Support\ConfProvider::from(\Iquesters\Foundation\Enums\Module::USER_INFE);
        $uiSnackbarConf = $uiConf->snackbar_conf;
    @endphp

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

    // -----------------------------
    // Global variables for JS
    // -----------------------------

    // Store the Laravel route URL to send the timezone to
    window.TIMEZONE_STORE_URL = "{{ route('timezone.store') }}";

    // Store the CSRF token from Laravel for secure POST requests
    window.CSRF_TOKEN = "{{ csrf_token() }}";

    window.USER_INTERFACE_CONFIG = window.USER_INTERFACE_CONFIG || {};
    window.USER_INTERFACE_CONFIG.snackbar = {
        position: @json($uiSnackbarConf->position ?? 'bottom-right'),
        duration: @json($uiSnackbarConf->duration ?? 3000),
        stackMode: @json($uiSnackbarConf->stack_mode ?? 'stack'),
        maxVisible: @json($uiSnackbarConf->max_visible ?? 4),
        allowDismiss: @json($uiSnackbarConf->allow_dismiss ?? true),
        variant: @json($uiSnackbarConf->variant ?? 'light'),
        bgClass: @json($uiSnackbarConf->bg_class ?? ''),
        textClass: @json($uiSnackbarConf->text_class ?? ''),
        borderClass: @json($uiSnackbarConf->border_class ?? ''),
        shadowClass: @json($uiSnackbarConf->shadow_class ?? 'shadow'),
        toastClass: @json($uiSnackbarConf->toast_class ?? ''),
        bodyClass: @json($uiSnackbarConf->body_class ?? ''),
        closeButtonClass: @json($uiSnackbarConf->close_button_class ?? ''),
    };

    // Temporary compatibility alias for existing code paths.
    window.UI_SNACKBAR_CONFIG = window.USER_INTERFACE_CONFIG.snackbar;
</script>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

<!-- Bootstrap 5 JS (includes Popper.js) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>

<!-- DataTables JS -->
<script src="https://cdn.datatables.net/v/bs5/jq-3.7.0/moment-2.29.4/jszip-3.10.1/dt-2.2.2/af-2.7.0/b-3.2.2/b-colvis-3.2.2/b-html5-3.2.2/b-print-3.2.2/cr-2.0.4/date-1.5.5/fc-5.0.4/fh-4.0.1/kt-2.12.1/r-3.0.4/rg-1.5.1/rr-1.5.0/sc-2.4.3/sb-1.8.2/sp-2.3.3/sl-3.0.0/sr-1.4.1/datatables.min.js" integrity="sha384-pdpncyjMFzkxj3N8+5wWQGxGZCFzkWFpInHw4/e5Eg98sIg19W5HYwuEocBQGTtO" crossorigin="anonymous"></script>

<!-- JSON Editor -->
<script src="https://cdn.jsdelivr.net/npm/jsoneditor@10.1.0/dist/jsoneditor.min.js"></script>

@foreach(\Iquesters\UserInterface\UserInterfaceServiceProvider::getJsAssets() as $asset)
    <script
        src="{{ \Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl($asset['path']) }}"
        @if(str_contains($asset['path'], '.defer.')) defer @endif
    ></script>
@endforeach


<!-- Reverb WebSocket Client -->
    <script>
        // Configuration from PHP to JavaScript
        window.REVERB_CONFIG = {
            host: '{{ env("REVERB_HOST", "127.0.0.1") }}',
            port: '{{ env("REVERB_PORT", 6001) }}',
            scheme: '{{ env("REVERB_SCHEME", "http") }}',
            appKey: '{{ env("REVERB_APP_KEY", "reverb_key") }}',
            appId: '{{ env("REVERB_APP_ID", "1") }}',
            userId: '{{ auth()->id() ?? "anonymous" }}'
        };
        
        console.log('⚙️ Reverb Configuration:', window.REVERB_CONFIG);
    </script>

     <!-- Initialize Reverb -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Reverb client
            window.reverb = new ReverbClient(window.REVERB_CONFIG);
            
            // Connect to Reverb
            console.log('🚀 Initializing Reverb connection...');
            window.reverb.connect();
            
            // Handle connection events
            window.reverb.on('connected', function() {
                console.log('✅ Reverb client is connected');
                // You can subscribe to channels here if needed
            });
            
            window.reverb.on('disconnected', function(data) {
                console.log('🔌 Reverb client disconnected:', data);
            });
            
            window.reverb.on('error', function(error) {
                console.error('❌ Reverb error:', error);
            });
            
            // Disconnect when page unloads
            window.addEventListener('beforeunload', function() {
                if (window.reverb) {
                    window.reverb.disconnect();
                }
            });
        });
    </script>
<!-- Dynamic JavaScript inclusion ENDS -->
@stack('scripts')
