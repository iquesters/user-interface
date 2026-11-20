<?php

/*
| The entity data engine moved to iquesters/foundation in 2.1. The old class
| names still resolve (lazily, when first used) so app code and other modules
| keep working; they will be removed in 3.0. Loaded by composer "files".
*/

spl_autoload_register(static function (string $class): void {
    static $moved = [
        'Iquesters\\UserInterface\\Http\\Controllers\\DynamicEntityController' => 'Iquesters\\Foundation\\Http\\Controllers\\DynamicEntityController',
        'Iquesters\\UserInterface\\Http\\Query\\DynamicEntityListQuery' => 'Iquesters\\Foundation\\Http\\Query\\DynamicEntityListQuery',
        'Iquesters\\UserInterface\\Constants\\EntityListParams' => 'Iquesters\\Foundation\\Constants\\EntityListParams',
        'Iquesters\\UserInterface\\Contracts\\EntityScopeResolver' => 'Iquesters\\Foundation\\Contracts\\EntityScopeResolver',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityErrorMapper' => 'Iquesters\\Foundation\\Services\\Entity\\EntityErrorMapper',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityPresenter' => 'Iquesters\\Foundation\\Services\\Entity\\EntityPresenter',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityRepository' => 'Iquesters\\Foundation\\Services\\Entity\\EntityRepository',
        'Iquesters\\UserInterface\\Services\\Entity\\EntitySchemaResolver' => 'Iquesters\\Foundation\\Services\\Entity\\EntitySchemaResolver',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityScope' => 'Iquesters\\Foundation\\Services\\Entity\\EntityScope',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityValidator' => 'Iquesters\\Foundation\\Services\\Entity\\EntityValidator',
        'Iquesters\\UserInterface\\Services\\Entity\\EntityValueNormalizer' => 'Iquesters\\Foundation\\Services\\Entity\\EntityValueNormalizer',
    ];

    if (isset($moved[$class])) {
        class_alias($moved[$class], $class);
    }
});
