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
            !Auth::check() ||
            !Schema::hasTable('modules') ||
            !Schema::hasTable('navigations') ||
            !Schema::hasTable('navigation_metas')
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
        $submenuItems = json_decode($module->getMeta('module_sidebar_menu') ?? '[]', true);

        if (!is_array($submenuItems) || empty($submenuItems)) {
            return collect();
        }

        // Unique key per item: route + default table schema.
        $submenu = collect($submenuItems)->map(fn ($item) => array_merge($item, [
            '_key' => ($item['route'] ?? '') . '::' . ($item['default-table-schema-uid'] ?? 'none'),
        ]));

        $navigation = Navigation::with('metas')->where('name', $module->name . '_sub_menu')->first();
        $savedOrder = $navigation ? json_decode($navigation->getMeta('navigation_order') ?? '[]', true) : [];
        $savedOrder = is_array($savedOrder) ? $savedOrder : [];

        $existingKeys = $submenu->pluck('_key')->all();
        $savedOrder = array_values(array_intersect($savedOrder, $existingKeys));
        $finalKeys = array_merge($savedOrder, array_diff($existingKeys, $savedOrder));

        return collect($finalKeys)
            ->map(function ($key) use ($submenu) {
                $item = $submenu->firstWhere('_key', $key);

                if (!$item) {
                    return null;
                }

                $params = $item['params'] ?? [];

                if (!empty($item['default-table-schema-uid'])) {
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
                    'url' => !empty($item['route']) && Route::has($item['route']) ? route($item['route'], $params) : '#',
                ];
            })
            ->filter()
            ->values();
    }

    private function resolveActive(): array
    {
        $none = ['index' => null, 'module' => null, 'url' => null];
        $request = request();

        if (!$request) {
            return $none;
        }

        $fullUrl = rtrim($request->fullUrl(), '/');
        $currentPath = '/' . trim($request->path(), '/');

        $best = null;
        $bestScore = -1;

        foreach ($this->modules() as $index => $module) {
            foreach ($this->menu($module) as $item) {
                if (empty($item['url']) || $item['url'] === '#') {
                    continue;
                }

                $itemPath = '/' . trim((string) parse_url($item['url'], PHP_URL_PATH), '/');

                if (rtrim($item['url'], '/') === $fullUrl) {
                    $score = PHP_INT_MAX; // exact, query string included
                } elseif ($itemPath === $currentPath) {
                    $score = PHP_INT_MAX - 1;
                } elseif ($itemPath !== '/' && str_starts_with($currentPath, $itemPath . '/')) {
                    $score = strlen($itemPath);
                } else {
                    continue;
                }

                if ($score > $bestScore) {
                    $bestScore = $score;
                    $best = ['index' => $index, 'module' => $module, 'url' => $item['url']];
                }
            }
        }

        return $best ?? $none;
    }
}
