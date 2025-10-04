<?php

namespace Iquesters\UserInterface\Database\Seeders;

use Iquesters\Foundation\Database\Seeders\BaseModuleSeeder;

class UserInterfaceSeeder extends BaseModuleSeeder
{
    protected string $moduleName = 'user-interface';
    protected string $description = 'user-interface module';
    protected array $metas = [
        'module_icon' => 'fa-solid fa-box',
        'module_sidebar_menu' => [
            [
                "icon" => "fa-solid fa-box",
                "label" => "Products",
                "route" => "products.index",
                "params" => ["organisationUid" => null]
            ],
            [
                "icon" => "fa-solid fa-plus",
                "label" => "Add Product",
                "route" => "products.create",
                "params" => ["organisationUid" => null]
            ],
            [
                "icon" => "fa-solid fa-tags",
                "label" => "Categories",
                "route" => "categories.index",
                "params" => ["organisationUid" => null]
            ]
        ]
    ];
}