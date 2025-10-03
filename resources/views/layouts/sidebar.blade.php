<aside class="sidebar bg-light text-dark p-1" id="appSidebar">
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
    function setActive(tab) {
        tabs.forEach(t => t.classList.remove('active-module'));
        tab.classList.add('active-module');
        localStorage.setItem('activeModuleIndex', tab.dataset.index);
    }

    // Load saved module or default first
    let savedIndex = localStorage.getItem('activeModuleIndex');
    let defaultTab = tabs[0];

    if (savedIndex) {
        const tab = Array.from(tabs).find(t => t.dataset.index === savedIndex);
        if (tab) defaultTab = tab;
    }

    renderSidebar(JSON.parse(defaultTab.dataset.menu || '[]'), defaultTab.dataset.name);
    setActive(defaultTab);

    // Attach click events
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            renderSidebar(JSON.parse(tab.dataset.menu || '[]'), tab.dataset.name);
            setActive(tab);
        });
    });
});
</script>
@endpush