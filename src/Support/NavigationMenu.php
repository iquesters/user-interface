<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Iquesters\Foundation\Models\Module;
use Iquesters\Foundation\Models\Navigation;
use Iquesters\Foundation\System\Traits\Loggable;

/**
 * Builds the module navigation (minibar / header tabs / mobile bar / sidebar)
 * once per request. Bound as a scoped instance: the views render the module
 * tabs up to three times and every Blade view is composed, so without this
 * the same modules, metas and menus were queried hundreds of times per page.
 */
class NavigationMenu
{
    use Loggable;

    private ?Collection $modules = null;

    /** @var array<int, Collection> menu items per module id */
    private array $menus = [];

    private ?array $active = null;

    /**
     * Modules the current user can access, in the saved primary order.
     */
    public function modules(): Collection
    {
        return $this->modules ??= $this->loadModules();
    }

    /**
     * Sidebar items of a module: [icon, label, url], in the saved order.
     */
    public function menu(Module $module): Collection
    {
        return $this->menus[$module->id] ??= $this->buildMenu($module);
    }

    /**
     * Where a click on the module goes: its dashboard, wherever the admin
     * moved it in the sidebar; else (no dashboard) the first sidebar item.
     */
    public function homeUrl(Module $module): string
    {
        $menu = $this->menu($module);
        $dashboard = $menu->first(fn ($entry) => ($entry['kind'] ?? null) === 'dashboard');

        return ($dashboard ?? $menu->first())['url'] ?? '#';
    }

    /**
     * The module and menu item matching the current URL:
     * ['index' => int|null, 'module' => Module|null, 'url' => string|null].
     * An exact URL match wins; otherwise the longest item path the current
     * path is under (e.g. /users/5/edit → the /users item).
     */
    public function active(): array
    {
        return $this->active ??= $this->resolveActive();
    }

    private function loadModules(): Collection
    {
        if (
            ! Auth::check() ||
            ! Schema::hasTable('modules') ||
            ! Schema::hasTable('navigations') ||
            ! Schema::hasTable('navigation_metas')
        ) {
            return collect();
        }

        try {
            $modules = Module::getForUser(Auth::user())->values();

            if ($modules->isEmpty()) {
                return collect();
            }

            $moduleIds = $modules->pluck('id')->all();

            $navigation = Navigation::with('metas')->where('name', 'primary_navigation')->first();
            $savedOrder = $navigation ? json_decode($navigation->getMeta('navigation_order') ?? '[]', true) : [];
            $savedOrder = is_array($savedOrder) ? array_values(array_intersect($savedOrder, $moduleIds)) : [];

            // Saved order first, then modules added since.
            $finalOrder = array_merge($savedOrder, array_diff($moduleIds, $savedOrder));

            return collect($finalOrder)
                ->map(fn ($id) => $modules->firstWhere('id', $id))
                ->filter()
                ->values();
        } catch (\Throwable $e) {
            static::logWarning('Loading navigation modules failed', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    private function buildMenu(Module $module): Collection
    {
        // Navigation items (foundation): sidebar items with their tabs as children.
        if ($items = $this->itemsMenu($module)) {
            return $items;
        }

        // Older foundation / not synced yet: the module's declared menu.
        $submenuItems = json_decode($module->getMeta('module_sidebar_menu') ?? '[]', true);

        if (! is_array($submenuItems) || empty($submenuItems)) {
            return collect();
        }

        // Unique key per item: route + default table schema.
        $submenu = collect($submenuItems)->map(fn ($item) => array_merge($item, [
            '_key' => ($item['route'] ?? '').'::'.($item['default-table-schema-uid'] ?? 'none'),
        ]));

        $navigation = Navigation::with('metas')->where('name', $module->name.'_sub_menu')->first();
        $savedOrder = $navigation ? json_decode($navigation->getMeta('navigation_order') ?? '[]', true) : [];
        $savedOrder = is_array($savedOrder) ? $savedOrder : [];

        $existingKeys = $submenu->pluck('_key')->all();
        $savedOrder = array_values(array_intersect($savedOrder, $existingKeys));
        $finalKeys = array_merge($savedOrder, array_diff($existingKeys, $savedOrder));

        return collect($finalKeys)
            ->map(function ($key) use ($submenu) {
                $item = $submenu->firstWhere('_key', $key);

                if (! $item) {
                    return null;
                }

                $params = $item['params'] ?? [];

                if (! empty($item['default-table-schema-uid'])) {
                    $params['default_table_schema_uid'] = $item['default-table-schema-uid'];
                }

                foreach ($params as $k => $v) {
                    if ($v === null) {
                        $params[$k] = request()->route($k);
                    }
                }

                return [
                    'icon' => $item['icon'] ?? null,
                    'label' => $item['label'] ?? null,
                    'url' => ! empty($item['route']) && Route::has($item['route']) ? route($item['route'], $params) : '#',
                    'children' => [],
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * The module's sidebar from navigation_items: active top-level items the
     * user may see, each with its visible tabs ("children"). Null when the
     * module has no items (older foundation, or not synced yet).
     */
    private function itemsMenu(Module $module): ?Collection
    {
        $model = 'Iquesters\Foundation\Models\NavigationItem';

        if (! class_exists($model) || ! Schema::hasTable('navigation_items')) {
            return null;
        }

        $items = $model::with(['children' => fn ($q) => $q->where('status', 'active')])
            ->where('ref_module', $module->id)
            ->whereNull('ref_parent')
            ->where('status', 'active')
            ->orderBy('sort')->orderBy('id')
            ->get();

        if ($items->isEmpty() && ! $model::where('ref_module', $module->id)->exists()) {
            return null;
        }

        $user = Auth::user();
        // kind: "dashboard" (the module's fixed first item), "self" (the tab
        // standing for its sidebar item's own page) or null.
        $entry = fn ($item) => [
            'key' => $item->key,
            'icon' => $item->displayIcon(),
            'label' => $item->displayLabel(),
            'url' => $item->href(),
            'kind' => $item->isDashboard() ? 'dashboard' : ($item->isSelfTab() ? 'self' : null),
        ];

        return $items
            ->filter(fn ($item) => $item->visibleTo($user))
            ->map(fn ($item) => $entry($item) + [
                'children' => $item->children
                    ->filter(fn ($child) => $child->visibleTo($user))
                    ->each(fn ($child) => $child->setRelation('parent', $item))
                    ->map($entry)->values()->all(),
            ])
            ->values();
    }

    private function resolveActive(): array
    {
        $none = ['index' => null, 'module' => null, 'url' => null, 'item' => null, 'child' => null];
        $request = request();

        if (! $request) {
            return $none;
        }

        $fullUrl = rtrim($request->fullUrl(), '/');
        $currentPath = '/'.trim($request->path(), '/');

        $best = null;
        $bestScore = -1;

        foreach ($this->modules() as $index => $module) {
            foreach ($this->menu($module) as $top) {
                foreach (array_merge([[$top, null]], array_map(fn ($c) => [$top, $c], $top['children'] ?? [])) as [$parent, $child]) {
                    $item = $child ?? $parent;

                    if (empty($item['url']) || $item['url'] === '#') {
                        continue;
                    }

                    $itemPath = '/'.trim((string) parse_url($item['url'], PHP_URL_PATH), '/');

                    if (rtrim($item['url'], '/') === $fullUrl) {
                        $score = PHP_INT_MAX; // exact, query string included
                    } elseif ($itemPath === $currentPath) {
                        $score = PHP_INT_MAX - 1;
                    } elseif ($itemPath !== '/' && str_starts_with($currentPath, $itemPath.'/')) {
                        $score = strlen($itemPath);
                    } else {
                        continue;
                    }

                    // A tab wins a tie with its sidebar item (same page, more precise).
                    if ($score > $bestScore || ($score === $bestScore && $child !== null)) {
                        $bestScore = $score;
                        // url: the sidebar item to highlight; item/child: for tabs and breadcrumbs.
                        $best = ['index' => $index, 'module' => $module, 'url' => $parent['url'], 'item' => $parent, 'child' => $child];
                    }
                }
            }
        }

        return $best ?? $none;
    }
}
