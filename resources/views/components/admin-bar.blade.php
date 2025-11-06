@if(auth()->check() && auth()->user()->hasRole('super-admin'))
    @php
        $currentRoute = Route::currentRouteName();
    @endphp
    @if(str_starts_with($currentRoute, 'admin.'))
        @php
            $modeDescription = "Full Access Enabled";
            $buttonRoute = route('dashboard');
            $buttonText = "View as User";
        @endphp
    @else
        @php
            $modeDescription = "Viewing as User";
            $buttonRoute = route('admin.dashboard');
            $buttonText = "Switch to Admin Mode";
        @endphp
    @endif
    <div class="bg-danger-subtle small p-1 d-flex justify-content-between align-items-center gap-3 position-sticky top-0 shadow-sm" style="z-index: 1050;">
        <div class="small">
            [{{$modeDescription}}]

            <a href="{{ $buttonRoute }}" class="text-decoration-none">
                {{ $buttonText }}
            </a>
        </div>

        <small>Super Admin Mode</small>
    </div>
@endif