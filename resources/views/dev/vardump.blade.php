<?php

use Illuminate\Support\Str;

$uuid = Str::uuid()

?>
<div class="accordion-item">
    <h2 class="accordion-header sticky-top">
        <button class="accordion-button collapsed p-2" type="button" data-bs-toggle="collapse" data-bs-target="#flush-{{$uuid}}" aria-expanded="false" aria-controls="flush-{{$uuid}}">
            {{ $heading }}
        </button>
    </h2>
    <div id="flush-{{$uuid}}" class="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
        <div id="dev-info-json" class="json-editor" data-json-schema="{{ json_encode($var) }}"></div>
    </div>
</div>