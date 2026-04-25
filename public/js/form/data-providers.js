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

    console.log("Fetching form schema for formID: " + formID);
    const pendingRequest = fetch('/api/noauth/form/'+formID)
        .then(response => response.json())
        .then(formSchema => {
            const resolvedSchema = formSchema?.response_schema?.data ?? formSchema?.data ?? null;

            if (resolvedSchema) {
                formSchemaCache.set(formID, resolvedSchema);
            }

            return resolvedSchema;
        })
        .catch(err => {
            console.log(err);
            return null;
        })
        .finally(() => {
            formSchemaPendingRequests.delete(formID);
        });

    formSchemaPendingRequests.set(formID, pendingRequest);

    return pendingRequest;
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
       .catch(err => console.log(err))
   
   return tableSchema?.response_schema?.data ?? tableSchema?.data;
}
