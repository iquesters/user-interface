<aside class="sidebar bg-light text-dark p-1 {{ config('userinterface.nav_style') === 'minibar' ? 'has-minibar' : 'no-minibar' }}" id="appSidebar">
    <div class="sidebar-body">
        <div class="list-group list-group-flush" id="sidebarMenu">
            <div class="text-muted px-2 py-1">Loading menu...</div>
        </div>
    </div>
</aside>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebarMenu');
    const tabs = document.querySelectorAll('.module-tab');
    const dropdownItems = document.querySelectorAll('.dropdown-item[data-menu]');

    // Render sidebar
    function renderSidebar(menu, name) {
        sidebar.innerHTML = '';
        if (!menu || menu.length === 0) {
            sidebar.innerHTML = `<div class="text-muted px-2 py-1">No menu available for ${name}</div>`;
            return;
        }

        menu.forEach(item => {
            const link = document.createElement('a');
            link.className = 'list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center';
            link.href = item.url || '#';
            link.innerHTML = `<span><i class="${item.icon} me-2"></i>${item.label}</span>`;
            sidebar.appendChild(link);
        });
    }

    // Set active tab
    function setActive(element) {
        // Remove active from all tabs
        tabs.forEach(t => t.classList.remove('active-module'));
        dropdownItems.forEach(d => d.classList.remove('active'));
        
        // Add active to current element
        element.classList.add(element.classList.contains('module-tab') ? 'active-module' : 'active');
        localStorage.setItem('activeModuleIndex', element.dataset.index);
    }

    // Load saved module or default first
    let savedIndex = localStorage.getItem('activeModuleIndex');
    let defaultElement = tabs[0];

    if (savedIndex) {
        // Check in tabs first
        let element = Array.from(tabs).find(t => t.dataset.index === savedIndex);
        
        // If not found in tabs, check dropdown items
        if (!element) {
            element = Array.from(dropdownItems).find(d => d.dataset.index === savedIndex);
        }
        
        if (element) defaultElement = element;
    }

    renderSidebar(JSON.parse(defaultElement.dataset.menu || '[]'), defaultElement.dataset.name);
    setActive(defaultElement);

    // Attach click events to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            renderSidebar(JSON.parse(tab.dataset.menu || '[]'), tab.dataset.name);
            setActive(tab);
        });
    });

    // Attach click events to dropdown items
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            renderSidebar(JSON.parse(item.dataset.menu || '[]'), item.dataset.name);
            setActive(item);
            
            // Close the dropdown after selection
            const dropdownBtn = document.querySelector('[data-bs-toggle="dropdown"]');
            if (dropdownBtn) {
                const dropdown = bootstrap.Dropdown.getInstance(dropdownBtn);
                if (dropdown) dropdown.hide();
            }
        });
    });
});
</script>
@endpush