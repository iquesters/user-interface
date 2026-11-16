<script>
    @php
        $uiConf = \Iquesters\Foundation\Support\ConfProvider::from(\Iquesters\Foundation\Enums\Module::USER_INFE);
        $uiSnackbarConf = $uiConf->snackbar_conf;
    @endphp

    // Event delegation so toggle-password buttons added after page load
    // (e.g. schema-rendered forms, which insert their fields asynchronously)
    // still work, not just ones present at DOMContentLoaded.
    document.addEventListener('click', function(event) {
        const button = event.target.closest('.toggle-password');
        if (!button) {
            return;
        }

        const passwordInput = button.parentNode.querySelector('input');

        if (passwordInput) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye-slash');
                icon.classList.toggle('fa-eye');
            }
        }
    });

    // -----------------------------
    // Global variables for JS
    // -----------------------------

    // Store the Laravel route URL to send the timezone to
    window.TIMEZONE_STORE_URL = "{{ route('timezone.store') }}";

    // Store the CSRF token from Laravel for secure POST requests
    window.CSRF_TOKEN = "{{ csrf_token() }}";

    window.USER_INTERFACE_CONFIG = window.USER_INTERFACE_CONFIG || {};

    // Debug logging for the module JS (window.uiDebug?.(...)): only with APP_DEBUG,
    // so production consoles stay clean. console.warn/error are always shown.
    window.USER_INTERFACE_CONFIG.debug = @json((bool) config('app.debug'));
    window.uiDebug = (...args) => {
        if (window.USER_INTERFACE_CONFIG?.debug) {
            console.log(...args);
        }
    };

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

{{-- Third-party JS (jQuery, Bootstrap, + DataTables/JSON Editor outside auth pages):
     self-hosted or CDN per the vendor_assets setting (Support\VendorLibraries). --}}
{!! \Iquesters\UserInterface\Support\VendorLibraries::scripts(isAuthPage: ! empty($isAuth)) !!}

{{-- The module's own scripts: one bundled file (npm run build) when APP_DEBUG is off,
     the individual files while debugging. --}}
@if ($jsBundleUrl = \Iquesters\UserInterface\Support\Assets::jsBundleUrl())
    <script src="{{ $jsBundleUrl }}"></script>
@else
    @foreach(\Iquesters\UserInterface\UserInterfaceServiceProvider::getJsAssets() as $asset)
        <script
            src="{{ \Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl($asset['path']) }}"
            @if(str_contains($asset['path'], '.defer.')) defer @endif
        ></script>
    @endforeach
@endif


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
        
        window.uiDebug?.('⚙️ Reverb Configuration:', window.REVERB_CONFIG);
    </script>

     <!-- Initialize Reverb -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Reverb client
            window.reverb = new ReverbClient(window.REVERB_CONFIG);
            
            // Connect to Reverb
            window.uiDebug?.('🚀 Initializing Reverb connection...');
            window.reverb.connect();
            
            // Handle connection events
            window.reverb.on('connected', function() {
                window.uiDebug?.('✅ Reverb client is connected');
                // You can subscribe to channels here if needed
            });
            
            window.reverb.on('disconnected', function(data) {
                window.uiDebug?.('🔌 Reverb client disconnected:', data);
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
