<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\View\View;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;

/**
 * Help, Privacy policy and Terms pages. Public, so they can be linked from the
 * login and sign-up pages. Views are templates the app overrides (see InfoPages).
 */
class InfoPageController extends Controller
{
    public function help(): View
    {
        return $this->page('help');
    }

    public function privacy(): View
    {
        return $this->page('privacy');
    }

    public function terms(): View
    {
        return $this->page('terms');
    }

    private function page(string $name): View
    {
        $conf = ConfProvider::from(Module::USER_INFE);

        return view("userinterface::pages.{$name}", [
            'appName' => $conf->app_name,
            // Signed-in users keep the app chrome; guests get the auth layout.
            'pageLayout' => auth()->check() ? $conf->app_layout : $conf->auth_layout,
        ]);
    }
}
