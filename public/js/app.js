document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('appSidebar');
    const mainContent = document.getElementById('mainContent');
    const body = document.body;

    const isMobile = () => window.innerWidth < 992;

    if (!sidebar) {
        console.error('Sidebar not found');
        return;
    }

    /* ----------------------------
       Update hamburger buttons
    ---------------------------- */
    function updateHamburgerState() {
        const isOpen = isMobile()
            ? sidebar.classList.contains('active')   // Mobile uses .active
            : !sidebar.classList.contains('hidden'); // Desktop uses .hidden

        document.querySelectorAll('.sidebar-toggle').forEach(btn => {
            btn.classList.toggle('btn-light', isOpen);
        });
    }

    /* ----------------------------
       Initialize sidebar
    ---------------------------- */
    function initializeSidebar() {
        sidebar.style.transition = 'none';

        const savedState = localStorage.getItem('sidebarState');

        if (isMobile()) {
            // Always closed on mobile
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-active');
        } else {
            // Desktop state persisted
            if (savedState === 'closed') {
                sidebar.classList.add('hidden');
                mainContent?.classList.add('no-squeeze');
            } else {
                sidebar.classList.remove('hidden');
                mainContent?.classList.remove('no-squeeze');
            }
        }

        setTimeout(() => {
            sidebar.style.transition = 'all 0.3s ease';
            updateHamburgerState();
        }, 50);
    }

    /* ----------------------------
       Toggle sidebar
    ---------------------------- */
    function toggleSidebar() {
        if (isMobile()) {
            sidebar.classList.toggle('active');
            body.classList.toggle('sidebar-active');

            updateHamburgerState();
            return;
        }

        // Desktop
        sidebar.classList.toggle('hidden');
        mainContent?.classList.toggle('no-squeeze');

        const isOpen = !sidebar.classList.contains('hidden');
        localStorage.setItem('sidebarState', isOpen ? 'open' : 'closed');

        updateHamburgerState();
    }

    /* ----------------------------
       Event delegation for toggles
    ---------------------------- */
    document.addEventListener('click', function (e) {
        const toggleBtn = e.target.closest('.sidebar-toggle');
        if (!toggleBtn) return;

        e.preventDefault();
        toggleSidebar();
    });

    /* ----------------------------
       Close sidebar when clicking outside (mobile)
    ---------------------------- */
    document.addEventListener('click', function (e) {
        if (
            isMobile() &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !e.target.closest('.sidebar-toggle')
        ) {
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-active');
            updateHamburgerState();
        }
    });

    /* ----------------------------
       Close sidebar when clicking links (mobile)
    ---------------------------- */
    sidebar.querySelectorAll('.list-group-item').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile() && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                body.classList.remove('sidebar-active');
                updateHamburgerState();
            }
        });
    });

    /* ----------------------------
       Handle window resize
    ---------------------------- */
    window.addEventListener('resize', initializeSidebar);

    // Initialize on page load
    initializeSidebar();
});

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            template: `
                <div class="tooltip custom-tooltip fully-opaque" role="tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner"></div>
                </div>`,
            animation: true,
            html: true
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeTooltips);

document.addEventListener('DOMContentLoaded', function () {
    const adminBar = document.getElementById('super-admin-navbar');
    const header = document.querySelector('header.sticky-top');

    if (adminBar && header) {
        const height = adminBar.offsetHeight;
        header.style.top = height + 'px';
    }
});