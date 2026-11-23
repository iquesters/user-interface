<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Str;
use Iquesters\UserInterface\Models\FormSchema;
use Iquesters\UserInterface\Models\TableSchema;
use Iquesters\UserInterface\Tests\TestCase;

/**
 * The list page answers its record URLs too
 * (/list/{table}/{view|edit}/form/{form}/data/{uid}, /list/{table}/create/form/{form}, ?mode=table|split):
 * the page's JS opens what they name, so a reload or a shared link shows the same state.
 */
class ListPageUrlTest extends TestCase
{
    private function table(): TableSchema
    {
        return TableSchema::create([
            'uid' => (string) Str::ulid(),
            'slug' => 'demo-table',
            'name' => 'Demo',
            'description' => 'Demo list',
            'schema' => ['entity' => 'demo_items', 'dt-options' => ['columns' => [['data' => 'name']]]],
            'status' => 'active',
        ]);
    }

    public function test_the_list_page_serves_its_mode_and_record_urls(): void
    {
        $table = $this->table();
        $this->actingAs($this->makeUser('super-admin'));

        foreach ([
            "/list/{$table->uid}",
            "/list/{$table->uid}?mode=split",
            "/list/{$table->uid}/view/form/demo-form/data/01ABC",
            "/list/{$table->uid}/view/form/demo-form/data/01ABC?mode=split",
            "/list/{$table->uid}/edit/form/demo-form/data/01ABC?mode=table",
            "/list/{$table->uid}/create/form/demo-form?mode=split&q=ann&page=2",
        ] as $url) {
            $this->get($url)->assertOk()->assertSee('id="'.$table->uid.'"', false);
        }
    }

    public function test_other_paths_are_not_list_urls(): void
    {
        $table = $this->table();
        $this->actingAs($this->makeUser('super-admin'));

        foreach ([
            "/list/{$table->uid}/split",
            "/list/{$table->uid}/delete/form/demo-form/data/01ABC",
            "/list/{$table->uid}/view/form/demo-form",
            "/list/{$table->uid}/view/demo-form/01ABC",
        ] as $url) {
            $this->get($url)->assertNotFound();
        }
    }

    public function test_the_loading_placeholder_matches_the_view_mode_and_record(): void
    {
        $table = $this->table();
        $this->actingAs($this->makeUser('super-admin'));
        $split = 'data-skeleton-mode="split" class="ui-split-skeleton';

        // Default (table view): the table placeholder shows, the split one is hidden.
        $this->get("/list/{$table->uid}")->assertOk()
            ->assertSee('data-skeleton-mode="table" class=""', false)
            ->assertSee($split.'  d-none', false);

        // ?mode=split with a record: the split placeholder with the record on the right.
        $this->get("/list/{$table->uid}/view/form/demo-form/data/01ABC?mode=split")->assertOk()
            ->assertSee($split.' has-record d-flex', false);

        // Table view with a record: the record full width, no table placeholder.
        $this->get("/list/{$table->uid}/view/form/demo-form/data/01ABC")->assertOk()
            ->assertDontSee('bg-info-subtle rounded col-3 p-3', false);
    }

    public function test_the_form_api_names_the_form_and_finds_it_by_uid_too(): void
    {
        // List page URLs name the form by uid; pages and schemas by slug.
        $form = FormSchema::create([
            'uid' => (string) Str::ulid(),
            'slug' => 'demo-form',
            'name' => 'Demo form',
            'description' => 'Demo',
            'schema' => ['fields' => []],
            'status' => 'active',
        ]);

        foreach (['demo-form', $form->uid] as $id) {
            $this->getJson("/api/user-interface/v1/noauth/form/{$id}")
                ->assertOk()
                ->assertJsonPath('success', true)
                ->assertJsonPath('response_schema.data.schemaUid', $form->uid)
                ->assertJsonPath('response_schema.data.schemaSlug', 'demo-form');
        }
    }

    public function test_guests_cannot_open_a_record_url(): void
    {
        $table = $this->table();

        // (The login page comes from user-management: here a guest gets 401.)
        $this->getJson("/list/{$table->uid}/view/form/demo-form/data/01ABC")->assertUnauthorized();
    }
}
