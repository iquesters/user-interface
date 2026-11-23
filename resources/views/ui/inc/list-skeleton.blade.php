@php
    /*
     * List page loading placeholder, shaped like what will render:
     * - table view: the table, or (a record in the URL) the record full width;
     * - split view: the list on the left and the record (or the empty panel) on the right.
     * The view mode is the URL's ?mode, else the one this browser stored for the
     * table (the inline script below), else the table's default_view_mode.
     * The record placeholder matches renderRecordSkeleton() in table-renderers.js.
     */
    $schema = $table_schema->schema ?? [];
    $urlMode = request()->query('mode');
    $defaultMode = in_array($schema['default_view_mode'] ?? 'table', ['inbox', 'split'], true) ? 'split' : 'table';
    $skeletonMode = in_array($urlMode, ['table', 'split'], true) ? $urlMode : $defaultMode;
    $record = (string) request()->route('record');
    $skeletonRecord = $record !== '' && ! str_starts_with($record, 'create/');

    $recordSkeleton = function () {
        $row = '<div class="d-flex flex-column flex-sm-row gap-1 gap-sm-3 py-1">'
            .'<span class="placeholder col-4 col-sm-3 rounded"></span>'
            .'<span class="placeholder col-7 col-sm-6 rounded"></span></div>';

        return '<div class="d-flex justify-content-between align-items-center pt-2 pb-1 px-3 border-bottom">'
            .'<div class="flex-grow-1"><span class="placeholder col-5 col-md-3 rounded d-block mb-1" style="height: 1rem;"></span>'
            .'<span class="placeholder col-3 col-md-2 rounded d-block" style="height: 0.6rem;"></span></div>'
            .'<span class="placeholder rounded" style="width: 1rem; height: 1rem;"></span></div>'
            .'<div class="d-flex gap-2 px-3 py-2"><span class="placeholder rounded" style="width: 3.5rem; height: 1.25rem;"></span>'
            .'<span class="placeholder rounded" style="width: 4rem; height: 1.25rem;"></span></div>'
            .'<div class="px-3 px-lg-4 pb-3 pt-2"><div class="d-flex align-items-center gap-3 mb-4">'
            .'<span class="placeholder rounded-circle flex-shrink-0" style="width: 72px; height: 72px;"></span>'
            .'<div class="flex-grow-1"><span class="placeholder col-6 rounded mb-2 d-block" style="height: 1.25rem;"></span>'
            .'<span class="placeholder col-4 rounded d-block"></span></div></div>'
            .str_repeat($row, 5).'</div>';
    };
@endphp

{{-- mt-2: the same gap below the actions bar as the DataTable's first row (Bootstrap 5 layout "row mt-2"). --}}
<div class="table-skeleton mt-2 d-flex flex-column flex-grow-1" style="min-height: 0;" aria-hidden="true"
     data-skeleton-table="{{ $table_schema->uid }}"
     data-skeleton-entity="{{ $schema['entity'] ?? '' }}">

    {{-- Table view --}}
    <div data-skeleton-mode="table" class="{{ $skeletonMode === 'table' ? '' : 'd-none' }}">
        @if ($skeletonRecord)
            <div class="border rounded placeholder-glow">{!! $recordSkeleton() !!}</div>
        @else
            <div class="placeholder-wave">
                <div class="d-flex justify-content-between align-items-center mb-3 gap-3">
                    <div class="bg-info-subtle rounded col-3 p-3"></div>
                    <div class="bg-info-subtle rounded col-4 p-3"></div>
                </div>

                <div class="border rounded overflow-hidden bg-white">
                    <div class="d-flex justify-content-between align-items-center p-3 border-bottom gap-3">
                        <div class="bg-info-subtle rounded col-2 p-2"></div>
                        <div class="bg-info-subtle rounded col-3 p-2"></div>
                    </div>

                    <div class="p-3">
                        @for ($i = 0; $i < 6; $i++)
                            <div class="bg-info-subtle rounded w-100 p-3 {{ $i < 5 ? 'mb-3' : '' }}"></div>
                        @endfor
                    </div>

                    <div class="d-flex justify-content-between align-items-center p-3 border-top gap-3">
                        <div class="bg-info-subtle rounded col-3 p-2"></div>
                        <div class="bg-info-subtle rounded col-2 p-2"></div>
                    </div>
                </div>
            </div>
        @endif
    </div>

    {{-- Split view: list (left) and record or empty panel (right); one panel at a time on small screens. --}}
    <div data-skeleton-mode="split" class="ui-split-skeleton {{ $skeletonRecord ? 'has-record' : '' }} {{ $skeletonMode === 'split' ? 'd-flex' : 'd-none' }} border rounded flex-grow-1 overflow-hidden" style="min-height: 0;">
        <div class="ui-split-skeleton-list placeholder-glow border-end p-2" style="width: 40%;">
            <div class="d-flex justify-content-between gap-2 mb-3">
                <span class="placeholder rounded col-3" style="height: 1.75rem;"></span>
                <span class="placeholder rounded col-5" style="height: 1.75rem;"></span>
            </div>
            @for ($i = 0; $i < 7; $i++)
                <div class="d-flex align-items-center gap-2 py-2 border-bottom">
                    <span class="placeholder rounded flex-shrink-0" style="width: 1rem; height: 1rem;"></span>
                    <span class="placeholder rounded-circle flex-shrink-0" style="width: 2.25rem; height: 2.25rem;"></span>
                    <div class="flex-grow-1">
                        <span class="placeholder col-7 rounded d-block mb-1"></span>
                        <span class="placeholder col-5 rounded d-block" style="height: 0.6rem;"></span>
                    </div>
                </div>
            @endfor
        </div>
        <div class="ui-split-skeleton-record flex-grow-1 placeholder-glow">
            @if ($skeletonRecord)
                {!! $recordSkeleton() !!}
            @else
                <div class="d-flex align-items-center justify-content-center h-100 text-muted small">Select an item to view details</div>
            @endif
        </div>
    </div>
</div>

<script>
    // No ?mode in the URL: the view mode this browser stored for the table
    // (same key as ViewModeManager) decides which placeholder shows.
    (function () {
        var skeleton = document.currentScript.previousElementSibling;
        if (!skeleton || new URLSearchParams(window.location.search).get('mode')) return;
        var stored = null;
        try {
            stored = localStorage.getItem('view_mode_' + skeleton.dataset.skeletonEntity + '_' + skeleton.dataset.skeletonTable);
        } catch (e) {}
        if (!stored) return;
        var mode = stored === 'inbox' ? 'split' : 'table';
        skeleton.querySelectorAll('[data-skeleton-mode]').forEach(function (variant) {
            var show = variant.dataset.skeletonMode === mode;
            variant.classList.toggle('d-none', !show);
            if (variant.dataset.skeletonMode === 'split') variant.classList.toggle('d-flex', show);
        });
    })();
</script>
