@php
    use Illuminate\Support\Str;
    use Iquesters\Foundation\Services\NavigationLayoutService;

    // Layout-controlled defaults
    $tabId     = 'tabs';
    $sticky    = false;
    $secondary = false;
    $familyRoute = $familyRoute ?? null;
    $navigationTabs = app(NavigationLayoutService::class)->getTabsForCurrentRoute();
    $tabs = $navigationTabs;

    // Filter tabs user can actually see
    $visibleTabs = collect($tabs)->filter(function ($tab) {
        if (!empty($tab['permission']) && auth()->check()) {
            return auth()->user()->can($tab['permission']);
        }

        return true;
    })->filter(function ($tab) use ($familyRoute) {
        if (!$familyRoute) {
            return true;
        }

        $tabFamilyRoute = $tab['family_route'] ?? $tab['sidebar_route'] ?? null;

        return $tabFamilyRoute === null || $tabFamilyRoute === $familyRoute;
    })->values();
@endphp

@if ($visibleTabs->count() > 0)
    <ul
        id="{{ $tabId }}"
        class="nav {{ $secondary ? 'nav-pills' : 'nav-tabs' }}
               mb-2 {{ $sticky ? 'nav-tabs-sticky-top' : '' }}"
        role="tablist"
    >
        @foreach ($visibleTabs as $index => $tab)
            @php
                // Route params (safe)
                $routeParams = array_filter($tab['params'] ?? [], fn ($v) => !is_null($v));
                $tabFamilyRoute = $tab['family_route'] ?? $tab['sidebar_route'] ?? $familyRoute;

                // Auto-generate stable tab id
                $autoTabId = 'tab-' . Str::slug($tab['route'] . '-' . $index);

                // Server-side active (basic)
                $isActive = request()->routeIs($tab['route']);
                if ($tabFamilyRoute) {
                    $isActive = $isActive && (request()->routeIs($tabFamilyRoute) || request()->routeIs($tab['route']));
                }
            @endphp

            <li class="nav-item" role="presentation">
                <a
                    id="{{ $autoTabId }}"
                    href="{{ Route::has($tab['route']) ? route($tab['route'], $routeParams) : '#' }}"
                    data-family-route="{{ $tabFamilyRoute ?? '' }}"
                    class="nav-link
                           {{ $isActive ? 'active' : '' }}
                           d-flex d-lg-block flex-column flex-lg-row align-items-center px-2 px-md-3"
                >
                    @isset($tab['icon'])
                        <i class="{{ $tab['icon'] }} me-1"></i>
                    @endisset

                    {!! $tab['label'] !!}
                </a>
            </li>
        @endforeach

    </ul>
@endif

@once
@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname.replace(/\/$/, '');

    function getPath(href) {
        if (!href || href === '#') {
            return '';
        }

        try {
            return new URL(href, window.location.origin).pathname.replace(/\/$/, '');
        } catch (e) {
            return href.replace(/\/$/, '');
        }
    }

    function activateTabs(nav) {
        const links = nav.querySelectorAll('.nav-link');
        const familyRoutes = [...links]
            .map(link => link.dataset.familyRoute || '')
            .filter(Boolean);

        let matched = false;

        links.forEach(link => {
            const hrefPath = getPath(link.getAttribute('href'));
            if (!hrefPath) {
                return;
            }

            const familyRoute = link.dataset.familyRoute || '';
            const familyPath = familyRoute ? getPath(familyRoute) : '';
            const familyMatches = !familyPath || currentPath === familyPath || currentPath.startsWith(familyPath + '/');
            const routeMatches = currentPath === hrefPath || currentPath.startsWith(hrefPath + '/');

            if (familyMatches && routeMatches) {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                matched = true;
            }
        });

        if (!matched && familyRoutes.length === 0) {
            links.forEach(link => {
                const hrefPath = getPath(link.getAttribute('href'));
                if (!hrefPath) {
                    return;
                }

                if (currentPath === hrefPath || currentPath.startsWith(hrefPath + '/')) {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }
    }

    document.querySelectorAll('ul.nav.nav-tabs, ul.nav.nav-pills').forEach(activateTabs);
});
</script>
@endpush
@endonce
