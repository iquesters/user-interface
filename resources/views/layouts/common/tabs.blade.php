@php
    /*
     * Page tabs.
     * - From navigation (default): the tabs ("children") of the sidebar item
     *   this page belongs to, managed in Admin → Navigation.
     * - Deprecated: a view's own $tabs array [{route, params, icon, label, permission}].
     * One scrollable line on small screens; labels are text, never HTML.
     */
    $navigationMenu = app(\Iquesters\UserInterface\Support\NavigationMenu::class);
    $navActive = $navigationMenu->active();
    $tabItems = [];

    if (isset($tabs) && is_array($tabs)) {
        foreach ($tabs as $tab) {
            if (! empty($tab['permission']) && auth()->check() && ! auth()->user()->can($tab['permission'])) {
                continue;
            }
            $routeName = $tab['route'] ?? null;
            $tabItems[] = [
                'label' => strip_tags((string) ($tab['label'] ?? '')),
                'icon' => $tab['icon'] ?? null,
                'url' => $routeName && Route::has($routeName) ? route($routeName, array_filter($tab['params'] ?? [], fn ($v) => ! is_null($v))) : '#',
                'active' => $routeName && request()->routeIs($routeName),
            ];
        }
    } elseif (! empty($navActive['item']['children'])) {
        $item = $navActive['item'];
        $children = $item['children'];
        $activeChild = $navActive['child']['key'] ?? null;

        // The item's own page is a tab: its "own page" tab (kind self), where
        // the admin put it; else first, unless a tab already opens it (e.g. "Current").
        $pageIsATab = collect($children)->contains(fn ($child) => ($child['kind'] ?? null) === 'self'
            || rtrim($child['url'], '/') === rtrim($item['url'], '/'));
        if (! $pageIsATab) {
            $tabItems[] = ['label' => $item['label'], 'icon' => $item['icon'], 'url' => $item['url'], 'active' => $activeChild === null];
        }

        foreach ($children as $child) {
            $tabItems[] = $child + ['active' => $activeChild === $child['key']];
        }
    }
@endphp

@if (count($tabItems) > 1 || (isset($tabs) && count($tabItems) > 0))
    <ul class="nav nav-tabs ui-page-tabs flex-nowrap overflow-x-auto overflow-y-hidden mb-2" role="tablist">
        @foreach ($tabItems as $tab)
            <li class="nav-item flex-shrink-0" role="presentation">
                <a href="{{ $tab['url'] }}"
                   class="nav-link text-nowrap d-flex align-items-center gap-1 px-2 px-md-3 {{ $tab['active'] ? 'active' : '' }}"
                   @if ($tab['active']) aria-current="page" @endif>
                    @if (! empty($tab['icon']))
                        <i class="{{ $tab['icon'] }}" aria-hidden="true"></i>
                    @endif
                    <span>{{ $tab['label'] }}</span>
                </a>
            </li>
        @endforeach
    </ul>

    @once
        @push('scripts')
            <script>
                // Small screens: bring the active tab into view.
                document.querySelectorAll('.ui-page-tabs .nav-link.active').forEach((link) => {
                    link.scrollIntoView({ block: 'nearest', inline: 'center' });
                });
            </script>
        @endpush
    @endonce
@endif
