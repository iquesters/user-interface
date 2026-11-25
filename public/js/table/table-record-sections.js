/**
 * Record sections: a table schema can show a record as several parts, one under
 * another, in the split panel and the full-width record view:
 *
 *   "record": [
 *     {"form": "application-form", "mode": "view"},
 *     {"component": "community.application.proofs"},
 *     {"form": "decision-form", "mode": "edit", "when": {"status": ["applied", "on_hold"]}},
 *   ]
 *
 * - form: a form schema (slug or uid) in "view" or "edit" mode; its {uid} is the record's.
 * - component: a registered record component (hydrated with the record).
 * - html: a URL ("{uid}" replaced) whose HTML the module renders for the record,
 *   for parts that are lists (files, history) rather than a form or a card.
 * - when: shown only when the record's field has one of the values.
 *
 * The record comes from the table's data_url ("{data_url}/{uid}") when it has one,
 * else the list row. After a form in a section saves, the record reloads in place
 * and the table refreshes.
 */

/** Table schema's data_url record address: "{data_url}/{uid}" (query string kept last). */
function tableRecordDataUrl(schema, uid) {
    const base = String(schema?.data_url || '');
    if (!base || !uid) {
        return null;
    }
    const [path, query] = base.split('?');
    return `${path.replace(/\/+$/, '')}/${encodeURIComponent(uid)}${query ? `?${query}` : ''}`;
}

/**
 * The page's own query parameters that aren't the table's (e.g. ?status=on_hold
 * from a navigation tab), forwarded to a data_url so the module can filter by them.
 */
function tablePageFilters() {
    const owned = ['q', 'sort', 'dir', 'page', 'per_page', 'mode'];
    const filters = {};
    new URLSearchParams(window.location.search).forEach((value, key) => {
        if (!owned.includes(key)) {
            filters[key] = value;
        }
    });
    return filters;
}

function recordSectionVisible(section, record) {
    const when = section?.when;
    if (!when || typeof when !== 'object') {
        return true;
    }
    return Object.entries(when).every(([field, allowed]) => {
        const values = Array.isArray(allowed) ? allowed.map(String) : [String(allowed)];
        return values.includes(String(record?.[field] ?? ''));
    });
}

async function loadSectionRecord(schema, row) {
    const url = tableRecordDataUrl(schema, row?.uid);
    if (!url || typeof fetchSessionJsonData !== 'function') {
        return row || {};
    }
    const record = await fetchSessionJsonData(url);
    return record && typeof record === 'object' && !Array.isArray(record) ? { ...row, ...record } : (row || {});
}

/**
 * Render the record's sections into the detail panel's content container.
 * @returns {Promise<boolean>} false when the schema has no sections
 */
async function renderRecordSections(contentContainer, schema, row, options = {}) {
    const sections = Array.isArray(schema?.record) ? schema.record : [];
    if (!sections.length) {
        return false;
    }

    if (typeof renderRecordSkeleton === 'function') {
        contentContainer.innerHTML = renderRecordSkeleton();
    }

    const record = await loadSectionRecord(schema, row);
    const visible = sections.filter((section) => recordSectionVisible(section, record));
    contentContainer.innerHTML = '';

    for (const section of visible) {
        const wrapper = document.createElement('section');
        wrapper.className = 'ui-record-section mb-3 pb-3 border-bottom';
        if (section.title) {
            const heading = document.createElement('h6');
            heading.className = 'fs-6 mb-2';
            heading.textContent = section.title;
            wrapper.appendChild(heading);
        }
        const body = document.createElement('div');
        wrapper.appendChild(body);
        contentContainer.appendChild(wrapper);

        if (section.html) {
            await renderSectionHtml(body, section, record);
        } else if (section.component) {
            await renderSectionComponent(body, section, record);
        } else if (section.form) {
            await renderSectionForm(body, section, record, () => {
                renderRecordSections(contentContainer, schema, record, options);
                refreshSectionTable(contentContainer);
            });
        }
    }

    contentContainer.lastElementChild?.classList.remove('border-bottom', 'pb-3', 'mb-3');
    if (typeof initializeDetailViewScripts === 'function') {
        initializeDetailViewScripts(contentContainer);
    }

    return true;
}

async function renderSectionHtml(body, section, record) {
    body.innerHTML = typeof renderComponentSkeleton === 'function' ? renderComponentSkeleton() : '';
    try {
        const url = String(section.html).replace('{uid}', encodeURIComponent(record.uid || ''));
        const response = await fetch(url, { credentials: 'same-origin', headers: { 'Accept': 'text/html', 'X-Requested-With': 'XMLHttpRequest' } });
        body.innerHTML = response.ok ? await response.text() : '';
    } catch (error) {
        console.warn('Record section could not be loaded.', section.html, error);
        body.innerHTML = '';
    }
}

async function renderSectionComponent(body, section, record) {
    if (typeof fetchComponentTemplate !== 'function') {
        return;
    }
    body.innerHTML = typeof renderComponentSkeleton === 'function' ? renderComponentSkeleton() : '';
    const template = await fetchComponentTemplate(section.component, null);
    body.innerHTML = template?.success && template.html
        ? hydrateComponentTemplate(template.html, template.bindings || {}, record)
        : '';
}

async function renderSectionForm(body, section, record, onSaved) {
    if (typeof fetchHtmlComponent !== 'function' || typeof setupForm !== 'function') {
        return;
    }
    const result = await fetchHtmlComponent(section.form, record.uid);
    if (!result?.success || !result.html) {
        return;
    }
    body.innerHTML = result.html;

    const form = body.querySelector(TABLE_SELECTOR_DETAIL_FORM);
    if (!form) {
        return;
    }
    form.dataset.entityUid = record.uid || '';
    form.dataset.formData = JSON.stringify(record);
    form.__entityDataCache = record;
    form.dataset.recordSource = 'record-section';
    form.dataset.formMode = section.mode === 'edit' ? 'edit' : 'view';
    await setupForm(form);

    // Saved: show the record again (e.g. the new status) instead of leaving the page.
    const listener = (event) => {
        if (event.detail?.formId !== form.id || !document.body.contains(form)) {
            return;
        }
        window.removeEventListener('lab-form:submitted', listener);
        onSaved();
    };
    window.addEventListener('lab-form:submitted', listener);
}

function refreshSectionTable(contentContainer) {
    const container = contentContainer.closest(TABLE_SELECTOR_INBOX_VIEW_CONTAINER);
    const listTable = container?.__listTable;
    const sourceTable = listTable?.__sourceTable;
    if (sourceTable && typeof window.clearLabTableCache === 'function') {
        window.clearLabTableCache(sourceTable);
    }
    // Same reload as after a delete (the list keeps its page).
    if (listTable && window.$?.fn?.DataTable?.isDataTable(listTable)) {
        window.$(listTable).DataTable().ajax.reload(null, false);
    }
}
