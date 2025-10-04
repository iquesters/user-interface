@php
    $mobileMaxVisible = config('userinterface.mobile_bottom_tabs', 4);
    $featuredTabName = config('userinterface.mobile_featured_tab'); // Can be null for no featured tab
    $featuredPosition = config('userinterface.mobile_featured_position', 'center'); // 'center' or null
    
    $mobileTabs = $installedModules->take($mobileMaxVisible);
    $mobileDropdownTabs = $installedModules->skip($mobileMaxVisible);
    $tabCount = $mobileTabs->count();
    
    // Find the featured tab by name and move it to center if needed
    $featuredIndex = -1;
    if ($featuredTabName) {
        foreach ($mobileTabs as $idx => $mod) {
            if (strtolower(trim($mod->name)) === strtolower(trim($featuredTabName))) {
                $featuredIndex = $idx;
                break;
            }
        }
        
        // If position is 'center', reorder tabs to move featured tab to center
        if ($featuredPosition === 'center' && $featuredIndex !== -1) {
            $centerIndex = (int) floor($tabCount / 2);
            $tabsArray = $mobileTabs->values()->all();
            
            // Swap featured tab with center position
            if ($featuredIndex !== $centerIndex) {
                $temp = $tabsArray[$centerIndex];
                $tabsArray[$centerIndex] = $tabsArray[$featuredIndex];
                $tabsArray[$featuredIndex] = $temp;
                $mobileTabs = collect($tabsArray);
                $featuredIndex = $centerIndex; // Update featured index
            }
        }
    }
@endphp

<!-- Mobile bottom navigation (sm + md screens) -->
<div class="d-flex d-lg-none align-items-center border-top bg-white shadow-sm vw-100" 
    style="height: 70px; position: fixed; bottom: 0; z-index: 1050;">
    
    <div class="d-flex w-100 h-100 align-items-center {{ $tabCount < $mobileMaxVisible ? 'justify-content-center' : 'justify-content-around' }}" 
            style="padding: 0 8px;">
        
        @foreach($mobileTabs as $index => $module)
            @php
                // Check if this is the featured tab
                $isFeatured = ($featuredTabName && $index === $featuredIndex);
                
                $menu = collect(json_decode($module->getMeta("module_sidebar_menu"), true))
                    ->map(function($item) {
                        return [
                            "icon" => $item["icon"],
                            "label" => $item["label"],
                            "url" => \Illuminate\Support\Facades\Route::has($item["route"])
                                ? route($item["route"], ["organisationUid" => request()->route("organisationUid")])
                                : "#",
                        ];
                    });
            @endphp

            @if($isFeatured)
                <!-- Featured Tab (Large/Elevated) -->
                <a href="{{ $menu[0]['url'] ?? '#' }}" 
                    class="d-flex flex-column align-items-center text-decoration-none"
                    data-bs-toggle="tooltip" data-bs-placement="top" title="{{ ucfirst($module->name) }}"
                    style="flex: 1 1 0; min-width: 0; position: relative;">
                    <div class="d-flex align-items-center justify-content-center rounded-circle text-white shadow-lg" 
                            style="width: 56px; height: 56px; margin-top: -20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        <i class="{{ $module->getMeta('module_icon') }} fs-4"></i>
                    </div>
                    <small class="fw-semibold text-center" style="font-size: 0.65rem; margin-top: 4px; color: #667eea; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
                        {{ ucfirst($module->name) }}
                    </small>
                </a>
            @else
                <!-- Regular Tab -->
                <a href="{{ $menu[0]['url'] ?? '#' }}" 
                    class="d-flex flex-column align-items-center justify-content-center text-center text-dark text-decoration-none mobile-nav-tab" 
                    data-bs-toggle="tooltip" data-bs-placement="top" title="{{ ucfirst($module->name) }}"
                    style="flex: 1 1 0; min-width: 0; padding: 8px 4px; transition: all 0.2s;">
                    <i class="{{ $module->getMeta('module_icon') }} fs-5"></i>
                    <small style="font-size: 0.65rem; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
                        {{ ucfirst($module->name) }}
                    </small>
                </a>
            @endif
        @endforeach

        <!-- Dropdown for remaining modules -->
        @if($mobileDropdownTabs->count() > 0)
            <div class="dropdown dropup" style="flex: 1 1 0;">
                <button class="btn d-flex flex-column align-items-center justify-content-center w-100 border-0 bg-transparent text-primary" 
                        type="button" data-bs-toggle="dropdown"
                        style="padding: 8px 4px;">
                    <div class="d-flex flex-column align-items-center">
                    </div>
                    <small class="gap-2">+{{ $mobileDropdownTabs->count() }}
                        <i class="fa-solid fa-caret-up"></i>
                    </small>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    @foreach($mobileDropdownTabs as $module)
                        @php
                            $menu = collect(json_decode($module->getMeta("module_sidebar_menu"), true))
                                ->map(function($item) {
                                    $params = $item['params'] ?? [];
                                    foreach ($params as $key => $value) {
                                        if ($value === null) $params[$key] = request()->route($key);
                                    }
                                    return [
                                        "icon" => $item["icon"],
                                        "label" => $item["label"],
                                        "url" => \Illuminate\Support\Facades\Route::has($item["route"])
                                            ? route($item["route"], $params)
                                            : "#",
                                    ];
                                });
                        @endphp
                        <li>
                            <a class="dropdown-item d-flex align-items-center" href="{{ $menu[0]['url'] ?? '#' }}">
                                <i class="{{ $module->getMeta('module_icon') }} me-2"></i>
                                <span>{{ ucfirst($module->name) }}</span>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif

    </div>
</div>