{{-- Flashed messages (redirect()->with('success'|'error'|'warning'|'info'|'status'))
     show as a toast, the same as on the auth pages. Included more than once by
     the app layout, so it renders once. --}}
@once
    @php
        $flashToasts = array_filter([
            'info' => session('status') ?? session('info'),
            'success' => session('success'),
            'warning' => session('warning'),
            'error' => session('error'),
        ], fn ($message) => is_string($message) && $message !== '');
    @endphp
    @if ($flashToasts)
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                if (typeof window.showSnackbar !== 'function') {
                    return;
                }
                @foreach ($flashToasts as $type => $message)
                    window.showSnackbar(@json(__($message)), @json($type));
                @endforeach
            });
        </script>
    @endif
@endonce
