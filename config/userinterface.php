<?php
return [
    'middleware' => ['web', 'auth'],
    'layout_app' => env('USERINTERFACE_LAYOUT_APP', 'userinterface::layouts.app')
];
?>