<?php

namespace Iquesters\UserInterface\Config;

use Iquesters\Foundation\Support\BaseConf;
use Iquesters\Foundation\Support\ApiConf;
use Iquesters\Foundation\Enums\Module;

class UserInterfaceConf extends BaseConf
{
    protected ?string $identifier = Module::USER_INFE;

    protected string $auth_layout;
    protected string $app_layout;
    protected string $logo;
    protected string $app_name;
    protected string $app_description;
    protected string $large_screen_nav_style;
    protected int $large_screen_module_tabs;
    protected int $small_screen_bottom_tabs;
    protected string $small_screen_featured_tab;
    protected string $small_screen_featured_position;

    protected ApiConf $api_conf;
    
    protected function prepareDefault(BaseConf $default_values)
    {
        $default_values->auth_layout = 'userinterface::layouts.auth';
        $default_values->app_layout = 'userinterface::layouts.app';
        $default_values->logo = 'img/logo.png';
        $default_values->app_name = 'Iquesters';
        $default_values->app_description = 'Iquesters Application';
        $default_values->large_screen_nav_style = 'minibar';
        $default_values->large_screen_module_tabs = 7;
        $default_values->small_screen_bottom_tabs = 4;
        $default_values->small_screen_featured_tab = '';
        $default_values->small_screen_featured_position = 'center';
        
        $default_values->api_conf = new ApiConf();
        $default_values->api_conf->prefix = 'user-interface'; // Must be auto generated from module enum - the vendor name  
        $default_values->api_conf->prepareDefault($default_values->api_conf);
    }

}