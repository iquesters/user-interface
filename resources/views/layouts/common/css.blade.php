<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">

<!-- FontAwesome CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<!-- Bootstrap CSS -->
{{-- <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous"> --}}

<!-- DataTables CSS -->
<link href="https://cdn.datatables.net/v/bs5/jq-3.7.0/moment-2.29.4/jszip-3.10.1/dt-2.2.2/af-2.7.0/b-3.2.2/b-colvis-3.2.2/b-html5-3.2.2/b-print-3.2.2/cr-2.0.4/date-1.5.5/fc-5.0.4/fh-4.0.1/kt-2.12.1/r-3.0.4/rg-1.5.1/rr-1.5.0/sc-2.4.3/sb-1.8.2/sp-2.3.3/sl-3.0.0/sr-1.4.1/datatables.min.css" rel="stylesheet" integrity="sha384-wYf859STWTPggciSnTIDCGMabsgGXnODSCOXsmSXYvBU+qa7uYQjrZCTi9/jyzAD" crossorigin="anonymous">

<!-- JSON Editor -->
<link href="https://cdn.jsdelivr.net/npm/jsoneditor@10.1.0/dist/jsoneditor.min.css" rel="stylesheet">

{{-- Theme Render Logic --}}
@php
    $theme = Iquesters\UserInterface\UserInterfaceServiceProvider::getCurrentTheme() ?? 'default';
@endphp
{{-- Load user-specific theme --}}
<link href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/theme/' . $theme . '/bootstrap.min.css') }}" rel="stylesheet">
{{-- <link href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/theme/' . $theme . '/bootstrap.min.css?v=' . filemtime(public_path('css/theme/' . $theme . '/bootstrap.min.css'))) }}" rel="stylesheet"> --}}

<link href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/bootstrap-override.css') }}" rel="stylesheet">

<!-- app.css -->
<link rel="stylesheet" type="text/css" media="screen" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl() }}">
<link rel="stylesheet" type="text/css" media="screen and (min-width:  576px)" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/app-sm.css') }}">
<link rel="stylesheet" type="text/css" media="screen and (min-width:  768px)" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/app-md.css') }}">
<link rel="stylesheet" type="text/css" media="screen and (min-width:  992px)" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/app-lg.css') }}">
<link rel="stylesheet" type="text/css" media="screen and (min-width: 1200px)" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/app-xl.css') }}">
<link rel="stylesheet" type="text/css" media="screen and (min-width: 1400px)" href="{{ Iquesters\UserInterface\UserInterfaceServiceProvider::getCssUrl('css/app-xxl.css') }}">

@stack('styles')