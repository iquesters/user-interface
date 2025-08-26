@extends(config('userinterface.layout_app'))

@section('title')
Create new Table Schema
@endsection

@section('content')
@include('userinterface::table-schemas.forms.form-create')
@endsection