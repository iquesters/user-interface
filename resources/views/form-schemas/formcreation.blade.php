@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    use Iquesters\UserManagement\Config\UserManagementKeys;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp 

@extends($layout)

@section('title', 'Create New Master Data'.(isset($data->parent_id) && $data->parent_id > 0 ? ' for ' . $data->parent->key : ''))

@section('content')
<!-- <form id="{{$data->parent->uid}}" class="shoz-form"></form> -->
 <!-- action="{{ route('form.submitAndSave', ['uid' => $data->parent->uid ?? '']) }}" -->
<form id="{{$data->parent->uid}}" class="shoz-form" 
       
      method="POST" 
      enctype="multipart/form-data"
      data-form-meta=""
      data-form-data=''>
    @csrf

   
    
    
</form>
<!-- APP ENV Message container -->
<div id="form-error-message"></div>

@endsection

@pushonce('scripts')
<script type="text/javascript">
    const APP_ENV = "{{ config('app.env') }}";
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
                window.location.reload();
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