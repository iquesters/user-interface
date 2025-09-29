document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('appSidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;
    const isMobile = () => window.innerWidth < 992;

    // Check if elements exist
    if (!sidebar || !mainContent || !sidebarToggle) {
        console.error('Required elements not found');
        return;
    }

    // Initialize sidebar state
    function initializeSidebar() {
        // Disable transitions temporarily
        sidebar.style.transition = 'none';
        
        if (isMobile()) {
            // Mobile: hidden by default
            sidebar.classList.remove('active', 'hidden');
            mainContent.classList.remove('no-squeeze');
        } else {
            // Desktop: check saved state
            const savedState = localStorage.getItem('sidebarState');
            if (savedState === 'closed') {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('active');
                mainContent.classList.add('no-squeeze');
            } else {
                // Default for desktop - sidebar visible
                sidebar.classList.remove('hidden', 'active');
                mainContent.classList.remove('no-squeeze');
            }
        }
        
        // Re-enable transitions
        setTimeout(() => {
            sidebar.style.transition = 'all 0.3s ease';
        }, 50);
    }

    // Toggle sidebar function
    function toggleSidebar() {
        if (isMobile()) {
            // Mobile behavior - use 'active' class
            sidebar.classList.toggle('active');
            body.classList.toggle('sidebar-active');
        } else {
            // Desktop behavior - use 'hidden' class
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('no-squeeze');
            
            // Save state
            const isHidden = sidebar.classList.contains('hidden');
            localStorage.setItem('sidebarState', isHidden ? 'closed' : 'open');
        }
    }

    // Initialize on load
    initializeSidebar();

    // Apply toggle event
    sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSidebar();
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (isMobile() && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target)) {
            toggleSidebar();
        }
    });

    // Handle sidebar link clicks
    const navLinks = document.querySelectorAll('.sidebar .list-group-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Only close the sidebar on mobile
            if (isMobile() && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    });

    // Handle resize events
    window.addEventListener('resize', function() {
        initializeSidebar();
    });
});