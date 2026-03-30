@php
    $title       = $title ?? '';
    $description = $description ?? '';
    $icon        = $icon ?? null;
    $type        = $type ?? null;   // integration | provider
    $key         = $key ?? null;    // woocommerce | whatsapp | etc

    $enabled = false;

    if ($type === 'integration' && isset($application)) {
        $enabled = ($application->status ?? null) === \Iquesters\UserInterface\Constants\EntityStatus::ACTIVE;
    }

    if ($type === 'provider' && isset($provider)) {
        $enabled = ($provider->status ?? null) === \Iquesters\UserInterface\Constants\EntityStatus::ACTIVE;
    }

    $isKnoraiInternalTool = false;

    if ($type === 'integration' && isset($application) && method_exists($application, 'getMeta')) {
        $isKnoraiInternalTool = filter_var(
            $application->getMeta('knorai_internal_tool'),
            FILTER_VALIDATE_BOOLEAN
        );
    }
@endphp

<div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
    <div class="border rounded-4 shadow-md w-100 h-100 position-relative">
        <div class="d-flex flex-column p-3 h-100">

            {{-- HEADER --}}
            <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                <h6 class="fw-semibold d-flex align-items-center gap-2 mb-0 flex-grow-1">
                    @if($icon)
                        <span class="fs-6">{!! $icon !!}</span>
                    @endif
                    <span>{{ $title }}</span>
                </h6>

                @if($isKnoraiInternalTool)
                    <x-userinterface::badge
                        text="KnoRai In"
                        variant="warning"
                        class="text-dark flex-shrink-0"
                    />
                @endif
            </div>

            {{-- DESCRIPTION --}}
            <p class="mb-2 text-muted flex-grow-1">
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
