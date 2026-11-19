<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Iquesters\Foundation\Models\BusinessEntity;
use Iquesters\Foundation\Support\BusinessEntity\BusinessEntityDefinitionValidator;
use Iquesters\UserInterface\Tests\TestCase;

/**
 * Foundation's business entity screens and schema generation with this
 * module installed (layout, SchemaModels). The records API itself is tested
 * in foundation.
 */
class BusinessEntityScreensTest extends TestCase
{
    private string $definition;

    protected function setUp(): void
    {
        parent::setUp();

        $customers = $this->registerEntity('Customer', 'customers', [
            'name' => ['name' => 'name', 'type' => 'string', 'nullable' => false, 'required' => true],
            'email' => ['name' => 'email', 'type' => 'string', 'input_type' => 'email'],
        ]);
        $addresses = $this->registerEntity('Address', 'addresses', [
            'customer_id' => ['name' => 'customer_id', 'type' => 'bigint'],
            'city' => ['name' => 'city', 'type' => 'string', 'required' => true],
        ]);

        $this->definition = json_encode((new BusinessEntityDefinitionValidator)->validate([
            'parts' => [
                ['alias' => 'customer', 'entity_uid' => $customers, 'fields' => ['name', 'email']],
                ['alias' => 'address', 'entity_uid' => $addresses, 'fields' => ['city'],
                    'link' => ['type' => 'has_one', 'to' => 'customer', 'foreign_key' => 'customer_id']],
            ],
        ])->toArray());
    }

    private function registerEntity(string $name, string $table, array $fields): string
    {
        $uid = (string) Str::ulid();
        $id = DB::table('entities')->insertGetId([
            'uid' => $uid, 'entity_name' => $name, 'slug' => $table,
            'fields' => json_encode($fields), 'meta_fields' => json_encode([]),
            'status' => 'active', 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('entity_metas')->insert([
            'ref_parent' => $id, 'meta_key' => 'table_name', 'meta_value' => $table,
            'status' => 'active', 'created_at' => now(), 'updated_at' => now(),
        ]);

        return $uid;
    }

    public function test_creating_a_business_entity_stores_its_form_and_table_schemas(): void
    {
        $this->actingAs($this->makeUser('super-admin'))
            ->post('/business-entity', ['name' => 'Client Card', 'definition' => $this->definition])
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $businessEntity = BusinessEntity::where('slug', 'client-card')->firstOrFail();
        $form = DB::table('form_schemas')->where('slug', 'business-client-card-form')->first();
        $table = DB::table('table_schemas')->where('slug', 'business-client-card-table')->first();

        $this->assertNotNull($form);
        $this->assertNotNull($table);
        $this->assertSame($form->uid, $businessEntity->getMeta('form_schema_uid'));
        $this->assertSame($table->uid, $businessEntity->getMeta('table_schema_uid'));
        $this->assertSame('business-entity/client-card', json_decode($table->schema, true)['entity']);
        $this->assertStringEndsWith('/api/foundation/v1/business-entity/show/client-card/{uid}', json_decode($form->schema, true)['dataEndpoint']);
    }

    public function test_admin_screens_render(): void
    {
        $this->actingAs($this->makeUser('super-admin'));
        $this->post('/business-entity', ['name' => 'Client Card', 'definition' => $this->definition]);
        $uid = BusinessEntity::where('slug', 'client-card')->value('uid');

        $this->get('/business-entity')->assertOk()->assertSee('Client Card');
        $this->get('/business-entity/create')->assertOk()
            ->assertSee('businessEntityBuilder', false)
            ->assertSee('js/business-entity-builder.js', false);
        $this->get("/business-entity/{$uid}/edit")->assertOk()->assertSee('client-card');
    }
}
