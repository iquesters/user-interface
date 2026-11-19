<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Iquesters\Foundation\Models\BusinessEntity;
use Iquesters\Foundation\Models\Entity;
use Iquesters\Foundation\Services\Schema\EntitySchemaService;
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

    public function test_the_builder_gets_relation_types_models_and_its_urls(): void
    {
        $this->actingAs($this->makeUser('super-admin'));

        $html = $this->get('/business-entity/create')->assertOk()->getContent();
        preg_match('#<script type="application/json" id="businessEntityData">(.*?)</script>#s', $html, $match);
        $data = json_decode(html_entity_decode($match[1] ?? ''), true);

        $this->assertContains('has_many', array_column($data['relationTypes'], 'name'));
        $this->assertContains('morph_to_many', array_column($data['relationTypes'], 'name'));
        $this->assertContains('role', array_column($data['models'], 'key'));
        $this->assertStringEndsWith('/business-entity/check', $data['urls']['check']);
        $this->assertContains('customer_id', collect($data['entities'])->firstWhere('table', 'addresses')['columns']);
    }

    public function test_check_validates_without_saving_and_reports_missing_pivots(): void
    {
        $this->actingAs($this->makeUser('super-admin'));
        $definition = json_decode($this->definition, true);

        $this->postJson('/business-entity/check', ['definition' => $this->definition])
            ->assertOk()->assertJsonPath('valid', true);

        $definition['parts'][] = ['alias' => 'roles', 'model' => 'role', 'link' => ['type' => 'belongs_to_many', 'to' => 'customer',
            'pivot' => ['table' => 'customer_role', 'foreign_pivot_key' => 'customer_id', 'related_pivot_key' => 'role_id']]];

        $this->postJson('/business-entity/check', ['definition' => json_encode($definition)])
            ->assertOk()
            ->assertJsonPath('valid', false)
            ->assertJsonPath('missing_pivots.0.table', 'customer_role');

        $this->assertDatabaseCount('business_entities', 0);
        $this->assertFalse(Schema::hasTable('customer_role'));

        $this->getJson('/business-entity/columns?table=model_has_roles')->assertJsonPath('exists', true);
        $this->getJson('/business-entity/columns?table=nope_nope')->assertJsonPath('exists', false);
        $this->getJson('/business-entity/columns?table=bad;name')->assertJsonPath('exists', false);
    }

    public function test_saving_again_updates_the_same_schemas(): void
    {
        $this->actingAs($this->makeUser('super-admin'));
        $this->post('/business-entity', ['name' => 'Client Card', 'definition' => $this->definition]);
        $businessEntity = BusinessEntity::where('slug', 'client-card')->firstOrFail();

        $this->put("/business-entity/{$businessEntity->uid}", ['name' => 'Client Card', 'definition' => $this->definition])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, DB::table('form_schemas')->where('slug', 'business-client-card-form')->count());
        $this->assertSame(1, DB::table('table_schemas')->where('slug', 'business-client-card-table')->count());
    }

    public function test_entity_schemas_are_generated_once_and_updated_in_place(): void
    {
        $this->actingAs($this->makeUser('super-admin'));
        $entity = Entity::where('entity_name', 'Customer')->firstOrFail();
        $service = app(EntitySchemaService::class);
        $fields = ['name' => ['name' => 'name', 'type' => 'string', 'label' => 'Name']];

        $first = $service->sync($entity, $fields, []);
        $second = $service->sync($entity->fresh(), $fields + ['email' => ['name' => 'email', 'type' => 'string', 'label' => 'Email']], []);

        $this->assertSame($first, $second);
        $this->assertSame($first['form_schema_uid'], $entity->fresh()->getMeta('form_schema_uid'));
        $form = DB::table('form_schemas')->where('uid', $first['form_schema_uid'])->first();
        $this->assertSame('customers-form', $form->slug);
        $this->assertSame(['name', 'email'], array_column(json_decode($form->schema, true)['fields'], 'id'));
        $this->assertSame(1, DB::table('form_schemas')->where('slug', 'customers-form')->count());
    }
}
