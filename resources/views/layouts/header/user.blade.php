<div class="d-flex gap-2 align-items-center">
    <ul class="navbar-nav flex-row align-items-center ms-auto">
        <li class="nav-item navbar-dropdown dropdown-user dropdown ms-2">
            <a class="nav-link p-0" href="javascript:void(0);" data-bs-toggle="dropdown" id="userDropdown">
                <div class="avatar avatar-online">
                    <img src="https://placehold.co/400x400/faf3e0/d72638/png?text={{ Auth::user()->name[0] ?? '?' }}"  alt="" class="avatar h-auto rounded-circle" style="width: 40px !important; height: 40px !important;">
                </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-md rounded-4 p-3 profile-dropdown bg-light" id="profileDropdown">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" data-bs-dismiss="dropdown" style="transform: scale(0.75);" aria-label="Close"></button>
                <li class="p-2 text-center mt-2">
                    <div class="d-flex align-items-center">
                        <!-- Profile Image Column -->
                        <div class="me-3 position-relative">
                            <img src="https://placehold.co/400x400/faf3e0/d72638/png?text={{ Auth::user()->name[0] ?? '?' }}" 
                                alt="" 
                                class="rounded-circle" 
                                style="width: 50px; height: 50px;">
                            <button type="button" class="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0 p-0" 
                                    style="width: 20px; height: 20px; transform: translate(25%, 25%);"
                                    data-bs-toggle="modal" data-bs-target="#profilePictureModal">
                                <i class="fa-solid fa-pen fa-2xs"></i>
                            </button>
                        </div>
                        <!-- Profile Details Column -->
                        <div class="text-start">
                            <h6 class="mb-0 fw-semibold ">{{ Auth::user()->name ?? 'Unknown' }}</h6>
                            <small class="d-block">{{ Auth::user()?->email ?? 'Unknown' }}</small>
                            <small>
                                <small class="d-block" title="User Role">
                                    {{ implode(", ", Auth::user()?->roles?->pluck('name')->toArray() ?? ['unknown']) }}
                                </small>
                                <small>
                                    <small class="d-block" title="Last Login">{{ Auth::user()->last_login_at ? Auth::user()->last_login_at->timezone('Asia/Kolkata')->format('d M Y H:i:s') : 'Unknown' }}</small>
                                </small>
                            </small>
                        </div>
                    </div>
                </li>
                <li><div class="dropdown-divider my-2"></div></li>
                <li>
                    <a class="dropdown-item d-flex align-items-center py-1 text-muted" href="#">
                        <i class="fa-solid fa-fw fa-user-circle me-2"></i> My Profile
                    </a>
                </li>
                <li>
                    <a class="dropdown-item d-flex align-items-center py-1 text-muted" href="#">
                        <i class="fas fa-fw fa-question-circle me-2"></i> Help
                    </a>
                </li>
                <li><div class="dropdown-divider"></div></li>
                @if (class_exists(\Iquesters\UserManagement\UserManagementServiceProvider::class))
                    <li>
                        <form method="POST" action="{{ route('logout') }}" class="mb-0">
                            @csrf
                            <button type="submit" class="dropdown-item d-flex align-items-center py-1 text-muted">
                                <i class="fa-solid fa-fw fa-sign-out-alt me-2"></i> Logout
                            </button>
                        </form>
                    </li>
                @endif
                <small class="d-flex align-items-center justify-content-center mt-2">
                    <a class="small me-1 text-muted" href="#">
                        Privacy
                    </a>
                    <small>|</small>
                    <a class="small ms-1 text-muted" href="#">
                        Terms & Conditions
                    </a>
                </small>
            </ul>
        </li>
    </ul>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Profile picture preview
    const profilePictureInput = document.getElementById('profile_picture');
    const imagePreview = document.getElementById('imagePreview');
    
    if (profilePictureInput && imagePreview) {
        profilePictureInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    const dropdownToggle = document.getElementById('userDropdown');
    const dropdownMenu = document.getElementById('profileDropdown');
    const closeButton = dropdownMenu.querySelector('.btn-close');
    
    // Initialize Bootstrap dropdown
    const dropdown = new bootstrap.Dropdown(dropdownToggle);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideDropdown = dropdownMenu.contains(event.target);
        const isClickOnToggle = dropdownToggle.contains(event.target);
        
        if (!isClickInsideDropdown && !isClickOnToggle) {
            dropdown.hide();
        }
    });
    
    // Close dropdown when clicking the close button
    closeButton.addEventListener('click', function() {
        dropdown.hide();
    });
    
    // Prevent dropdown from closing when clicking inside it
    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});
</script>
@endpush