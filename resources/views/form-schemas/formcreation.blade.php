@extends(config('userinterface.layout_app'))

@section('title', 'Create New Master Data'.(isset($data->parent_id) && $data->parent_id > 0 ? ' for ' . $data->parent->key : ''))

@section('content')
<form id="mdm-create" class="shoz-form" data-form-data="{{json_encode($data)}}"></form>
<!-- <form id="mdm-create" class="shoz-form" 
      action="{{ route('form.formsubmit') }}" 
      method="POST" 
      enctype="multipart/form-data"
      data-form-data="{{ json_encode($data) }}">
    @csrf
</form> -->

@endsection

@pushonce('scripts')
<script type="text/javascript">
    function prepare_MDMForm(formID) {
        // do something here
    }
</script>
@endpushonce