@php
    use Illuminate\Support\Str;

    // Layout-controlled defaults
    $tabId     = 'tabs';
    $sticky    = false;
    $secondary = false;

    // Filter tabs user can actually see
    $visibleTabs = collect($tabs)->filter(function ($tab) {
        if (!empty($tab['permission']) && auth()->check()) {
            return auth()->user()->can($tab['permission']);
        }

        return true;
    })->values();
@endphp

@if ($visibleTabs->count() > 1)
    <ul
        id="{{ $tabId }}"
        class="nav {{ $secondary ? 'nav-pills' : 'nav-tabs' }}
               mb-2 {{ $sticky ? 'nav-tabs-sticky-top' : '' }}"
        role="tablist"
    >
        @foreach ($visibleTabs as $index => $tab)
            @php
                // Route params (safe)
                $routeParams = array_filter($tab['params'] ?? [], fn ($v) => !is_null($v));

                // Auto-generate stable tab id
                $autoTabId = 'tab-' . Str::slug($tab['route'] . '-' . $index);

                // Server-side active (basic)
                $isActive = request()->routeIs($tab['route']);
            @endphp

            <li class="nav-item" role="presentation">
                <a
                    id="{{ $autoTabId }}"
                    href="{{ route($tab['route'], $routeParams) }}"
                    class="nav-link
                           {{ $isActive ? 'active' : '' }}
                           d-flex d-lg-block flex-column flex-lg-row align-items-center px-2 px-md-3"
                >
                    @isset($tab['icon'])
                        <i class="{{ $tab['icon'] }} me-1"></i>
                    @endisset

                    {!! $tab['label'] !!}
                </a>
            </li>
        @endforeach
    </ul>
@endif

@once
@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('ul.nav.nav-tabs, ul.nav.nav-pills').forEach(nav => {
        const links = nav.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname.replace(/\/$/, '');

        let matched = false;

        // Exact match
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            const linkPath = new URL(href, window.location.origin)
                .pathname.replace(/\/$/, '');

            if (currentPath === linkPath) {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                matched = true;
            }
        });

        // Prefix match (nested routes)
        if (!matched) {
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;

                const linkPath = new URL(href, window.location.origin)
                    .pathname.replace(/\/$/, '');

                if (
                    currentPath === linkPath ||
                    currentPath.startsWith(linkPath + '/')
                ) {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }
    });
});
</script>
@endpush
@endonce