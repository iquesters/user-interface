@extends(config('userinterface.layout_app'))

@section('title')
Table Schema Overview
@endsection

@section('content')
@include('userinterface::table-schemas.forms.form-update')
@endsection