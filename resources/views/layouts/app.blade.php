<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

@include('userinterface::layouts.common.head')

<body>
    @include('userinterface::layouts.header')
    <div class="container-fluid" style="min-height: calc(100vh - 65px);">
        <!-- Sidebar -->
        @include('userinterface::layouts.sidebar')
        <!-- Main Content -->
        <main class="main-content bg- squeeze" id="mainContent">
            <!-- Session Status -->
            @include('userinterface::layouts.common.alert')
            @yield('content')
        </main>
    </div>
    @include('userinterface::layouts.common.js')
</body>
</html>