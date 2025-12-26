@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    
    // Configuration
    $viewMode = $viewMode ?? 'desktop';
    $navStyle = ConfProvider::from(Module::USER_INFE)->large_screen_nav_style ?? null;

    if ($viewMode === 'mobile') {
        $maxVisible = ConfProvider::from(Module::USER_INFE)->small_screen_bottom_tabs;
    } else {
        // Desktop / Vertical
        if ($navStyle === 'minibar') {
            // Show ALL modules, no dropdown
            $maxVisible = $installedModules->count();
        } else {
            $maxVisible = ConfProvider::from(Module::USER_INFE)->large_screen_module_tabs;
        }
    }
    
    // Mobile featured tab configuration
    $featuredTabName = ConfProvider::from(Module::USER_INFE)->small_screen_featured_tab;
    $featuredPosition = ConfProvider::from(Module::USER_INFE)->small_screen_featured_position ?? 'center';
    
    // Process modules
    $visibleModules = $installedModules->take($maxVisible);
    $dropdownModules = $installedModules->skip($maxVisible);
    
    // Reorder for featured tab if mobile
    $featuredIndex = -1;
    if ($viewMode === 'mobile' && $featuredTabName) {
        foreach ($visibleModules as $idx => $mod) {
            if (strtolower(trim($mod->name)) === strtolower(trim($featuredTabName))) {
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
    
    // Generate menu helper
    use Iquesters\Foundation\Models\Navigation;
    use Illuminate\Support\Facades\Route;

    $generateMenu = function ($module) {

        /**
         * STEP 1: Load raw submenu from module meta
         */
        $submenuItems = json_decode(
            $module->getMeta('module_sidebar_menu') ?? '[]',
            true
        );

        if (!is_array($submenuItems) || empty($submenuItems)) {
            return collect();
        }

        /**
         * STEP 2: Normalize submenu items (unique key)
         */
        $submenu = collect($submenuItems)
            ->map(function ($item) {
                return array_merge($item, [
                    '_key' => $item['route']
                        . '::'
                        . ($item['default-table-schema-uid'] ?? 'none'),
                ]);
            });

        /**
         * STEP 3: Load saved order
         */
        $navigation = Navigation::where(
            'name',
            $module->name . '_sub_menu'
        )->first();

        $savedOrder = [];

        if ($navigation) {
            $savedOrder = json_decode(
                $navigation->getMeta('navigation_order') ?? '[]',
                true
            );
        }

        $savedOrder = is_array($savedOrder) ? $savedOrder : [];

        /**
         * STEP 4: Clean invalid keys
         */
        $existingKeys = $submenu->pluck('_key')->toArray();
        $savedOrder   = array_values(array_intersect($savedOrder, $existingKeys));

        /**
         * STEP 5: Append new submenu items
         */
        $newKeys   = array_diff($existingKeys, $savedOrder);
        $finalKeys = array_merge($savedOrder, $newKeys);

        /**
         * STEP 6: Build sidebar menu (CORRECT)
         */
        return collect($finalKeys)
            ->map(function ($key) use ($submenu) {

                $item = $submenu->firstWhere('_key', $key);
                if (!$item) {
                    return null;
                }

                $params = $item['params'] ?? [];

                if (!empty($item['default-table-schema-uid'])) {
                    $params['default_table_schema_uid']
                        = $item['default-table-schema-uid'];
                }

                foreach ($params as $k => $v) {
                    if ($v === null) {
                        $params[$k] = request()->route($k);
                    }
                }

                return [
                    'icon'  => $item['icon'] ?? null,
                    'label' => $item['label'] ?? null,
                    'url'   => Route::has($item['route'])
                        ? route($item['route'], $params)
                        : '#',
                ];
            })
            ->filter()
            ->values();

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
                $menu = $generateMenu($module);
                $isFeatured = ($viewMode === 'mobile' && $featuredTabName && $index === $featuredIndex);
            @endphp

            <a href="{{ $menu[0]['url'] ?? '#' }}" 
               class="module-tab module-tab-{{ $viewMode }} {{ $isFeatured ? 'module-tab-featured' : '' }} d-flex flex-column align-items-center justify-content-center text-decoration-none text-primary"
               data-view-mode="{{ $viewMode }}"
               data-menu='@json($menu)'
               data-name="{{ ucfirst($module->name) }}"
               data-index="{{ $index }}"
               data-bs-toggle="tooltip"
               data-bs-placement="{{ $config['placement'] }}"
               title="{{ ucfirst($module->name) }}">
                
                <div class="module-tab-icon-wrapper {{ $isFeatured ? 'module-tab-icon-featured' : '' }}">
                    <i class="fa-fw {{ $module->getMeta('module_icon') ?: 'fas fa-cubes' }} module-tab-icon"></i>
                </div>
                
                <small class="module-tab-label {{ $isFeatured ? 'module-tab-label-featured' : '' }}">
                    {{ ucfirst($module->name) }}
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
                        @php $menu = $generateMenu($module); @endphp
                        <li>
                            <a class="dropdown-item d-flex align-items-center text-truncate"
                               data-view-mode="{{ $viewMode }}"
                               href="{{ $viewMode === 'desktop' || $viewMode === 'vertical' ? 'javascript:void(0);' : ($menu[0]['url'] ?? '#') }}"
                               data-menu='@json($menu)'
                               data-name="{{ ucfirst($module->name) }}"
                               data-index="{{ $maxVisible + $idx }}">
                                <i class="{{ $module->getMeta('module_icon') }} me-2"></i>
                                <span class="text-truncate" style="max-width: calc(100% - 20px);">
                                    {{ ucfirst($module->name) }}
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

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    ['Desktop', 'Vertical', 'Mobile'].forEach(mode => {
        const dropdownBtn = document.getElementById('modulesDropdown' + mode);
        
        if (!dropdownBtn) return;
        
        dropdownBtn.addEventListener('show.bs.dropdown', function (e) {
            if (mode === 'Mobile') return;
            
            const dropdown = e.target.nextElementSibling;
            const rect = e.target.getBoundingClientRect();
            
            document.body.appendChild(dropdown);
            dropdown.style.position = 'fixed';
            dropdown.style.zIndex = '9999';
            dropdown.style.left = (mode === 'Vertical' ? rect.right + 5 : rect.left) + 'px';
            dropdown.style.top = (mode === 'Vertical' ? rect.top : rect.bottom + 5) + 'px';
            dropdown.classList.add('show');
        });
        
        dropdownBtn.addEventListener('hide.bs.dropdown', function (e) {
            if (mode === 'Mobile') return;
            
            const dropdown = document.querySelector('#modulesDropdown' + mode + ' + .dropdown-menu, body > .dropdown-menu');
            if (dropdown) {
                dropdown.classList.remove('show');
                e.target.parentNode.appendChild(dropdown);
            }
        });
    });
});
</script>
@endpush