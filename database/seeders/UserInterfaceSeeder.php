<?php

namespace Iquesters\UserInterface\Database\Seeders;

use Iquesters\Foundation\Database\Seeders\BaseSeeder;

class UserInterfaceSeeder extends BaseSeeder
{
    protected string $moduleName = 'user-interface';
    protected string $description = 'user-interface module';
    protected array $metas = [
        'module_icon' => 'fas fa-puzzle-piece',
        'module_sidebar_menu' => [
            [
                "icon" => "fas fa-list-check",
                "label" => "All Forms",
                "route" => "form.list",
            ],
            [
                "icon" => "fas fa-table",
                "label" => "All Tables",
                "route" => "table.list",
            ],
            [
                "icon" => "fas fa-database",
                "label" => "All Entities",
                "route" => "entities.index",
            ]
        ]
    ];
    
    /**
     * Implement abstract method from BaseSeeder
     */
    protected function seedCustom(): void
    {
        // Add custom seeding logic here if needed
        // Leave empty if none
    }
}