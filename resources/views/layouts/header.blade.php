@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    
    // Define options for the logo image
    $logoOptions = (object)array(
        'img' => (object)array(
            'id' => 'header-brand-logo',
            'src' => Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl(),
            'alt' => 'Logo',
            'width' => 'auto',
            'height' => '32px',
            'class' => 'brand-logo-sm',
            'container_class' => '',
            'aspect_ratio' => 'auto'
        ),
    );
@endphp

<header class="sticky-top bg-primary-subtle shadow-sm" style="height: 56px;">     
    <div class="d-flex justify-content-between align-items-center h-100 {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'pe-2' : 'pe-1' }}">
        
        <div class="d-flex align-items-center py-2" style="min-width: 250px">

            <div class="d-lg-none d-flex align-items-center justify-content-center" style="width: 50px">
                @include('userinterface::components.hamburger', [
                    'classes' => ''
                ])
            </div>

            @if(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'header')
                <div class="d-lg-flex d-none align-items-center justify-content-center" style="width: 50px">
                    @include('userinterface::components.hamburger', [
                        'classes' => ''
                    ])
                </div>
            @endif
            <div class="d-flex align-items-center justify-content-start gap-2 ps-2">
                <a href="{{ url('/') }}">
                    @include('userinterface::utils.image', ['options' => $logoOptions])
                </a>            
                @if(config('app.debug'))
                    <div class="badge badge-deleted">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
                @endif
            </div>
        </div>

        <!-- Display header nav bar based of configuration -->
        @if(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'header')
            <div class="d-none d-lg-flex h-100 flex-grow-1 overflow-x-auto overflow-y-hidden">
                @include('userinterface::components.module-tabs', [
                    'installedModules' => $installedModules,
                    'viewMode' => 'desktop'
                ])
            </div>
        @endif

        <div class="d-flex align-items-center justify-content-end gap-2" style="min-width: 250px">     
            <!-- User -->
            @include('userinterface::layouts.header.user')
            
            @if(config('app.env') === 'dev')
                @include('userinterface::layouts.dropdown-dev')
            @endif
        </div>
    </div>
</header>