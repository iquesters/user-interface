/**
 * List page URL state: the address bar follows the list without reloading
 * the page (history.pushState / replaceState), and a reload or a shared link
 * opens the same state.
 *
 * The path says which record and what is done with it (the form mode); the
 * query says how the page is laid out and filtered:
 *
 *   /list/{table}                                   the list
 *   /list/{table}/view/form/{form}/data/{uid}       a record in view mode
 *   /list/{table}/edit/form/{form}/data/{uid}       a record in edit mode
 *   /list/{table}/create/form/{form}                the create form
 *                                                   ({form}: the form schema's uid)
 *   ?mode=table|split                               the view mode: "split" shows a record
 *                                                   in the right panel, "table" full width
 *                                                   in place of the table (left out when it
 *                                                   is the table's default)
 *   ?q=term  &sort=field&dir=asc|desc  &page=2  &per_page=25
 *
 * Opening, closing or switching a record or the view mode adds a history
 * entry (Back undoes it); search, sort and paging replace the current one.
 */

const TABLE_URL_ACTIONS = ['view', 'edit', 'create'];

/** True while the page applies a URL (Back/Forward): nothing writes the URL meanwhile. */
let tableUrlRestoring = false;

function tableUrlModeToParam(mode) {
    return mode === VIEW_MODE_INBOX ? 'split' : 'table';
}

function tableUrlParamToMode(param) {
    if (param === 'split' || param === 'inbox') return VIEW_MODE_INBOX;
    if (param === 'table') return VIEW_MODE_TABLE;
    return null;
}

/** The list URL's parts, or null when this isn't a /list/{table} page. */
function parseTableUrl(href = window.location.href) {
    const url = new URL(href, window.location.origin);
    const match = url.pathname.match(
        /^(.*?\/list\/[^/]+)(?:\/(view|edit|create)\/form\/([^/]+)(?:\/data\/([^/]+))?)?\/?$/
    );

    if (!match) {
        return null;
    }

    return {
        base: match[1],
        action: match[2] || null,
        form: match[3] ? decodeURIComponent(match[3]) : null,
        uid: match[4] ? decodeURIComponent(match[4]) : null,
        mode: tableUrlParamToMode(url.searchParams.get('mode')),
        query: url.searchParams,
    };
}

/** The URL for an open record (or none) with these query parameters. */
function buildTableUrl(state, record, query) {
    let path = state.base;
    const hasRecord = record && TABLE_URL_ACTIONS.includes(record.action) && record.form
        && (record.action === 'create' || record.uid);

    if (hasRecord) {
        path += `/${record.action}/form/${encodeURIComponent(record.form)}`;
        if (record.action !== 'create') {
            path += `/data/${encodeURIComponent(record.uid)}`;
        }
    }

    const search = query.toString();

    return path + (search ? `?${search}` : '') + window.location.hash;
}

function currentTableUrlRecord(state) {
    return state.action ? { action: state.action, form: state.form, uid: state.uid } : null;
}

function writeTableUrl(url, push) {
    if (tableUrlRestoring || url === window.location.pathname + window.location.search + window.location.hash) {
        return;
    }

    history[push ? 'pushState' : 'replaceState']({ labTable: true }, '', url);
}

/**
 * A form's uid for the URL. Schemas and pages name forms by slug; the form
 * API returns the form's uid with its schema ("schemaUid", cached), and
 * accepts either, so a URL's uid loads the form too.
 */
async function tableUrlFormUid(formId) {
    if (!formId || typeof getFormSchema !== 'function') {
        return formId;
    }

    const schema = await getFormSchema(formId);

    return schema?.schemaUid || formId;
}

/**
 * Show a record (or the create form) in the URL, its form by uid; null shows
 * the list. Adds a history entry.
 */
async function setTableUrlRecord(record, { push = true } = {}) {
    if (!parseTableUrl()) return;

    if (record?.form) {
        record = { ...record, form: await tableUrlFormUid(record.form) };
    }

    // Read the URL after the (usually cached) lookup: it may have changed meanwhile.
    const state = parseTableUrl();
    writeTableUrl(buildTableUrl(state, record, new URLSearchParams(state.query)), push);
}

/** Show the view mode in the URL (?mode, left out for the table's default), keeping the open record. */
function setTableUrlMode(mode, defaultMode, { push = false } = {}) {
    setTableUrlQuery({ mode: mode === defaultMode ? null : tableUrlModeToParam(mode) }, { push });
}

/** Set (or with null / '', remove) query parameters, keeping the path. */
function setTableUrlQuery(values = {}, { push = false } = {}) {
    const state = parseTableUrl();
    if (!state) return;

    const query = new URLSearchParams(state.query);
    Object.entries(values).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
            query.delete(key);
        } else {
            query.set(key, String(value));
        }
    });

    writeTableUrl(buildTableUrl(state, currentTableUrlRecord(state), query), push);
}

/**
 * DataTables options from the URL: search term, page size, first row and
 * (sortFields given) the sorted column. sortFields: server field per column index.
 */
function tableUrlDataTableOptions(sortFields = [], defaultLength = 10) {
    const state = parseTableUrl();
    if (!state) return {};

    const options = {};
    const q = state.query.get('q');
    const perPage = parseInt(state.query.get('per_page') || '', 10);
    const page = parseInt(state.query.get('page') || '', 10);
    const sort = state.query.get('sort');

    if (q) options.search = { search: q };
    if (perPage > 0) options.pageLength = perPage;
    if (page > 1) options.displayStart = (page - 1) * (perPage > 0 ? perPage : (defaultLength || 10));

    const sortIndex = sort && Array.isArray(sortFields) ? sortFields.indexOf(sort) : -1;
    if (sortIndex > 0) {
        options.order = [[sortIndex, state.query.get('dir') === 'desc' ? 'desc' : 'asc']];
    }

    return options;
}

/**
 * Keep the URL's search, sort and paging in step with a DataTable (replace,
 * no history entry). sortFields null: this list doesn't sort (split view's
 * list), so the URL's sort is left as it is.
 */
function bindTableUrlSync(listTable, sortFields = null, defaultLength = 10) {
    if (typeof $ === 'undefined' || !parseTableUrl()) return;

    $(listTable).on('draw.dt', function () {
        if (!$.fn.DataTable.isDataTable(listTable)) return;

        const dt = $(listTable).DataTable();
        const info = dt.page.info();
        const values = {
            q: dt.search() || null,
            page: info.page > 0 ? info.page + 1 : null,
            per_page: info.length && info.length !== (defaultLength || 10) ? info.length : null,
        };

        if (Array.isArray(sortFields)) {
            const [order] = dt.order() || [];
            const field = order ? sortFields[order[0]] : null;
            values.sort = field || null;
            values.dir = field && order[1] === 'desc' ? 'desc' : null;
        }

        setTableUrlQuery(values);
    });
}

/** Back / Forward: apply the URL to every list on the page without a reload. */
window.addEventListener('popstate', async () => {
    if (!parseTableUrl()) return;

    tableUrlRestoring = true;
    try {
        for (const table of document.querySelectorAll('.lab-table')) {
            await table.__viewManager?.applyUrl?.();
        }
    } finally {
        tableUrlRestoring = false;
    }
});
