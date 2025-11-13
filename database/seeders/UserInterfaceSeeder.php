<?php

namespace Iquesters\UserInterface\Database\Seeders;

use Iquesters\Foundation\Database\Seeders\BaseSeeder;
use Illuminate\Support\Facades\DB;

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
        // Create or fetch parent "theme"
        $themeParent = DB::table('master_data')->updateOrInsert(
            ['key' => 'theme'],
            [
                'value' => 'Theme Configuration',
                'parent_id' => 0,
                'status' => 'active',
                'created_by' => 0,
                'updated_by' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Fetch the parent ID (updateOrInsert doesn’t return ID, so get it manually)
        $themeParentId = DB::table('master_data')
            ->where('key', 'theme')
            ->value('id');

        // List of Bootswatch themes
        $themes = [
            'default',
            'brite',
            'cerulean',
            'cosmo',
            'cyborg',
            'darkly',
            'flatly',
            'journal',
            'litera',
            'lumen',
            'lux',
            'materia',
            'minty',
            'morph',
            'pulse',
            'quartz',
            'sandstone',
            'simplex',
            'sketchy',
            'slate',
            'solar',
            'spacelab',
            'superhero',
            'united',
            'vapor',
            'yeti',
            'zephyr'
        ];


        // Insert each theme under parent "theme"
        foreach ($themes as $theme) {
            DB::table('master_data')->updateOrInsert(
                ['key' => $theme, 'parent_id' => $themeParentId],
                [
                    'value' => ucfirst($theme),
                    'status' => 'active',
                    'created_by' => 0,
                    'updated_by' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Add current_theme entry (default = cerulean)
        DB::table('master_data')->updateOrInsert(
            ['key' => 'current_theme', 'parent_id' => $themeParentId],
            [
                'value' => 'default',
                'status' => 'active',
                'created_by' => 0,
                'updated_by' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}