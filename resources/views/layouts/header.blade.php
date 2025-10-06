{{-- <header class="sticky-top bg-white shadow-sm" style="max-height: 65px;">        
    <div class="d-flex justify-content-between px-2 align-items-center">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2 align-items-center py-2" style="min-width: 242px">
                <button class="btn-light app-left-sidebar-toggler border-0 rounded-circle text-muted d-flex align-items-center justify-content-center" type="button" id="sidebarToggle" style="height: 40px; width: 40px;">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <a href="{{ url('/') }}">
                    <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" alt="Logo" class="brand-logo-sm" style="height: 25px;">
                </a>            
                @if(config('app.debug'))
                    <div class="text-bg-danger fw-bold px-2 py-1 rounded">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
                @endif

            </div>
                <div class="d-none d-lg-flex">
                    <!-- Module Tabs -->
                    @include('userinterface::layouts.header.module-tab')
                </div>
            @php
                $mobileMaxVisible = 4; // 4 tabs + 1 for dropdown
                $mobileTabs = $installedModules->take($mobileMaxVisible);
                $mobileDropdownTabs = $installedModules->skip($mobileMaxVisible);
            @endphp

            <!-- Mobile bottom navigation (sm + md screens) -->
            <div class="d-flex d-lg-none justify-content-between align-items-center border-top bg-white shadow-sm" 
                style="height: 60px; position: fixed; bottom: 0; width: 100%; z-index: 1050;">

                @foreach($mobileTabs as $module)
                    @php
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

                    <a href="{{ $menu[0]['url'] ?? '#' }}" class="d-flex flex-column align-items-center justify-content-center text-center text-dark flex-grow-1 text-decoration-none" 
                    data-bs-toggle="tooltip" data-bs-placement="top" title="{{ ucfirst($module->name) }}">
                        <i class="{{ $module->getMeta('module_icon') }}"></i>
                        <small>{{ ucfirst($module->name) }}</small>
                    </a>
                @endforeach

                <!-- Dropdown for remaining modules -->
                @if($mobileDropdownTabs->count() > 0)
                    <div class="dropdown dropup flex-grow-1 text-center">
                        <button class="btn btn-sm dropdown-toggle p-0 m-0 border-0 bg-transparent" type="button" data-bs-toggle="dropdown">
                            <i class="fa-solid fa-ellipsis"></i>
                        </button>
                        <ul class="dropdown-menu">
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

        <div class="d-flex align-items-center justify-content-center gap-2">     
            <!-- User -->
            @include('userinterface::layouts.header.user')
            
            @if(config('app.env') === 'dev')
                @include('userinterface::layouts.dropdown-dev')
            @endif

        </div>
    </div>
</header> --}}

<header class="sticky-top bg-white shadow-sm" style="max-height: 56px;">        
    <div class="d-flex justify-content-between px-2 align-items-center">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2 align-items-center py-2" style="min-width: 242px">
                <button class="btn-light app-left-sidebar-toggler border-0 rounded-circle text-muted d-flex align-items-center justify-content-center" type="button" id="sidebarToggle" style="height: 40px; width: 40px;">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <a href="{{ url('/') }}">
                    <img src="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getLogoUrl() }}" alt="Logo" class="brand-logo-sm" style="height: 25px;">
                </a>            
                @if(config('app.debug'))
                    <div class="text-bg-danger fw-bold px-2 py-1 rounded">{{ \Illuminate\Support\Str::upper(config('app.env')) }}</div>
                @endif
            </div>
            
            <div class="d-none d-lg-flex">
                <!-- Module Tabs -->
                @include('userinterface::layouts.header.module-tab')
            </div>
        </div>

        <div class="d-flex align-items-center justify-content-center gap-2">     
            <!-- User -->
            @include('userinterface::layouts.header.user')
            
            @if(config('app.env') === 'dev')
                @include('userinterface::layouts.dropdown-dev')
            @endif
        </div>
    </div>
</header>