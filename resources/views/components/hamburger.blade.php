@props([
    'size' => '40px',      // default size
    'classes' => '',       // additional classes
    'style' => '',         // additional inline styles
    'iconClass' => 'fa-bars' // default icon
])

<button 
    {{ $attributes->merge(['class' => "sidebar-toggle btn-light border-0 rounded-circle d-flex align-items-center justify-content-center $classes"]) }}
    type="button"
    style="height: {{ $size }} !important; width: {{ $size }}; {{ $style }}"
>
    <i class="fa-solid {{ $iconClass }}"></i>
</button>