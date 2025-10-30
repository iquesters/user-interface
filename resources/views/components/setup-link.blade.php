@php
    use Spatie\Permission\Models\Role;
    use Iquesters\UserInterface\UserInterfaceServiceProvider;
    $superadminExists = false;

    try {
        if (Schema::hasTable('roles') && Schema::hasTable('model_has_roles')) {
            $superadminExists = Role::where('name', 'super-admin')
                ->whereHas('users')
                ->exists();
        }
    } catch (\Exception $e) {
        $superadminExists = true; // skip link if something fails
    }
@endphp
@if(!$superadminExists)
    <div style="padding: 2rem; text-align:center" style="background-color: #f9fafb; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        @if (class_exists(UserInterfaceServiceProvider::class))
            <img src="{{ UserInterfaceServiceProvider::getLogoUrl() }}" 
                alt="Logo" 
                style="max-width: 120px; max-height: 60px; margin-bottom: 15px;">
        @endif

        <h5 style="color: #111827; font-weight: 600; margin-bottom: 10px;">
            🎉 You’ve successfully installed the User Interface package!
        </h5>
        
        <p style="color: #6b7280; margin-bottom: 20px;">
            Everything is set up. Click below to get started configuring your module.
        </p>

        @if (Route::has('ui.setup'))
            <a href="{{ route('ui.setup') }}"
            style="padding: 10px 15px; background-color: #6366F1; color: #fff;
                    border-radius: 8px; text-decoration: none; font-weight: 600;
                    box-shadow: 0 3px 6px rgba(99,102,241,0.3); transition: all 0.2s;">
                🚀 Get Started
            </a>
        @endif
    </div>
@endif