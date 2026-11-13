@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp 

@extends($layout)

@section('title')
Create new Form Schema
@endsection

@section('content')
@include('userinterface::form-schemas.forms.form-create')
@endsection