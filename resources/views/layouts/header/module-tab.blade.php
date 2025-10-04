@php
    $maxVisible = config('userinterface.max_visible_modules');
    $total = count($installedModules);
    $tabsPerScroll = 7;
@endphp

<div class="overflow-x-auto">
<div class="d-flex align-items-center border-start border-white position-relative" style="max-width: calc(100vw - 550px); background-color: #e6e3e3">

    {{-- Scrollable tabs container --}}
    <div class="d-flex flex-grow-1" id="modulesContainer">
        {{-- First N modules --}}
        @foreach($installedModules->take($maxVisible) as $index => $module)
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

            <div class="d-flex flex-column align-items-center justify-content-center p-2 text-center module-tab text-truncate border-end border-white"
                style="width: 80px; flex-shrink: 0;"
                data-menu='@json($menu)'
                data-name="{{ ucfirst($module->name) }}"
                data-index="{{ $index }}"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                title="{{ ucfirst($module->name) }}">
                <i class="{{ $module->getMeta('module_icon') }}"></i>
                <small class="mb-0 text-truncate" style="max-width: 100%;">
                    <small>{{ ucfirst($module->name) }}</small>
                </small>
            </div>
        @endforeach
    </div>

    {{-- Dropdown for remaining modules outside scroll container --}}
    @if($total > $maxVisible)
        <div class="dropdown border-end border-start border-white">
            <button class="btn btn-sm text-primary dropdown-toggle p-1 py-3 small fw-semibold"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                +{{ $total - $maxVisible }}
            </button>
            <ul class="dropdown-menu">
                @foreach($installedModules->skip($maxVisible) as $index => $module)
                    @php
                        $menu = collect(json_decode($module->getMeta("module_sidebar_menu"), true))
                            ->map(function ($item) {
                                $params = $item['params'] ?? [];
                                foreach ($params as $key => $value) {
                                    if ($value === null) {
                                        $params[$key] = request()->route($key);
                                    }
                                }
                                return [
                                    "icon"  => $item["icon"],
                                    "label" => $item["label"],
                                    "url"   => \Illuminate\Support\Facades\Route::has($item["route"])
                                        ? route($item["route"], $params)
                                        : "#",
                                ];
                            });
                    @endphp

                    <li>
                        <a class="dropdown-item d-flex align-items-center text-truncate"
                           href="javascript:void(0);"
                           data-menu='@json($menu)'
                           data-name="{{ ucfirst($module->name) }}"
                           data-index="{{ $maxVisible + $index }}">
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