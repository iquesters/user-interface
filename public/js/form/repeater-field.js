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
    if (value === null || value === undefined) {
        // A new row starts with the field's "default" (e.g. Adult, +91).
        return sub.default ?? '';
    }

    return value;
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
    numberRepeaterRows(field, list);

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
        numberRepeaterRows(field, list);
        row.querySelector('input:not([type=hidden]), select, textarea')?.focus();
        list.dispatchEvent(new Event('change', { bubbles: true }));
    });
    container.appendChild(add);

    if (typeof createHelperText === 'function' && field.helperText) {
        createHelperText(field, fragment);
    }
}

/**
 * "rowLabel": "Guest" shows each row as a titled card ("Guest 1", "Guest 2")
 * with its fields in a wrapping grid and a Remove link; without it, a compact
 * single-line row.
 */
function renderRepeaterRow(field, row) {
    const asCard = Boolean(field.rowLabel);
    const card = document.createElement('div');
    card.classList.add('lab-repeater-row', 'border', 'rounded', asCard ? 'p-3' : 'p-2');
    if (asCard) card.classList.add('lab-repeater-card');
    card.dataset.uid = row?.uid || '';
    card.dataset.id = row?.uid ? '' : (row?.id ?? '');

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.title = 'Remove';
    remove.setAttribute('aria-label', 'Remove');
    const icon = document.createElement('i');
    icon.className = asCard ? 'fa-regular fa-fw fa-trash-can' : 'fas fa-fw fa-trash';
    remove.appendChild(icon);
    remove.addEventListener('click', () => {
        const list = card.parentElement;
        card.remove();
        if (list) {
            numberRepeaterRows(field, list);
            list.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    if (asCard) {
        const header = document.createElement('div');
        header.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'mb-2');
        const title = document.createElement('div');
        title.classList.add('lab-repeater-card-title', 'fw-semibold');
        title.dataset.repeaterTitle = 'true';
        title.textContent = field.rowLabel;
        remove.classList.add('btn', 'btn-sm', 'btn-link', 'text-danger', 'text-decoration-none', 'p-0');
        const text = document.createElement('span');
        text.classList.add('ms-1', 'small');
        text.textContent = 'Remove';
        remove.appendChild(text);
        header.append(title, remove);
        card.appendChild(header);
    } else {
        remove.classList.add('btn', 'btn-sm', 'btn-outline-danger');
    }

    const grid = document.createElement('div');
    grid.classList.add('row', 'g-2', 'align-items-end');
    if (asCard) grid.classList.add('row-gap-3');

    repeaterSubFields(field).forEach(sub => {
        // Hidden (e.g. the row's record id): kept and sent, not shown.
        if (sub.type === 'hidden') {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.value = repeaterCellValue(row, sub);
            hidden.dataset.repeaterField = sub.id;
            hidden.dataset.repeaterMeta = sub.meta === true ? 'true' : 'false';
            card.appendChild(hidden);
            return;
        }
        const col = document.createElement('div');
        const id = `rep-${Math.random().toString(36).slice(2)}`;
        const control = repeaterControl(sub, repeaterCellValue(row, sub));
        control.id = id;
        control.dataset.repeaterField = sub.id;
        control.dataset.repeaterMeta = sub.meta === true ? 'true' : 'false';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = sub.label || sub.id;

        if (asCard && sub.type === 'checkbox') {
            // A yes/no question on its own line: the question, then Yes / No buttons
            // (the checkbox stays, hidden, as the value).
            col.classList.add('col-12');
            control.classList.add('d-none');
            const question = document.createElement('div');
            question.classList.add('form-label', 'small', 'mb-1', 'fw-semibold');
            question.textContent = sub.label || sub.id;
            const group = document.createElement('div');
            group.classList.add('btn-group', 'btn-group-sm', 'lab-yes-no');
            group.setAttribute('role', 'group');
            group.setAttribute('aria-label', sub.label || sub.id);
            const choice = (text, yes) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.classList.add('btn');
                b.textContent = text;
                b.dataset.yes = yes ? 'true' : 'false';
                b.addEventListener('click', () => {
                    if (control.checked === yes) return;
                    control.checked = yes;
                    control.dispatchEvent(new Event('change', { bubbles: true }));
                });
                return b;
            };
            const yesButton = choice('Yes', true);
            const noButton = choice('No', false);
            const paint = () => {
                yesButton.classList.toggle('btn-primary', control.checked);
                yesButton.classList.toggle('btn-outline-secondary', !control.checked);
                noButton.classList.toggle('btn-secondary', !control.checked);
                noButton.classList.toggle('btn-outline-secondary', control.checked);
                yesButton.setAttribute('aria-pressed', String(control.checked));
                noButton.setAttribute('aria-pressed', String(!control.checked));
            };
            control.addEventListener('change', paint);
            paint();
            group.append(yesButton, noButton);
            col.append(question, group, control);
            if (sub.helperText) {
                const help = document.createElement('div');
                help.classList.add('form-text', 'mt-1');
                help.textContent = sub.helperText;
                col.appendChild(help);
            }
            grid.appendChild(col);
            return;
        }

        col.classList.add(...(asCard ? ['col-12', 'col-sm-6', 'col-lg-4'] : ['col-12', 'col-md']));
        label.classList.add('form-label', 'small', 'mb-1');
        if (sub.required) {
            const star = document.createElement('span');
            star.classList.add('text-danger', 'ms-1');
            star.textContent = '*';
            label.appendChild(star);
        }
        col.append(label, control);
        grid.appendChild(col);
    });

    if (!asCard) {
        const actions = document.createElement('div');
        actions.classList.add('col-auto');
        actions.appendChild(remove);
        grid.appendChild(actions);
    }

    card.appendChild(grid);
    applyRepeaterRowVisibility(field, card);

    return card;
}

/** Card rows are numbered: "Guest 1", "Guest 2"… (again after one is removed). */
function numberRepeaterRows(field, list) {
    if (!field.rowLabel) {
        return;
    }
    list.querySelectorAll(':scope > .lab-repeater-row').forEach((card, index) => {
        const title = card.querySelector('[data-repeater-title]');
        if (title) title.textContent = `${field.rowLabel} ${index + 1}`;
    });
}

/**
 * Within a row, a sub-field with "showWhen": {"field": "alumnus", "equals": true}
 * shows only while that sibling has the value (a checkbox: ticked or not). A
 * hidden one isn't required and its value isn't sent.
 */
function applyRepeaterRowVisibility(field, card) {
    const rules = repeaterSubFields(field).filter(sub => sub.showWhen?.field);
    // A select's option with "showWhen" (e.g. "Child" only while "Joining as a member?" is No).
    const optionRules = repeaterSubFields(field).filter(sub => Array.isArray(sub.options) && sub.options.some(opt => opt?.showWhen?.field));
    if (!rules.length && !optionRules.length) {
        return;
    }
    const control = (id) => card.querySelector(`[data-repeater-field="${id}"]`);
    const valueOf = (el) => (el?.type === 'checkbox' ? el.checked : (el?.value ?? ''));
    const matches = (value, expected) => (Array.isArray(expected) ? expected : [expected]).some(want => (typeof want === 'boolean'
        ? Boolean(value === true || value === '1' || value === 'true') === want
        : String(value ?? '') === String(want)));

    const updateOptions = () => optionRules.forEach(sub => {
        const el = control(sub.id);
        if (!el || el.tagName !== 'SELECT') {
            return;
        }
        sub.options.filter(opt => opt?.showWhen?.field).forEach(opt => {
            const option = [...el.options].find(o => o.value === String(opt.value));
            if (!option) {
                return;
            }
            const parent = control(opt.showWhen.field);
            // A hidden field counts as unanswered (empty / No).
            const value = parent && !parent.disabled ? valueOf(parent) : (parent?.type === 'checkbox' ? false : '');
            const show = matches(value, opt.showWhen.equals ?? true);
            option.hidden = !show;
            option.disabled = !show;
            if (!show && option.selected) {
                // The chosen option went away: the first one still offered.
                const first = [...el.options].find(o => o.value !== '' && !o.disabled);
                el.value = first ? first.value : '';
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    const updateFields = () => rules.forEach(sub => {
        const el = control(sub.id);
        const col = el?.closest('[class*="col-"]');
        if (!el || !col) {
            return;
        }
        const parent = control(sub.showWhen.field);
        // Hidden when the field it depends on is hidden too (e.g. "Class left after" needs "Completed at").
        const show = !parent?.disabled && matches(valueOf(parent), sub.showWhen.equals ?? true);
        col.style.display = show ? '' : 'none';
        el.disabled = !show; // not sent, not checked
        if (sub.required) {
            el.required = show;
        }
    });

    const update = () => {
        updateOptions();
        updateFields();
    };

    update();
    new Set([
        ...rules.map(sub => sub.showWhen.field),
        ...optionRules.flatMap(sub => sub.options.filter(opt => opt?.showWhen?.field).map(opt => opt.showWhen.field)),
    ]).forEach(id => {
        control(id)?.addEventListener('change', update);
        control(id)?.addEventListener('input', update);
    });
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
    // Number limits (0 included), e.g. a year between 1900 and next year.
    ['min', 'max', 'step'].forEach(key => {
        if (sub[key] !== undefined && sub[key] !== null && sub[key] !== '') control.setAttribute(key, sub[key]);
    });
    if (typeof blockNegativeNumberKeys === 'function') blockNegativeNumberKeys(sub, control);
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

    // Hidden fields have no column.
    const subs = repeaterSubFields(field).filter(sub => sub.type !== 'hidden');
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
            // A select with options from an address: show the option's label, not its value.
            if (sub.optionsFrom?.url && value !== '') {
                loadRepeaterOptions(sub.optionsFrom.url).then(options => {
                    const match = (options || []).find(opt => String(opt?.value) === String(value));
                    if (match) {
                        td.textContent = match.label ?? match.text ?? String(value);
                    }
                });
            }
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
            if (control.disabled) {
                return; // hidden by its row's showWhen: not sent
            }
            const value = control.type === 'checkbox' ? control.checked : control.value;
            (control.dataset.repeaterMeta === 'true' ? meta : row)[control.dataset.repeaterField] = value;
        });

        if (Object.keys(meta).length > 0) {
            row.meta = meta;
        }

        return row;
    });
}
