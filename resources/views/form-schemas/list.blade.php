@extends(config('userinterface.layout_app'))

@section('title')
Form Schemas
@endsection

@section('content')
<div class="card border-0">
    <div class="card-header bg-white border-0 p-0">
        <div class="d-flex align-items-center justify-content-between gap-2">
            <div class="d-flex align-items-center gap-2">
                <i class="far fa-fw fa-building"></i>
                <h5 class="mb-0 mt-1">Form Schemas</h5>
            </div>
            <div class="d-flex align-items-center gap-2">
                <a class="btn btn-sm btn-outline-secondary d-flex align-items-center" href="{{ route('form.create') }}">
                    <!-- <i class="far fa-fw fa-plus"></i> -->
                    New Form
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
                @if($forms->isNotEmpty())
                @foreach($forms as $form)
                <tr>
                    <td class="">{{ $form->name }}</td>
                    <td class="">{{ $form->description }}</td>
                    <td class="">{{ $form->id }}</td>
                    <td class="">{{ $form->schema }}</td>
                    <td class="">{{ $form->extra_info }}</td>
                    <td class="">
                        <div class="d-flex justify-content-center gap-2">
                            <a type="button" class="nav-link d-flex align-items-center text-primary" title="Form Creation of {{ $form->name }} form" href="{{route('form.formCreation',$form->uid)}}">
                                <i class="fa-fw far fa-eye"></i>
                            </a>
                            <a type="button" class="nav-link d-flex align-items-center text-success" title="Overview of {{ $form->name }} form" href="{{route('form.overview',$form->id)}}">
                                <i class="fa-fw far fa-edit"></i>
                            </a>
                            <a type="button" class="nav-link d-flex align-items-center text-danger" title="Delete {{ $form->name }} form" href="{{route('form.delete',$form->id)}}">
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
@endsection