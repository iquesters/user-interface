@extends(app('app.layout'))

@php
    $entity = ucwords(str_replace('_', ' ', $table_schema->schema['entity']));
@endphp

@section('page-title', \Iquesters\Foundation\Helpers\MetaHelper::make([$entity]))

@section('meta-description', 
    \Iquesters\Foundation\Helpers\MetaHelper::description("List view of {$entity}")
)

@section('content')
    <div class="d-flex justify-content-between align-items-center mb-3">

        <h5 class="fs-6 mb-0">
            List view of {{ $entity }}
        </h5>

        @php
            $defaultView = $table_schema->schema['default_view_mode'] ?? 'table';
        @endphp

        <button type="button"
                class="btn btn-sm btn-outline-dark"
                id="toggleViewBtn"
                title="{{ $defaultView === 'table' ? 'Switch to Split View' : 'Switch to Table View' }}">
            
            <i class="fas {{ $defaultView === 'table' ? 'fa-table-columns' : 'fa-table' }}"></i>

        </button>

    </div>

    <table id="{{ $table_schema->uid }}" class="lab-table"></table>
@endsection