@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
@endphp

<aside class="sidebar ui-sidebar bg-light {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'has-minibar' : 'no-minibar' }}" id="appSidebar">
    <div class="sidebar-body">
        <div class="list-group list-group-flush" id="sidebarMenu">
            <div class="list-group-item dropdown-item ps-3 pe-2 py-1 d-flex justify-content-between align-items-center">
                Loading menu...
            </div>
        </div>
    </div>
</aside>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebarMenu');

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

    /* ================================
       SIDEBAR RENDER
    ================================= */
    function renderSidebar(menu, name) {
        sidebar.innerHTML = '';

        if (!menu || menu.length === 0) {
            sidebar.innerHTML = `<div class="text-muted ps-3 pe-2 py-1">No menu available for ${name}</div>`;
            return;
        }

        menu.forEach(item => {
            const link = document.createElement('a');
            link.className = 'list-group-item dropdown-item ps-3 pe-2 py-1 d-flex align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `<i class="fa-fw ${item.icon} me-2"></i><span>${item.label}</span>`;
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

        localStorage.setItem('activeModuleIndex', element.dataset.index);
    }

    /* ================================
       INITIAL LOAD
    ================================= */
    const mode = getCurrentViewMode();
    let tabs = getTabs(mode);
    let dropdownItems = getDropdownItems(mode);

    // fallback for header/minibar if no tabs in current mode
    if (!tabs.length) {
        tabs = getTabs('desktop'); // try desktop tabs
    }
    if (!dropdownItems.length) {
        dropdownItems = getDropdownItems('desktop');
    }

    if (!tabs.length) return; // still none? exit

    let savedIndex = localStorage.getItem('activeModuleIndex');
    let activeElement = tabs[0];

    if (savedIndex) {
        activeElement =
            [...tabs].find(t => t.dataset.index === savedIndex) ||
            [...dropdownItems].find(d => d.dataset.index === savedIndex) ||
            activeElement;
    }

    renderSidebar(JSON.parse(activeElement.dataset.menu || '[]'), activeElement.dataset.name);
    setActive(activeElement);

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