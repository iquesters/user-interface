@if(auth()->check() && auth()->user()->hasRole('super-admin'))
    <div class="bg-dark text-white text-center py-2 d-flex justify-content-center align-items-center gap-3 position-sticky top-0 z-3 shadow-sm">
        <span class="fw-semibold">
            🛠️ Super Admin Mode — Full Access Enabled
        </span>

        @php
            $currentRoute = Route::currentRouteName();
        @endphp

        @if(str_starts_with($currentRoute, 'admin.'))
            {{-- Currently in Admin Dashboard — show User Dashboard button --}}
            <a href="{{ route('dashboard') }}" class="btn btn-sm btn-light">
                👤 Go to User Dashboard
            </a>
        @else
            {{-- Currently in User Dashboard — show Admin Dashboard button --}}
            <a href="{{ route('admin.dashboard') }}" class="btn btn-sm btn-light">
                🧭 Go to Admin Dashboard
            </a>
        @endif
    </div>
@endif