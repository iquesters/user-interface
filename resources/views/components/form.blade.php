@props([
    'id' => null,
    'method' => 'POST',
    'enctype' => 'multipart/form-data',
    'meta' => '',
    'formData' => '',
    'entity_uid' => null,
])




{{-- The class should be named as the final named decide --}}
<form id="{{ $id }}"
      class="shoz-form" 
      method="{{ strtoupper($method) }}"
      enctype="{{ $enctype }}"
      data-form-meta="{{ $meta }}"
      data-form-data='{{ $formData }}'
      data-entity-uid="{{ $entity_uid }}">
    @csrf

  <div class="form-skeleton">
    <!-- Header Section -->
    <div class="mb-4">
      <div class="placeholder-wave">
        <div class="bg-info-subtle rounded col-12 p-4 mb-2"></div>
        {{-- <div class="bg-info-subtle rounded col-12 p-5">  </div> --}}
      </div>
    </div>
    <!-- Body Section -->
    <div class="mb-4 placeholder-wave">
      <div class="row mb-3">
          <div class="col-6">
              <div class="bg-info-subtle rounded col-6 p-2 mb-2"></div>
              <div class="bg-info-subtle rounded col-12 p-4"></div>
          </div>
          <div class="col-6">
              <div class="bg-info-subtle rounded col-5 p-2 mb-2"></div>
              <div class="bg-info-subtle rounded col-12 p-4"></div>
          </div>
      </div>
      
      <div class="bg-info-subtle rounded col-2 p-2 mb-2"></div>
      <div class="bg-info-subtle rounded col-9 p-4 mb-3"></div>
      {{-- <div class="bg-info-subtle rounded col-3 p-2 mb-2"></div>
      <div class="bg-info-subtle rounded col-6 p-4"></div> --}}
      <div class="row mb-3">
          <div class="col-5">
              <div class="bg-info-subtle rounded col-6 p-2 mb-2"></div>
              <div class="bg-info-subtle rounded col-12 p-4"></div>
          </div>
          <div class="col-7">
              <div class="bg-info-subtle rounded col-5 p-2 mb-2"></div>
              <div class="bg-info-subtle rounded col-12 p-4"></div>
          </div>
      </div>
    </div>
    <!-- Footer Section -->
    <div class="d-flex justify-content-end placeholder-wave">
      <div class="bg-info-subtle rounded col-2 p-4 me-2"></div>
      <div class="bg-info-subtle rounded col-2 p-4"></div>
    </div>
  </div>
</form>
{{-- <p class="alert alert-info">Form Rendered by Form Schema</p> --}}

@if(config('app.debug'))
<div class="small p-1 d-flex justify-content-end align-items-center">
    <div class="small">
        Form Rendered by Form Schema
    </div>
</div>
@endif