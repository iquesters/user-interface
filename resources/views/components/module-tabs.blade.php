@php
    $maxVisible = config('userinterface.max_visible_modules');
    $total = count($installedModules);
@endphp

<div class="d-flex {{ $orientation === 'vertical' ? 'flex-column align-items-center' : '' }} border-start border-white"
     style="background-color: #e6e3e3;">

    {{-- Scrollable tabs container --}}
    <div class="d-flex flex-grow-1 {{ $orientation === 'vertical' ? 'flex-column align-items-center overflow-hidden' : '' }}"
         id="modulesContainer">

        {{-- First N modules --}}
        @foreach($installedModules->take($maxVisible) as $index => $module)
            @php
                $menu = collect(json_decode($module->getMeta("module_sidebar_menu"), true))
                    ->map(function($item) {
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

    {{-- Dropdown for remaining modules (outside scroll container) --}}
    @if($total > $maxVisible)
        <div class="dropdown border-start border-white {{ $orientation === 'vertical' ? 'border-end' : '' }} modules-dropdown-{{ $orientation }}">
            <button class="btn btn-sm text-primary dropdown-toggle p-1 py-3 small fw-semibold"
                    type="button"
                    id="modulesDropdown{{ $orientation }}"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="true"
                    aria-expanded="false">
                +{{ $total - $maxVisible }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="modulesDropdown{{ $orientation }}">
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

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const dropdownBtn = document.getElementById('modulesDropdown{{ $orientation }}');
        
        if (dropdownBtn) {
            dropdownBtn.addEventListener('show.bs.dropdown', function (e) {
                const dropdown = e.target.nextElementSibling;
                const rect = e.target.getBoundingClientRect();
                
                // Move dropdown to body
                document.body.appendChild(dropdown);
                
                // Position it
                dropdown.style.position = 'fixed';
                dropdown.style.zIndex = '9999';
                
                @if($orientation === 'vertical')
                    dropdown.style.left = (rect.right + 5) + 'px';
                    dropdown.style.top = rect.top + 'px';
                @else
                    dropdown.style.left = rect.left + 'px';
                    dropdown.style.top = (rect.bottom + 5) + 'px';
                @endif
                
                dropdown.classList.add('show');
            });
            
            dropdownBtn.addEventListener('hide.bs.dropdown', function (e) {
                const dropdown = document.querySelector('#modulesDropdown{{ $orientation }} + .dropdown-menu, body > .dropdown-menu');
                if (dropdown) {
                    dropdown.classList.remove('show');
                    // Move it back
                    e.target.parentNode.appendChild(dropdown);
                }
            });
        }
    });
</script>
@endpush