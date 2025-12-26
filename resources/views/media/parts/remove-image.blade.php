<?php 
$currentImageOptions = (object)array(
    'img' => (object)array(
        'id' => 'user-logo',
        'src' => $user_logo,
        'alt' => $user->name,
        'width' => '120px',
        'class' => 'rounded-circle',
        'container_class' => 'img-thumbnail rounded-circle',
        'aspect_ratio' => '1/1'
    ),
);
$initial = strtoupper(substr($user->name ?? 'S', 0, 1));
$newImageOptions = (object)array(
    'img' => (object)array(
        'id' => 'user-logo',
        'src' => "https://placehold.co/400x400/faf3e0/d72638/png?text=".$initial,
        'alt' => $user->name,
        'width' => '120px',
        'class' => 'rounded-circle',
        'container_class' => 'img-thumbnail rounded-circle',
        'aspect_ratio' => '1/1'
    ),
);
?>

<div id="remove-image-dropbox" class="d-none">
    <div class="text-center p-3 d-flex flex-column align-items-center gap-2">
        <h3>Remove profile picture?</h3>
        <div class="d-flex align-items-center">
            @include('userinterface::utils.image', ['options' => $currentImageOptions])
        
            <i class="fa-solid fa-arrow-right p-3"></i>

            @include('userinterface::utils.image', ['options' => $newImageOptions])
        </div>
        <p class="mt-3">Your previous picture will be saved in your past profile pictures album, and this image will be used instead.</p>
    </div>
</div>
