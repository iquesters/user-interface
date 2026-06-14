function removeTableSkeleton(tableElement) {
    const shell = tableElement.closest(TABLE_SELECTOR_LAB_TABLE_SHELL);
    const skeleton = shell?.querySelector(TABLE_SELECTOR_TABLE_SKELETON);

    if (skeleton) {
        skeleton.remove();
    }

    tableElement.classList.remove(TABLE_CLASS_HIDDEN);
}

async function fetchEntityData(entity, offset = 0, length = 50) {
    const response = await apiClient.get(`${TABLE_API_ENTITY_LIST_PREFIX}${entity}`, {
        offset,
        length
    });

    if (!response.success) {
        console.error(TABLE_MESSAGE_FAILED_FETCH_ENTITY, response.message);
        return {
            success: false,
            message: response.message,
            error: response.error
        };
    }

    // Data is now in response.data (extracted from response_schema.data by api-client)
    // Meta information is in response.meta
    return {
        success: true,
        data: response.data || [],
        total: response.meta?.pagination?.total || response.data?.length || 0,
        meta: response.meta
    };
}

function isReusableDetailComponent(componentName) {
    return componentName === TABLE_COMPONENT_LAB_FORM;
}

function getReusableDetailComponentCacheKey(formSchemaId, componentName) {
    return `${componentName}::${formSchemaId || ''}`;
}

function getComponentTemplateCacheKey(componentName, schemaId = null) {
    return `${componentName}::${schemaId || ''}`;
}

function hydrateReusableDetailComponentHtml(templateHtml, formSchemaId, entityUid = null) {
    if (!templateHtml) {
        return '';
    }

    const template = document.createElement('template');
    template.innerHTML = templateHtml.trim();

    const form = template.content.querySelector(TABLE_SELECTOR_DETAIL_FORM);
    if (form) {
        if (formSchemaId) {
            form.id = formSchemaId;
        }

        if (entityUid) {
            form.dataset.entityUid = entityUid;
            form.setAttribute(TABLE_ATTRIBUTE_ENTITY_UID, entityUid);
        } else {
            delete form.dataset.entityUid;
            form.removeAttribute(TABLE_ATTRIBUTE_ENTITY_UID);
        }
    }

    return template.innerHTML;
}

async function fetchHtmlComponent(formSchemaId, entityUid = null, componentName = TABLE_COMPONENT_LAB_FORM) {
    const reusableCacheKey = getReusableDetailComponentCacheKey(formSchemaId, componentName);

    if (isReusableDetailComponent(componentName) && detailComponentTemplateCache.has(reusableCacheKey)) {
        return {
            success: true,
            html: hydrateReusableDetailComponentHtml(
                detailComponentTemplateCache.get(reusableCacheKey),
                formSchemaId,
                entityUid
            ),
            component: componentName
        };
    }

    const template = await fetchComponentTemplate(componentName, formSchemaId);

    if (!template.success || !template.html) {
        return template;
    }

    if (isReusableDetailComponent(componentName)) {
        detailComponentTemplateCache.set(reusableCacheKey, template.html);
    }

    return {
        success: true,
        html: hydrateReusableDetailComponentHtml(template.html, formSchemaId, entityUid),
        component: template.component || componentName,
    };
}

async function fetchComponentTemplate(componentName, schemaId = null) {
    const cacheKey = getComponentTemplateCacheKey(componentName, schemaId);

    if (componentTemplateCache.has(cacheKey)) {
        return componentTemplateCache.get(cacheKey);
    }

    const endpoint = `${TABLE_API_COMPONENT_TEMPLATE_PREFIX}${encodeURIComponent(componentName)}`;
    const response = await apiClient.get(endpoint);

    if (!response.success || !response.data?.html) {
        return {
            success: false,
            error: response.message || TABLE_MESSAGE_FAILED_FETCH_COMPONENT_TEMPLATE,
        };
    }

    const template = document.createElement('template');
    template.innerHTML = response.data.html.trim();

    let bindings = {};
    const bindingScript = template.content.querySelector('script[data-component-bindings]');

    if (bindingScript) {
        try {
            bindings = JSON.parse(bindingScript.textContent || '{}');
        } catch (error) {
            console.warn(TABLE_MESSAGE_FAILED_PARSE_COMPONENT_BINDINGS, error);
        }

        bindingScript.remove();
    }

    const templateResult = {
        success: true,
        html: template.innerHTML.trim(),
        bindings,
        component: response.data.component || componentName,
    };

    componentTemplateCache.set(cacheKey, templateResult);

    return templateResult;
}

function getSummaryComponentTemplateCacheKey(schema = {}, componentName = '') {
    return `${componentName}::${getComponentSchemaIdentifier(schema) || ''}`;
}

async function ensureSummaryComponentTemplate(schema = {}) {
    const summaryComponent = getSchemaConfigValue(schema, TABLE_SCHEMA_KEY_SUMMARY_COMPONENT);
    if (!summaryComponent) {
        return null;
    }

    const cacheKey = getSummaryComponentTemplateCacheKey(schema, summaryComponent);
    if (componentTemplateCache.has(cacheKey)) {
        schema.__summaryComponentTemplate = componentTemplateCache.get(cacheKey);
        return schema.__summaryComponentTemplate;
    }

    const result = await fetchComponentTemplate(summaryComponent, getComponentSchemaIdentifier(schema));

    if (result.success && result.html) {
        componentTemplateCache.set(cacheKey, result);
        schema.__summaryComponentTemplate = result;
        return result;
    }

    console.warn(`${TABLE_MESSAGE_FAILED_LOAD_SUMMARY_COMPONENT}: ${summaryComponent}`, result.error || result.message);
    return null;
}

/**
 * Handle UI context from API responses
 * @param {Object} uiContext
 */
function handleUIContext(uiContext) {
    if (!uiContext) return;

    // Handle redirect
    if (uiContext.redirect) {
        console.log('🔄 Redirecting to:', uiContext.redirect);
        window.location.href = uiContext.redirect;
        return;
    }

    // Handle page refresh
    if (uiContext.refresh) {
        console.log('🔄 Refreshing page');
        window.location.reload();
        return;
    }

    // Handle close action (for modals, panels, etc.)
    if (uiContext.close) {
        console.log('❌ Closing current view');
        // Dispatch event for application to handle
        window.dispatchEvent(new CustomEvent(TABLE_EVENT_UI_CLOSE));
    }

    // Toast notifications are handled by api-client
}

// ---------------------------
// 🧠 CONFIG MERGE LOGIC
// ---------------------------
function mergeDataTableConfigs(defaultConfig, schemaConfig, userConfig = {}) {
    return {
        ...defaultConfig,
        ...schemaConfig,
        ...userConfig,
        columns: mergeColumns(defaultConfig.columns || [], schemaConfig.columns || [], userConfig.columns || []),
    };
}

function mergeColumns(defaultCols, schemaCols, userCols) {
    return schemaCols.map(col => ({
        ...defaultCols.find(d => d.data === col.data),
        ...col,
        ...userCols.find(u => u.data === col.data),
    }));
}

function getUserPersonalization(entityName) {
    return {};
}

