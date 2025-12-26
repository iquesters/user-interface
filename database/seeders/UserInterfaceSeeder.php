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

        /*
        |-------------------------------------------------
        | Forms
        |-------------------------------------------------
        */
        [
            "icon" => "fas fa-list-check",
            "label" => "Forms",
            "route" => "ui.list",
            "table_schema" => [
                "slug" => "form-schema-table",
                "name" => "Form Schemas",
                "description" => "Datatable schema for form schemas",
                "schema" => [
                    "entity" => "form_schemas",
                    "dt-options" => [
                        "columns" => [
                            ["data" => "id", "title" => "ID", "visible" => true],
                            [
                                "data" => "name",
                                "title" => "Form Name",
                                "visible" => true,
                                "link" => true,
                                "form-schema-uid" => "form-schema-details"
                            ],
                            ["data" => "slug", "title" => "Slug", "visible" => true],
                            ["data" => "description", "title" => "Description", "visible" => true],
                        ],
                        "options" => [
                            "pageLength" => 10,
                            "order" => [[0, "desc"]],
                            "responsive" => true
                        ]
                    ],
                    "default_view_mode" => "inbox"
                ]
            ]
        ],

        /*
        |-------------------------------------------------
        | Tables
        |-------------------------------------------------
        */
        [
            "icon" => "fas fa-table",
            "label" => "Tables",
            "route" => "ui.list",
            "table_schema" => [
                "slug" => "table-schema-table",
                "name" => "Table Schemas",
                "description" => "Datatable schema for table schemas",
                "schema" => [
                    "entity" => "table_schemas",
                    "dt-options" => [
                        "columns" => [
                            ["data" => "id", "title" => "ID", "visible" => true],
                            [
                                "data" => "name",
                                "title" => "Table Name",
                                "visible" => true,
                                "link" => true,
                                "form-schema-uid" => "table-schema-details"
                            ],
                            ["data" => "slug", "title" => "Slug", "visible" => true],
                            ["data" => "description", "title" => "Description", "visible" => true],
                        ],
                        "options" => [
                            "pageLength" => 10,
                            "order" => [[0, "desc"]],
                            "responsive" => true
                        ]
                    ],
                    "default_view_mode" => "inbox"
                ]
            ]
        ],

        /*
        |-------------------------------------------------
        | Navigation
        |-------------------------------------------------
        */
        [
            "icon" => "fas fa-bars-staggered",
            "label" => "Navigation",
            "route" => "ui.list",
            "table_schema" => [
                "slug" => "navigation-table",
                "name" => "Navigations",
                "description" => "Datatable schema for navigations",
                "schema" => [
                    "entity" => "navigations",
                    "dt-options" => [
                        "columns" => [
                            ["data" => "id", "title" => "ID", "visible" => true],
                            [
                                "data" => "name",
                                "title" => "Navigation Name",
                                "visible" => true,
                                "link" => true,
                                "form-schema-uid" => "navigation-details"
                            ],
                            [
                                "data" => "meta.navigation_order",
                                "title" => "Order",
                                "visible" => true
                            ],
                        ],
                        "options" => [
                            "pageLength" => 10,
                            "order" => [[0, "desc"]],
                            "responsive" => true
                        ]
                    ],
                    "default_view_mode" => "inbox"
                ]
            ]
        ],

        /*
        |-------------------------------------------------
        | Others (no table schema)
        |-------------------------------------------------
        */
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
        ],
        [
            "icon" => "fas fa-building-columns",
            "label" => "All Organisations",
            "route" => "organisations.index",
        ],
    ],
];

    protected array $permissions = [
        'view-master_data',
        'create-master_data',
        'edit-master_data',
        'delete-master_data',
        'view-organisations',
        'create-organisations',
        'edit-organisations',
        'delete-organisations'
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