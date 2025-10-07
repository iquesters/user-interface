<header class="sticky-top bg-white shadow-sm" style="height: 56px;">        
    <div class="d-flex justify-content-between px-2 align-items-center h-100">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2 align-items-center py-2" style="min-width: 242px">

                <div class="d-lg-none">
                    <button class="sidebar-toggle btn-light app-left-sidebar-toggler border-0 rounded-circle text-muted d-flex align-items-center justify-content-center" type="button" style="height: 40px; width: 40px;">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                </div>

                @if(config('userinterface.nav_style') === 'header')
                    <button class="sidebar-toggle btn-light app-left-sidebar-toggler border-0 rounded-circle text-muted d-flex align-items-center justify-content-center d-none d-lg-flex" type="button" style="height: 40px; width: 40px;">
                        <i class="fa-solid fa-bars"></i>
                    </button>
                @endif

                <a href="{{ url('/') }}">
                    <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" alt="Logo" class="brand-logo-sm" style="height: 25px;">
                </a>            
                @if(config('app.debug'))
                    <div class="text-bg-danger fw-bold px-2 py-1 rounded">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
                @endif
            </div>

            <!-- Display header nav bar based of configuration -->
            @if(config('userinterface.nav_style') === 'header')
                <div class="d-none d-lg-flex h-100">
                    <!-- Module Tabs -->
                    @include('userinterface::components.module-tabs', [
                        'installedModules' => $installedModules, 
                        'viewMode' => 'desktop'
                    ])
                </div>
            @endif
        </div>

        <div class="d-flex align-items-center justify-content-center gap-2">     
            <!-- User -->
            @include('userinterface::layouts.header.user')
            
            @if(config('app.env') === 'dev')
                @include('userinterface::layouts.dropdown-dev')
            @endif
        </div>
    </div>
</header>