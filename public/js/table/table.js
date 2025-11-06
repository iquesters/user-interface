/**
 * table.js - Updated to wait for Sanctum token
 */

// Get Sanctum token from meta tag with retry logic
const getSanctumToken = () => {
    const tokenMeta = document.querySelector('meta[name="sanctum-token"]');
    return tokenMeta ? tokenMeta.getAttribute('content') : '';
};

// Wait for token to be available
const waitForToken = (maxWaitTime = 5000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkToken = () => {
            const token = getSanctumToken();
            
            if (token) {
                resolve(token);
                return;
            }
            
            if (Date.now() - startTime > maxWaitTime) {
                reject(new Error('Sanctum token not found after waiting'));
                return;
            }
            
            setTimeout(checkToken, 100);
        };
        
        checkToken();
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    console.log('DOMContentLoaded - Starting table initialization');
    
    try {
        // Wait for Sanctum token to be available
        await waitForToken();
        console.log('Sanctum token found, initializing tables');
        
        document.querySelectorAll(".shoz-table").forEach(initShozTable);
    } catch (error) {
        console.warn('Sanctum token not available:', error.message);
        showAuthWarning();
    }
});

/**
 * Initialize a Shoz DataTable for the given table element
 */
async function initShozTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn("Missing table id (expected slug name)");

    console.log(`📡 Fetching schema for slug: ${slug}`);
    const schemaResponse = await fetchTableSchema(slug);

    if (!schemaResponse?.data) {
        return showErrorMessage(tableElement, "Table schema not found");
    }

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtConfig = schema["dt-options"] || {};

    if (!entity || !dtConfig.columns) {
        return showErrorMessage(tableElement, "Invalid dt-options or missing entity");
    }

    console.log(`📡 Fetching entity data for: ${entity}`);
    const entityResponse = await fetchEntityData(entity);

    if (!entityResponse.success || !entityResponse.data) {
        return showErrorMessage(tableElement, entityResponse.error || "Failed to load data");
    }

    renderDataTable(tableElement, entityResponse.data, dtConfig, entity);
}

/**
 * Fetch the table schema from Laravel API with Sanctum token
 */
async function fetchTableSchema(slug) {
    try {
        const token = getSanctumToken();
        console.log('Using token for API call:', token ? 'Token present' : 'No token');
        console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token');
        
        const res = await fetch(`/api/auth/table/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('API Response status:', res.status);
        console.log('API Response headers:', Object.fromEntries(res.headers.entries()));
        
        // Try to read the response body for more error details
        const responseText = await res.text();
        console.log('API Response body:', responseText);
        
        if (res.status === 401) {
            handleUnauthorized();
            return null;
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return JSON.parse(responseText);
    } catch (err) {
        console.error("Schema fetch failed:", err);
        return null;
    }
}

/**
 * Fetch entity data from Laravel API with Sanctum token
 */
async function fetchEntityData(entity) {
    try {
        const token = getSanctumToken();
        const res = await fetch(`/api/entity/${entity}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        
        if (res.status === 401) {
            handleUnauthorized();
            return { success: false, error: 'Authentication required' };
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return await res.json();
    } catch (err) {
        console.error("🔥 Entity data fetch failed:", err);
        return { success: false, error: err.message };
    }
}

function handleUnauthorized() {
    console.error('Authentication required - redirecting to login');
    // Clear any invalid token
    localStorage.removeItem('auth_token');
    // Redirect to login
    // window.location.href = '/login?error=token_expired';
}

function showAuthWarning() {
    document.querySelectorAll(".shoz-table").forEach(table => {
        table.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">
                    <div class="alert alert-warning">
                        <h5>Authentication Required</h5>
                        <p>Please log in to view this table.</p>
                        <a href="/login" class="btn btn-primary">Login</a>
                    </div>
                </td>
            </tr>
        `;
    });
}

/**
 * Render DataTable using dt-options from schema, with meta field support
 */
function renderDataTable(tableElement, data, dtConfig, entityName) {
    if (!Array.isArray(data) || !data.length) {
        return showErrorMessage(tableElement, "⚠️ No data available");
    }

    const { columns, options } = dtConfig;

    // Reset the table structure
    tableElement.innerHTML = `<thead><tr></tr></thead><tbody></tbody>`;
    const theadRow = tableElement.querySelector("thead tr");

    columns.forEach(col => {
        if (col.visible !== false) {
            const th = document.createElement("th");
            th.textContent = col.title || col.data;
            theadRow.appendChild(th);
        }
    });

    // 🧩 Build DataTable column definitions with meta field handling
    const resolvedColumns = columns
        .filter(col => col.visible !== false)
        .map(col => ({
            data: null,
            title: col.title,
            render: (row) => {
                // handle meta.* references
                if (col.data.startsWith("meta.")) {
                    const metaKey = col.data.split(".")[1];
                    const metaItem = (row.meta || []).find(m => m.meta_key === metaKey);
                    return metaItem ? metaItem.meta_value : "";
                }
                // handle nested object (e.g., "profile.name")
                if (col.data.includes(".")) {
                    return col.data.split(".").reduce((acc, key) => acc?.[key], row) ?? "";
                }
                // regular direct property
                return row[col.data] ?? "";
            }
        }));

    // Initialize DataTable
    $(tableElement).DataTable({
        data: data,
        columns: resolvedColumns,
        responsive: options?.responsive ?? true,
        pageLength: options?.pageLength ?? 10,
        order: options?.order ?? [],
        autoWidth: true,
        destroy: true,
        language: {
            searchPlaceholder: "Search records...",
            search: "",
        },
    });

    console.log(`✅ DataTable rendered for entity: ${entityName}`);
}

/**
 * Show an error or empty message
 */
function showErrorMessage(table, message) {
    table.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">${message}</td></tr>`;
}