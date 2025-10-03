@php
    $maxVisible = config('userinterface.max_visible_modules');
    $total = count($installedModules);
@endphp

<div class="d-flex justify-content-center align-items-center flex-wrap gap-2">
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

        <div class="d-flex flex-column align-items-center justify-content-center p-1 border rounded shadow-sm small fw-semibold text-center module-tab"
            data-menu='@json($menu)'
            data-name="{{ ucfirst($module->name) }}"
            data-index="{{ $index }}">
            <i class="{{ $module->getMeta('module_icon') }}"></i>
            <p class="mb-0">{{ ucfirst($module->name) }}</p>
        </div>
    @endforeach

    {{-- Dropdown for remaining --}}
    @if($total > $maxVisible)
        <div class="dropdown">
            <button class="btn btn-sm btn-outline-primary dropdown-toggle p-1 small fw-semibold"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                +{{ $total - $maxVisible }}
            </button>
            <ul class="dropdown-menu shadow rounded-3">
                @foreach($installedModules->skip($maxVisible) as $index => $module)
                    @php
                        $menu = collect(json_decode($module->getMeta("module_sidebar_menu"), true))
                            ->map(function ($item) {
                                $params = $item['params'] ?? [];

                                // Replace nulls with values from current request
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
                        <a class="dropdown-item small fw-semibold module-tab"
                        href="javascript:void(0);"
                        data-menu='@json($menu)'
                        data-name="{{ ucfirst($module->name) }}"
                        data-index="{{ $maxVisible + $index }}">
                            <i class="{{ $module->getMeta('module_icon') }} me-2"></i>
                            {{ ucfirst($module->name) }}
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif
</div>