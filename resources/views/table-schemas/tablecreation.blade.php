@extends('userinterface::layouts.app')

@section('content')
<div class="container mt-4">
    <h2>{{ $data->parent->name }} Table Schema</h2>

    <table id="schemaTable" class="table table-bordered table-striped">
        <thead>
            <tr>
                @php
                    $schema = json_decode($data->parent->schema, true);
                    $columns = ['Field Name']; // Start with Field Name
                    // Collect all possible keys in schema
                    foreach ($schema as $field) {
                        foreach ($field as $key => $value) {
                            if (!in_array(ucfirst($key), $columns)) {
                                $columns[] = ucfirst($key);
                            }
                        }
                    }
                @endphp

                @foreach($columns as $col)
                    <th>{{ $col }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($schema as $fieldName => $field)
                <tr>
                    <td>{{ $fieldName }}</td>
                    @foreach(array_slice($columns, 1) as $col) {{-- Skip Field Name --}}
                        @php
                            $key = strtolower($col);
                        @endphp
                        <td>
                            @if(isset($field[$key]))
                                @if(is_bool($field[$key]))
                                    {{ $field[$key] ? 'Yes' : 'No' }}
                                @else
                                    {{ $field[$key] }}
                                @endif
                            @else
                                -
                            @endif
                        </td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

{{-- DataTables Scripts --}}
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>

<script>
    $(document).ready(function() {
        $('#schemaTable').DataTable({
            responsive: true,
            pageLength: 10
        });
    });
</script>
@endsection
