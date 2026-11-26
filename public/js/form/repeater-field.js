/**
 * Repeatable group field: "type": "repeater".
 *
 *   {"id": "notes", "type": "repeater", "label": "Notes", "addLabel": "Add note",
 *    "fields": [{"id": "body", "type": "text", "label": "Body", "required": true},
 *               {"id": "phone", "type": "text", "label": "Phone", "meta": true}]}
 *
 * Every row has the group's "fields" (a meta field goes under the row's
 * "meta"). The value is the whole list, sent and received as
 *   [{"uid": "…", "body": "…", "meta": {"phone": "…"}}, ...]
 * so a row removed here is removed on the server too. Rows that came from
 * the server keep their uid (or id). Used by business entity lists of rows
 * (has_many / morph_many).
 *
 * DOM is built with textContent only (no HTML from data).
 */

function isRepeaterField(field) {
    return field?.type === 'repeater';
}

function repeaterRowsOf(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    return [];
}

function repeaterSubFields(field) {
    return (Array.isArray(field.fields) ? field.fields : []).filter(sub => sub && sub.id);
}

function repeaterCellValue(row, sub) {
    const source = sub.meta === true ? (row?.meta || {}) : (row || {});
    const value = source[sub.id];

    return value === null || value === undefined ? '' : value;
}

/** Edit mode: a list of row cards with an add button; view mode: a small table. */
function renderRepeaterField(field, addTo, readOnly) {
    const fragment = createFieldFragment(field, addTo);
    const container = document.createElement('div');
    container.classList.add('lab-repeater', readOnly ? 'lab-view-field' : 'mb-1');
    container.dataset.repeaterFor = field.id;
    fragment.appendChild(container);

    if (field.label) {
        const label = document.createElement('div');
        label.classList.add(...(readOnly ? ['lab-view-label', 'small', 'text-body-secondary', 'mb-1'] : ['form-label', 'mb-1']));
        label.textContent = field.label;
        container.appendChild(label);
    }

    const rows = repeaterRowsOf(field.value);

    if (readOnly) {
        container.appendChild(renderRepeaterTable(field, rows));
        return;
    }

    // Anchor for server errors on this field (form.js maps errors by name).
    const anchor = document.createElement('input');
    anchor.type = 'hidden';
    anchor.name = field.id;
    anchor.dataset.repeaterAnchor = 'true';
    container.appendChild(anchor);

    const list = document.createElement('div');
    list.classList.add('lab-repeater-rows', 'd-flex', 'flex-column', 'gap-2');
    container.appendChild(list);

    rows.forEach(row => list.appendChild(renderRepeaterRow(field, row)));

    const add = document.createElement('button');
    add.type = 'button';
    add.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'mt-2');
    const icon = document.createElement('i');
    icon.className = 'fa-regular fa-fw fa-plus';
    const text = document.createElement('span');
    text.classList.add('ms-1');
    text.textContent = field.addLabel || 'Add row';
    add.append(icon, text);
    add.addEventListener('click', () => {
        const row = renderRepeaterRow(field, {});
        list.appendChild(row);
        row.querySelector('input, select, textarea')?.focus();
    });
    container.appendChild(add);

    if (typeof createHelperText === 'function' && field.helperText) {
        createHelperText(field, fragment);
    }
}

function renderRepeaterRow(field, row) {
    const card = document.createElement('div');
    card.classList.add('lab-repeater-row', 'border', 'rounded', 'p-2');
    card.dataset.uid = row?.uid || '';
    card.dataset.id = row?.uid ? '' : (row?.id ?? '');

    const grid = document.createElement('div');
    grid.classList.add('row', 'g-2', 'align-items-end');

    repeaterSubFields(field).forEach(sub => {
        const col = document.createElement('div');
        col.classList.add('col-12', 'col-md');
        const id = `rep-${Math.random().toString(36).slice(2)}`;

        const label = document.createElement('label');
        label.classList.add('form-label', 'small', 'mb-1');
        label.htmlFor = id;
        label.textContent = sub.label || sub.id;
        if (sub.required) {
            const star = document.createElement('span');
            star.classList.add('text-danger', 'ms-1');
            star.textContent = '*';
            label.appendChild(star);
        }

        const control = repeaterControl(sub, repeaterCellValue(row, sub));
        control.id = id;
        control.dataset.repeaterField = sub.id;
        control.dataset.repeaterMeta = sub.meta === true ? 'true' : 'false';

        col.append(label, control);
        grid.appendChild(col);
    });

    const actions = document.createElement('div');
    actions.classList.add('col-auto');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.classList.add('btn', 'btn-sm', 'btn-outline-danger');
    remove.title = 'Remove row';
    remove.setAttribute('aria-label', 'Remove row');
    const icon = document.createElement('i');
    icon.className = 'fas fa-fw fa-trash';
    remove.appendChild(icon);
    remove.addEventListener('click', () => card.remove());
    actions.appendChild(remove);
    grid.appendChild(actions);

    card.appendChild(grid);

    return card;
}

const repeaterOptionsCache = new Map();

/** A select's options from a module endpoint ({"data": [{value, label}]}), once per URL. */
function loadRepeaterOptions(url) {
    if (!repeaterOptionsCache.has(url)) {
        repeaterOptionsCache.set(url, fetch(url, { credentials: 'same-origin', headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
            .then(response => (response.ok ? response.json() : {}))
            .then(json => (Array.isArray(json?.data) ? json.data : (json?.response_schema?.data || [])))
            .catch(() => []));
    }

    return repeaterOptionsCache.get(url);
}

function repeaterControl(sub, value) {
    let control;

    if (sub.type === 'textarea') {
        control = document.createElement('textarea');
        control.rows = 2;
        control.value = value;
    } else if (sub.type === 'select' || (Array.isArray(sub.options) && sub.options.length > 0 && sub.type !== 'checkbox')) {
        control = document.createElement('select');
        control.classList.add('form-select', 'form-select-sm');
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '—';
        control.appendChild(empty);
        const addOptions = (options) => (options || []).forEach(opt => {
            if (opt?.value === '' || opt?.value === null || opt?.value === undefined) {
                return; // the empty choice is already there
            }
            const option = document.createElement('option');
            option.value = String(opt?.value ?? '');
            option.textContent = opt?.label ?? opt?.text ?? option.value;
            option.selected = String(value) === option.value;
            control.appendChild(option);
        });
        addOptions(sub.options);
        if (sub.required) control.required = true;

        // "optionsFrom": {"url"}: loaded once per address, shared by every row.
        if (sub.optionsFrom?.url) {
            loadRepeaterOptions(sub.optionsFrom.url).then(addOptions);
        }

        return control;
    } else if (sub.type === 'checkbox') {
        control = document.createElement('input');
        control.type = 'checkbox';
        control.classList.add('form-check-input');
        control.checked = value === true || value === 1 || value === '1' || value === 'true';

        return control;
    } else {
        control = document.createElement('input');
        control.type = ['number', 'email', 'date', 'datetime-local', 'time'].includes(sub.type) ? sub.type : 'text';
        control.value = value;
    }

    control.classList.add('form-control', 'form-control-sm');
    if (sub.required) control.required = true;
    if (sub.maxLength) control.maxLength = sub.maxLength;
    if (sub.placeholder) control.placeholder = sub.placeholder;

    return control;
}

function renderRepeaterTable(field, rows) {
    if (rows.length === 0) {
        const empty = document.createElement('div');
        empty.classList.add('lab-view-value', 'fw-medium');
        empty.textContent = '—';
        return empty;
    }

    const subs = repeaterSubFields(field);
    const wrap = document.createElement('div');
    wrap.classList.add('table-responsive');
    const table = document.createElement('table');
    table.classList.add('table', 'table-sm', 'mb-0');

    const head = table.createTHead().insertRow();
    subs.forEach(sub => {
        const th = document.createElement('th');
        th.classList.add('small', 'text-body-secondary', 'fw-normal');
        th.textContent = sub.label || sub.id;
        head.appendChild(th);
    });

    const body = table.createTBody();
    rows.forEach(row => {
        const tr = body.insertRow();
        subs.forEach(sub => {
            const td = tr.insertCell();
            const value = repeaterCellValue(row, sub);
            td.textContent = typeof getReadOnlyFieldDisplayValue === 'function'
                ? String(getReadOnlyFieldDisplayValue({ ...sub, value }))
                : (value === '' ? '—' : String(value));
        });
    });

    wrap.appendChild(table);

    return wrap;
}

/** The list sent on submit: [{uid?, field: value, meta: {}}]. */
function collectRepeaterValue(form, field) {
    const escaped = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(field.id) : field.id;
    const container = form.querySelector(`[data-repeater-for="${escaped}"]`);

    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll('.lab-repeater-row')).map(rowEl => {
        const row = {};
        const meta = {};

        if (rowEl.dataset.uid) row.uid = rowEl.dataset.uid;
        else if (rowEl.dataset.id) row.id = rowEl.dataset.id;

        rowEl.querySelectorAll('[data-repeater-field]').forEach(control => {
            const value = control.type === 'checkbox' ? control.checked : control.value;
            (control.dataset.repeaterMeta === 'true' ? meta : row)[control.dataset.repeaterField] = value;
        });

        if (Object.keys(meta).length > 0) {
            row.meta = meta;
        }

        return row;
    });
}
