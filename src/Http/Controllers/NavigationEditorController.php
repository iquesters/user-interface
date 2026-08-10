<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Iquesters\Foundation\Models\Module;
use Iquesters\Foundation\Models\Navigation;
use Iquesters\Foundation\System\Http\ApiResponse;
use Illuminate\Support\Collection;

class NavigationEditorController extends Controller
{
    public function index(Request $request)
    {
        try {
            $modules = Module::query()
                ->select(['id', 'uid', 'name', 'description', 'status'])
                ->orderBy('name')
                ->get();

            $navigationTree = $this->buildNavigationTree($modules, false);
            $selected = $this->resolveSelection($request, $navigationTree);
            $hasExplicitSelection = $request->filled('selected_uid')
                || $request->filled('edit_uid')
                || $request->filled('node_id')
                || $request->filled('navigation_uid');

            return view('userinterface::navigation-editor.index', [
                'modules' => $modules,
                'navigationTree' => $navigationTree,
                'selectedNode' => $hasExplicitSelection ? $selected['node'] : null,
                'selectedPayload' => $hasExplicitSelection ? $selected['payload'] : [],
                'selectedPath' => $hasExplicitSelection ? $selected['path'] : [],
                'selectedMode' => $hasExplicitSelection ? $selected['mode'] : null,
                'selectedUid' => $hasExplicitSelection ? $selected['uid'] : null,
                'selectedModuleUid' => $hasExplicitSelection ? ($selected['module_uid'] ?? null) : null,
                'editingUid' => $request->query('edit_uid'),
                'editingMode' => $request->query('edit_mode'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Navigation editor index failed', [
                'error' => $e->getMessage(),
            ]);

            abort(500, 'Unable to load navigation editor');
        }
    }

    public function children(Request $request, string $parent_uid)
    {
        try {
            $modules = Module::query()
                ->select(['id', 'uid', 'name', 'description', 'status'])
                ->orderBy('name')
                ->get();

            $parent = Navigation::where('uid', $parent_uid)->first();
            if (!$parent) {
                $module = $modules->firstWhere('uid', $parent_uid);
                if (!$module) {
                    return ApiResponse::error('Parent node not found.', 404);
                }

                $navigationIds = DB::table('module_has_navigations')
                    ->whereIn('module_id', [$module->id, $module->uid])
                    ->pluck('navigation_id')
                    ->filter()
                    ->values();

                if ($navigationIds->isEmpty()) {
                    $navigationIds = Navigation::query()
                        ->where('ref_parent', $module->id)
                        ->pluck('id')
                        ->filter()
                        ->values();
                }

                $navigationRows = Navigation::query()
                    ->with(['metas'])
                    ->whereIn('id', $navigationIds)
                    ->orderBy('id')
                    ->get();

                $children = $this->buildSidebarRows($navigationRows);

                return ApiResponse::success([
                    'parent_uid' => $parent_uid,
                    'parent_type' => 'module',
                    'parent_node_id' => $module->uid,
                    'parent_navigation_uid' => $module->uid,
                    'parent_module_uid' => $module->uid,
                    'children' => $children,
                ], 'Module children loaded successfully.');
            }

            $module = $modules->firstWhere('id', $parent->ref_parent) ?? $modules->firstWhere('uid', (string) $parent->ref_parent);
            if (!$module) {
                return ApiResponse::error('Parent node not found.', 404);
            }

            $navigationIds = DB::table('module_has_navigations')
                ->where('module_id', $module->id)
                ->pluck('navigation_id')
                ->filter()
                ->values();

            $navigationRows = Navigation::query()
                ->with(['metas'])
                ->whereIn('id', $navigationIds)
                ->orderBy('id')
                ->get();

            $payload = $this->decodeNavigationItems($parent->getMeta('navigation_items'));
            $sidebarId = $this->resolveNavigationNodeId($parent, $payload);

            $items = $this->collectTabChildren($navigationRows, $sidebarId);

            return ApiResponse::success([
                'parent_uid' => $parent_uid,
                'parent_type' => 'sidebar',
                'parent_node_id' => $sidebarId,
                'parent_navigation_uid' => $parent->uid,
                'parent_module_uid' => $module->uid,
                'children' => $items,
            ], 'Navigation children loaded successfully.');
        } catch (\Throwable $e) {
            Log::error('Navigation editor children load failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'parent_uid' => $parent_uid,
            ]);

            return ApiResponse::error('Failed to load navigation children.', 500, [
                'exception' => class_basename($e),
                'detail' => $e->getMessage(),
            ]);
        }
    }

    public function update(Request $request, string $navigation_uid)
    {
        try {
            $payload = $request->validate([
                'navigation_type' => ['required', 'in:module,sidebar,tab'],
                'navigation_payload' => ['required'],
            ]);

            $navigation = Navigation::where('uid', $navigation_uid)->firstOrFail();

            $rawPayload = $payload['navigation_payload'];
            if (is_array($rawPayload)) {
                $decoded = $rawPayload;
            } elseif (is_string($rawPayload)) {
                $decoded = json_decode($rawPayload, true);
            } else {
                $decoded = null;
            }

            if (!is_array($decoded)) {
                return ApiResponse::error('Navigation payload must be valid JSON.', 422);
            }

            $navigation->setMeta('navigation_items', json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            $navigation->update([
                'updated_by' => auth()->id() ?? 0,
            ]);

            $this->syncModuleSidebarMenu($navigation, $decoded);

            return ApiResponse::success([
                'navigation_uid' => $navigation->uid,
                'navigation_type' => $payload['navigation_type'],
                'navigation_items' => $decoded,
            ], 'Navigation saved successfully.');
        } catch (\Throwable $e) {
            Log::error('Navigation editor save failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => auth()->id(),
                'navigation_uid' => $navigation_uid,
            ]);

            return ApiResponse::error('Failed to save navigation.', 500, [
                'exception' => class_basename($e),
                'detail' => $e->getMessage(),
            ]);
        }
    }

    public function liveData(Request $request, string $module_uid)
    {
        try {
            $modules = Module::query()
                ->select(['id', 'uid', 'name', 'description', 'status'])
                ->orderBy('name')
                ->get();

            $module = $modules->firstWhere('uid', $module_uid);
            if (!$module) {
                return ApiResponse::error('Module not found.', 404);
            }

            $navigationTree = $this->buildNavigationTree($modules);
            $moduleNode = collect($navigationTree)->firstWhere('navigation_uid', $module_uid)
                ?? collect($navigationTree)->firstWhere('label', $module->name)
                ?? null;

            if (!$moduleNode) {
                return ApiResponse::error('Navigation data not found.', 404);
            }

            $sidebarItems = collect($moduleNode['children'] ?? [])
                ->map(function (array $sidebarNode) {
                    $firstItem = $sidebarNode['payload'][0] ?? [];

                    return [
                        'navigation_uid' => $sidebarNode['navigation_uid'] ?? null,
                        'label' => $sidebarNode['title'] ?? ($sidebarNode['navigation_name'] ?? 'Navigation'),
                        'title' => $sidebarNode['navigation_name'] ?? null,
                        'icon' => $firstItem['icon'] ?? 'fas fa-circle',
                        'url' => $this->resolveNavigationUrlFromPayload($firstItem),
                        'has_children' => !empty($sidebarNode['children'] ?? []),
                        'children' => collect($sidebarNode['children'] ?? [])->map(function (array $tabNode) {
                            $firstTab = $tabNode['payload'][0] ?? [];

                            return [
                                'navigation_uid' => $tabNode['navigation_uid'] ?? null,
                                'label' => $tabNode['title'] ?? ($tabNode['navigation_name'] ?? 'Navigation'),
                                'title' => $tabNode['navigation_name'] ?? null,
                                'icon' => $firstTab['icon'] ?? 'fas fa-circle',
                                'url' => $this->resolveNavigationUrlFromPayload($firstTab),
                            ];
                        })->values()->all(),
                    ];
                })
                ->values()
                ->all();

            return ApiResponse::success([
                'module_uid' => $module->uid,
                'module_name' => $module->name,
                'sidebar_items' => $sidebarItems,
            ], 'Navigation live data refreshed.');
        } catch (\Throwable $e) {
            Log::error('Navigation editor live data failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'module_uid' => $module_uid,
            ]);

            return ApiResponse::error('Failed to load live navigation data.', 500, [
                'exception' => class_basename($e),
                'detail' => $e->getMessage(),
            ]);
        }
    }

    public function sidebarHtml(Request $request, string $module_uid)
    {
        try {
            $module = Module::where('uid', $module_uid)->first();
            if (!$module) {
                return ApiResponse::error('Module not found.', 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sidebar rendered successfully.',
                'data' => [
                    'html' => view('userinterface::layouts.sidebar', [
                        'currentModuleUid' => $module->uid,
                        'currentModule' => $module,
                    ])->render(),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Navigation editor sidebar html failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'module_uid' => $module_uid,
            ]);

            return ApiResponse::error('Failed to render sidebar.', 500, [
                'exception' => class_basename($e),
                'detail' => $e->getMessage(),
            ]);
        }
    }

    protected function resolveSelection(Request $request, array $navigationTree): array
    {
        $requestedNodeId = $request->query('node_id');
        $requestedUid = $request->query('navigation_uid');
        $requestedMode = $request->query('mode', 'module');
        $requestedSelectedUid = $request->query('selected_uid');
        $requestedEditUid = $request->query('edit_uid');

        foreach ($navigationTree as $moduleNode) {
            if (
                ($moduleNode['node_id'] ?? null) === $requestedNodeId ||
                ($moduleNode['module_uid'] ?? null) === $requestedNodeId ||
                ($moduleNode['navigation_uid'] ?? null) === $requestedSelectedUid ||
                ($moduleNode['module_uid'] ?? null) === $requestedSelectedUid
            ) {
                return [
                    'node' => $moduleNode,
                    'payload' => $moduleNode['payload'],
                    'path' => [$moduleNode['label']],
                    'mode' => 'module',
                    'uid' => $moduleNode['navigation_uid'],
                    'module_uid' => $moduleNode['module_uid'] ?? null,
                ];
            }

            if (
                ($moduleNode['navigation_uid'] ?? null) === $requestedUid ||
                ($moduleNode['module_uid'] ?? null) === $requestedUid
            ) {
                return [
                    'node' => $moduleNode,
                    'payload' => $moduleNode['payload'],
                    'path' => [$moduleNode['label']],
                    'mode' => 'module',
                    'uid' => $moduleNode['navigation_uid'],
                    'module_uid' => $moduleNode['module_uid'] ?? null,
                ];
            }

            foreach ($moduleNode['children'] as $sidebarNode) {
                if (($sidebarNode['navigation_uid'] ?? null) === $requestedSelectedUid || ($sidebarNode['navigation_uid'] ?? null) === $requestedEditUid) {
                    return [
                        'node' => $sidebarNode,
                        'payload' => $sidebarNode['payload'],
                        'path' => [$moduleNode['label'], $sidebarNode['label']],
                        'mode' => 'sidebar',
                        'uid' => $sidebarNode['navigation_uid'],
                        'module_uid' => $moduleNode['module_uid'] ?? null,
                    ];
                }

                foreach ($sidebarNode['children'] as $tabNode) {
                    if (($tabNode['navigation_uid'] ?? null) === $requestedSelectedUid || ($tabNode['navigation_uid'] ?? null) === $requestedEditUid) {
                        return [
                            'node' => $tabNode,
                            'payload' => $tabNode['payload'],
                            'path' => [$moduleNode['label'], $sidebarNode['label'], $tabNode['label']],
                            'mode' => 'tab',
                            'uid' => $tabNode['navigation_uid'],
                            'module_uid' => $moduleNode['module_uid'] ?? null,
                        ];
                    }
                }
            }
        }

        return [
            'node' => null,
            'payload' => [],
            'path' => [],
            'mode' => $requestedMode,
            'uid' => null,
            'module_uid' => null,
        ];
    }

    protected function buildNavigationTree($modules, bool $includeChildren = true): array
    {
        $navigationRows = Navigation::query()
            ->with(['metas'])
            ->orderBy('id')
            ->get();

        $moduleNavigation = $navigationRows->firstWhere('name', 'module_navigation');
        $modulePayload = $moduleNavigation
            ? $this->decodeNavigationItems($moduleNavigation->getMeta('navigation_items'))
            : [];

        $rowsByModuleId = $navigationRows->groupBy('ref_parent');

        return collect($modulePayload)
            ->map(function (array $item) use ($modules, $rowsByModuleId, $moduleNavigation, $modulePayload, $includeChildren) {
                $moduleUid = $item['module_uid'] ?? $item['target_module_uid'] ?? null;
                $module = $moduleUid ? $modules->firstWhere('uid', $moduleUid) : null;
                $moduleRows = $module ? $rowsByModuleId->get($module->id, collect()) : collect();
                $sidebarRows = $includeChildren ? $this->buildSidebarRows($moduleRows) : [];
                $hasSidebarChildren = $this->moduleHasSidebarChildren($moduleRows);

                return [
                    'node_id' => $item['id'] ?? ($module?->uid ?? 'unknown'),
                    'id' => 'module-' . ($module?->uid ?? $item['id'] ?? 'unknown'),
                    'label' => $item['label'] ?? ($module?->name ?? 'module'),
                    'title' => $item['title'] ?? ($module?->description ?? ($module?->name ?? 'module')),
                    'navigation_uid' => $moduleNavigation?->uid,
                    'module_id' => $module?->id ?? null,
                    'module_uid' => $module?->uid ?? $moduleUid,
                    'navigation_name' => $moduleNavigation?->name,
                    'mode' => 'module',
                    'payload' => $modulePayload,
                    'meta_count' => count($modulePayload),
                    'children' => $sidebarRows,
                    'has_children' => $hasSidebarChildren,
                ];
            })
            ->values()
            ->all();
    }

    protected function buildSidebarRows(Collection $moduleRows): array
    {
        return $moduleRows
            ->map(function (Navigation $navigation) use ($moduleRows) {
                $payload = $this->decodeNavigationItems($navigation->getMeta('navigation_items'));
                $sidebarId = $this->resolveNavigationNodeId($navigation, $payload);

                $tabChildren = $this->collectTabChildren($moduleRows, $sidebarId);

                return [
                    'id' => 'nav-' . $navigation->uid,
                    'label' => $navigation->name,
                    'title' => $this->resolveNavigationTitle($navigation, $payload),
                    'navigation_uid' => $navigation->uid,
                    'navigation_name' => $navigation->name,
                    'mode' => 'sidebar',
                    'payload' => $payload,
                    'meta_count' => count($payload),
                    'children' => [],
                    'has_children' => !empty($tabChildren),
                ];
            })
            ->values()
            ->all();
    }

    protected function moduleHasSidebarChildren(Collection $moduleRows): bool
    {
        return $moduleRows->contains(function (Navigation $navigation) {
            $payload = $this->decodeNavigationItems($navigation->getMeta('navigation_items'));
            $first = $payload[0] ?? [];
            $placement = $first['placement'] ?? $first['section'] ?? 'sidebar';

            return $placement === 'sidebar';
        });
    }

    protected function buildModuleChildrenForModule(Module $module, Collection $navigationRows): array
    {
        $moduleRows = $navigationRows->filter(function (Navigation $navigation) use ($module) {
            return in_array((string) $navigation->ref_parent, [(string) $module->id, (string) $module->uid], true);
        })->values();

        return $this->buildSidebarRows($moduleRows);
    }

    protected function buildImmediateChildrenForNavigation(Navigation $parent, Collection $modules): array
    {
        $payload = $this->decodeNavigationItems($parent->getMeta('navigation_items'));
        $mode = $this->guessNavigationMode($parent, $payload);

        if ($mode === 'module') {
            $navigationRows = Navigation::query()
                ->with(['metas'])
                ->orderBy('id')
                ->get();

            $moduleNavigation = $navigationRows->firstWhere('name', 'module_navigation');
            $modulePayload = $moduleNavigation
                ? $this->decodeNavigationItems($moduleNavigation->getMeta('navigation_items'))
                : [];

            $moduleUid = $modulePayload[0]['module_uid'] ?? $modulePayload[0]['target_module_uid'] ?? null;
            $module = $moduleUid ? $modules->firstWhere('uid', $moduleUid) : null;

            if (!$module) {
                return [];
            }

            $rowsByModuleId = $navigationRows->groupBy('ref_parent');
            $moduleRows = $rowsByModuleId->get($module->id, collect());

            return $this->buildSidebarRows($moduleRows);
        }

        if ($mode === 'sidebar') {
            $module = $modules->firstWhere('id', $parent->ref_parent) ?? $modules->firstWhere('uid', (string) $parent->ref_parent);
            if (!$module) {
                return [];
            }

            $moduleRows = Navigation::query()
                ->with(['metas'])
                ->where('ref_parent', $module->id)
                ->orderBy('id')
                ->get();

            return $this->collectTabChildren($moduleRows, $this->resolveNavigationNodeId($parent, $payload));
        }

        return [];
    }

    protected function decodeNavigationItems($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);
        return is_array($decoded) ? $decoded : [];
    }

    protected function guessNavigationMode(Navigation $navigation, array $payload): string
    {
        $first = $payload[0] ?? [];
        $placement = $first['placement'] ?? $first['section'] ?? null;

        if ($placement === 'tabs') {
            return 'tab';
        }

        return $navigation->ref_parent ? 'sidebar' : 'module';
    }

    protected function resolveNavigationTitle(Navigation $navigation, array $payload): string
    {
        $first = $payload[0] ?? [];
        return $first['label'] ?? $navigation->name;
    }

    protected function resolveNavigationNodeId(Navigation $navigation, array $payload): ?string
    {
        $first = $payload[0] ?? [];
        return $first['id'] ?? $navigation->name;
    }

    protected function collectTabChildren(Collection $moduleRows, ?string $sidebarNodeId): array
    {
        if (!$sidebarNodeId) {
            return [];
        }

        return $moduleRows
            ->filter(function (Navigation $navigation) use ($sidebarNodeId) {
                $payload = $this->decodeNavigationItems($navigation->getMeta('navigation_items'));
                $first = $payload[0] ?? [];
                $placement = $first['placement'] ?? $first['section'] ?? null;
                $parentId = $first['parent_id'] ?? null;

                return $placement === 'tabs' && in_array($parentId, [$sidebarNodeId, $navigation->name], true);
            })
            ->map(function (Navigation $navigation) {
                $payload = $this->decodeNavigationItems($navigation->getMeta('navigation_items'));
                $nestedChildren = [];

                return [
                    'id' => 'nav-' . $navigation->uid,
                    'label' => $navigation->name,
                    'title' => $this->resolveNavigationTitle($navigation, $payload),
                    'navigation_uid' => $navigation->uid,
                    'navigation_name' => $navigation->name,
                    'mode' => 'tab',
                    'payload' => $payload,
                    'meta_count' => count($payload),
                    'children' => $nestedChildren,
                    'has_children' => false,
                ];
            })
            ->values()
            ->all();
    }

    protected function resolveNavigationUrlFromPayload(array $item): string
    {
        $params = $item['params'] ?? [];

        if (!empty($item['default-table-schema-uid'])) {
            $params['default_table_schema_uid'] = $item['default-table-schema-uid'];
        }

        $url = $item['url'] ?? null;
        if (is_string($url) && $url !== '' && $url !== '#') {
            return $url;
        }

        $route = $item['route'] ?? null;
        if ($route && Route::has($route)) {
            try {
                return route($route, $params);
            } catch (\Throwable $e) {
                return '#';
            }
        }

        return '#';
    }

    protected function syncModuleSidebarMenu(Navigation $navigation, array $savedItems): void
    {
        $moduleId = $navigation->ref_parent;
        if (!$moduleId) {
            return;
        }

        $module = Module::query()->find($moduleId);
        if (!$module) {
            return;
        }

        $modules = Module::query()
            ->select(['id', 'uid', 'name', 'description', 'status'])
            ->orderBy('name')
            ->get();

        $navigationTree = $this->buildNavigationTree($modules);
        $moduleNode = collect($navigationTree)->firstWhere('module_uid', $module->uid)
            ?? collect($navigationTree)->firstWhere('navigation_uid', $module->uid)
            ?? null;

        $sidebarItems = collect($moduleNode['children'] ?? [])
            ->map(function (array $sidebarNode) {
                $firstItem = $sidebarNode['payload'][0] ?? [];

                return [
                    'navigation_uid' => $sidebarNode['navigation_uid'] ?? null,
                    'id' => $sidebarNode['navigation_uid'] ?? null,
                    'label' => $sidebarNode['title'] ?? ($sidebarNode['navigation_name'] ?? 'Navigation'),
                    'original_label' => $sidebarNode['title'] ?? ($sidebarNode['navigation_name'] ?? 'Navigation'),
                    'title' => $sidebarNode['navigation_name'] ?? null,
                    'icon' => $firstItem['icon'] ?? 'fas fa-circle',
                    'url' => $this->resolveNavigationUrlFromPayload($firstItem),
                    'sort_order' => $firstItem['sort_order'] ?? 0,
                    'visible' => true,
                    'enabled' => true,
                    'locked' => false,
                    'children' => collect($sidebarNode['children'] ?? [])
                        ->map(function (array $tabNode) {
                            $firstTab = $tabNode['payload'][0] ?? [];

                            return [
                                'navigation_uid' => $tabNode['navigation_uid'] ?? null,
                                'id' => $tabNode['navigation_uid'] ?? null,
                                'label' => $tabNode['title'] ?? ($tabNode['navigation_name'] ?? 'Navigation'),
                                'original_label' => $tabNode['title'] ?? ($tabNode['navigation_name'] ?? 'Navigation'),
                                'title' => $tabNode['navigation_name'] ?? null,
                                'icon' => $firstTab['icon'] ?? 'fas fa-circle',
                                'url' => $this->resolveNavigationUrlFromPayload($firstTab),
                                'sort_order' => $firstTab['sort_order'] ?? 0,
                                'visible' => true,
                                'enabled' => true,
                                'locked' => false,
                            ];
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        $module->setMeta('module_sidebar_menu', json_encode($sidebarItems, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        $module->update([
            'updated_by' => auth()->id() ?? 0,
        ]);
    }
}
