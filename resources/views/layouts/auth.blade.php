<!DOCTYPE html>
<html lang="en">
<head>
    @include('userinterface::layouts.common.head', ['isAuth' => true])
</head>
<body>
    <!-- Main Content -->
    <main>
        <div class="w-100 d-flex align-items-center justify-content-center px-4" style="min-height: 100vh;">
            <div class="row justify-content-md-center w-100">
                {{-- Pages showing a single form narrow this via @section('auth-card-class') --}}
                <div class="@yield('auth-card-class', 'col-md-8') d-flex flex-column justify-content-center align-items-center card shadow-lg rounded-4 p-4">
                    
                    <!-- Logo (now responsive) -->
                    <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" 
                         class="img-fluid mb-4" 
                         alt="Logo" 
                         style="max-width: 200px; width: 100%;">

                    @yield('content')
                </div>
            </div>
        </div>
    </main>

    @include('userinterface::layouts.common.snackbar')
    @include('userinterface::layouts.common.js', ['isAuth' => true])

    {{-- Flashed messages from a plain redirect (e.g. Google login error, setup done)
         show as a toast, same as form submissions. --}}
    @php
        $flashToasts = array_filter([
            'info' => session('status'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
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
</body>
</html>