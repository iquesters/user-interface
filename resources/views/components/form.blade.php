@props([
    'id' => null,
    'method' => 'POST',
    'enctype' => 'multipart/form-data',
    'meta' => '',
    'formData' => '',
    'entity_uid' => null,
    'form_mode' => null,
])

@php
    // The real field count/widths are only known once the schema is fetched
    // client-side (async), and by then the real fields are ready to render
    // anyway — so there's no point building an intermediate skeleton in JS.
    // Instead, look the schema up by slug here (System A / FormSchema, keyed
    // by $id, same as the client fetches by formElement.id) so the very
    // first paint already matches the real form shape. Falls back to the
    // generic skeleton below for anything this can't resolve (System B /
    // TableSchema-backed forms, or a schema that hasn't been seeded yet).
    $skeletonFieldWidths = [];
    $skeletonHasHeader = true; // unknown shape (System B / unseeded) — keep existing placeholder
    $skeletonButtonCount = 2; // unknown shape — keep existing 2-button placeholder
    $skeletonActionRows = []; // populated only when the schema uses row-grouped actions

    if ($id && \Illuminate\Support\Facades\Schema::hasTable('form_schemas')) {
        $rawSchema = \Illuminate\Support\Facades\DB::table('form_schemas')
            ->where('slug', $id)
            ->where('status', 'active')
            ->value('schema');

        if ($rawSchema) {
            $decodedSchema = json_decode($rawSchema, true) ?: [];
            $defaultFieldSize = $decodedSchema['defaultFieldSize'] ?? $decodedSchema['default_field_size'] ?? null;

            // Only forms that actually render a title/description (setupFormHeader /
            // setupInfoBlock in form.js) should show a placeholder for one.
            $skeletonHasHeader = ! empty($decodedSchema['header']['text'])
                || ! empty($decodedSchema['heading'])
                || ! empty($decodedSchema['info']['innerHTML']);

            $skeletonFieldWidths = collect($decodedSchema['fields'] ?? [])
                ->filter(fn ($field) => ($field['type'] ?? null) !== 'hidden')
                ->map(function ($field) use ($defaultFieldSize) {
                    $size = $field['size'] ?? $field['gridSize'] ?? $defaultFieldSize;

                    if (is_array($size)) {
                        $size = $size['lg'] ?? $size['md'] ?? $size['xs'] ?? 6;
                    }

                    return is_numeric($size) ? max(1, min(12, (int) $size)) : 6;
                })
                ->values()
                ->all();

            // Mirror applyModeOverrides() in form.js: each mode has hardcoded
            // allowSubmit/allowCancel defaults, which a schema's modes.<mode>
            // entry (e.g. modes.edit.allowCancel) can then override — that
            // override is exactly what makes our auth forms submit-only.
            $resolvedMode = $form_mode ?: 'edit';
            $modeDefaults = [
                'create' => ['allowSubmit' => true, 'allowCancel' => true],
                'view' => ['allowSubmit' => false, 'allowCancel' => false],
                'edit' => ['allowSubmit' => true, 'allowCancel' => true],
                'delete' => ['allowSubmit' => true, 'allowCancel' => true],
            ][$resolvedMode] ?? ['allowSubmit' => true, 'allowCancel' => true];

            foreach (['allowSubmit', 'allowCancel'] as $key) {
                if (isset($decodedSchema['modes'][$resolvedMode][$key])) {
                    $modeDefaults[$key] = (bool) $decodedSchema['modes'][$resolvedMode][$key];
                }
            }

            $schemaActions = $decodedSchema['actions'] ?? [];
            $skeletonActionRows = [];

            if (! empty($schemaActions)) {
                $hasExplicitCancel = collect($schemaActions)->contains(
                    fn ($action) => ($action['type'] ?? null) === 'cancel' || strtolower($action['text'] ?? '') === 'cancel'
                );
                $skeletonButtonCount = count($schemaActions)
                    + ($hasExplicitCancel || ! $modeDefaults['allowCancel'] ? 0 : 1);

                // Mirrors setupFormFooter()'s row grouping in form.js — an
                // action's 'row' key splits the footer into multiple lines
                // instead of one, so the skeleton should show the same
                // number of rows/items per row, not just a flat count. Each
                // item also carries its shape: a link-style action renders
                // as plain text (addAction() gives it no button chrome), so
                // a boxy button-shaped placeholder for it looked wrong next
                // to the real thing.
                $skeletonActionRows = collect($schemaActions)
                    ->groupBy(fn ($action) => $action['row'] ?? 0)
                    ->sortKeys()
                    ->map(function ($rowActions) {
                        return collect($rowActions)
                            ->map(function ($action) {
                                $isLink = ($action['element']['type'] ?? null) === 'a'
                                    || ($action['element']['variant'] ?? null) === 'link';

                                return $isLink ? 'link' : 'button';
                            })
                            ->values()
                            ->all();
                    })
                    ->values()
                    ->all();
            } else {
                $skeletonButtonCount = ($modeDefaults['allowCancel'] ? 1 : 0) + ($modeDefaults['allowSubmit'] ? 1 : 0);
            }
        }
    }
@endphp

{{-- The class should be named as the final named decide --}}
<form id="{{ $id }}"
      class="lab-form" 
      method="{{ strtoupper($method) }}"
      enctype="{{ $enctype }}"
      data-form-meta="{{ $meta }}"
      data-form-data='{{ $formData }}'
      data-entity-uid="{{ $entity_uid }}"
      data-form-mode="{{ $form_mode }}">
    @csrf

  <div class="form-skeleton">
    @if ($skeletonHasHeader)
    <!-- Header Section -->
    <div class="mb-4">
      <div class="placeholder-wave">
        <div class="bg-info-subtle rounded col-12 p-4 mb-2"></div>
      </div>
    </div>
    @endif
    <!-- Body Section -->
    <div class="mb-4 placeholder-wave">
      @if (count($skeletonFieldWidths) > 0)
        <div class="row mb-3 g-2">
          @foreach ($skeletonFieldWidths as $fieldWidth)
            <div class="col-{{ $fieldWidth }}">
                {{-- Explicit heights matching a real .form-label (~24px) and
                     .form-control (~38px) — the old p-2/p-4 padding-based
                     sizing didn't map to those, so the skeleton was
                     noticeably taller than the real field it stands in for. --}}
                <div class="bg-info-subtle rounded col-5 mb-2" style="height: 1.2rem;"></div>
                <div class="bg-info-subtle rounded col-12" style="height: 38px;"></div>
            </div>
          @endforeach
        </div>
      @else
        {{-- Schema not resolvable server-side (System B / not yet seeded) — generic fallback --}}
        <div class="row mb-3">
            <div class="col-6">
                <div class="bg-info-subtle rounded col-6 p-2 mb-2"></div>
                <div class="bg-info-subtle rounded col-12 p-4"></div>
            </div>
            <div class="col-6">
                <div class="bg-info-subtle rounded col-5 p-2 mb-2"></div>
                <div class="bg-info-subtle rounded col-12 p-4"></div>
            </div>
        </div>
        <div class="bg-info-subtle rounded col-2 p-2 mb-2"></div>
        <div class="bg-info-subtle rounded col-9 p-4 mb-3"></div>
        <div class="row mb-3">
            <div class="col-5">
                <div class="bg-info-subtle rounded col-6 p-2 mb-2"></div>
                <div class="bg-info-subtle rounded col-12 p-4"></div>
            </div>
            <div class="col-7">
                <div class="bg-info-subtle rounded col-5 p-2 mb-2"></div>
                <div class="bg-info-subtle rounded col-12 p-4"></div>
            </div>
        </div>
      @endif
    </div>
    @if (count($skeletonActionRows) > 0)
    <!-- Footer Section (row-grouped, matches setupFormFooter()'s multi-row layout) -->
    @foreach ($skeletonActionRows as $rowShapes)
      <div class="d-flex align-items-center {{ count($rowShapes) === 1 ? 'justify-content-center' : 'justify-content-between' }} gap-2 placeholder-wave mb-3">
        @foreach ($rowShapes as $shape)
          @if ($shape === 'link')
            {{-- Plain-text link (addAction() gives it no button chrome) — a short, thin bar, not a box --}}
            <div class="bg-info-subtle rounded" style="width: 130px; height: 0.9rem;"></div>
          @else
            {{-- Real .btn.btn-sm sized placeholder --}}
            <div class="bg-info-subtle rounded" style="width: 80px; height: 30px;"></div>
          @endif
        @endforeach
      </div>
    @endforeach
    @elseif ($skeletonButtonCount > 0)
    <!-- Footer Section -->
    <div class="d-flex justify-content-end gap-2 placeholder-wave">
      @for ($i = 0; $i < $skeletonButtonCount; $i++)
        <div class="bg-info-subtle rounded col-2 p-4"></div>
      @endfor
    </div>
    @endif
  </div>
</form>
{{-- <p class="alert alert-info">Form Rendered by Form Schema</p> --}}

@if(config('app.debug'))
<div class="small p-1 d-flex justify-content-end align-items-center">
    <div class="small">
        Form Rendered by Form Schema
    </div>
</div>
@endif
