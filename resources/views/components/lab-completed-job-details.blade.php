<style>
    .lab-show-more-chevron-__LAB_UUID__ {
        transform: rotate(-90deg);
    }
    #lab-show-more-__LAB_UUID__[aria-expanded="true"] .lab-show-more-chevron-__LAB_UUID__ {
        transform: rotate(0deg);
    }
</style>

<div class="p-2">

    {{-- ------------------------------------------------------------------ --}}
    {{-- Timeline                                                            --}}
    {{-- ------------------------------------------------------------------ --}}
    <div class="mb-2">
        <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
            <div class="small text-muted">
                <i class="fa fa-chart-line me-1"></i>
                Timeline
            </div>

            <div class="d-flex flex-wrap gap-3">
                <span class="small text-info-emphasis">
                    <i class="fa fa-clock me-1"></i>
                    Active Time: __LAB_PROCESSING_TIME__
                </span>
                <span class="small text-success-emphasis">
                    <i class="fa fa-hourglass-half me-1"></i>
                    Total Time: __LAB_TURNAROUND_TIME__
                </span>
            </div>
        </div>

        {{-- Hidden spans supply bound timestamps to JS for timeline rendering --}}
        <span id="lab-ts-queued-__LAB_UUID__"    class="d-none" aria-hidden="true">__LAB_QUEUED_AT__</span>
        <span id="lab-ts-available-__LAB_UUID__" class="d-none" aria-hidden="true">__LAB_AVAILABLE_AT__</span>
        <span id="lab-ts-reserved-__LAB_UUID__"  class="d-none" aria-hidden="true">__LAB_RESERVED_AT__</span>
        <span id="lab-ts-started-__LAB_UUID__"   class="d-none" aria-hidden="true">__LAB_STARTED_AT__</span>
        <span id="lab-ts-completed-__LAB_UUID__" class="d-none" aria-hidden="true">__LAB_COMPLETED_AT__</span>

        <div class="progress rounded-2 mb-2" id="lab-timeline-bar-__LAB_UUID__" style="height: 0.75rem;">
            {{-- Filled by JS below; fallback grey bar shown until JS runs --}}
            <div class="progress-bar bg-secondary-subtle" role="progressbar" style="width: 100%;"></div>
        </div>

        {{-- Legend + accordion toggle --}}
        <div class="d-flex flex-column flex-lg-row justify-content-between gap-2">
            <div class="d-flex flex-wrap gap-2 small">
                <span class="text-body"><span class="d-inline-block bg-dark-subtle border border-dark-subtle rounded-1 me-1 align-middle" style="width: 1.00em; height: 1.00em;"></span>Queued</span>
                <span class="text-body"><span class="d-inline-block bg-primary-subtle border border-primary-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Available</span>
                <span class="text-body"><span class="d-inline-block bg-warning-subtle border border-warning-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Reserved</span>
                <span class="text-body"><span class="d-inline-block bg-success-subtle border border-success-subtle rounded-1 me-1 align-middle" style="width: 0.95em; height: 0.95em;"></span>Completed</span>
            </div>

            {{-- Accordion toggle styled as a plain link --}}
            <button
                id="lab-show-more-__LAB_UUID__"
                class="btn btn-link btn-sm p-0 small text-muted text-decoration-none align-self-start align-self-lg-center"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#lab-completed-job-times-__LAB_UUID__"
                aria-expanded="false"
                aria-controls="lab-completed-job-times-__LAB_UUID__"
            >
                <i class="fa fa-chevron-down me-1 lab-show-more-chevron-__LAB_UUID__" style="transition: transform 0.2s ease;"></i>
                Show more
            </button>
        </div>

        {{-- Bootstrap accordion-style collapse with proper body padding --}}
        <div class="accordion accordion-flush" id="lab-timeline-accordion-__LAB_UUID__">
            <div class="accordion-item border-0 bg-transparent">
                <div
                    class="accordion-collapse collapse"
                    id="lab-completed-job-times-__LAB_UUID__"
                    data-bs-parent="#lab-timeline-accordion-__LAB_UUID__"
                >
                    <div class="accordion-body px-0 pb-0">
                        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-5 g-2">
                            <div class="col min-w-0">
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

                            <div class="col min-w-0">
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

                            <div class="col min-w-0">
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

                            <div class="col min-w-0">
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

                            <div class="col min-w-0">
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
                </div>
            </div>
        </div>
    </div>

    <hr class="my-2">

    {{-- ------------------------------------------------------------------ --}}
    {{-- Details                                                             --}}
    {{-- ------------------------------------------------------------------ --}}
    <div class="mb-2">
        <div class="small text-muted mb-2">
            {{-- Icon changed from fa-circle-info to fa-list-ul --}}
            <i class="fa fa-list-ul me-1"></i>
            Details
        </div>

        {{-- Hidden textarea holds raw response JSON; JS extracts attempts from it --}}
        <textarea
            id="lab-response-data-__LAB_UUID__"
            class="d-none"
            aria-hidden="true"
        >__LAB_RESPONSE__</textarea>

        <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="small text-muted text-nowrap d-flex align-items-center gap-1">
                    Connection
                    {{-- fa-circle-info moved here as an inline tooltip --}}
                    <i
                        class="fa fa-circle-info"
                        data-bs-toggle="tooltip"
                        data-bs-placement="right"
                        title="The queue connection driver used to dispatch and process this job (e.g. database, database_chatbot)"
                        style="cursor: help;"
                    ></i>
                </div>
                <div class="fw-normal text-break text-end">__LAB_CONNECTION__</div>
            </div>

            <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="small text-muted text-nowrap">
                    UUID
                </div>
                <div class="fw-normal font-monospace text-break text-end">__LAB_UUID__</div>
            </div>

            <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="small text-muted text-nowrap">
                    Attempts
                </div>
                <div id="lab-attempts-value-__LAB_UUID__" class="fw-normal text-break text-end">N/A</div>
            </div>
        </div>
    </div>

    <hr class="my-2">

    {{-- ------------------------------------------------------------------ --}}
    {{-- Payload                                                             --}}
    {{-- ------------------------------------------------------------------ --}}
    <div>
        <div class="small text-muted mb-2">
            <i class="fa fa-box-open me-1"></i>
            Payload
        </div>

        <textarea
            id="lab-payload-data-__LAB_UUID__"
            class="d-none"
            aria-hidden="true"
        >__LAB_PAYLOAD__</textarea>

        <div
            id="lab-payload-editor-__LAB_UUID__"
            style="min-height: 200px;"
        ></div>
    </div>

</div>

<script>
(function () {
    function init() {
        // --- Attempts ---
        const responseTextarea = document.getElementById('lab-response-data-__LAB_UUID__');
        const attemptsEl = document.getElementById('lab-attempts-value-__LAB_UUID__');

        if (responseTextarea && attemptsEl) {
            try {
                const response = JSON.parse(responseTextarea.value.trim());
                attemptsEl.textContent = (response.attempts !== undefined && response.attempts !== null)
                    ? response.attempts
                    : 'N/A';
            } catch (e) {
                attemptsEl.textContent = 'N/A';
            }
        }

        // --- Four-segment timeline bar (Queued / Available / Reserved / Completed) ---
        const tsQueued     = document.getElementById('lab-ts-queued-__LAB_UUID__');
        const tsAvailable  = document.getElementById('lab-ts-available-__LAB_UUID__');
        const tsReserved   = document.getElementById('lab-ts-reserved-__LAB_UUID__');
        const tsStarted    = document.getElementById('lab-ts-started-__LAB_UUID__');
        const tsCompleted  = document.getElementById('lab-ts-completed-__LAB_UUID__');
        const timelineBar  = document.getElementById('lab-timeline-bar-__LAB_UUID__');

        if (tsQueued && tsAvailable && tsReserved && tsStarted && tsCompleted && timelineBar) {
            const queued    = new Date(tsQueued.textContent.trim());
            const available = new Date(tsAvailable.textContent.trim());
            const reserved  = new Date(tsReserved.textContent.trim());
            const started   = new Date(tsStarted.textContent.trim());
            const completed = new Date(tsCompleted.textContent.trim());

            if (!isNaN(queued) && !isNaN(available) && !isNaN(reserved) && !isNaN(started) && !isNaN(completed)) {
                const total = completed - queued;

                const fmt = function (ms) {
                    const s = Math.round(ms / 1000);
                    return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's';
                };

                const segments = [
                    { cls: 'bg-dark-subtle',    label: 'Queued for' },
                    { cls: 'bg-primary-subtle', label: 'Available for' },
                    { cls: 'bg-warning-subtle', label: 'Reserved for' },
                    { cls: 'bg-success-subtle', label: 'Executing for' },
                ];

                // Actual durations — used as the source of truth for tooltips
                const actual = [
                    available - queued,    // Queueing
                    reserved  - available, // Available
                    started   - reserved,  // Reserved
                    completed - started,   // Executing
                ];

                // Width split: if either in a pair is 0, each gets half the combined width
                const pairSplit = function (a, b) {
                    if (a === 0 || b === 0) { const h = (a + b) / 2; return [h, h]; }
                    return [a, b];
                };

                // Tooltip: 0-duration segment borrows its partner's actual value;
                // both-zero pair shows "0s" for each
                const pairTooltip = function (a, b) {
                    if (a === 0 && b === 0) return ['0s', '0s'];
                    if (a === 0) return [fmt(b), fmt(b)];
                    if (b === 0) return [fmt(a), fmt(a)];
                    return [fmt(a), fmt(b)];
                };

                const [d0, d1] = pairSplit(actual[0], actual[1]);
                const [d2, d3] = pairSplit(actual[2], actual[3]);
                const display  = [d0, d1, d2, d3];

                const [tt0, tt1] = pairTooltip(actual[0], actual[1]);
                const [tt2, tt3] = pairTooltip(actual[2], actual[3]);
                const tooltips  = [tt0, tt1, tt2, tt3];

                // When all timestamps are identical (total = 0), split the bar evenly
                const getWidth = total > 0
                    ? function (i) { return Math.max(0, Math.min(100, (display[i] / total) * 100)); }
                    : function ()  { return 25; };

                timelineBar.innerHTML = segments.map(function (seg, i) {
                    return '<div class="progress-bar ' + seg.cls + '" role="progressbar"'
                        + ' style="width: ' + getWidth(i) + '%;"'
                        + ' data-bs-toggle="tooltip" data-bs-title="' + seg.label + ': ' + tooltips[i] + '"></div>';
                }).join('');
            }
        }

        // --- Bootstrap tooltips (Connection icon + timeline segments) ---
        const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipEls.forEach(function (el) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                new bootstrap.Tooltip(el);
            }
        });

        // --- Payload JSONEditor ---
        const payloadTextarea = document.getElementById('lab-payload-data-__LAB_UUID__');
        const payloadContainer = document.getElementById('lab-payload-editor-__LAB_UUID__');

        if (payloadTextarea && payloadContainer) {
            const raw = payloadTextarea.value.trim();
            let data;

            try {
                data = JSON.parse(raw);
            } catch (e) {
                payloadContainer.innerHTML =
                    '<pre class="small text-muted mb-0" style="white-space: pre-wrap; word-break: break-all;">'
                    + raw.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    + '</pre>';
                return;
            }

            const editor = new JSONEditor(payloadContainer, {
                mode: 'view',
                navigationBar: false,
                statusBar: false,
                mainMenuBar: true,
            });

            editor.set(data);
            editor.expandAll();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
</script>

<script type="application/json" data-component-bindings>
{
    "__LAB_UUID__": {
        "type": "text",
        "paths": ["uuid"],
        "fallback": "unknown"
    },

    "__LAB_CONNECTION__": {
        "type": "text",
        "paths": ["connection"],
        "fallback": "N/A"
    },

    "__LAB_RESPONSE__": {
        "type": "text",
        "paths": ["response"],
        "fallback": "{}"
    },

    "__LAB_PAYLOAD__": {
        "type": "text",
        "paths": ["payload"],
        "fallback": "{}"
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

    "__LAB_RESERVED_AT__": {
        "type": "text",
        "paths": ["reserved_at"],
        "fallback": "N/A"
    },

    "__LAB_STARTED_AT__": {
        "type": "text",
        "paths": ["started_at"],
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
    }
}
</script>