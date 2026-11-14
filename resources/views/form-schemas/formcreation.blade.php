@php
    use Iquesters\Foundation\Support\ConfProvider;
    use Iquesters\Foundation\Enums\Module;
    $layout=ConfProvider::from(Module::USER_INFE)->app_layout;
@endphp

@extends($layout)

@section('title', 'Create New Master Data'.(isset($data->parent_id) && $data->parent_id > 0 ? ' for ' . $data->parent->key : ''))

@section('content')
@if (session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

{{-- Form preview: submitting only validates against the form schema (nothing is saved). --}}
<form id="{{$data->parent->uid}}" class="lab-form"
      action="{{ route('form.formsubmit', ['uid' => $data->parent->uid ?? '']) }}"
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

    // Fields are rendered by form.js after load, so wait for them before
    // marking the fields that failed server-side validation.
    (function showServerErrorsWhenReady(attempt) {
        const errors = window.formErrors || {};
        const fields = Object.keys(errors);
        if (fields.length === 0) {
            return;
        }

        if (!fields.some((f) => document.querySelector(`[name="${f}"]`)) && attempt < 30) {
            setTimeout(() => showServerErrorsWhenReady(attempt + 1), 100);
            return;
        }

        showValidationErrors(errors);
    })(0);

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
