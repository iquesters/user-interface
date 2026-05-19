<div class="card border-0 shadow-sm">
    <div class="card-body p-2">
        <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-2 mb-3">
            <div class="min-w-0">
                <div class="small text-muted mb-1 invisible" aria-hidden="true">Queue</div>
                <div class="h5 fw-semibold text-break mb-0">__LAB_QUEUE__</div>
            </div>

            <div class="text-lg-end min-w-0">
                <div class="small text-muted mb-1">UUID</div>
                <div class="small font-monospace text-break">__LAB_UUID__</div>
            </div>
        </div>

        <div class="row g-2 mb-2">
            <div class="col-12 col-md-6">
                <div class="border border-info-subtle rounded-2 bg-light-subtle text-info-emphasis p-2 p-lg-3 h-100">
                    <div class="small mb-1">
                        <i class="fa fa-clock me-1"></i>
                        Active Time
                    </div>
                    <div class="fw-normal text-break">__LAB_PROCESSING_TIME__</div>
                </div>
            </div>

            <div class="col-12 col-md-6">
                <div class="border border-success-subtle rounded-2 bg-light-subtle text-success-emphasis p-2 p-lg-3 h-100">
                    <div class="small mb-1">
                        <i class="fa fa-hourglass-half me-1"></i>
                        Total Time
                    </div>
                    <div class="fw-normal text-break">__LAB_TURNAROUND_TIME__</div>
                </div>
            </div>
        </div>

        <div class="border rounded-2 bg-light-subtle p-2 p-lg-3 mb-2">
            <div>
                <div class="small text-muted mb-1">
                    <i class="fa fa-database me-1"></i>
                    Connection
                </div>
                <div class="fw-normal text-break">__LAB_CONNECTION__</div>
            </div>
        </div>

        <div class="row row-cols-5 g-1">
            <div class="col min-w-0">
                <div class="border rounded-2 px-2 py-1 h-100 overflow-hidden">
                    <div class="small text-muted mb-1">
                        <i class="fa fa-clock me-1"></i>
                        Queued
                    </div>
                    <x-userinterface::badge
                        text="__LAB_QUEUED_AT__"
                        title="__LAB_QUEUED_AT__"
                        variant="light"
                        class="d-block w-100 text-body border text-truncate px-1"
                    />
                </div>
            </div>

            <div class="col min-w-0">
                <div class="border rounded-2 px-2 py-1 h-100 overflow-hidden">
                    <div class="small text-muted mb-1">
                        <i class="fa fa-calendar-check me-1"></i>
                        Available
                    </div>
                    <x-userinterface::badge
                        text="__LAB_AVAILABLE_AT__"
                        title="__LAB_AVAILABLE_AT__"
                        variant="light"
                        class="d-block w-100 text-body border text-truncate px-1"
                    />
                </div>
            </div>

            <div class="col min-w-0">
                <div class="border rounded-2 px-2 py-1 h-100 overflow-hidden">
                    <div class="small text-muted mb-1">
                        <i class="fa fa-lock me-1"></i>
                        Reserved
                    </div>
                    <x-userinterface::badge
                        text="__LAB_RESERVED_AT__"
                        title="__LAB_RESERVED_AT__"
                        variant="light"
                        class="d-block w-100 text-body border text-truncate px-1"
                    />
                </div>
            </div>

            <div class="col min-w-0">
                <div class="border rounded-2 px-2 py-1 h-100 overflow-hidden">
                    <div class="small text-muted mb-1">
                        <i class="fa fa-play me-1"></i>
                        Started
                    </div>
                    <x-userinterface::badge
                        text="__LAB_STARTED_AT__"
                        title="__LAB_STARTED_AT__"
                        variant="light"
                        class="d-block w-100 text-body border text-truncate px-1"
                    />
                </div>
            </div>

            <div class="col min-w-0">
                <div class="border rounded-2 px-2 py-1 h-100 overflow-hidden">
                    <div class="small text-muted mb-1">
                        <i class="fa fa-check me-1"></i>
                        Completed
                    </div>
                    <x-userinterface::badge
                        text="__LAB_COMPLETED_AT__"
                        title="__LAB_COMPLETED_AT__"
                        variant="light"
                        class="d-block w-100 text-body border text-truncate px-1"
                    />
                </div>
            </div>
        </div>

        <div class="border rounded-2 bg-light-subtle p-2 p-lg-3 mt-2">
            <div class="small text-muted mb-2">
                <i class="fa fa-chart-line me-1"></i>
                Timeline
            </div>

            <div class="progress rounded-2" style="height: 0.75rem;">
                __LAB_TIMELINE__
            </div>

            <div class="d-flex flex-wrap gap-2 mt-2 small">
                <span class="text-body"><span class="d-inline-block bg-dark-subtle border border-dark-subtle rounded-1 me-1 align-middle" style="width: 1.00em; height: 1.00em;"></span>Queued</span>
                <span class="text-body"><span class="d-inline-block bg-primary-subtle border border-primary-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Available</span>
                <span class="text-body"><span class="d-inline-block bg-warning-subtle border border-warning-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Reserved</span>
                <span class="text-body"><span class="d-inline-block bg-info-subtle border border-info-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Started</span>
                <span class="text-body"><span class="d-inline-block bg-success-subtle border border-success-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Completed</span>
            </div>
        </div>
    </div>
</div>

<script type="application/json" data-component-bindings>
{
    "__LAB_UUID__": {
        "type": "text",
        "paths": ["uuid"],
        "fallback": "No UUID"
    },

    "__LAB_CONNECTION__": {
        "type": "text",
        "paths": ["connection"],
        "fallback": "N/A"
    },

    "__LAB_QUEUE__": {
        "type": "text",
        "paths": ["queue"],
        "fallback": "N/A"
    },

    "__LAB_COMPLETED_AT__": {
        "type": "text",
        "paths": ["completed_at"],
        "fallback": "N/A"
    },

    "__LAB_QUEUED_AT__": {
        "type": "text",
        "paths": ["queued_at"],
        "fallback": "N/A"
    },

    "__LAB_STARTED_AT__": {
        "type": "text",
        "paths": ["started_at"],
        "fallback": "N/A"
    },

    "__LAB_RESERVED_AT__": {
        "type": "text",
        "paths": ["reserved_at"],
        "fallback": "N/A"
    },

    "__LAB_AVAILABLE_AT__": {
        "type": "text",
        "paths": ["available_at"],
        "fallback": "N/A"
    },

    "__LAB_PROCESSING_TIME__": {
        "type": "duration",
        "start_paths": ["started_at"],
        "end_paths": ["completed_at"],
        "fallback": "N/A"
    },

    "__LAB_TURNAROUND_TIME__": {
        "type": "duration",
        "start_paths": ["available_at"],
        "end_paths": ["completed_at"],
        "fallback": "N/A"
    },

    "__LAB_TIMELINE__": {
        "type": "timeline",
        "fallback_template": "<div class=\"progress-bar bg-secondary\" role=\"progressbar\" style=\"width: 100%;\">N/A</div>",
        "stages": [
            {
                "label": "Queued",
                "paths": ["queued_at"],
                "class": "bg-dark-subtle"
            },
            {
                "label": "Available",
                "paths": ["available_at"],
                "class": "bg-primary-subtle"
            },
            {
                "label": "Reserved",
                "paths": ["reserved_at"],
                "class": "bg-warning-subtle"
            },
            {
                "label": "Started",
                "paths": ["started_at"],
                "class": "bg-info-subtle"
            },
            {
                "label": "Completed",
                "paths": ["completed_at"],
                "class": "bg-success-subtle"
            }
        ]
    }
}
</script>
