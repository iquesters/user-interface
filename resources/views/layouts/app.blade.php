<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

@include('userinterface::layouts.common.head')

<body>
    {{-- <div class="d-flex">
        <div class="d-flex">
            @include('userinterface::layouts.header')
            <div class="container-fluid" style="min-height: calc(100vh - 65px);">
                <!-- Sidebar -->
                @include('userinterface::layouts.sidebar')
                <!-- Main Content -->
                <main class="main-content bg- squeeze" id="mainContent" style="min-height: calc(100vh - 56px);">
                    <!-- Session Status -->
                    @include('userinterface::layouts.common.alert')
                    @yield('content')
                </main>
            </div>
        </div>
        @include('userinterface::layouts.common.mobile-navbar')
    </div>
    @include('userinterface::layouts.common.js') --}}

    {{-- @include('utils.backdrop-loader') --}}
    <div class="ui-wrapper">
        {{-- @auth --}}
        {{-- @include('userinterface::layouts.common.mobile-navbar') --}}

        <!-- Display minibar nav bar based of configuration -->
        @if(config('userinterface.nav_style') === 'minibar')
            @include('userinterface::layouts.common.minibar')
        @endif
        {{-- @endif --}}
        <div class="ui-main">
            @include('userinterface::components.admin-bar')
            @include('userinterface::layouts.header')
            <div class="ui-workarea gap-1">
                <div id="ui-sidebar" class="ui-sidebar animate-all rounded">
                    <div class="ui-sidebar-content list-group h-100 w-100">
                        @include('userinterface::layouts.sidebar')
                    </div>
                </div>
                <div class="ui-content animate-all bg-white" id="mainContent">
                    @include('userinterface::layouts.common.alert')
                    {{-- @auth --}}
                    <div class="row row-cols-1 p-2 g-2">
                        <div class="col col-md-12">
                            {{-- @stack('content') --}}
                            @yield('content')
                        </div>
                        <!-- <div class="col col-md-3 d-none d-md-block"> -->
                        {{-- <div class="col col-md-3">
                            @include('userinterface::layouts.common.alert')
                        </div> --}}
                    </div>
                    {{-- @else
                    @stack('content')
                    @endauth --}}
                </div>
            </div>
            @include('userinterface::layouts.common.modal')
            {{-- @include('layouts.common.footer') --}}
        </div>
        <!-- <div class="ui-minibar">
            <a class="btn toggle-btn">
                <i class="far fa-fw fa-comment"></i>
            </a>
        </div> -->
        @include('userinterface::layouts.common.mobile-navbar')
    </div>
    @include('userinterface::layouts.common.js')
</body>
</html>