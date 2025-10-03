<header class="sticky-top bg-white p-2 shadow-sm" style="max-height: 65px;">        
    <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex gap-2 align-items-center">
            <button class="btn-light app-left-sidebar-toggler border-0 rounded-circle text-muted d-flex align-items-center justify-content-center" type="button" id="sidebarToggle" style="height: 40px; width: 40px;">
                <i class="fa-solid fa-bars"></i>
            </button>
            <a href="{{ url('/') }}">
                <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" alt="Logo" class="brand-logo-sm" style="height: 25px;">
            </a>            
            @if(config('app.debug'))
                <div class="text-bg-danger fw-bold px-2 py-1 rounded">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
            @endif

            <!-- Module Tabs -->
            @include('userinterface::layouts.header.module-tab')
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
