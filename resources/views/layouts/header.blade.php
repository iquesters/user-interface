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
            min-width: 250px is defined in 4-userinterface-lg.css under @media (min-width: 992px).

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
        <!-- Display header nav bar based of configuration -->
        @if(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar')
            <div class="d-none d-lg-flex flex-grow-1 justify-content-center px-3">
                <div class="global-search global-search-expanded global-search-minibar d-flex align-items-center" role="search">
                    <button class="btn global-search-icon" type="button" aria-label="Search" title="Search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <input class="form-control global-search-input" type="search" placeholder="Search (Coming Soon)" aria-label="Global search">
                    <button class="btn global-search-filter" type="button" aria-label="Filter" title="Filter">
                        <i class="fa-solid fa-sliders"></i>
                    </button>
                </div>
            </div>
        @elseif(ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'header')
            <div class="d-none d-lg-flex h-100 flex-grow-1 align-items-center overflow-hidden position-relative global-search-header-shell">
                <div class="global-search-module-tabs d-flex h-100 overflow-x-auto overflow-y-hidden">
                    @include('userinterface::components.module-tabs', [
                        'installedModules' => $installedModules,
                        'viewMode' => 'desktop'
                    ])
                </div>
                <div class="global-search-header-actions d-flex align-items-center">
                    <button class="btn global-search-action global-search-header-trigger" type="button" aria-label="Search" title="Search" aria-expanded="false" aria-controls="globalSearchHeaderPanel">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <small class="global-search-label">Search</small>
                    </button>
                    <button class="btn global-search-action" type="button" aria-label="Filter" title="Filter">
                        <i class="fa-solid fa-sliders"></i>
                        <small class="global-search-label">Filter</small>
                    </button>
                </div>
                <div class="global-search-header-panel" id="globalSearchHeaderPanel" hidden>
                    <div class="global-search global-search-expanded global-search-header d-flex align-items-center" role="search">
                        <button class="btn global-search-icon" type="button" aria-label="Search" title="Search">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <input class="form-control global-search-input" type="search" placeholder="Search (Coming Soon)" aria-label="Global search">
                        <button class="btn global-search-filter global-search-header-close" type="button" aria-label="Close search" title="Close search">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        @endif

        <div class="d-flex d-lg-none h-100 flex-grow-1 align-items-center justify-content-end overflow-hidden position-relative global-search-mobile-shell">
            <div class="global-search-mobile-actions d-flex align-items-center">
                <button class="btn global-search-action global-search-mobile-trigger" type="button" aria-label="Search" title="Search" aria-expanded="false" aria-controls="globalSearchMobilePanel">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <small class="global-search-label">Search</small>
                </button>
                <button class="btn global-search-action" type="button" aria-label="Filter" title="Filter">
                    <i class="fa-solid fa-sliders"></i>
                    <small class="global-search-label">Filter</small>
                </button>
            </div>
            <div class="global-search-mobile-panel" id="globalSearchMobilePanel" hidden>
                <div class="global-search global-search-expanded global-search-mobile d-flex align-items-center" role="search">
                    <button class="btn global-search-icon" type="button" aria-label="Search" title="Search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <input class="form-control global-search-input" type="search" placeholder="Search" aria-label="Global search">
                    <button class="btn global-search-filter global-search-mobile-close" type="button" aria-label="Close search" title="Close search">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        </div>

        {{-- 
            header-right: replaces inline style="min-width: 250px".
            min-width: 250px is defined in 4-userinterface-lg.css under @media (min-width: 992px).

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

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const bindSearchPanel = function (triggerSelector, panelId, closeSelector) {
            const trigger = document.querySelector(triggerSelector);
            const panel = document.getElementById(panelId);

            if (!trigger || !panel) {
                return;
            }

            const input = panel.querySelector('.global-search-input');
            const closeButton = panel.querySelector(closeSelector);

            const openSearch = function () {
                panel.hidden = false;
                trigger.setAttribute('aria-expanded', 'true');
                requestAnimationFrame(function () {
                    input && input.focus();
                });
            };

            const closeSearch = function () {
                panel.hidden = true;
                trigger.setAttribute('aria-expanded', 'false');
            };

            trigger.addEventListener('click', function () {
                if (panel.hidden) {
                    openSearch();
                } else {
                    closeSearch();
                }
            });

            closeButton && closeButton.addEventListener('click', closeSearch);

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !panel.hidden) {
                    closeSearch();
                    trigger.focus();
                }
            });

            document.addEventListener('click', function (event) {
                if (panel.hidden || panel.contains(event.target) || trigger.contains(event.target)) {
                    return;
                }

                closeSearch();
            });
        };

        bindSearchPanel('.global-search-header-trigger', 'globalSearchHeaderPanel', '.global-search-header-close');
        bindSearchPanel('.global-search-mobile-trigger', 'globalSearchMobilePanel', '.global-search-mobile-close');
    });
</script>
