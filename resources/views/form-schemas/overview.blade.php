@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp 

@extends($layout)

@section('title')
Form Overview
@endsection

@section('content')
@include('userinterface::form-schemas.forms.form-update')
@endsection
