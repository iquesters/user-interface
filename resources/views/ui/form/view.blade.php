@extends(app('app.layout'))

@section('title', 'View Form')

@section('content')
<form id="{{$data->parent->uid}}" class="shoz-form" 
       
      method="POST" 
      enctype="multipart/form-data"
      data-form-meta=""
      data-form-data=''>
    @csrf

   
    
    
</form>
@endsection

