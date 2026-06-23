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

@push('styles')
<style>
.sidebar #sidebarMenu .active-module {
    background-color: var(--bs-primary-bg-subtle) !important;
    color: var(--bs-primary-text-emphasis) !important;
    font-weight: 600;
    border-radius: 0.35rem;
}

.sidebar #sidebarMenu .active-module:hover {
    background-color: var(--bs-primary-bg-subtle) !important;
    color: var(--bs-primary-text-emphasis) !important;
}

.sidebar #sidebarMenu .dropdown-item:hover {
    background-color: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
    border-radius: 0.35rem;
}
</style>
@endpush

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

    function normalizeUrl(url) {
        if (!url) return '';

        try {
            const parsed = new URL(url, window.location.origin);
            return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch (e) {
            return url;
        }
    }

    function menuMatchesCurrentUrl(menu) {
        const currentUrl = normalizeUrl(window.location.href);
        const currentPath = normalizeUrl(window.location.pathname + window.location.search + window.location.hash);

        return (menu || []).some(item => {
            if (!item || !item.url || item.url === '#') {
                return false;
            }

            const itemUrl = normalizeUrl(item.url);
            return itemUrl === currentUrl || itemUrl === currentPath;
        });
    }

    function findActiveElementByCurrentUrl(tabs, dropdownItems) {
        const tabMatch = [...tabs].find(tab => {
            try {
                const menu = JSON.parse(tab.dataset.menu || '[]');
                return menuMatchesCurrentUrl(menu);
            } catch (e) {
                return false;
            }
        });

        if (tabMatch) {
            return tabMatch;
        }

        return [...dropdownItems].find(item => {
            try {
                const menu = JSON.parse(item.dataset.menu || '[]');
                return menuMatchesCurrentUrl(menu);
            } catch (e) {
                return false;
            }
        }) || null;
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

        const currentUrl = normalizeUrl(window.location.href);
        const currentPath = normalizeUrl(window.location.pathname + window.location.search + window.location.hash);

        menu.forEach(item => {
            const link = document.createElement('a');
            link.className = 'list-group-item dropdown-item ps-3 pe-2 py-1 d-flex align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `<i class="fa-fw ${item.icon} me-2"></i><span>${item.label}</span>`;

            const itemUrl = normalizeUrl(item.url);
            if (itemUrl && (itemUrl === currentUrl || itemUrl === currentPath)) {
                link.classList.add('active-module');
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
    let activeElement = findActiveElementByCurrentUrl(tabs, dropdownItems);

    if (!activeElement && savedIndex) {
        activeElement =
            [...tabs].find(t => t.dataset.index === savedIndex) ||
            [...dropdownItems].find(d => d.dataset.index === savedIndex) ||
            tabs[0];
    }

    if (!activeElement) {
        activeElement = tabs[0];
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
