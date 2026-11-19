<?php

namespace Iquesters\UserInterface\Contracts;

/**
 * Somewhere record components can come from besides module files, e.g. the
 * database (components edited in an admin screen). Bind one with the tag
 * RecordComponents::SOURCES_TAG; sources are asked before module files, so
 * a stored component can override a module's file with the same key.
 *
 * A component is plain HTML with __PLACEHOLDER__ tokens plus its bindings
 * (see docs/record-components.md); no Blade or PHP is run for it.
 */
interface RecordComponentSource
{
    /** @return array{html: string, bindings?: array}|null null when this source doesn't have the key */
    public function find(string $key): ?array;
}
