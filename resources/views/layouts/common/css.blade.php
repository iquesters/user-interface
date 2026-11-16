{{-- Third-party CSS: self-hosted or CDN per the vendor_assets setting (Support\VendorLibraries). --}}
{{-- Tables and the JSON editor are not used on auth pages (login/register/setup). --}}
{!! \Iquesters\UserInterface\Support\VendorLibraries::styles(isAuthPage: ! empty($isAuth)) !!}

<!-- All package CSS assets (including theme and bootstrap-override) -->
@foreach(\Iquesters\UserInterface\UserInterfaceServiceProvider::getCssAssets() as $asset)
    <link rel="stylesheet"
          media="{{ $asset['media'] }}"
          href="{{ \Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl($asset['path']) }}">
@endforeach

@stack('styles')
