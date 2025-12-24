document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('appSidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
    const body = document.body;
    const isMobile = () => window.innerWidth < 992;

    // Ensure sidebar exists
    if (!sidebar || !sidebarToggles.length) {
        console.error('Sidebar or toggle buttons not found');
        return;
    }

    // Initialize sidebar state
    function initializeSidebar() {
        sidebar.style.transition = 'none';
        
        if (isMobile()) {
            // Always hidden by default on mobile
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-active');
        } else {
            // Desktop state saved in localStorage
            const savedState = localStorage.getItem('sidebarState');
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
        }, 50);
    }

    // Toggle sidebar visibility
    function toggleSidebar() {
        if (isMobile()) {
            sidebar.classList.toggle('active');
            body.classList.toggle('sidebar-active');
        } else {
            sidebar.classList.toggle('hidden');
            mainContent?.classList.toggle('no-squeeze');
            localStorage.setItem(
                'sidebarState',
                sidebar.classList.contains('hidden') ? 'closed' : 'open'
            );
        }
    }

    // Initialize state
    initializeSidebar();

    // Bind toggle events (for both buttons)
    sidebarToggles.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            toggleSidebar();
        });
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', e => {
        if (
            isMobile() &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !e.target.closest('.sidebar-toggle')
        ) {
            toggleSidebar();
        }
    });

    // Close sidebar when clicking a link (mobile only)
    sidebar.querySelectorAll('.list-group-item').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile() && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', initializeSidebar);
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