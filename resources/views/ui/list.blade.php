@extends(app('app.layout'))

@php
    $entity = ucwords(str_replace('_', ' ', $table_schema->schema['entity']));
    $defaultView = $table_schema->schema['default_view_mode'] ?? 'table';

    // Table schema "create": {"form": "<form schema>", "label": "Create user"}
    // adds a Create button that opens that form in create mode (modal).
    // Optional "permission": the button shows only to users who have it
    // (the endpoint still checks; this only hides a button that would fail).
    $create = is_array($table_schema->schema['create'] ?? null) && ! empty($table_schema->schema['create']['form'])
        ? $table_schema->schema['create']
        : null;
    if ($create && ! empty($create['permission']) && ! (auth()->user()?->can($create['permission']) ?? false)) {
        $create = null;
    }

@endphp

@php
    // The table's own name and description (e.g. "People and roles"), else the entity.
    $listTitle = trim((string) ($table_schema->name ?? '')) ?: $entity;
    $listDescription = trim((string) ($table_schema->description ?? ''));
@endphp

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make([$listTitle]))

@section('meta-description',
    \Iquesters\Foundation\Helpers\MetaHelper::description($listDescription ?: "List view of {$listTitle}")
)

@section('content')
    <div id="listViewportLayout" class="d-flex flex-column" data-auto-viewport-height data-viewport-height-offset="8" data-viewport-height-min="360" style="min-height: 0;">
    {{-- Title (Always visible) --}}
    <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
            <h5 class="fs-6 mb-0" data-entity="{{ $entity }}">{{ $listTitle }}</h5>
            @if ($listDescription !== '')
                <div class="small text-muted">{{ $listDescription }}</div>
            @endif
        </div>
    </div>

    {{-- Actions bar and the table (also used by other pages). --}}
    @include('userinterface::components.table', ['table_schema' => $table_schema, 'create' => $create, 'defaultView' => $defaultView])
    </div>
@endsection