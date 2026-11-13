@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp 

@extends($layout)

@section('title')
Table Schema Overview
@endsection

@section('content')
@include('userinterface::table-schemas.forms.form-update')
@endsection
