<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\UserInterface\Support\FormSchemaLabel;
use Iquesters\UserInterface\Tests\TestCase;

/** "Form Rendered by Form Schema: slug": who sees it (settings form_schema_label, form_schema_label_roles). */
class FormSchemaLabelTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Settings are cached: each test starts from the defaults.
        Cache::flush();
        ConfProvider::forget();
    }

    public function test_by_default_only_super_admins_see_it_while_debugging(): void
    {
        config(['app.debug' => true]);
        $this->assertTrue(FormSchemaLabel::visibleTo($this->makeUser('super-admin')));
        $this->assertFalse(FormSchemaLabel::visibleTo($this->makeUser('admin')));
        $this->assertFalse(FormSchemaLabel::visibleTo($this->makeUser()));
        $this->assertFalse(FormSchemaLabel::visibleTo(null));

        config(['app.debug' => false]);
        $this->assertFalse(FormSchemaLabel::visibleTo($this->makeUser('super-admin')));
    }

    public function test_the_roles_and_when_are_settings(): void
    {
        config(['app.debug' => false]);
        $conf = ConfProvider::from(Module::USER_INFE);

        $conf->update(['form_schema_label' => 'always', 'form_schema_label_roles' => 'super-admin, admin']);
        $this->assertTrue(FormSchemaLabel::visibleTo($this->makeUser('admin')));
        $this->assertFalse(FormSchemaLabel::visibleTo($this->makeUser('member')));

        $conf->update(['form_schema_label_roles' => '']);
        $this->assertTrue(FormSchemaLabel::visibleTo($this->makeUser('member')));

        $conf->update(['form_schema_label' => 'never']);
        $this->assertFalse(FormSchemaLabel::visibleTo($this->makeUser('super-admin')));
    }

    public function test_the_page_tells_the_form_engine(): void
    {
        config(['app.debug' => true]);
        $this->actingAs($this->makeUser('super-admin'));
        $this->get('/help')->assertOk()->assertSee('showFormSchemaLabel = true', false);

        $this->actingAs($this->makeUser('admin'));
        $this->get('/help')->assertOk()->assertSee('showFormSchemaLabel = false', false);
    }

    public function test_when_must_be_debug_always_or_never(): void
    {
        $this->expectException(ValidationException::class);
        ConfProvider::from(Module::USER_INFE)->update(['form_schema_label' => 'sometimes']);
    }
}
