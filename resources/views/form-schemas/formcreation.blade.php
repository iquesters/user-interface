@extends(config('userinterface.layout_app'))

@section('title', 'Create New Master Data'.(isset($data->parent_id) && $data->parent_id > 0 ? ' for ' . $data->parent->key : ''))

@section('content')
<!-- <form id="mdm-create" class="shoz-form" data-form-data="{{json_encode($data)}}"></form> -->
 <!-- action="{{ route('form.submitAndSave', ['uid' => $data->parent->uid ?? '']) }}" -->
<form id="mdm-create" class="shoz-form" 
       
      method="POST" 
      enctype="multipart/form-data"
      data-form-data="{{ json_encode($data) }}">
    @csrf

   
    
    
</form>

@endsection

@pushonce('scripts')
<script type="text/javascript">
    function prepare_MDMForm(formID) {
        // do something here
    }
    window.formErrors = @json($errors->toArray());

    $('#mdm-create').on('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        const formData = new FormData(this);

        $('.is-invalid').removeClass('is-invalid');   
        $('.invalid-feedback').remove(); 
        
        $.ajax({
            url: "http://127.0.0.1:8000/form/save-form/{{ $data->parent->uid ?? '' }}", 
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                console.log("API Response:", response);
                alert("Form submitted successfully!");
            },
            error: function(xhr) {
                console.error("API Error:", xhr.responseText);
                if (xhr.status === 422) {
                    const res = xhr.responseJSON;
                    if (res.errors) {
                        showValidationErrors(res.errors);
                    }
                } else {
                    alert("Something went wrong!");
                }
            
            }
        });
    });


function showValidationErrors(errors) {
    Object.keys(errors).forEach(function(field) {
        const input = document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('is-invalid');

            const errorDiv = document.createElement("div");
            errorDiv.classList.add("invalid-feedback");
            errorDiv.textContent = errors[field][0];
            
            // Append error message right after the input
            input.parentNode.appendChild(errorDiv);
        }
    });
}
</script>
@endpushonce