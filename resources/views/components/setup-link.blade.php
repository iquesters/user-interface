@php
    use Iquesters\UserInterface\UserInterfaceServiceProvider;

    // Onboarding stages (state comes from iquesters/user-management when installed):
    //   'setup' -> first-run setup not submitted: only /setup is reachable
    //   'admin' -> setup done, no super-admin yet: create the first (admin) account
    //   null    -> onboarding complete, show nothing
    $setupState = 'Iquesters\\UserManagement\\Support\\SetupState';
    $stage = null;

    try {
        if (class_exists($setupState)) {
            $stage = ! $setupState::isConfigured() ? 'setup' : (! $setupState::adminCreated() ? 'admin' : null);
        } elseif (class_exists(\Spatie\Permission\Models\Role::class) && Schema::hasTable('roles')) {
            $stage = \Spatie\Permission\Models\Role::where('name', 'super-admin')->whereHas('users')->exists() ? null : 'setup';
        }
    } catch (\Throwable $e) {
        $stage = null; // never block the home page on an error
    }

    // Links to hide on the host app's home page while onboarding isn't finished.
    $hiddenLinks = [];
    if ($stage === 'setup') {
        $hiddenLinks = array_filter([
            Route::has('login') ? route('login') : null,
            Route::has('register') ? route('register') : null,
        ]);
    } elseif ($stage === 'admin') {
        $hiddenLinks = array_filter([Route::has('login') ? route('login') : null]);
    }
@endphp

@if ($stage)
    @if ($hiddenLinks)
        {{-- Login/register aren't usable yet (they redirect to /setup), so hide the app's links to them. --}}
        <style>
            @foreach ($hiddenLinks as $link)
                a[href="{{ $link }}"]{{ $loop->last ? '' : ',' }}
            @endforeach
            { display: none !important; }
        </style>
    @endif

    <div style="
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f9fafb;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    ">

        @if (class_exists(UserInterfaceServiceProvider::class))
            <img src="{{ UserInterfaceServiceProvider::getLogoUrl() }}"
                alt="Logo"
                style="max-width: 120px; max-height: 60px; margin-bottom: 15px;">
        @endif

        @if ($stage === 'setup')
            <h5 style="color: #111827; font-weight: 600; margin-bottom: 10px;">
                🎉 You’ve successfully installed the User Interface package!
            </h5>

            <p style="color: #6b7280; margin-bottom: 20px;">
                Set up your application (name and logo) to get started.
            </p>

            @if (Route::has('ui.setup'))
                <a href="{{ route('ui.setup') }}"
                style="padding: 10px 15px; background-color: #6366F1; color: #fff;
                        border-radius: 8px; text-decoration: none; font-weight: 600;
                        box-shadow: 0 3px 6px rgba(99,102,241,0.3); transition: all 0.2s;">
                    🚀 Get Started
                </a>
            @else
                <div class="alert alert-danger p-2"> Install iquesters/user-management package</div>
            @endif
        @else
            <h5 style="color: #111827; font-weight: 600; margin-bottom: 10px;">
                ✅ Setup complete
            </h5>

            <p style="color: #6b7280; margin-bottom: 20px;">
                Create the first account. It becomes the super-admin.
            </p>

            @if (Route::has('register'))
                <a href="{{ route('register') }}"
                style="padding: 10px 15px; background-color: #6366F1; color: #fff;
                        border-radius: 8px; text-decoration: none; font-weight: 600;
                        box-shadow: 0 3px 6px rgba(99,102,241,0.3); transition: all 0.2s;">
                    👤 Create admin account
                </a>
            @endif
        @endif
    </div>
@endif
