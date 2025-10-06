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

    /*
    |--------------------------------------------------------------------------
    | Module Tabs
    |--------------------------------------------------------------------------
    | Control how many modules are shown before moving the rest into dropdown
    */
    'max_visible_modules' => env('USERINTERFACE_MAX_VISIBLE_MODULES', 7),
    
    /*
    |--------------------------------------------------------------------------
    | Mobile Bottom Navigation
    |--------------------------------------------------------------------------
    | Configure mobile bottom tab bar settings
    */
   'mobile_bottom_tabs' => env('USERINTERFACE_MOBILE_BOTTOM_TABS', 4),
    
    // Set to null to disable featured tab, or set any module name
    'mobile_featured_tab' => env('USERINTERFACE_MOBILE_FEATURED_TAB', null), // null = no featured tab, or 'product', 'user-management', etc.
    
    // Position of featured tab: 'center' (default), 'left', 'right', or null
    'mobile_featured_position' => env('USERINTERFACE_MOBILE_FEATURED_POSITION', 'center'),

    /*
    |--------------------------------------------------------------------------
    | Navigation Style
    |--------------------------------------------------------------------------
    |
    | Choose which navigation style to use:
    | - 'minibar'  : shows the left minibar navigation
    | - 'header'   : shows module tabs in the header
    |
    */
    'nav_style' => env('USERINTERFACE_NAV_STYLE', 'header'),
];
?>