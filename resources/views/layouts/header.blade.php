@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    
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

{{-- Removed: inline <style> block with @media (max-width: 991.98px) and min-width: unset. --}}

<header class="sticky-top bg-primary-subtle shadow-sm" style="height: 56px;">     
    <div class="d-flex justify-content-between align-items-center h-100 {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'pe-2' : 'pe-1' }}">
        
        {{-- 
            header-left: replaces inline style="min-width: 250px".
            No min-width rule needed in CSS — layout works via flexbox naturally.
        --}}
        <div class="d-flex align-items-center py-2 header-left">

            {{-- Hamburger: visible only on mobile (d-lg-none) --}}
            <div class="d-lg-none d-flex align-items-center justify-content-center" style="width: 50px">
                @include('userinterface::components.hamburger', [
                    'classes' => ''
                ])
            </div>

            {{-- Hamburger: visible only on desktop when nav style is 'header' --}}
            @if(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'header')
                <div class="d-lg-flex d-none align-items-center justify-content-center" style="width: 50px">
                    @include('userinterface::components.hamburger', [
                        'classes' => ''
                    ])
                </div>
            @endif

            {{-- Logo and environment badge --}}
            <div class="d-flex align-items-center justify-content-start gap-2 ps-2">
                <a href="{{ url('/') }}">
                    @include('userinterface::utils.image', ['options' => $logoOptions])
                </a>            
                @if(config('app.debug'))
                    <x-userinterface::status status="deleted">
                        {{ \Illuminate\Support\Str::upper(config('app.env')) }}
                    </x-userinterface::status>
                @endif
            </div>
        </div>

        {{-- Centre module tabs: only rendered on desktop when nav style is 'header' --}}
        @if(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'header')
            <div class="d-none d-lg-flex h-100 flex-grow-1 overflow-x-auto overflow-y-hidden">
                @include('userinterface::components.module-tabs', [
                    'installedModules' => $installedModules,
                    'viewMode' => 'desktop'
                ])
            </div>
        @endif

        {{-- 
            header-right: replaces inline style="min-width: 250px".
            No min-width rule needed in CSS — layout works via flexbox naturally.
        --}}
        <div class="d-flex align-items-center justify-content-end gap-2 header-right">
            {{-- User avatar / profile dropdown --}}
            @include('userinterface::layouts.header.user')
            
            {{-- Dev tools dropdown: only visible in dev environment --}}
            @if(config('app.env') === 'dev')
                @include('userinterface::layouts.dropdown-dev')
            @endif
        </div>
    </div>
</header>