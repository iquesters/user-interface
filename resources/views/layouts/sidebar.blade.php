@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\Foundation\Models\Module as FoundationModule;
    use Illuminate\Support\Facades\Route;

    $currentModuleUid = request()->query('module_uid');
    $currentModule = $currentModuleUid
        ? FoundationModule::where('uid', $currentModuleUid)->first()
        : null;

    $sidebarMenu = [];

    if ($currentModule) {
        $rawSidebarMenu = $currentModule->getMeta('module_sidebar_menu') ?? '[]';
        $sidebarMenu = is_string($rawSidebarMenu) ? json_decode($rawSidebarMenu, true) : $rawSidebarMenu;
        $sidebarMenu = is_array($sidebarMenu) ? $sidebarMenu : [];
    }

    $sidebarMenu = collect($sidebarMenu)
        ->filter(fn ($item) => is_array($item))
        ->filter(fn ($item) => ($item['enabled'] ?? true) && ($item['visible'] ?? true))
        ->sortBy(function ($item) {
            return is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : PHP_INT_MAX;
        })
        ->values();

    $resolveUrl = function (array $item): string {
        $params = $item['params'] ?? [];

        if (!empty($item['default-table-schema-uid'])) {
            $params['default_table_schema_uid'] = $item['default-table-schema-uid'];
        }

        $route = $item['route'] ?? null;
        if ($route && Route::has($route)) {
            try {
                return route($route, $params);
            } catch (\Throwable $e) {
                return '#';
            }
        }

        $url = $item['url'] ?? null;
        if (is_string($url) && $url !== '' && $url !== '#') {
            return $url;
        }

        return '#';
    };
@endphp

<aside class="sidebar ui-sidebar bg-body {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'has-minibar' : 'no-minibar' }}" id="appSidebar">
    <div class="sidebar-body bg-body">
        <div class="list-group list-group-flush nav-sidebar-pending" id="sidebarMenu">
            @forelse($sidebarMenu as $item)
                <a
                    href="{{ $resolveUrl($item) }}"
                    class="list-group-item list-group-item-action dropdown-item ps-3 pe-2 py-2 d-flex justify-content-between align-items-center"
                >
                    <span class="d-flex align-items-center gap-2 text-truncate">
                        <i class="{{ $item['icon'] ?? 'fas fa-circle' }}"></i>
                        <span>{{ $item['label'] ?? $item['original_label'] ?? 'Navigation' }}</span>
                    </span>
                </a>
            @empty
                <div class="list-group-item dropdown-item ps-3 pe-2 py-1 d-flex justify-content-between align-items-center">
                    No menu available.
                </div>
            @endforelse
        </div>
    </div>
</aside>
