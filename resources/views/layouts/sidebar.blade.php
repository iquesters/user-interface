@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;

    // Rendered on the server so the menu is there on first paint (no
    // "Loading menu..." flash) and the current page's item is highlighted.
    $navigationMenu = app(\Iquesters\UserInterface\Support\NavigationMenu::class);
    $navModules = $navigationMenu->modules();
    $navActive = $navigationMenu->active();
    // No menu item matches this URL (e.g. dashboard, profile): show the first
    // module; the script below may switch to the one the user last opened.
    $sidebarModule = $navActive['module'] ?? $navModules->first();
    $sidebarItems = $sidebarModule ? $navigationMenu->menu($sidebarModule) : collect();
    $sidebarActiveClasses = 'active bg-primary-subtle text-primary fw-semibold';
@endphp

<aside class="sidebar ui-sidebar {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'has-minibar' : 'no-minibar' }}" id="appSidebar">
    <div class="sidebar-body">
        <div class="list-group list-group-flush" id="sidebarMenu"
             data-server-active="{{ $navActive['module'] ? '1' : '0' }}"
             data-active-index="{{ $navActive['index'] ?? '' }}"
             data-active-url="{{ $navActive['url'] ?? '' }}">
            @if ($sidebarModule && $sidebarItems->isEmpty())
                <div class="text-muted ps-3 pe-2 py-1">No menu available for {{ ucfirst($sidebarModule->name) }}</div>
            @endif
            @foreach ($sidebarItems as $item)
                @php $isActive = $navActive['url'] !== null && $item['url'] === $navActive['url']; @endphp
                <a class="list-group-item dropdown-item ps-3 pe-2 py-1 d-flex align-items-center {{ $isActive ? $sidebarActiveClasses : '' }}"
                   href="{{ $item['url'] }}"
                   @if ($isActive) aria-current="page" @endif>
                    <i class="fa-fw {{ $item['icon'] }} me-2"></i><span>{{ $item['label'] }}</span>
                </a>
            @endforeach
        </div>
    </div>
</aside>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebarMenu');
    const ACTIVE_CLASSES = @json(explode(' ', $sidebarActiveClasses));

    /* ================================
       VIEW MODE HELPERS
    ================================= */
    function getCurrentViewMode() {
        return window.innerWidth < 992 ? 'mobile' : 'vertical';
    }

    function getTabs(mode) {
        return document.querySelectorAll(`.module-tab[data-view-mode="${mode}"]`);
    }

    function getDropdownItems(mode) {
        return document.querySelectorAll(`.dropdown-item[data-menu][data-view-mode="${mode}"]`);
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    /* ================================
       SIDEBAR RENDER (client-side, when switching module)
    ================================= */
    function renderSidebar(menu, name) {
        sidebar.innerHTML = '';

        if (!menu || menu.length === 0) {
            sidebar.innerHTML = `<div class="text-muted ps-3 pe-2 py-1">No menu available for ${escapeHtml(name)}</div>`;
            return;
        }

        const activeUrl = sidebar.dataset.activeUrl;

        menu.forEach(item => {
            const link = document.createElement('a');
            link.className = 'list-group-item dropdown-item ps-3 pe-2 py-1 d-flex align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `<i class="fa-fw ${escapeHtml(item.icon)} me-2"></i><span>${escapeHtml(item.label)}</span>`;
            if (activeUrl && item.url === activeUrl) {
                link.classList.add(...ACTIVE_CLASSES);
                link.setAttribute('aria-current', 'page');
            }
            sidebar.appendChild(link);
        });
    }

    /* ================================
       ACTIVE STATE HANDLER
    ================================= */
    function setActive(element) {
        const mode = element.dataset.viewMode;

        getTabs(mode).forEach(t => t.classList.remove('active-module'));
        getDropdownItems(mode).forEach(d => d.classList.remove('active'));

        element.classList.add(
            element.classList.contains('module-tab') ? 'active-module' : 'active'
        );

        try { localStorage.setItem('activeModuleIndex', element.dataset.index); } catch (e) {}
    }

    /* ================================
       INITIAL STATE
    ================================= */
    const mode = getCurrentViewMode();
    let tabs = getTabs(mode);
    let dropdownItems = getDropdownItems(mode);

    // fallback for header/minibar if no tabs in current mode
    if (!tabs.length) {
        tabs = getTabs('desktop');
    }
    if (!dropdownItems.length) {
        dropdownItems = getDropdownItems('desktop');
    }

    if (!tabs.length) return;

    const findByIndex = index =>
        [...tabs].find(t => t.dataset.index === index) ||
        [...dropdownItems].find(d => d.dataset.index === index);

    if (sidebar.dataset.serverActive === '1') {
        // The server matched the current page: the sidebar is already right.
        const serverActive = findByIndex(sidebar.dataset.activeIndex);
        if (serverActive) setActive(serverActive);
    } else {
        // Page isn't in any menu: reopen the module the user last used.
        let savedIndex = null;
        try { savedIndex = localStorage.getItem('activeModuleIndex'); } catch (e) {}
        const saved = savedIndex !== null ? findByIndex(savedIndex) : null;

        if (saved && saved.dataset.index !== tabs[0].dataset.index) {
            renderSidebar(JSON.parse(saved.dataset.menu || '[]'), saved.dataset.name);
        }
        setActive(saved || tabs[0]);
    }

    /* ================================
       CLICK HANDLERS
    ================================= */
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            renderSidebar(JSON.parse(tab.dataset.menu || '[]'), tab.dataset.name);
            setActive(tab);
        });
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();

            renderSidebar(JSON.parse(item.dataset.menu || '[]'), item.dataset.name);
            setActive(item);

            // Close dropdown
            const btn = item.closest('.dropdown')?.querySelector('[data-bs-toggle="dropdown"]');
            if (btn) bootstrap.Dropdown.getInstance(btn)?.hide();
        });
    });

});
</script>
@endpush
