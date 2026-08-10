(function () {
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

    function getTabs(mode) {
        return document.querySelectorAll(`.module-tab[data-view-mode="${mode}"]`);
    }

    function getDropdownItems(mode) {
        return document.querySelectorAll(`.dropdown-item[data-menu][data-view-mode="${mode}"]`);
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

    function renderSidebar(menu) {
        const sidebar = document.getElementById('sidebarMenu');

        if (!sidebar) {
            return;
        }

        sidebar.innerHTML = '';

        if (!menu || menu.length === 0) {
            sidebar.innerHTML = '<div class="text-muted ps-3 pe-2 py-1">No menu available.</div>';
            sidebar.classList.remove('nav-sidebar-pending');
            sidebar.classList.add('nav-sidebar-ready');
            return;
        }

        const sortedMenu = [...menu].sort((left, right) => {
            const leftOrder = Number.isFinite(Number(left?.sort_order)) ? Number(left.sort_order) : Number.MAX_SAFE_INTEGER;
            const rightOrder = Number.isFinite(Number(right?.sort_order)) ? Number(right.sort_order) : Number.MAX_SAFE_INTEGER;

            if (leftOrder === rightOrder) {
                return 0;
            }

            return leftOrder - rightOrder;
        });

        const currentUrl = normalizeUrl(window.location.href);
        const currentPath = normalizeUrl(window.location.pathname + window.location.search + window.location.hash);

        sortedMenu.forEach(item => {
            const link = document.createElement('a');
            link.className = 'list-group-item dropdown-item ps-3 pe-2 py-1 d-flex align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `<i class="fa-fw ${item.icon || 'fas fa-circle'} me-2"></i><span>${item.label || ''}</span>`;

            const itemUrl = normalizeUrl(item.url);
            if (itemUrl && (itemUrl === currentUrl || itemUrl === currentPath)) {
                link.classList.add('sidebar-active-module');
                link.setAttribute('aria-current', 'page');
            }

            sidebar.appendChild(link);
        });

        sidebar.classList.remove('nav-sidebar-pending');
        sidebar.classList.add('nav-sidebar-ready');
    }

    function refreshSidebarFromModuleUid(moduleUid, fallbackMenu) {
        if (!moduleUid) {
            return false;
        }

        const activeElement =
            document.querySelector(`.module-tab[data-module-uid="${moduleUid}"]`) ||
            document.querySelector(`.dropdown-item[data-module-uid="${moduleUid}"]`);

        if (!activeElement) {
            if (Array.isArray(fallbackMenu)) {
                renderSidebar(fallbackMenu);
                return true;
            }

            return false;
        }

        let menu = fallbackMenu;

        if (!Array.isArray(menu)) {
            try {
                menu = JSON.parse(activeElement.dataset.menu || '[]');
            } catch (e) {
                menu = [];
            }
        }

        renderSidebar(menu);
        setActive(activeElement);
        return true;
    }

    function getPrimarySidebarUrl(menu) {
        if (!Array.isArray(menu)) {
            return '';
        }

        const firstVisibleItem = menu.find(item => item && item.url && item.url !== '#');
        return firstVisibleItem ? firstVisibleItem.url : '';
    }

    function setActive(element) {
        const mode = element.dataset.viewMode;
        const moduleUid = element.dataset.moduleUid || '';

        getTabs(mode).forEach(t => t.classList.remove('minibar-active-module'));
        getDropdownItems(mode).forEach(d => d.classList.remove('active'));

        element.classList.add(element.classList.contains('module-tab') ? 'minibar-active-module' : 'active');
        localStorage.setItem('activeModuleUid', moduleUid);
        localStorage.setItem('activeModuleIndex', element.dataset.index);
    }

    function navigateToModule(element) {
        const href = element.dataset.href || element.getAttribute('href');
        let menu = [];

        try {
            menu = JSON.parse(element.dataset.menu || '[]');
        } catch (e) {
            menu = [];
        }

        const primarySidebarUrl = getPrimarySidebarUrl(menu);
        const targetHref = primarySidebarUrl || href;

        if (!targetHref || targetHref === '#' || targetHref.startsWith('javascript:')) {
            return false;
        }

        localStorage.setItem('activeModuleUid', element.dataset.moduleUid || '');
        localStorage.setItem('activeModuleIndex', element.dataset.index || '');
        window.location.href = targetHref;
        return true;
    }

    function activateCurrentModule() {
        const mode = window.innerWidth < 992 ? 'mobile' : 'vertical';
        let tabs = getTabs(mode);
        let dropdownItems = getDropdownItems(mode);

        if (!tabs.length) {
            tabs = getTabs('desktop');
        }
        if (!dropdownItems.length) {
            dropdownItems = getDropdownItems('desktop');
        }

        if (!tabs.length) {
            return;
        }

        const urlModuleUid = new URL(window.location.href).searchParams.get('module_uid');
        const savedUid = localStorage.getItem('activeModuleUid');
        const savedIndex = localStorage.getItem('activeModuleIndex');
        let activeElement = null;

        if (urlModuleUid) {
            activeElement =
                [...tabs].find(t => t.dataset.moduleUid === urlModuleUid) ||
                [...dropdownItems].find(d => d.dataset.moduleUid === urlModuleUid) ||
                null;
        }

        if (savedUid) {
            activeElement =
                activeElement ||
                [...tabs].find(t => t.dataset.moduleUid === savedUid) ||
                [...dropdownItems].find(d => d.dataset.moduleUid === savedUid) ||
                null;
        }

        if (savedIndex) {
            activeElement =
                activeElement ||
                [...tabs].find(t => t.dataset.index === savedIndex) ||
                [...dropdownItems].find(d => d.dataset.index === savedIndex) ||
                null;
        }

        if (!activeElement) {
            activeElement = findActiveElementByCurrentUrl(tabs, dropdownItems);
        }

        if (!activeElement) {
            activeElement = tabs[0];
        }

        try {
            const activeMenu = JSON.parse(activeElement.dataset.menu || '[]');
            renderSidebar(activeMenu);
        } catch (e) {
            renderSidebar([]);
        }

        setActive(activeElement);
    }

    document.addEventListener('click', function (e) {
        const moduleTab = e.target.closest('.module-tab[data-href]');
        if (moduleTab) {
            const href = moduleTab.dataset.href || moduleTab.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                e.preventDefault();
                navigateToModule(moduleTab);
            }
            return;
        }

        const dropdownItem = e.target.closest('.dropdown-item[data-menu][data-href]');
        if (dropdownItem) {
            const href = dropdownItem.dataset.href || dropdownItem.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('javascript:')) {
                e.preventDefault();
                navigateToModule(dropdownItem);
            }
        }
    }, true);

    document.addEventListener('DOMContentLoaded', activateCurrentModule);

    document.addEventListener('navigation:sidebar-refresh', function (event) {
        const detail = event.detail || {};
        refreshSidebarFromModuleUid(detail.moduleUid, detail.menu);
    });

    window.__refreshNavigationSidebar = function (moduleUid, menu) {
        return refreshSidebarFromModuleUid(moduleUid, menu);
    };
})();
