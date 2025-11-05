@extends(app('app.layout'))

@section('title', 'View Form')

@section('content')

    @include('userinterface::components.form',
        [
            'id' => $form_schema_id
        ])
@endsection

