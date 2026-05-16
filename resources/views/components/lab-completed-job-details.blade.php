<div class="card border-0 shadow-sm">
    <div class="card-body p-3 p-lg-4">
        <div class="mb-4 min-w-0">
            <div class="small text-muted mb-1">Queue</div>
            <h4 class="mb-2 fw-semibold text-break">__LAB_QUEUE__</h4>
            <div class="text-muted text-break">__LAB_UUID__</div>
        </div>

        <div class="row g-2 mb-4">
            <div class="col-12 col-md-6">
                <div class="border border-info-subtle rounded-2 bg-info-subtle text-info-emphasis p-3 h-100">
                    <div class="small mb-1">Duration</div>
                    <div class="fs-5 fw-semibold text-break">__LAB_DURATION__</div>
                </div>
            </div>

            <div class="col-12 col-md-6">
                <div class="border rounded-2 bg-light-subtle p-3 h-100">
                    <div class="small text-muted mb-1">Connection</div>
                    <div class="fw-semibold text-break">__LAB_CONNECTION__</div>
                </div>
            </div>
        </div>

        <div class="row g-2 mb-4">
            <div class="col-12 col-md-4">
                <div class="border rounded-2 p-3 h-100">
                    <div class="small text-muted mb-1">Started</div>
                    <div class="fw-semibold text-break">__LAB_STARTED_AT__</div>
                </div>
            </div>

            <div class="col-12 col-md-4">
                <div class="border rounded-2 p-3 h-100">
                    <div class="small text-muted mb-1">Reserved</div>
                    <div class="fw-semibold text-break">__LAB_RESERVED_AT__</div>
                </div>
            </div>

            <div class="col-12 col-md-4">
                <div class="border rounded-2 p-3 h-100">
                    <div class="small text-muted mb-1">Completed</div>
                    <div class="fw-semibold text-break">__LAB_COMPLETED_AT__</div>
                </div>
            </div>
        </div>

        <div class="border rounded-2 overflow-hidden">
            <div class="bg-light-subtle px-3 py-2 fw-semibold">Job Reference</div>
            <div class="p-3 d-flex flex-column gap-3">
                <div>
                    <div class="small text-muted mb-1">UUID</div>
                    <div class="text-break">__LAB_UUID__</div>
                </div>

                <div>
                    <div class="small text-muted mb-1">Available At</div>
                    <div class="text-break">__LAB_AVAILABLE_AT__</div>
                </div>
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

    "__LAB_QUEUE__": {
        "type": "text",
        "paths": ["queue"],
        "fallback": "N/A"
    },

    "__LAB_CONNECTION__": {
        "type": "text",
        "paths": ["connection"],
        "fallback": "N/A"
    },

    "__LAB_COMPLETED_AT__": {
        "type": "text",
        "paths": ["completed_at"],
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

    "__LAB_DURATION__": {
        "type": "duration",
        "paths": ["duration", "runtime", "elapsed_time"],
        "start_paths": ["started_at"],
        "end_paths": ["completed_at"],
        "fallback": "N/A"
    }
}
</script>
