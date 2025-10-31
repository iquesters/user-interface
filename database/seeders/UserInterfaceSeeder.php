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
                "label" => "Forms",
                "route" => "form.list",
            ],
            [
                "icon" => "fas fa-table",
                "label" => "Tables",
                "route" => "table.list",
            ],
            [
                "icon" => "fas fa-database",
                "label" => "Entities",
                "route" => "entities.index",
            ],
            [
                "icon" => "fas fa-cubes",
                "label" => "Modules",
                "route" => "modules.assign-to-role",
            ],
            [
                "icon" => "fas fa-list-ul",
                "label" => "All Masterdatas",
                "route" => "master-data.index",
            ]
        ]
    ];

    protected array $permissions = [
        'view-master_data',
        'create-master_data',
        'edit-master_data',
        'delete-master_data'
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