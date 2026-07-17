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
