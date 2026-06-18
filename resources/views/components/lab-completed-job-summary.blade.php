<div class="d-flex align-items-start justify-content-between gap-3 overflow-hidden w-100">
    <div class="min-w-0">
        <div class="fw-semibold text-truncate mb-2">__LAB_QUEUE__</div>

        <div class="d-flex align-items-center gap-2 min-w-0">
            <x-userinterface::badge
                text="Total Time: __LAB_TURNAROUND_TIME__"
                icon="fa fa-clock"
                variant="light"
                class="border border-info-subtle bg-light-subtle text-info-emphasis text-truncate"
            />
        </div>
    </div>

    <div class="text-end min-w-0 flex-shrink-0">
        <div class="small font-monospace text-muted text-truncate mb-2">__LAB_ID__</div>

        <div class="d-flex justify-content-end">
            <x-userinterface::badge
                text="Finished: __LAB_COMPLETED_AT__"
                variant="light"
                class="text-body border text-truncate"
            />
        </div>
    </div>
</div>

<script type="application/json" data-component-bindings>
{
    "__LAB_QUEUE__": {
        "type": "text",
        "paths": ["queue"],
        "fallback": "N/A"
    },

    "__LAB_ID__": {
        "type": "text",
        "paths": ["id"],
        "fallback": "N/A"
    },
    "__LAB_COMPLETED_AT__": {
        "type": "text",
        "paths": ["completed_at"],
        "fallback": "N/A"
    },

    "__LAB_TURNAROUND_TIME__": {
        "type": "duration",
        "start_paths": ["available_at"],
        "end_paths": ["completed_at"],
        "fallback": "N/A"
    }
}
</script>
