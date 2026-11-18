@php
    // Expects $user. avatarUrl() comes from user-management's HasUserManagement trait.
    $initial = mb_strtoupper(mb_substr(trim((string) ($user->name ?? '')) ?: '?', 0, 1));
    $imageOptions = fn (string $id, string $src) => (object) [
        'img' => (object) [
            'id' => $id,
            'src' => $src,
            'alt' => $user->name ?? '',
            'width' => '96px',
            'class' => 'rounded-circle',
            'container_class' => 'img-thumbnail rounded-circle',
            'aspect_ratio' => '1/1',
        ],
    ];
    $current = method_exists($user, 'avatarUrl') ? $user->avatarUrl() : '';
@endphp

<div id="remove-image-dropbox" class="d-none">
    <div class="text-center p-2 d-flex flex-column align-items-center gap-2">
        <div class="d-flex align-items-center">
            @include('userinterface::utils.image', ['options' => $imageOptions('remove-image-current', $current)])
            <i class="fa-solid fa-arrow-right p-3 text-muted"></i>
            @include('userinterface::utils.image', ['options' => $imageOptions('remove-image-default', 'https://placehold.co/400x400/faf3e0/d72638/png?text='.rawurlencode($initial))])
        </div>
        <p class="small text-muted mb-0">Your uploaded picture will be removed and the default picture shown instead.</p>
    </div>
</div>
