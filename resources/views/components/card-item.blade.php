@props([
    'title',
    'description',
    'icon' => null,
    'type' => null,   // integration | provider
    'key' => null,    // woocommerce | whatsapp | etc
])

@php
    $enabledIntegrations = ['woocommerce'];
    $enabledProviders    = ['whatsapp'];

    $enabled = false;

    if ($type === 'integration') {
        $enabled = in_array($key, $enabledIntegrations);
    }

    if ($type === 'provider') {
        $enabled = in_array($key, $enabledProviders);
    }
@endphp

<div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
    <div class="card shadow-sm border w-100 h-100">
        <div class="card-body d-flex flex-column">

            {{-- HEADER --}}
            <h6 class="fw-semibold d-flex align-items-center gap-2 mb-2">

                @if($icon)
                    <span class="fs-5">{!! $icon !!}</span>
                @endif

                <span>{{ $title }}</span>

            </h6>

            {{-- DESCRIPTION --}}
            <p class="mb-3 text-muted flex-grow-1">
                {{ $description }}
            </p>

            {{-- ACTION --}}
            @if(trim($slot))
                <div class="mt-auto">
                    @if($enabled)
                        {{ $slot }}
                    @else
                        <button
                            class="btn btn-sm btn-outline-secondary"
                            disabled
                            data-bs-toggle="tooltip"
                            title="Coming soon"
                        >
                            <i class="fa fa-clock me-1"></i>
                            {{ trim(strip_tags($slot)) }}
                        </button>
                    @endif
                </div>
            @endif

        </div>
    </div>
</div>