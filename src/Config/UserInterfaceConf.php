<?php

namespace Iquesters\UserInterface\Config;

use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\BaseConf;

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

    protected SnackbarConf $snackbar_conf;

    /** Third-party JS/CSS (jQuery, Bootstrap, Font Awesome, DataTables, JSON Editor): local | cdn */
    protected string $vendor_assets;

    /**
     * Help / Privacy / Terms links in the user menu and page footers. Empty: the
     * module's own pages (/help, /privacy-policy, /terms-conditions), whose
     * templates are published to resources/views/vendor/userinterface/pages.
     * Set a URL to link an external page instead.
     */
    protected string $help_url;

    protected string $privacy_url;

    protected string $terms_url;

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
        $default_values->snackbar_conf = new SnackbarConf;
        $default_values->vendor_assets = 'local';
        $default_values->help_url = '';
        $default_values->privacy_url = '';
        $default_values->terms_url = '';
    }

    protected function rules(): array
    {
        return [
            'auth_layout' => 'required|string',
            'app_layout' => 'required|string',
            'large_screen_nav_style' => 'in:minibar,header',
            'large_screen_module_tabs' => 'integer|between:1,20',
            'small_screen_bottom_tabs' => 'integer|between:1,6',
            'small_screen_featured_position' => 'in:center,left,right',
            'vendor_assets' => 'in:local,cdn',
            'help_url' => 'nullable|url:http,https|max:2048',
            'privacy_url' => 'nullable|url:http,https|max:2048',
            'terms_url' => 'nullable|url:http,https|max:2048',
        ];
    }
}
