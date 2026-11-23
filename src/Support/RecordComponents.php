<?php

namespace Iquesters\UserInterface\Support;

use InvalidArgumentException;
use Iquesters\UserInterface\Contracts\RecordComponentSource;

/**
 * Record components: what a list shows for a record, in its rows
 * ("summary", table schema "row_component") and when the record is open in
 * view mode ("details", form schema "modes.view.component"). Schemas name
 * them by key, e.g. "user.details", never by file path.
 *
 * Where a key comes from, in order:
 * 1. a RecordComponentSource bound with the tag self::SOURCES_TAG (e.g.
 *    components stored in the database, later), so it can override a file;
 * 2. a module's file, registered by key: the module that owns the data keeps
 *    its components in resources/views/records/{type}/{summary|details}.blade.php
 *    and registers them in its service provider:
 *
 *        app(RecordComponents::class)->register('user.details', 'usermanagement::records.user.details', 'details', 'User details');
 *
 * 3. (deprecated) a fully qualified view name, e.g.
 *    "userinterface::components.lab-user-details", as older schemas have.
 */
final class RecordComponents
{
    public const SOURCES_TAG = 'record-component-sources';

    public const KINDS = ['summary', 'details'];

    /** @var array<string, array{view: string, kind: string, label: string}> */
    private array $components = [];

    public function register(string $key, string $view, string $kind, ?string $label = null): void
    {
        if (! preg_match('/^[a-z][a-z0-9_-]*(\.[a-z0-9_-]+)+$/', $key)) {
            throw new InvalidArgumentException("Record component key \"{$key}\" must look like \"user.details\".");
        }

        if (! in_array($kind, self::KINDS, true)) {
            throw new InvalidArgumentException('Record component kind must be '.implode(' or ', self::KINDS).'.');
        }

        $this->components[$key] = ['view' => $view, 'kind' => $kind, 'label' => $label ?? $key];
    }

    public function has(string $key): bool
    {
        return isset($this->components[$key]);
    }

    /** The registered components, e.g. for a picker: [key => {view, kind, label}]. */
    public function all(?string $kind = null): array
    {
        return array_filter($this->components, fn ($c) => $kind === null || $c['kind'] === $kind);
    }

    /**
     * The component's template: {html, key} (bindings stay inside the HTML's
     * <script data-component-bindings> block, as the table expects), or null.
     *
     * @return array{html: string, key: string, deprecated: bool}|null
     */
    public function template(string $key): ?array
    {
        foreach (app()->tagged(self::SOURCES_TAG) as $source) {
            if ($source instanceof RecordComponentSource && ($found = $source->find($key)) !== null) {
                return ['html' => self::withBindings($found), 'key' => $key, 'deprecated' => false];
            }
        }

        if ($this->has($key)) {
            return ['html' => view($this->components[$key]['view'])->render(), 'key' => $key, 'deprecated' => false];
        }

        // Older schemas name a view directly.
        if (str_contains($key, '::') && view()->exists($key)) {
            return ['html' => view($key)->render(), 'key' => $key, 'deprecated' => true];
        }

        return null;
    }

    /** A stored component as the table reads it: its HTML followed by its bindings block. */
    private static function withBindings(array $component): string
    {
        $html = (string) ($component['html'] ?? '');

        if (! empty($component['bindings']) && ! str_contains($html, 'data-component-bindings')) {
            $json = json_encode($component['bindings'], JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
            $html .= "\n<script type=\"application/json\" data-component-bindings>{$json}</script>";
        }

        return $html;
    }
}
