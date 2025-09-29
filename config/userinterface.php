<?php
return [
    'middleware' => ['web', 'auth'],
    'layout_app' => env('USERINTERFACE_LAYOUT_APP', 'userinterface::layouts.app'),
    
    /*
    |--------------------------------------------------------------------------
    | Logo Configuration
    |--------------------------------------------------------------------------
    |
    | The path or URL of the logo to be displayed on auth pages.
    | You can use:
    | - Full URL: 'https://example.com/logo.png'
    | - Absolute path: '/images/logo.png'
    | - Package asset: 'img/logo.png' (will be served via package route)
    | - Package namespace: 'usermanagement::img.logo.png'
    |
    */
    'logo' => env('USER_MANAGEMENT_LOGO', 'img/logo.png'),
];
?>