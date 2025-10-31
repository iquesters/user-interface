@props([
    'id' => null,
    'data' => null,
    'method' => 'POST',
    'enctype' => 'multipart/form-data',
    'meta' => '',
    'formData' => '',
])

{{-- The class should be named as the final named decide --}}
<form id="{{ $id }}"
      class="shoz-form" 
      method="{{ strtoupper($method) }}"
      enctype="{{ $enctype }}"
      data-form-meta="{{ $meta }}"
      data-form-data='{{ $formData }}'>
    @csrf

</form>
<p class="alert alert-info">Form Rendered by Form Schema</p>
