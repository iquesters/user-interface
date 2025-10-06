<div class="d-none d-lg-flex">
    <div class="shoz-minibar">
        <div class="shoz-minibar-nav">
            <ul class="shoz-minibar-header">
                <li class="h-100 w-100 d-flex justify-content-center align-items-center">
                    @if(config('userinterface.nav_style') === 'minibar')
                        <button class="btn btn-light border-0 rounded-circle nav-link h-100 shoz-minibar-nav-toggler" type="button" id="sidebarToggle"  style="height: 40px !important; width: 40px;">
                            <i class="fas fa-fw fa-bars"></i>
                        </button>
                    @endif
                </li>
            </ul>

            <ul class="shoz-minibar-body">
                <div class="d-flex flex-column align-items-center border-start border-white position-relative" style="background-color: #e6e3e3">
                    @include('userinterface::components.module-tabs', ['installedModules' => $installedModules, 'orientation' => 'vertical'])
                </div>
            </ul>
        </div>
    </div>
</div>