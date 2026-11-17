<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Routing\Route;
use Iquesters\UserInterface\Tests\TestCase;

class RouteProtectionTest extends TestCase
{
    /** Route-name prefixes that must be admin-only. */
    /** Builder routes stay admin-only; the entity API and ui.* screens use per-entity permissions. */
    private const ADMIN_ROUTE_PREFIXES = ['form.', 'table.', 'master-data.update'];

    public function test_builder_entity_and_generic_ui_routes_require_admin(): void
    {
        $checked = 0;

        foreach (app('router')->getRoutes()->getRoutes() as $route) {
            /** @var Route $route */
            $name = (string) $route->getName();

            if ($name === 'ui.theme' || ! $this->isAdminRouteName($name)) {
                continue;
            }

            $this->assertContains('ensure.admin', $route->gatherMiddleware(), "Route [{$name}] is missing ensure.admin.");
            $checked++;
        }

        $this->assertGreaterThan(14, $checked, 'Expected the builder/entity routes to be registered.');
    }

    public function test_settings_route_is_not_registered_by_user_interface(): void
    {
        // user-management owns /settings; the broken duplicate was removed.
        $route = app('router')->getRoutes()->getByName('settings');

        $this->assertTrue($route === null || ! str_starts_with($route->getActionName(), 'Iquesters\\UserInterface\\'));
    }

    private function isAdminRouteName(string $name): bool
    {
        foreach (self::ADMIN_ROUTE_PREFIXES as $prefix) {
            if (str_starts_with($name, $prefix)) {
                return true;
            }
        }

        return false;
    }
}
