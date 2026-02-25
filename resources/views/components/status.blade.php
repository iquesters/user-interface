@props([
    'status' => null,
    'class' => ''
])

@php
    // If slot text is provided, use it.
    // Otherwise generate from status
    if(trim($slot) !== '') {
        $text = $slot;
    } else {
        $text = $status ? ucwords(str_replace('_', ' ', $status)) : '';
    }

    // Optional: derive variant from status name
    $variant = $status;
@endphp

<x-userinterface::badge :text="$text" :variant="$variant" :class="$class" />