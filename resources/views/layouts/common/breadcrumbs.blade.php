@php
    /*
     * Breadcrumbs, built from navigation: Module (its dashboard) › Sidebar item › Tab › page
     * title. A page adds its own last crumb (e.g. a record's name) with
     * @section('breadcrumb', $record->name). Pages with a diglactic
     * Breadcrumbs::for() definition keep it. On phones: a "‹ back" link to the
     * previous crumb.
     */
    $navActive = app(\Iquesters\UserInterface\Support\NavigationMenu::class)->active();
    $crumbs = [];

    if ($navActive['module']) {
        // The module crumb opens the module's dashboard (its fixed sidebar item).
        $dashboard = app(\Iquesters\UserInterface\Support\NavigationMenu::class)->menu($navActive['module'])
            ->first(fn ($entry) => ($entry['kind'] ?? null) === 'dashboard');
        $crumbs[] = ['label' => \Illuminate\Support\Str::headline($navActive['module']->name), 'url' => $dashboard['url'] ?? null];
    }
    // On the dashboard the module crumb is the page; an own-page tab is its sidebar item.
    if ($navActive['item'] && ($navActive['item']['kind'] ?? null) !== 'dashboard') {
        $crumbs[] = ['label' => $navActive['item']['label'], 'url' => $navActive['item']['url']];
    }
    if ($navActive['child'] && ($navActive['child']['kind'] ?? null) !== 'self') {
        $crumbs[] = ['label' => $navActive['child']['label'], 'url' => $navActive['child']['url']];
    }
    $pageCrumb = trim(strip_tags($__env->yieldContent('breadcrumb')));
    if ($pageCrumb !== '') {
        $crumbs[] = ['label' => $pageCrumb, 'url' => null];
    }

    $back = count($crumbs) > 1 ? collect($crumbs)->slice(0, -1)->reverse()->first(fn ($c) => $c['url'] && $c['url'] !== '#') : null;
@endphp

@if (Breadcrumbs::exists())
    {{ Breadcrumbs::render() }}
@elseif (count($crumbs) > 0)
    <nav aria-label="Breadcrumb" class="ui-breadcrumbs">
        <ol class="breadcrumb small mb-0 d-none d-md-flex">
            @foreach ($crumbs as $index => $crumb)
                @php $isLast = $index === count($crumbs) - 1; @endphp
                <li class="breadcrumb-item {{ $isLast ? 'active' : '' }}" @if ($isLast) aria-current="page" @endif>
                    @if (! $isLast && $crumb['url'] && $crumb['url'] !== '#')
                        <a href="{{ $crumb['url'] }}" class="text-decoration-none">{{ $crumb['label'] }}</a>
                    @else
                        {{ $crumb['label'] }}
                    @endif
                </li>
            @endforeach
        </ol>
        <div class="d-flex d-md-none align-items-center gap-2 small text-truncate">
            @if ($back)
                <a href="{{ $back['url'] }}" class="text-decoration-none flex-shrink-0"><i class="fas fa-chevron-left me-1"></i>{{ $back['label'] }}</a>
                <span class="text-muted">/</span>
            @endif
            <span class="text-truncate fw-medium">{{ end($crumbs)['label'] }}</span>
        </div>
    </nav>
@endif
