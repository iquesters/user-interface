@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
@endphp

<header class="sticky-top bg-primary-subtle shadow-sm" style="height: 56px;">     
    <div class="d-flex justify-content-between pe-2 align-items-center h-100">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center py-2" style="min-width: 250px">

                <div class="d-lg-none d-flex align-items-center justify-content-center" style="width: 70px">
                    @include('userinterface::components.hamburger', [
                        'classes' => ''
                    ])
                </div>

                @if(ConfProvider::from(Module::USER_INFE)->nav_style === 'header')
                    <div class="d-lg-flex d-none align-items-center justify-content-center" style="width: 70px">
                        @include('userinterface::components.hamburger', [
                            'classes' => ''
                        ])
                    </div>
                @endif

                <a href="{{ url('/') }}">
                    <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" alt="Logo" class="brand-logo-sm" style="height: 25px;">
                </a>            
                @if(config('app.debug'))
                    <div class="badge badge-deleted">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
                @endif
            </div>

            <!-- Display header nav bar based of configuration -->
            @if(ConfProvider::from(Module::USER_INFE)->nav_style === 'header')
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