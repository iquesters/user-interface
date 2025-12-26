@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Carbon\Carbon;
    
    $user = Auth::user();

    $profilePath  = $user->getMeta('profile_picture_path');
    $profileFile  = $user->getMeta('profile_picture');
    $userAvatar = $profileFile
        ? $profilePath . $profileFile
        : "https://placehold.co/400x400/faf3e0/d72638/png?text=" . urlencode($user->name[0] ?? '?');

    $lastLoginRaw = $user->getMeta('last_login_at');

    if ($lastLoginRaw) {
        try {
            $lastLogin = Carbon::parse($lastLoginRaw)->timezone('Asia/Kolkata');
            $lastLoginFormatted = $lastLogin->isToday()
                ? $lastLogin->format('h:i A')                    // Example: 03:45 PM
                : $lastLogin->format('d M Y, h:i A');            // Example: 12 Oct 2025 03:45 PM
        } catch (Exception $e) {
            $lastLoginFormatted = 'Unknown';
        }
    } else {
        $lastLoginFormatted = 'Unknown';
    }


    $options = (object)array(
        'img' => (object)array(
            'id' => 'profileAvatar',
            'src' => $userAvatar,
            'alt' => 'Image',
            'width' => '40px',
            'class' => 'rounded-circle',
            'container_class' => '',
            'aspect_ratio' => ''
        ),
    );
@endphp

<div class="d-flex gap-2 align-items-center"
     style="{{ ConfProvider::from(Module::USER_INFE)->large_screen_nav_style === 'minibar' ? 'padding-right: 5px;' : '' }}">
    <ul class="navbar-nav flex-row align-items-center ms-auto">
        <li class="nav-item navbar-dropdown dropdown-user dropdown ms-2">
            <a class="nav-link p-0" href="javascript:void(0);" data-bs-toggle="dropdown" id="userDropdown">
                <div class="avatar avatar-online">
                    @include('usermanagement::utils.image', ['options' => $options])
                </div>
            </a>

            <ul class="dropdown-menu dropdown-menu-end shadow-md rounded-4 p-3 bg-primary-subtle profile-dropdown" id="profileDropdown">
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" data-bs-dismiss="dropdown" style="transform: scale(0.75);" aria-label="Close"></button>
                
                <li class="px-2 pt-2 text-center mt-2">
                    <div class="d-flex align-items-start">
                        <!-- Profile Image Column -->
                        <div class="me-3 position-relative">
                            @include('usermanagement::utils.image', ['options' => $options])
                        </div>

                        <!-- Profile Details Column -->
                        <div class="text-start">
                            <h6 class="mb-1 fw-semibold">{{ $user->name ?? 'Unknown' }}</h6>
                            <small class="d-block mb-0">{{ $user->email ?? 'Unknown' }}</small>
                            <small>
                                <small class="d-block mb-0" title="User Theme">
                                    Theme: {{ $user->getMeta('theme') ?? 'Application Default' }}
                                </small>
                                <small class="d-block mb-0" title="User Role">
                                    Role(s): {{ implode(', ', array_map('ucwords', $user->roles?->pluck('name')->toArray() ?? ['Unknown'])) }}
                                </small>
                                <small title="Last Login">Last Login: {{ $lastLoginFormatted }}</small>
                            </small>
                        </div>
                    </div>
                </li>

                <li><div class="dropdown-divider my-2"></div></li>

                @if(Route::has('myprofile'))
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-1 text-primary" href="{{ route('myprofile') }}">
                        <i class="fas fa-fw fa-user-circle"></i> My Profile
                    </a>
                </li>
                @endif

                @if(Route::has('settings'))
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-1 text-primary" href="{{ route('settings') }}">
                        <i class="fa fa-fw fa-cog"></i> Settings
                    </a>
                </li>
                @endif
                <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-1 text-primary" href="#">
                        <i class="fas fa-fw fa-question-circle"></i> Help
                    </a>
                </li>

                <li><div class="dropdown-divider"></div></li>

                @if (class_exists(\Iquesters\UserManagement\UserManagementServiceProvider::class))
                    <li>
                        <form method="POST" action="{{ route('logout') }}" class="mb-0">
                            @csrf
                            <button type="submit" class="dropdown-item d-flex align-items-center gap-2 py-1 text-primary">
                                <i class="fas fa-fw fa-sign-out-alt"></i> Logout
                            </button>
                        </form>
                    </li>
                @endif

                <small class="d-flex align-items-center justify-content-center mt-2">
                    <a class="small me-1" href="#">Privacy</a>
                    <small>|</small>
                    <a class="small ms-1" href="#">Terms & Conditions</a>
                </small>
            </ul>
        </li>
    </ul>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
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
    const dropdown = new bootstrap.Dropdown(dropdownToggle);

    document.addEventListener('click', function(event) {
        const isClickInside = dropdownMenu.contains(event.target);
        const isClickOnToggle = dropdownToggle.contains(event.target);
        if (!isClickInside && !isClickOnToggle) dropdown.hide();
    });

    closeButton.addEventListener('click', () => dropdown.hide());
    dropdownMenu.addEventListener('click', event => event.stopPropagation());
});
</script>
@endpush