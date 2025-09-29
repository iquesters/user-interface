<!-- Sidebar -->
<aside class="sidebar bg-light text-dark p-1" id="appSidebar">
    <div class="sidebar-body">
        <div class="list-group list-group-flush">
            @if (class_exists(\Iquesters\UserManagement\UserManagementServiceProvider::class))
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="{{ route('dashboard') }}">
                    <span><i class="fas fa-fw fa-tachometer-alt me-2"></i>Dashboard</span>
                </a>
                {{-- @if (Auth::user()->hasRole('super-admin')) --}}
                {{-- @can('manage-users') --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="{{ route('users.index') }}">
                    <span><i class="fas fa-fw fa-users me-2"></i>Users</span>
                </a>
            @endif
            @if (class_exists(\Iquesters\Organisation\OrganisationServiceProvider::class))
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="{{ route('organisations.index') }}">
                    <span><i class="fas fa-fw fa-building me-2"></i>Organisation</span>
                </a>
            @endif
            @if (class_exists(\Iquesters\UserManagement\UserManagementServiceProvider::class))
                {{-- @endcan --}}
                {{-- @can('manage-roles') --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="{{ route('roles.index') }}">
                    <span><i class="fas fa-fw fa-user-shield me-2"></i>Roles</span>
                </a>
                {{-- @endcan --}}
                
                {{-- @can('manage-permissions') --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="{{ route('permissions.index') }}">
                    <span><i class="fas fa-fw fa-shield-alt me-2"></i>Permissions</span>
                </a>
                {{-- @endcan --}}
                
                {{-- @can('view-master_data') --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="#">
                    <span><i class="fas fa-fw fa-database me-2"></i>Master Data</span>
                </a>
                {{-- @endcan --}}
                
                {{-- @can('view-qr_codes') --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="#">
                    <span><i class="fas fa-fw fa-qrcode me-2"></i>QR Codes</span>
                </a>
                {{-- @endcan --}}
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="#">
                    <span><i class="fas fa-fw fa-user-friends me-2"></i>Persons</span>
                </a>
                <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center" href="#">
                    <span><i class="fas fa-fw fa-plug me-2"></i>Modules</span>
                </a>
            @endif
                {{-- <a class="list-group-item dropdown-item px-2 py-1 d-flex justify-content-between align-items-center"
                href="{{ route('organisations.integration.index', ['organisationUid' => $organisation->uid ?? 'default']) }}">
                    <span><i class="fas fa-fw fa-plug me-2"></i>Integrations</span>
                </a> --}}
            {{-- @endif --}}
        </div>
    </div>
</aside>