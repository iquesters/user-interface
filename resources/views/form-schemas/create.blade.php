@extends(config('userinterface.layout_app'))

@section('title')
Create new Form Schema
@endsection

@section('content')
@include('userinterface::form-schemas.forms.form-create')
@endsection