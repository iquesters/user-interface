<div class="d-none d-lg-flex">
    <div class="minibar">
        <div class="minibar-nav">
            <ul class="minibar-header">
                <li class="h-100 w-100 d-flex justify-content-center align-items-center">
                    @if(config('userinterface.nav_style') === 'minibar')
                        @include('userinterface::components.hamburger', [
                            'classes' => 'text-muted h-100'
                        ])
                    @endif
                </li>
            </ul>

            <ul class="minibar-body">
                <div class="d-flex flex-column align-items-center border-start border-white position-relative" style="background-color: #e6e3e3">
                    @include('userinterface::components.module-tabs', [
                        'installedModules' => $installedModules, 
                        'viewMode' => 'vertical'
                    ])
            </ul>
        </div>
    </div>
</div>