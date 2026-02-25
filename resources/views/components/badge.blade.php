@props([
    'text' => null,
    'icon' => null,
    'variant' => 'secondary',
    'class' => ''
])

<span {{ $attributes->merge(['class' => "badge text-bg-$variant $class"]) }}>

    @if($icon)
        <i class="{{ $icon }} {{ $text ? 'me-1' : '' }}"></i>
    @endif

    @if($text)
        {{ $text }}
    @endif

</span>