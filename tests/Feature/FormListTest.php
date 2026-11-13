<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Iquesters\UserInterface\Tests\TestCase;

class FormListTest extends TestCase
{
    public function test_form_list_renders_when_schema_is_an_array(): void
    {
        DB::table('form_schemas')->insert([
            'uid' => (string) Str::ulid(),
            'slug' => 'demo-form',
            'name' => 'Demo Form',
            'description' => 'Demo',
            'schema' => json_encode(['entity' => 'demo_items', 'fields' => []]),
            'extra_info' => json_encode([]),
            'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->actingAs($this->makeUser('super-admin'))
            ->get('/form/list')
            ->assertOk()
            ->assertSee('Demo Form');
    }

    public function test_form_list_is_admin_only(): void
    {
        $this->actingAs($this->makeUser('user'))->get('/form/list')->assertForbidden();
    }
}
