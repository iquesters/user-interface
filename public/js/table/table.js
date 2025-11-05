/**
 * table.js
 * Dynamically builds a DataTable using dt-options from the Laravel TableSchema API,
 * including support for nested meta fields like "meta.registered_at".
 */

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".shoz-table").forEach(initShozTable);
});

/**
 * Initialize a Shoz DataTable for the given table element
 */
async function initShozTable(tableElement) {
    const slug = tableElement.id;
    if (!slug) return console.warn("⚠️ Missing table id (expected slug name)");

    console.log(`📡 Fetching schema for slug: ${slug}`);
    const schemaResponse = await fetchTableSchema(slug);

    if (!schemaResponse?.data) {
        return showErrorMessage(tableElement, "❌ Table schema not found");
    }

    const schema = schemaResponse.data;
    const entity = schema.entity;
    const dtConfig = schema["dt-options"] || {};

    if (!entity || !dtConfig.columns) {
        return showErrorMessage(tableElement, "❌ Invalid dt-options or missing entity");
    }

    console.log(`📡 Fetching entity data for: ${entity}`);
    const entityResponse = await fetchEntityData(entity);

    if (!entityResponse.success || !entityResponse.data) {
        return showErrorMessage(tableElement, entityResponse.error || "Failed to load data");
    }

    renderDataTable(tableElement, entityResponse.data, dtConfig, entity);
}

/**
 * Fetch the table schema from Laravel API
 */
async function fetchTableSchema(slug) {
    try {
        const res = await fetch(`/api/noauth/table/${slug}`);
        return await res.json();
    } catch (err) {
        console.error("🔥 Schema fetch failed:", err);
        return null;
    }
}

/**
 * Fetch entity data from Laravel API
 */
async function fetchEntityData(entity) {
    try {
        const res = await fetch(`/api/entity/${entity}`);
        return await res.json();
    } catch (err) {
        console.error("🔥 Entity data fetch failed:", err);
        return { success: false, error: err.message };
    }
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