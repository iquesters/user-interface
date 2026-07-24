@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\Foundation\Models\Module as FoundationModule;
    use Iquesters\Foundation\Models\Navigation;
    use Illuminate\Support\Facades\Auth;
    use Illuminate\Support\Facades\Route;
    
    // Configuration
    $viewMode = $viewMode ?? 'desktop';
    $navStyle = ConfProvider::from(Module::USER_INFE)->large_screen_nav_style ?? null;
    $navigationName = $navigationName ?? 'module_navigation';
    $foundationNavigationName = $foundationNavigationName ?? 'foundation_navigation';

    $navigation = Navigation::where('name', $navigationName)->first();
    $navigationItems = $navigation
        ? json_decode($navigation->getMeta('navigation_items') ?? '[]', true)
        : [];

    $navigationItems = collect(is_array($navigationItems) ? $navigationItems : [])
        ->filter(fn ($item) => ($item['enabled'] ?? true) && ($item['visible'] ?? true))
        ->sortBy(function ($item) {
            return is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : PHP_INT_MAX;
        })
        ->values();

    if (!Auth::check()) {
        $navigationItems = collect();
    }

    $installedModules = collect($installedModules ?? []);

    if (Auth::check() && $installedModules->isNotEmpty()) {
        $allowedModuleIds = $installedModules->pluck('id')->flip();

        $navigationItems = $navigationItems->filter(function ($item) use ($allowedModuleIds) {
            $moduleUid = $item['module_uid'] ?? $item['target_module_uid'] ?? null;

            if (!$moduleUid) {
                return false;
            }

            $module = FoundationModule::where('uid', $moduleUid)->first();

            return $module ? $allowedModuleIds->has($module->id) : false;
        })->values();
    } elseif (Auth::check()) {
        $currentUser = Auth::user();
        $accessibleModuleIds = FoundationModule::getForUser($currentUser)
            ->pluck('id')
            ->flip();

        $navigationItems = $navigationItems->filter(function ($item) use ($accessibleModuleIds) {
            $moduleUid = $item['module_uid'] ?? $item['target_module_uid'] ?? null;

            if (!$moduleUid) {
                return false;
            }

            $module = FoundationModule::where('uid', $moduleUid)->first();

            return $module ? $accessibleModuleIds->has($module->id) : false;
        })->values();
    } else {
        $navigationItems = collect();
    }

    if ($viewMode === 'mobile') {
        $maxVisible = ConfProvider::from(Module::USER_INFE)->small_screen_bottom_tabs;
    } else {
        // Desktop / Vertical
        if ($navStyle === 'minibar') {
            // Show ALL modules, no dropdown
            $maxVisible = $navigationItems->count();
        } else {
            $maxVisible = ConfProvider::from(Module::USER_INFE)->large_screen_module_tabs;
        }
    }
    
    // Mobile featured tab configuration
    $featuredTabName = ConfProvider::from(Module::USER_INFE)->small_screen_featured_tab;
    $featuredPosition = ConfProvider::from(Module::USER_INFE)->small_screen_featured_position ?? 'center';
    
    // Process modules from navigation JSON
    $visibleModules = $navigationItems->take($maxVisible);
    $dropdownModules = $navigationItems->skip($maxVisible);
    
    // Reorder for featured tab if mobile
    $featuredIndex = -1;
    if ($viewMode === 'mobile' && $featuredTabName) {
        foreach ($visibleModules as $idx => $mod) {
            $moduleName = $mod['module_name'] ?? $mod['label'] ?? '';
            if (strtolower(trim($moduleName)) === strtolower(trim($featuredTabName))) {
                $featuredIndex = $idx;
                break;
            }
        }
        
        if ($featuredPosition === 'center' && $featuredIndex !== -1) {
            $centerIndex = (int) floor($visibleModules->count() / 2);
            $tabsArray = $visibleModules->values()->all();
            if ($featuredIndex !== $centerIndex) {
                [$tabsArray[$centerIndex], $tabsArray[$featuredIndex]] = [$tabsArray[$featuredIndex], $tabsArray[$centerIndex]];
                $visibleModules = collect($tabsArray);
                $featuredIndex = $centerIndex;
            }
        }
    }
    
    $normalizeUrl = function (?string $url): string {
        if (!$url) {
            return '';
        }

        $parsed = parse_url($url);

        return ($parsed['path'] ?? $url) . (isset($parsed['query']) ? '?' . $parsed['query'] : '');
    };

    $withModuleQuery = function (string $url, ?string $moduleUid): string {
        if (!$url || $url === '#' || !$moduleUid) {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';

        return $url . $separator . 'module_uid=' . urlencode($moduleUid);
    };

    $resolveModule = function ($value) {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            return FoundationModule::where('id', $value)->first();
        }

        return FoundationModule::where('uid', $value)->first();
    };

    $resolveNavigationUrl = function (array $item, ?FoundationModule $module = null): string {
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

        if ($module) {
            $rawSidebarMenu = $module->getMeta('module_sidebar_menu') ?? '[]';
            $rawSidebarMenu = is_string($rawSidebarMenu) ? json_decode($rawSidebarMenu, true) : $rawSidebarMenu;
            $rawSidebarMenu = is_array($rawSidebarMenu) ? $rawSidebarMenu : [];

            $sortedSidebarMenu = collect($rawSidebarMenu)
                ->filter(fn ($item) => is_array($item))
                ->sortBy(function ($item) {
                    return is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : PHP_INT_MAX;
                })
                ->values();

            foreach ($sortedSidebarMenu as $sidebarItem) {
                if (!is_array($sidebarItem)) {
                    continue;
                }

                if (!($sidebarItem['enabled'] ?? true) || !($sidebarItem['visible'] ?? true)) {
                    continue;
                }

                $sidebarParams = $sidebarItem['params'] ?? [];

                if (!empty($sidebarItem['default-table-schema-uid'])) {
                    $sidebarParams['default_table_schema_uid'] = $sidebarItem['default-table-schema-uid'];
                }

                $sidebarRoute = $sidebarItem['route'] ?? null;
                if ($sidebarRoute && Route::has($sidebarRoute)) {
                    try {
                        return route($sidebarRoute, $sidebarParams);
                    } catch (\Throwable $e) {
                        return '#';
                    }
                }
            }
        }

        return '#';
    };

    $buildSidebarMenuItem = function (array $item): array {
        $params = $item['params'] ?? [];

        if (!empty($item['default-table-schema-uid'])) {
            $params['default_table_schema_uid'] = $item['default-table-schema-uid'];
        }

        $route = $item['route'] ?? null;
        $url = $item['url'] ?? null;
        if (is_string($url) && $url !== '' && $url !== '#') {
            $resolvedUrl = $url;
        } elseif ($route && Route::has($route)) {
            try {
                $resolvedUrl = route($route, $params);
            } catch (\Throwable $e) {
                $resolvedUrl = '#';
            }
        } else {
            $resolvedUrl = '#';
        }

        return [
            'icon' => $item['icon'] ?? null,
            'label' => $item['label'] ?? ($item['original_label'] ?? null),
            'url' => $resolvedUrl,
        ];
    };

    $resolveSidebarNavigationItems = function (FoundationModule $module): array {
        if ($module->name !== 'foundation') {
            return [];
        }

        $foundationNavigationRows = Navigation::query()
            ->where('ref_parent', $module->id)
            ->where('name', 'not like', 'foundation\_navigation')
            ->with(['metas' => function ($query) {
                $query->where('meta_key', 'navigation_items');
            }])
            ->orderBy('id')
            ->get();

        if ($foundationNavigationRows->isEmpty()) {
            $foundationNavigationRows = Navigation::query()
                ->where('name', 'foundation_navigation')
                ->with(['metas' => function ($query) {
                    $query->where('meta_key', 'navigation_items');
                }])
                ->get();
        }

        if ($foundationNavigationRows->isEmpty()) {
            return [];
        }

        $navigationItemsByNavigationName = $foundationNavigationRows->mapWithKeys(function (Navigation $navigation) {
            $items = json_decode($navigation->getMeta('navigation_items') ?? '[]', true);
            $items = is_array($items) ? $items : [];

            return [
                $navigation->name => collect($items)
                    ->filter(fn ($item) => is_array($item))
                    ->values()
                    ->all(),
            ];
        });

        $resolveFirstTabUrl = function (array $sidebarItem) use ($navigationItemsByNavigationName): ?string {
            $sidebarId = $sidebarItem['id'] ?? null;

            if (!$sidebarId) {
                return null;
            }

            foreach ($navigationItemsByNavigationName as $items) {
                foreach ($items as $item) {
                    if (!is_array($item)) {
                        continue;
                    }

                    $placement = $item['placement'] ?? $item['section'] ?? null;
                    if ($placement !== 'tabs') {
                        continue;
                    }

                    if (($item['parent_id'] ?? null) !== $sidebarId) {
                        continue;
                    }

                    $params = $item['params'] ?? [];
                    if (!empty($item['default-table-schema-uid'])) {
                        $params['default_table_schema_uid'] = $item['default-table-schema-uid'];
                    }

                    $route = $item['route'] ?? null;
                    if ($route && Route::has($route)) {
                        try {
                            return route($route, $params);
                        } catch (\Throwable $e) {
                            return null;
                        }
                    }
                }
            }

            return null;
        };

        $foundationItems = $foundationNavigationRows
            ->flatMap(function (Navigation $navigation) {
                $items = json_decode($navigation->getMeta('navigation_items') ?? '[]', true);
                $items = is_array($items) ? $items : [];

                return collect($items)
                    ->filter(function ($item) {
                        return is_array($item)
                            && (($item['placement'] ?? $item['section'] ?? 'sidebar') === 'sidebar')
                            && ($item['enabled'] ?? true)
                            && ($item['visible'] ?? true);
                    })
                    ->map(function (array $item) use ($navigation) {
                        $item['navigation_name'] = $navigation->name;
                        return $item;
                    });
            })
            ->sortBy(function ($item) {
                return is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : PHP_INT_MAX;
            })
            ->values()
            ->map(function (array $item) use ($resolveFirstTabUrl) {
                $item['label'] = $item['label'] ?? $item['original_label'] ?? '';
                $item['url'] = $item['url'] ?? $resolveFirstTabUrl($item) ?? null;
                return $item;
            })
            ->all();

        return $foundationItems;
    };

    $getModuleSidebarItems = function (array $module) use ($resolveModule, $resolveSidebarNavigationItems): array {
        $targetModule = $resolveModule($module['target_module_uid'] ?? $module['module_uid'] ?? null);

        if (!$targetModule) {
            return [];
        }

        return $resolveSidebarNavigationItems($targetModule);
    };
    
    // View mode configurations
    $viewConfigs = [
        'desktop' => [
            'container' => 'd-none d-lg-flex ',
            'inner' => 'd-flex flex-grow-1',
            'innerStyle' => '',
            'placement' => 'bottom',
            'dropdownIcon' => 'fa-caret-down',
        ],
        'vertical' => [
            'container' => 'd-none d-lg-flex flex-column align-items-center',
            'inner' => 'd-flex flex-grow-1 flex-column align-items-center overflow-hidden',
            'innerStyle' => '',
            'placement' => 'bottom',
            'dropdownIcon' => 'fa-caret-right',
        ],
        'mobile' => [
            'container' => 'align-items-center border-top shadow-sm vw-100 bg-primary-subtle text-primary',
            'inner' => 'd-flex w-100 h-100 align-items-center ' . ($visibleModules->count() < $maxVisible ? 'justify-content-center' : 'justify-content-around'),
            'containerStyle' => 'height: 70px; position: fixed; bottom: 0; z-index: 1050;',
            'innerStyle' => 'padding: 0 8px;',
            'placement' => 'top',
            'dropdownIcon' => 'fa-caret-up',
        ],
    ];
    
    $config = $viewConfigs[$viewMode];
@endphp

@if ($viewMode === 'mobile')
<div class="d-flex d-lg-none" style="{{ $config['containerStyle'] }}">
@endif

<div class="{{ $config['container'] }}" 
     data-view-mode="{{ $viewMode }}">
    
    <div class="{{ $config['inner'] }}" 
         id="modulesContainer{{ ucfirst($viewMode) }}"
         style="{{ $config['innerStyle'] }}">
        
        @foreach($visibleModules as $index => $module)
            @php 
                $submenuItems = $getModuleSidebarItems($module);
                $moduleModel = $resolveModule($module['target_module_uid'] ?? $module['module_uid'] ?? null);
                $isFeatured = ($viewMode === 'mobile' && $featuredTabName && $index === $featuredIndex);
                $moduleLabel = $module['label'] ?? ucfirst($module['module_name'] ?? $module['name'] ?? 'Module');
                $moduleIcon = $module['icon'] ?? 'fas fa-cubes';
                $moduleUid = $module['module_uid'] ?? $module['target_module_uid'] ?? '';
                $primaryUrl = $withModuleQuery($resolveNavigationUrl($module, $moduleModel), $moduleUid);
                $menu = collect($submenuItems)
                    ->map(fn ($item) => is_array($item) ? $buildSidebarMenuItem($item) : [])
                    ->filter(fn ($item) => !empty($item['label']))
                    ->values();
            @endphp

            <a href="{{ $primaryUrl }}" 
               onclick="if (this.dataset.href && this.dataset.href !== '#') { window.location.href = this.dataset.href; return false; }"
               class="module-tab module-tab-{{ $viewMode }} {{ $isFeatured ? 'module-tab-featured' : '' }} d-flex flex-column align-items-center justify-content-center text-decoration-none text-primary"
               data-view-mode="{{ $viewMode }}"
               data-menu='@json($menu)'
               data-name="{{ $moduleLabel }}"
               data-module-uid="{{ $moduleUid }}"
               data-index="{{ $index }}"
               data-href="{{ $primaryUrl }}"
               data-bs-toggle="tooltip"
               data-bs-placement="{{ $config['placement'] }}"
               title="{{ $moduleLabel }}">
                
                <div class="module-tab-icon-wrapper {{ $isFeatured ? 'module-tab-icon-featured' : '' }}">
                    <i class="fa-fw {{ $moduleIcon }} module-tab-icon"></i>
                </div>
                
                <small class="module-tab-label {{ $isFeatured ? 'module-tab-label-featured' : '' }}">
                    {{ $moduleLabel }}
                </small>
            </a>
        @endforeach

        {{-- Dropdown for overflow modules --}}
        @if($dropdownModules->count() > 0)
            <div class="dropdown {{ $viewMode === 'mobile' ? 'dropup' : '' }} modules-dropdown modules-dropdown-{{ $viewMode }}" 
                 style="{{ $viewMode === 'mobile' ? 'flex: 1 1 0;' : '' }}">
                <button class="btn module-dropdown-btn module-dropdown-btn-{{ $viewMode }} text-primary" 
                        type="button" 
                        id="modulesDropdown{{ ucfirst($viewMode) }}"
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="true"
                        aria-expanded="false">
                    <span class="module-dropdown-label">+{{ $dropdownModules->count() }}</span>
                    <i class="fa-solid {{ $config['dropdownIcon'] }} ms-1"></i>
                </button>
                <ul class="dropdown-menu {{ $viewMode === 'mobile' ? 'dropdown-menu-end' : '' }}" 
                    aria-labelledby="modulesDropdown{{ ucfirst($viewMode) }}">
                    @foreach($dropdownModules as $idx => $module)
                        @php 
                            $submenuItems = $getModuleSidebarItems($module);
                            $moduleModel = $resolveModule($module['target_module_uid'] ?? $module['module_uid'] ?? null);
                            $moduleLabel = $module['label'] ?? ucfirst($module['module_name'] ?? $module['name'] ?? 'Module');
                            $moduleIcon = $module['icon'] ?? 'fas fa-cubes';
                            $moduleUid = $module['module_uid'] ?? $module['target_module_uid'] ?? '';
                            $primaryUrl = $withModuleQuery($resolveNavigationUrl($module, $moduleModel), $moduleUid);
                            $menu = collect($submenuItems)
                                ->map(fn ($item) => is_array($item) ? $buildSidebarMenuItem($item) : [])
                                ->filter(fn ($item) => !empty($item['label']))
                                ->values();
                        @endphp
                        <li>
                            <a class="dropdown-item d-flex align-items-center text-truncate"
                               onclick="if (this.dataset.href && this.dataset.href !== '#') { window.location.href = this.dataset.href; return false; }"
                               data-view-mode="{{ $viewMode }}"
                               href="{{ $primaryUrl }}"
                               data-menu='@json($menu)'
                               data-name="{{ $moduleLabel }}"
                               data-module-uid="{{ $moduleUid }}"
                               data-index="{{ $maxVisible + $idx }}"
                               data-href="{{ $primaryUrl }}"
                               @if($viewMode === 'mobile') data-mobile-navigate="true" @endif>
                                <i class="{{ $moduleIcon }} me-2"></i>
                                <span class="text-truncate" style="max-width: calc(100% - 20px);">
                                    {{ $moduleLabel }}
                                </span>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>
</div>

@if ($viewMode === 'mobile')
</div>
@endif

