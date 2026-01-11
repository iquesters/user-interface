@php
    $title       = $title ?? '';
    $description = $description ?? '';
    $icon        = $icon ?? null;
    $type        = $type ?? null;   // integration | provider
    $key         = $key ?? null;    // woocommerce | whatsapp | etc

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
            <div class="mt-auto">
                @if($enabled)

                    @if($type === 'integration' && isset($application))
                        <a
                            href="{{ route('integration.create', [
                                'supported_integration_id' => $application->uid
                            ]) }}"
                            class="btn btn-sm btn-outline-primary"
                        >
                            <i class="fa fa-plus me-1"></i> Integration
                        </a>
                    @endif

                    @if($type === 'provider' && isset($provider))
                        <a
                            href="{{ route('channels.create', [
                                'provider_id' => $provider->uid
                            ]) }}"
                            class="btn btn-sm btn-outline-primary"
                        >
                            <i class="fa fa-plus me-1"></i> Channel
                        </a>
                    @endif

                @else
                    <button
                        class="btn btn-sm btn-outline-secondary"
                        disabled
                        data-bs-toggle="tooltip"
                        title="Coming soon"
                    >
                        <i class="fa fa-clock me-1"></i>
                        {{ $type === 'provider' ? 'Channel' : 'Integration' }}
                    </button>
                @endif
            </div>

        </div>
    </div>
</div>