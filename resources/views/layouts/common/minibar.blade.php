@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
@endphp

<div class="d-none d-lg-flex">
    <div class="minibar bg-primary-subtle">
        <div class="minibar-nav">
            <ul class="minibar-header">
                <li class="h-100 w-100 d-flex justify-content-center align-items-center">
                    @if(ConfProvider::from(Module::USER_INFE)->nav_style === 'minibar')
                        @include('userinterface::components.hamburger', [
                            'classes' => ''
                        ])
                    @endif
                </li>
            </ul>

            <ul class="minibar-body">
                <div class="d-flex flex-column align-items-center border-start border-white position-relative">
                    @include('userinterface::components.module-tabs', [
                        'installedModules' => $installedModules, 
                        'viewMode' => 'vertical'
                    ])
            </ul>
        </div>
    </div>
</div>