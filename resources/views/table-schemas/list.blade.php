@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\UserManagement\Config\UserManagementKeys;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp 

@extends($layout)

@section('title')
Table Schemas
@endsection

@section('content')
<div class="card border-0">
    <div class="card-header bg-white border-0 p-0">
        <div class="d-flex align-items-center justify-content-between gap-2">
            <div class="d-flex align-items-center gap-2">
                <i class="far fa-fw fa-building"></i>
                <h5 class="mb-0 mt-1">Table Schemas</h5>
            </div>
            <div class="d-flex align-items-center gap-2">
                <a class="btn btn-sm btn-outline-secondary d-flex align-items-center" href="{{ route('table.create') }}">
                    <!-- <i class="far fa-fw fa-plus"></i> -->
                    New Table
                </a>
            </div>
        </div>
    </div>
    <div class="card-body px-0 pb-0">
        <table id="form-schemas-table" class="table table-hover align-middle">
            <thead>
                <tr>
                    <th class="">
                        Name
                    </th>
                    <th class="">
                        Description
                    </th>
                    <th class="">
                        Slug
                    </th>
                    <th class="">
                        Schema
                    </th>
                    <th class="">
                        Extra Info
                    </th>
                    <th class="text-center no-sort" width="110px">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody>
                @if($tables->isNotEmpty())
                @foreach($tables as $table)
                <tr>
                    <td class="">{{ $table->name }}</td>
                    <td class="">{{ $table->description }}</td>
                    <td class="">{{ $table->id }}</td>
                    <td class="">{{ json_encode($table->schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</td>
                    <td class="">{{ $table->extra_info }}</td>
                    <td class="">
                        <div class="d-flex justify-content-center gap-2">
                            <a type="button" class="nav-link d-flex align-items-center" title="Overview of {{ $table->name }} form" href="{{route('table.overview',$table->id)}}">
                                <i class="fa-fw far fa-eye"></i>
                            </a>
                            <a type="button" class="nav-link d-flex align-items-center" title="Delete {{ $table->name }} form" href="{{route('table.delete',$table->id)}}">
                                <i class="fa-fw far fa-trash-can"></i>
                            </a>
                        </div>
                    </td>
                </tr>
                @endforeach
                @endif
            </tbody>
        </table>
    </div>
</div>

<table id="users-table" class="lab-table"></table>
@endsection 