@extends(app('app.layout'))

@section('title', 'edit Form')

@section('content')

    @include('userinterface::components.form',
        [
            'id' => $form_schema_id
        ])
@endsection

