<?php

/*
$sample_img_opts = (object)array(
    'img' => (object)array(
        'id' => 'account-view-logo',
        'src' => $__user_profile_img__,
        'alt' => $user->name,
        'width' => '100%',
        'class' => 'rounded',
        'container_class' => '',
        'aspect_ratio' => '1/1'
    ),
    'random_img' => (object)array(
        'width' => 150,
        'height' => 150,
        'text' => $user->name,
        'bg_color' => '223344',
        'text_color' => '001122',
        'text_font' => 'Roboto',
        'img_type' => ''
    ),
);
*/

// container variables
$container_class = 'd-flex align-items-center justify-content-center';
if (isset($options?->img?->container_class)) {
    $container_class = $container_class . ' ' . $options?->img?->container_class;
}

$container_style = '';
if (isset($options?->img?->aspect_ratio)) {
    $container_style = $container_style . 'aspect-ratio:' . $options?->img?->aspect_ratio . ';';
} else {
    $container_style = $container_style . 'aspect-ratio:1/1;';
}

if (isset($options?->img?->width)) {
    $container_style = $container_style . 'width:' . $options?->img?->width . ';';
}

if (isset($options?->img?->height)) {
    $container_style = $container_style . 'height:' . $options?->img?->height . ';';
}

$container_id = null;


// img variables
$img_id = null;
if (isset($options?->img?->id)) {
    $img_id = $options?->img?->id;
    $container_id = $img_id . '-container';
}
$img_src = null;
if (isset($options?->img?->src)) {
    $img_src = $options?->img?->src;
}
$img_title = '';
if (isset($options?->img?->title)) {
    $img_title = $options?->img?->title;
}
$img_alt = '';
if (isset($options?->img?->alt)) {
    $img_alt = $options?->img?->alt;
}
$img_class = '';
if (isset($options?->img?->class)) {
    $img_class = $options?->img?->class;
}


// random img variables
$random_img_width = null;
if (isset($options?->random_img?->width)) {
    $random_img_width = $options?->random_img?->width;
}

$random_img_height = null;
if (isset($options?->random_img?->height)) {
    $random_img_height = $options?->random_img?->height;
}

$random_img_text = null;
if (isset($options?->random_img?->text)) {
    $random_img_text = $options?->random_img?->text;
}

$random_img_bg_color = null;
if (isset($options?->random_img?->bg_color)) {
    if (str_starts_with($options?->random_img?->bg_color, '#')) {
        $random_img_bg_color = substr($options?->random_img?->bg_color, 1, strlen($options?->random_img?->bg_color));
    } else {
        $random_img_bg_color = $options?->random_img?->bg_color;
    }
}

$random_img_text_color = null;
if (isset($options?->random_img?->text_color)) {
    if (str_starts_with($options?->random_img?->text_color, '#')) {
        $random_img_text_color = substr($options?->random_img?->text_color, 1, strlen($options?->random_img?->text_color));
    } else {
        $random_img_text_color = $options?->random_img?->text_color;
    }
}

$random_img_text_font = null;
if (isset($options?->random_img?->text_font)) {
    $random_img_text_font = $options?->random_img?->text_font;
}

$random_img_img_type = null;
if (isset($options?->random_img?->img_type)) {
    $random_img_img_type = $options?->random_img?->img_type;
}
?>
<div
    id="{{ $container_id }}"
    class="{{ $container_class }}"
    style="{{ $container_style }}">
    <img
        id="{{ $img_id }}"
        alt="{{ $img_alt }}"
        class="img-fluid {{ $img_class }}"
        style="max-height:100%; max-width:100%"
        referrerpolicy="no-referrer"

        @isset($img_src)
        src="{{ $img_src }}"
        @else

        data-sz-avatar="random"

        @isset($random_img_width)
        data-sz-avatar-width="{{ $random_img_width }}"
        @endif

        @isset($random_img_height)
        data-sz-avatar-height="{{ $random_img_height }}"
        @endif

        @isset($random_img_text)
        data-sz-avatar-text="{{ $random_img_text }}"
        @endif

        @isset($random_img_bg_color)
        data-sz-avatar-bg-color="{{ $random_img_bg_color }}"
        @endif

        @isset($random_img_text_color)
        data-sz-avatar-text-color="{{ $random_img_text_color }}"
        @endif

        @isset($random_img_text_font)
        data-sz-avatar-text-font="{{ $random_img_text_font }}"
        @endif

        @isset($random_img_img_type)
        data-sz-avatar-img-type="{{ $random_img_img_type }}"
        @endif

        @endif

        @isset($img_title)
        data-toggle="tooltip"
        title="{{ $img_title }}"
        @endif />
</div>