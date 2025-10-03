<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@if(View::hasSection('title')) @yield('title') - @endif{{ config('app.name', 'iquesters') }}</title>
    <link rel="icon" type="image/x-icon" href="{{ route('userinterface.asset', ['path' => 'img/favicon.png']) }}">

    @include('userinterface::layouts.common.css')
</head>