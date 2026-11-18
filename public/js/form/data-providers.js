/**
 * This function provide you the form schema based on formID
 * 
 * @param string formID
 * 
 * @return json formSchema 
 */
// In-memory cache only: not persisted to localStorage/sessionStorage.
const formSchemaCache = new Map();
const formSchemaPendingRequests = new Map();

async function getFormSchema(formID) {
    if (!formID) {
        return null;
    }

    // Reuse the schema while the page is open to avoid repeated fetches for the same form.
    if (formSchemaCache.has(formID)) {
        return formSchemaCache.get(formID);
    }

    if (formSchemaPendingRequests.has(formID)) {
        return formSchemaPendingRequests.get(formID);
    }

    window.uiDebug?.("Fetching form schema for formID: " + formID);
    const pendingRequest = fetch(uiApiUrl('noauth/form/' + encodeURIComponent(formID)))
        .then(response => response.json())
        .then(formSchema => {
            const resolvedSchema = formSchema?.response_schema?.data ?? formSchema?.data ?? null;

            if (resolvedSchema) {
                formSchemaCache.set(formID, resolvedSchema);
            }

            return resolvedSchema;
        })
        .catch(err => {
            window.uiDebug?.(err);
            return null;
        })
        .finally(() => {
            formSchemaPendingRequests.delete(formID);
        });

    formSchemaPendingRequests.set(formID, pendingRequest);

    return pendingRequest;
}

/**
 * GET a same-origin JSON endpoint with the user's session and return its
 * `data` (plain {success, data} or response_schema.data), or null.
 */
async function fetchSessionJsonData(url) {
    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        });

        if (!response.ok) {
            window.uiDebug?.(`fetchSessionJsonData: ${url} answered ${response.status}`);
            return null;
        }

        const json = await response.json();
        return json?.response_schema?.data ?? json?.data ?? null;
    } catch (err) {
        window.uiDebug?.(err);
        return null;
    }
}

/**
 * Fields with "optionsFrom": {"url": "/..."} load their options from that
 * endpoint (an array of {value, label}). The endpoint's own auth applies, so
 * options that are not public never travel in the (public) schema.
 */
async function loadRemoteFieldOptions(formMeta) {
    const fields = Array.isArray(formMeta?.fields) ? formMeta.fields : [];

    await Promise.all(fields
        .filter(field => field?.optionsFrom?.url && !(Array.isArray(field.options) && field.options.length > 0))
        .map(async field => {
            const options = await fetchSessionJsonData(field.optionsFrom.url);
            field.options = Array.isArray(options) ? options : [];
        }));
}

/**
 * Record shown/edited by an entity form. A schema can name its own
 * "dataEndpoint" (with {uid}) when the generic entity API does not return
 * everything the form needs (e.g. a role with its permissions).
 */
async function fetchFormRecord(formMeta, entityUid) {
    if (formMeta?.dataEndpoint && entityUid) {
        return fetchSessionJsonData(formMeta.dataEndpoint.replace('{uid}', encodeURIComponent(entityUid)));
    }

    if (formMeta?.entity && entityUid) {
        const response = await getfetchEntityData(formMeta.entity, entityUid);
        return response?.data || null;
    }

    return null;
}

/**
* This function provide you the table schema based on tableID
* 
* @param string tableID
* 
* @return json formSchema 
*/
async function getTableSchema(tableID) {
   let tableSchema = await fetch('/api/noauth/table/'+tableID)
       .then(response => response.json())
       .catch(err => window.uiDebug?.(err))
   
   return tableSchema?.response_schema?.data ?? tableSchema?.data;
}
