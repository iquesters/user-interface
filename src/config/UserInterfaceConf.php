<?php

namespace Iquesters\UserInterface\Config;

use Iquesters\Foundation\Support\BaseConf;
use Iquesters\Foundation\Enums\Module;

class UserInterfaceConf extends BaseConf
{
    protected ?string $identifier = Module::USER_INFE;

    protected string $auth_layout;
    protected string $app_layout;
    protected string $logo;
    protected int $module_tabs;
    protected int $mobile_bottom_tabs;
    protected string $mobile_featured_tab;
    protected string $mobile_featured_position;
    protected string $nav_style;


    protected function prepareDefault(BaseConf $default_values)
    {
        $default_values->auth_layout = 'userinterface::layouts.auth';
        $default_values->app_layout = 'userinterface::layouts.app';
        $default_values->logo = 'img/logo.png';
        $default_values->module_tabs = 7;
        $default_values->mobile_bottom_tabs = 4;
        $default_values->mobile_featured_tab = '';
        $default_values->mobile_featured_position = 'center';
        $default_values->nav_style = 'minibar';

    }

}