<?php

namespace Iquesters\UserInterface\Config;

use Iquesters\Foundation\Support\BaseConf;

class SnackbarConf extends BaseConf
{
    protected ?string $identifier = 'snackbar';

    // Supported positions:
    // top-right, top-left, top-center,
    // bottom-right, bottom-left, bottom-center,
    // aliases accepted by JS: top, bottom, left, right
    protected string $position;

    // Duration in milliseconds before auto-hide.
    protected int $duration;

    // Stack behavior:
    // stack   -> keep multiple snackbars visible up to max_visible
    // replace -> remove old snackbar(s) before showing a new one
    protected string $stack_mode;

    // Maximum number of visible snackbars when stack_mode = stack.
    protected int $max_visible;

    // Whether the close button should be shown.
    protected bool $allow_dismiss;

    // Visual variants:
    // light  -> white/light background with subtle border
    // filled -> solid Bootstrap contextual background
    protected string $variant;

    // Optional Bootstrap utility classes to override background styling.
    // Examples: bg-white, bg-light, text-bg-dark, text-bg-success
    protected string $bg_class;

    // Optional Bootstrap utility classes for text color.
    // Examples: text-dark, text-primary, text-danger, text-warning-emphasis
    protected string $text_class;

    // Optional Bootstrap utility classes for border styling.
    // Examples: border border-secondary-subtle, border-0, border border-success
    protected string $border_class;

    // Optional Bootstrap shadow utility classes.
    // Examples: shadow-sm, shadow, shadow-lg, ''
    protected string $shadow_class;

    // Optional extra classes applied to the root toast element.
    // Examples: rounded-0, rounded-4, w-100
    protected string $toast_class;

    // Optional extra classes applied to the .toast-body element.
    // Examples: fw-semibold, small, px-4
    protected string $body_class;

    // Optional extra classes applied to the close button.
    // Examples: btn-close-white, ''
    protected string $close_button_class;

    protected function prepareDefault(BaseConf $default_values)
    {
        $default_values->position = 'bottom-right';
        $default_values->duration = 3000;
        $default_values->stack_mode = 'stack';
        $default_values->max_visible = 4;
        $default_values->allow_dismiss = true;
        $default_values->variant = 'light';
        $default_values->bg_class = '';
        $default_values->text_class = '';
        $default_values->border_class = '';
        $default_values->shadow_class = 'shadow';
        $default_values->toast_class = '';
        $default_values->body_class = '';
        $default_values->close_button_class = '';
    }
}
