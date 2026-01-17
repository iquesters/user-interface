<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

@include('userinterface::layouts.common.head')

@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
@endphp

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
        @if (ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar')
            @include('userinterface::layouts.common.minibar')
        @endif

        <div class="ui-main">
            @include('userinterface::components.admin-bar')
            @include('userinterface::layouts.header')
            <div class="ui-workarea gap-1">
                {{-- <div id="ui-sidebar" class=" animate-all rounded"> --}}
                    @include('userinterface::layouts.sidebar')
                {{-- </div> --}}
                <div class="ui-content animate-all" id="mainContent">
                    @include('userinterface::layouts.common.alert')
                    {{-- @auth --}}
                    
                    <div class="row row-cols-1 p-1 g-2">
                        <div class="col col-md-12">
                            <div class="position-sticky p-2 bg-white ps-3 breadcrumbs">
                            @if(Breadcrumbs::exists())
                            {{ Breadcrumbs::render() }}
                            @endif
                        </div>
                            {{-- Tabs (optional) --}}
                            @includeWhen(isset($tabs) && is_array($tabs), 'userinterface::layouts.common.tabs')

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