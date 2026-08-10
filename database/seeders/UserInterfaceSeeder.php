<?php

namespace Iquesters\UserInterface\Database\Seeders;

use Iquesters\Foundation\Database\Seeders\BaseSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
    
    protected array $entities = [
        'table_schemas' => [
            'fields' => [],
            'meta_fields' =>[]
        ],
        'form_schemas' => [
            'fields' => [],
            'meta_fields' =>[]
        ]
    ];
    /**
     * Implement abstract method from BaseSeeder
     */
    protected function seedCustom(): void
    {
        $module = DB::table('modules')
            ->where('name', $this->moduleName)
            ->first();

        if (!$module) {
            return;
        }

        $moduleId = $module->id;
        $moduleUid = $module->uid;
        $userId = 0;
        $now = now();

        $sidebarItems = [
            [
                'name' => 'user-interface-form-schemas',
                'id' => 'user-interface-form-schemas',
                'label' => 'Form Schemas',
                'icon' => 'fas fa-list-check',
                'route' => 'ui.list',
                'schema_uid' => DB::table('table_schemas')->where('slug', 'form-schema-table')->value('uid'),
                'sort_order' => 10,
            ],
            [
                'name' => 'user-interface-table-schemas',
                'id' => 'user-interface-table-schemas',
                'label' => 'Table Schemas',
                'icon' => 'fas fa-table',
                'route' => 'ui.list',
                'schema_uid' => DB::table('table_schemas')->where('slug', 'table-schema-table')->value('uid'),
                'sort_order' => 20,
            ],
            [
                'name' => 'user-interface-navigations',
                'id' => 'user-interface-navigations',
                'label' => 'Navigations',
                'icon' => 'fas fa-bars-staggered',
                'route' => 'ui.list',
                'schema_uid' => DB::table('table_schemas')->where('slug', 'navigation-table')->value('uid'),
                'sort_order' => 30,
            ],
            [
                'name' => 'user-interface-organisations',
                'id' => 'user-interface-organisations',
                'label' => 'All Organisations',
                'icon' => 'fas fa-building-columns',
                'route' => 'organisations.index',
                'schema_uid' => null,
                'sort_order' => 40,
            ],
        ];

        $sidebarNavigationUids = [];

        foreach ($sidebarItems as $item) {
            DB::table('navigations')->updateOrInsert(
                ['name' => $item['name']],
                [
                    'uid' => (string) Str::ulid(),
                    'ref_parent' => $moduleId,
                    'status' => 'active',
                    'created_by' => $userId,
                    'updated_by' => $userId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            $navigation = DB::table('navigations')
                ->where('name', $item['name'])
                ->first();

            if (!$navigation) {
                continue;
            }

            $sidebarNavigationUids[$item['name']] = $navigation->uid;

            DB::table('navigation_metas')->updateOrInsert(
                [
                    'ref_parent' => $navigation->id,
                    'meta_key' => 'navigation_items',
                ],
                [
                    'meta_value' => json_encode([
                        [
                            'id' => $item['id'],
                            'label' => $item['label'],
                            'original_label' => $item['label'],
                            'slug' => Str::slug($item['label']),
                            'route' => $item['route'],
                            'icon' => $item['icon'],
                            'placement' => 'sidebar',
                            'module_uid' => $moduleUid,
                            'target_module_uid' => $moduleUid,
                            'module_name' => $module->name,
                            'default-table-schema-uid' => $item['schema_uid'],
                            'sort_order' => $item['sort_order'],
                            'visible' => true,
                            'enabled' => true,
                            'locked' => false,
                            'source' => [
                                'table' => 'module_metas',
                                'meta_key' => 'module_sidebar_menu',
                            ],
                        ],
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'status' => 'active',
                    'created_by' => $userId,
                    'updated_by' => $userId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );

            DB::table('module_has_navigations')->updateOrInsert(
                [
                    'module_id' => $moduleId,
                    'navigation_id' => $navigation->id,
                ],
                [
                    'label' => $item['label'],
                    'icon' => $item['icon'],
                    'sort_order' => $item['sort_order'],
                    'visible' => 1,
                    'enabled' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        $tabDefinitions = [
            'user-interface-form-schemas' => [
                [
                    'name' => 'user-interface-form-schemas-list',
                    'id' => 'form-schemas-list-tab',
                    'label' => 'List',
                    'icon' => 'fas fa-fw fa-list',
                    'route' => 'ui.list',
                    'parent_id' => 'user-interface-form-schemas',
                    'schema_uid' => DB::table('table_schemas')->where('slug', 'form-schema-table')->value('uid'),
                ],
                [
                    'name' => 'user-interface-form-schemas-create',
                    'id' => 'form-schemas-create-tab',
                    'label' => 'Create',
                    'icon' => 'fas fa-fw fa-plus',
                    'route' => 'form.create',
                    'parent_id' => 'user-interface-form-schemas',
                    'schema_uid' => null,
                ],
            ],
            'user-interface-table-schemas' => [
                [
                    'name' => 'user-interface-table-schemas-list',
                    'id' => 'table-schemas-list-tab',
                    'label' => 'List',
                    'icon' => 'fas fa-fw fa-list',
                    'route' => 'ui.list',
                    'parent_id' => 'user-interface-table-schemas',
                    'schema_uid' => DB::table('table_schemas')->where('slug', 'table-schema-table')->value('uid'),
                ],
                [
                    'name' => 'user-interface-table-schemas-create',
                    'id' => 'table-schemas-create-tab',
                    'label' => 'Create',
                    'icon' => 'fas fa-fw fa-plus',
                    'route' => 'table.create',
                    'parent_id' => 'user-interface-table-schemas',
                    'schema_uid' => null,
                ],
            ],
            'user-interface-navigations' => [
                [
                    'name' => 'user-interface-navigations-list',
                    'id' => 'navigations-list-tab',
                    'label' => 'List',
                    'icon' => 'fas fa-fw fa-list',
                    'route' => 'ui.list',
                    'parent_id' => 'user-interface-navigations',
                    'schema_uid' => DB::table('table_schemas')->where('slug', 'navigation-table')->value('uid'),
                ],
            ],
        ];

        foreach ($tabDefinitions as $parentName => $tabs) {
            $parentNavigation = DB::table('navigations')->where('name', $parentName)->first();
            if (!$parentNavigation) {
                continue;
            }

            foreach ($tabs as $index => $tab) {
                DB::table('navigations')->updateOrInsert(
                    ['name' => $tab['name']],
                    [
                        'uid' => (string) Str::ulid(),
                        'ref_parent' => $moduleId,
                        'status' => 'active',
                        'created_by' => $userId,
                        'updated_by' => $userId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                $tabNavigation = DB::table('navigations')->where('name', $tab['name'])->first();
                if (!$tabNavigation) {
                    continue;
                }

                DB::table('navigation_metas')->updateOrInsert(
                    [
                        'ref_parent' => $tabNavigation->id,
                        'meta_key' => 'navigation_items',
                    ],
                    [
                        'meta_value' => json_encode([
                            [
                                'id' => $tab['id'],
                                'label' => $tab['label'],
                                'original_label' => $tab['label'],
                                'slug' => Str::slug($tab['label']),
                                'route' => $tab['route'],
                                'icon' => $tab['icon'],
                                'placement' => 'tabs',
                                'parent_id' => $tab['parent_id'],
                                'module_uid' => $moduleUid,
                                'target_module_uid' => $moduleUid,
                                'module_name' => $module->name,
                                'default-table-schema-uid' => $tab['schema_uid'],
                                'sort_order' => ($index + 1) * 10,
                                'visible' => true,
                                'enabled' => true,
                                'locked' => false,
                                'source' => [
                                    'table' => 'module_metas',
                                    'meta_key' => 'module_sidebar_menu',
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        'status' => 'active',
                        'created_by' => $userId,
                        'updated_by' => $userId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );

                DB::table('module_has_navigations')->updateOrInsert(
                    [
                        'module_id' => $moduleId,
                        'navigation_id' => $tabNavigation->id,
                    ],
                    [
                        'label' => $tab['label'],
                        'icon' => $tab['icon'],
                        'sort_order' => ($index + 1) * 10,
                        'visible' => 1,
                        'enabled' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }

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
