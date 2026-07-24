@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
@endphp

<aside class="sidebar ui-sidebar bg-body {{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'has-minibar' : 'no-minibar' }}" id="appSidebar">
    <div class="sidebar-body bg-body">
        <div class="list-group list-group-flush" id="sidebarMenu">
            <div class="list-group-item dropdown-item ps-3 pe-2 py-1 d-flex justify-content-between align-items-center">
                Loading menu...
            </div>
        </div>
    </div>
</aside>
