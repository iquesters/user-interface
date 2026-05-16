<div class="text-start overflow-hidden w-100">
    <div class="min-w-0 mb-2">
        <h6 class="mb-1 fw-semibold text-truncate">__LAB_QUEUE__</h6>
    </div>

    <div class="d-flex flex-wrap gap-2 small">
        <div class="rounded-2 border border-info-subtle bg-info-subtle px-2 py-1 text-info-emphasis">
            <span>Duration</span>
            <span class="fw-semibold ms-1">__LAB_DURATION__</span>
        </div>

        <div class="rounded-2 border bg-light-subtle px-2 py-1 text-truncate">
            <span class="text-muted">Done</span>
            <span class="fw-semibold ms-1">__LAB_COMPLETED_AT__</span>
        </div>
    </div>
</div>

<script type="application/json" data-component-bindings>
{
    "__LAB_ID__": {
        "type": "text",
        "paths": ["id"],
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

    "__LAB_DURATION__": {
        "type": "duration",
        "paths": ["duration", "runtime", "elapsed_time"],
        "start_paths": ["started_at"],
        "end_paths": ["completed_at"],
        "fallback": "N/A"
    }
}
</script>
