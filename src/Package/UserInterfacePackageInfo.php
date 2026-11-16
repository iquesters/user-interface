<?php

namespace Iquesters\UserInterface\Package;

use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\System\Package\PackageInfo;

/**
 * Auto-discovered by BaseServiceProvider: migrations, views, routes/web.php
 * (which requires api.php), the user-interface:seed command
 * (database/seeders/UserInterfaceSeeder) and Config/UserInterfaceConf.
 */
class UserInterfacePackageInfo extends PackageInfo
{
    protected function definePackageInfo(): void
    {
        // Views are referenced as userinterface::… (not user-interface::…).
        $this->view_namespace = 'userinterface';

        // The Module constant is USER_INFE, not the auto-derived USER-INTERFACE.
        $this->auto_conf_module = Module::USER_INFE;
    }
}
