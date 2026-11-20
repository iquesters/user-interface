<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Iquesters\Foundation\Services\Entity\EntityRepository;
use Iquesters\UserInterface\Tests\TestCase;
use Laravel\Sanctum\Sanctum;

/**
 * The entity API moved to foundation (/api/foundation/v1/entity/...). The old
 * URLs and class names keep working until 3.0; the API itself is tested in
 * foundation.
 */
class DeprecatedEntityApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $entityId = DB::table('entities')->insertGetId([
            'uid' => (string) Str::ulid(),
            'entity_name' => 'Demo Item',
            'slug' => 'demo-items',
            'fields' => json_encode(['name' => ['name' => 'name', 'type' => 'string']]),
            'meta_fields' => json_encode([]),
            'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('entity_metas')->insert([
            'ref_parent' => $entityId, 'meta_key' => 'table_name', 'meta_value' => 'demo_items',
            'status' => 'active', 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('demo_items')->insert(['uid' => (string) Str::ulid(), 'name' => 'Item', 'status' => 'active']);
    }

    public function test_old_entity_urls_still_work(): void
    {
        $this->getJson('/api/user-interface/v1/entity/list/demo_items')->assertUnauthorized();

        Sanctum::actingAs($this->makeUser('super-admin'));

        foreach (['/api/entity/list/demo_items', '/api/user-interface/v1/entity/list/demo_items', '/api/foundation/v1/entity/list/demo_items'] as $url) {
            $this->getJson($url)->assertOk()->assertJsonPath('response_schema.meta.pagination.total', 1);
        }
    }

    public function test_old_class_names_resolve_to_the_foundation_classes(): void
    {
        $this->assertTrue(class_exists('Iquesters\\UserInterface\\Services\\Entity\\EntityRepository'));
        $this->assertInstanceOf(EntityRepository::class, app('Iquesters\\UserInterface\\Services\\Entity\\EntityRepository'));
        $this->assertTrue(interface_exists('Iquesters\\UserInterface\\Contracts\\EntityScopeResolver'));
    }

    public function test_versioned_public_form_schema_needs_no_login(): void
    {
        $this->getJson('/api/user-interface/v1')->assertOk()->assertJsonPath('response_schema.data.module', 'user-interface');
        // Reaches the controller without auth (an unknown slug is answered by it, not by auth).
        $this->getJson('/api/user-interface/v1/noauth/form/no-such-form')->assertOk()->assertJsonPath('success', false);
    }
}
