@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\UserManagement\UserManagementServiceProvider;
@endphp

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @auth
        <meta name="sanctum-token" content="{{ Iquesters\UserManagement\Helpers\LoginHelper::get_sanctum_token(auth()->user()) }}">
    @endauth

    <title>
        @hasSection('title')
            @yield('title') -
        @endif
        {{ config('app.name', 'iquesters') }}
    </title>

    <link rel="icon" type="image/x-icon" href="{{ route('userinterface.asset', ['path' => 'img/favicon.png']) }}">

    {{-- ✅ Only load reCAPTCHA when on auth layout --}}
    @if (!empty($isAuth) && class_exists(UserManagementServiceProvider::class))
        @php
            $recaptcha = ConfProvider::from(Module::USER_MGMT)->recaptcha ?? null;
        @endphp

        @if ($recaptcha?->enabled)
            <script>
                window.recaptchaSiteKey = '{{ $recaptcha->site_key }}';
            </script>
            <script src="https://www.google.com/recaptcha/api.js?render={{ $recaptcha->site_key }}"></script>
        @endif
    @endif

    @include('userinterface::layouts.common.css')
</head>