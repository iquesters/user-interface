
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

@include('userinterface::layouts.common.head')

<body>
    @include('userinterface::components.form',
        [
            'id' => $form_schema_id,
            'entity_uid' => $entity_uid,
        ])
    @include('userinterface::layouts.common.js')
</body>
</html>