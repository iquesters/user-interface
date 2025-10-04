@php
    $maxVisible = config('userinterface.max_visible_modules');
    $total = count($installedModules);
    $tabsPerScroll = 7;
@endphp

<div class="d-flex align-items-center border-start border-white position-relative" style="max-width: calc(100vw - 550px); background-color: #e6e3e3">
    {{-- Left arrow --}}
    <button class="btn btn-sm position-absolute start-0 top-50 translate-middle-y arrow-btn d-none bg-secondary border text-info" id="leftArrow">
        &#8592;
    </button>

    {{-- Scrollable tabs container --}}
    <div class="d-flex overflow-hidden flex-grow-1" id="modulesContainer">
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

    {{-- Right arrow --}}
    <button class="btn btn-sm position-absolute end-0 top-50 translate-middle-y arrow-btn d-none bg-secondary border text-info" id="rightArrow">
        &#8594;
    </button>
</div>

{{-- CSS --}}
<style>
    #modulesContainer {
        scroll-behavior: smooth;
    }
    .arrow-btn {
        z-index: 10;
    }
</style>

{{-- JS --}}
<script>
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('modulesContainer');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');

    const tabs = Array.from(container.children);
    let currentPage = 0;

    function getTabsPerPage() {
        // How many tabs fit fully in the visible container
        const containerWidth = container.clientWidth;
        let totalWidth = 0;
        let count = 0;
        for (let tab of tabs) {
            totalWidth += tab.offsetWidth;
            if (totalWidth <= containerWidth) count++;
            else break;
        }
        return count || 1; // at least 1
    }

    function scrollToPage(page) {
        const tabsPerPage = getTabsPerPage();
        currentPage = Math.max(0, page);

        const firstTabIndex = currentPage * tabsPerPage;
        if (firstTabIndex >= tabs.length) {
            currentPage = Math.floor((tabs.length - 1) / tabsPerPage);
        }

        const scrollLeft = tabs[firstTabIndex].offsetLeft;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        updateArrows();
    }

    function updateArrows() {
        const maxScroll = container.scrollWidth - container.clientWidth;
        leftArrow.classList.toggle('d-none', container.scrollLeft <= 0);
        rightArrow.classList.toggle('d-none', container.scrollLeft >= maxScroll - 1);
    }

    rightArrow.addEventListener('click', () => {
        scrollToPage(currentPage + 1);
    });

    leftArrow.addEventListener('click', () => {
        scrollToPage(currentPage - 1);
    });

    container.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', () => scrollToPage(currentPage));

    updateArrows();
});

</script>