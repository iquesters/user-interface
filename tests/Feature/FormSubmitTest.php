<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Iquesters\UserInterface\Models\FormSchema;
use Iquesters\UserInterface\Tests\TestCase;

class FormSubmitTest extends TestCase
{
    private string $formUid;

    protected function setUp(): void
    {
        parent::setUp();

        $this->formUid = (string) Str::ulid();

        FormSchema::create([
            'uid' => $this->formUid,
            'slug' => 'contact-form',
            'name' => 'Contact',
            'description' => 'Contact form',
            'schema' => ['fields' => [
                ['id' => 'full_name', 'type' => 'text', 'required' => true, 'maxLength' => 20],
                ['id' => 'email', 'type' => 'email', 'required' => true],
            ]],
            'extra_info' => [],
            'status' => 'active',
        ]);

        $this->actingAs($this->makeUser('super-admin'));
    }

    public function test_form_values_storage_is_gone(): void
    {
        $this->assertFalse(Schema::hasTable('form_values'));
        $this->assertFalse(app('router')->getRoutes()->hasNamedRoute('form.submitAndSave'));
        $this->post("/api/form/save-form/{$this->formUid}")->assertNotFound();
    }

    public function test_valid_preview_submission_passes_validation(): void
    {
        $this->from('/form/formCreation/'.$this->formUid)
            ->post("/form/formsubmit/{$this->formUid}", ['full_name' => 'Asha', 'email' => 'asha@example.test'])
            ->assertRedirect('/form/formCreation/'.$this->formUid)
            ->assertSessionHas('success')
            ->assertSessionHasNoErrors();
    }

    public function test_invalid_preview_submission_returns_field_errors(): void
    {
        $this->from('/form/formCreation/'.$this->formUid)
            ->post("/form/formsubmit/{$this->formUid}", ['full_name' => str_repeat('x', 30), 'email' => 'nope'])
            ->assertRedirect('/form/formCreation/'.$this->formUid)
            ->assertSessionHasErrors(['full_name', 'email']);
    }
}
