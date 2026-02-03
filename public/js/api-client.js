/**
 * api-client.js — Centralized API Communication Layer
 * ✅ Handles new response_schema structure
 * ✅ Processes ui_context for client-side actions
 * ✅ Supports 3xx redirect handling
 * ✅ Consistent request/response structure
 * ✅ Automatic error handling
 * ✅ Token management
 * ✅ Request/response interceptors
 * ✅ Retry logic for failed requests
 */

// ---------------------------
// 🔧 CONFIGURATION
// ---------------------------
const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000,
    retryAttempts: 2,
    retryDelay: 1000,
    tokenMetaSelector: 'meta[name="sanctum-token"]',
    followRedirects: true, // Auto-follow 3xx redirects
};

// ---------------------------
// 📋 REQUEST/RESPONSE TYPES
// ---------------------------
/**
 * Standard API Request Structure
 * @typedef {Object} ApiRequest
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @property {string} endpoint - API endpoint path
 * @property {Object} [params] - URL query parameters
 * @property {Object} [data] - Request body data
 * @property {Object} [headers] - Additional headers
 * @property {boolean} [skipAuth] - Skip authentication token
 * @property {number} [timeout] - Request timeout override
 * @property {boolean} [followRedirects] - Follow 3xx redirects
 */

/**
 * Backend API Response Structure
 * @typedef {Object} BackendApiResponse
 * @property {boolean} success - Request success status
 * @property {number} status - HTTP status code
 * @property {string} message - Response message
 * @property {Object} response_schema - Response schema object
 * @property {*} response_schema.data - Response data
 * @property {Array|null} response_schema.errors - Error details
 * @property {Object|null} response_schema.meta - Metadata (pagination, etc.)
 * @property {Object|null} response_schema.links - Related links
 * @property {Object} ui_context - UI context object
 * @property {string|null} ui_context.component - Component to render
 * @property {string|null} ui_context.action - Action to perform
 * @property {string|null} ui_context.redirect - Redirect URL
 * @property {Object|null} ui_context.toast - Toast notification config
 * @property {Object|null} ui_context.modal - Modal config
 * @property {boolean} ui_context.refresh - Whether to refresh page
 * @property {boolean} ui_context.close - Whether to close current view
 * @property {Object|null} ui_context.custom - Custom UI context
 * @property {string} timestamp - Response timestamp
 * @property {string|null} request_id - Request ID for tracking
 */

/**
 * Client Response Structure (returned to caller)
 * @typedef {Object} ClientResponse
 * @property {boolean} success - Request success status
 * @property {*} data - Response data (from response_schema.data)
 * @property {string} message - Response message
 * @property {number} status - HTTP status code
 * @property {Array|null} errors - Error details
 * @property {Object|null} meta - Metadata
 * @property {Object|null} links - Related links
 * @property {Object} ui_context - UI context for client-side actions
 * @property {Error} [error] - Error object (for failures)
 */

// ---------------------------
// 🚀 API CLIENT CLASS
// ---------------------------
class ApiClient {
    constructor(config = {}) {
        this.config = { ...API_CONFIG, ...config };
        this.interceptors = {
            request: [],
            response: [],
        };
        this.requestId = 0;
    }

    /**
     * Get authentication token
     * @private
     * @returns {string|null}
     */
    _getToken() {
        const tokenMeta = document.querySelector(this.config.tokenMetaSelector);
        return tokenMeta ? tokenMeta.getAttribute('content') : null;
    }

    /**
     * Wait for authentication token
     * @private
     * @param {number} maxWaitTime
     * @returns {Promise<string>}
     */
    async _waitForToken(maxWaitTime = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;

            const check = () => {
                const token = this._getToken();
                if (token) {
                    return resolve(token);
                }

                if (Date.now() - startTime > maxWaitTime) {
                    return reject(new Error('Authentication token timeout'));
                }

                setTimeout(check, checkInterval);
            };

            check();
        });
    }

    /**
     * Generate request ID for tracking
     * @private
     * @returns {string}
     */
    _generateRequestId() {
        this.requestId++;
        return `req_${Date.now()}_${this.requestId}`;
    }

    /**
     * Build full URL
     * @private
     * @param {string} endpoint
     * @param {Object} params
     * @returns {string}
     */
    _buildURL(endpoint, params = {}) {
        const url = new URL(endpoint, window.location.origin + this.config.baseURL);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        return url.toString();
    }

    /**
     * Build request headers
     * @private
     * @param {ApiRequest} request
     * @returns {Promise<Headers>}
     */
    async _buildHeaders(request) {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Request-ID': this._generateRequestId(),
            ...request.headers,
        });

        // Add authentication token
        if (!request.skipAuth) {
            try {
                const token = await this._waitForToken();
                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
            } catch (error) {
                console.warn('⚠️ Token not available:', error.message);
            }
        }

        return headers;
    }

    /**
     * Execute request interceptors
     * @private
     * @param {ApiRequest} request
     * @returns {Promise<ApiRequest>}
     */
    async _executeRequestInterceptors(request) {
        let modifiedRequest = { ...request };

        for (const interceptor of this.interceptors.request) {
            modifiedRequest = await interceptor(modifiedRequest);
        }

        return modifiedRequest;
    }

    /**
     * Execute response interceptors
     * @private
     * @param {Response} response
     * @param {ApiRequest} request
     * @returns {Promise<Response>}
     */
    async _executeResponseInterceptors(response, request) {
        let modifiedResponse = response;

        for (const interceptor of this.interceptors.response) {
            modifiedResponse = await interceptor(modifiedResponse, request);
        }

        return modifiedResponse;
    }

    /**
     * Parse response with new response_schema structure
     * @private
     * @param {Response} response
     * @param {ApiRequest} request
     * @returns {Promise<ClientResponse>}
     */
    async _parseResponse(response, request) {
        const contentType = response.headers.get('content-type') || '';

        try {
            // Handle JSON responses
            if (contentType.includes('application/json')) {
                const json = await response.json();

                // Check if response follows new schema
                if (json.response_schema !== undefined) {
                    return this._parseStandardResponse(json, response);
                }

                // Legacy response format
                return this._parseLegacyResponse(json, response);
            }

            // Handle HTML responses
            if (contentType.includes('text/html')) {
                const html = await response.text();
                return {
                    success: response.ok,
                    data: { html },
                    message: response.ok ? 'Content loaded' : 'Request failed',
                    status: response.status,
                    errors: null,
                    meta: null,
                    links: null,
                    ui_context: {},
                };
            }

            // Handle text responses
            const text = await response.text();
            return {
                success: response.ok,
                data: text,
                message: response.ok ? 'Request successful' : 'Request failed',
                status: response.status,
                errors: null,
                meta: null,
                links: null,
                ui_context: {},
            };

        } catch (error) {
            console.error('❌ Response parsing error:', error);
            return {
                success: false,
                data: null,
                message: 'Failed to parse response',
                status: response.status,
                errors: [{ message: error.message }],
                meta: null,
                links: null,
                ui_context: {},
                error: error,
            };
        }
    }

    /**
     * Parse standard response_schema format
     * @private
     * @param {BackendApiResponse} json
     * @param {Response} response
     * @returns {ClientResponse}
     */
    _parseStandardResponse(json, response) {
        const clientResponse = {
            success: json.success || false,
            data: json.response_schema?.data || null,
            message: json.message || '',
            status: json.status || response.status,
            errors: json.response_schema?.errors || null,
            meta: json.response_schema?.meta || null,
            links: json.response_schema?.links || null,
            ui_context: json.ui_context || {},
        };

        // Process UI context
        this._processUIContext(clientResponse.ui_context);

        return clientResponse;
    }

    /**
     * Parse legacy response format
     * @private
     * @param {Object} json
     * @param {Response} response
     * @returns {ClientResponse}
     */
    _parseLegacyResponse(json, response) {
        return {
            success: json.success || response.ok,
            data: json.data || json,
            message: json.message || '',
            status: json.status || response.status,
            errors: json.errors || null,
            meta: json.meta || null,
            links: json.links || null,
            ui_context: {},
        };
    }

    /**
     * Process UI context and trigger client-side actions
     * @private
     * @param {Object} uiContext
     */
    _processUIContext(uiContext) {
        if (!uiContext || typeof uiContext !== 'object') {
            return;
        }

        // Handle redirect
        if (uiContext.redirect) {
            console.log('🔄 UI Context: Redirect to', uiContext.redirect);
            // Note: Actual redirect should be handled by caller
        }

        // Handle toast notification
        if (uiContext.toast) {
            console.log('📢 UI Context: Toast notification', uiContext.toast);
            this._showToast(uiContext.toast);
        }

        // Handle modal
        if (uiContext.modal) {
            console.log('📋 UI Context: Modal', uiContext.modal);
            // Note: Modal handling should be implemented by application
        }

        // Handle page refresh
        if (uiContext.refresh) {
            console.log('🔄 UI Context: Page refresh requested');
            // Note: Actual refresh should be handled by caller
        }

        // Handle close action
        if (uiContext.close) {
            console.log('❌ UI Context: Close requested');
            // Note: Close action should be handled by caller
        }

        // Handle custom actions
        if (uiContext.custom) {
            console.log('⚙️ UI Context: Custom action', uiContext.custom);
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('api-ui-context', {
                detail: uiContext.custom
            }));
        }
    }

    /**
     * Show toast notification (if toast library available)
     * @private
     * @param {Object} toastConfig
     */
    _showToast(toastConfig) {
        // Example integration with common toast libraries
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: toastConfig.message || '',
                duration: toastConfig.duration || 3000,
                gravity: toastConfig.position || 'top',
                position: 'right',
                backgroundColor: toastConfig.type === 'error' ? '#dc3545' : '#28a745',
            }).showToast();
        } else if (typeof toastr !== 'undefined') {
            const type = toastConfig.type || 'info';
            toastr[type](toastConfig.message || '');
        } else {
            console.log('Toast:', toastConfig);
        }
    }

    /**
     * Handle HTTP errors
     * @private
     * @param {Response} response
     * @param {ApiRequest} request
     * @returns {Promise<ClientResponse>}
     */
    async _handleError(response, request) {
        const parsed = await this._parseResponse(response, request);

        const errorResponse = {
            ...parsed,
            success: false,
            error: new Error(parsed.message || `HTTP ${response.status}`),
        };

        // Log error details
        console.error(`❌ API Error [${response.status}]:`, errorResponse);

        // Handle specific status codes
        if (response.status === 401) {
            this._handleUnauthorized();
        }

        // Handle 3xx redirects
        if (response.status >= 300 && response.status < 400) {
            return this._handleRedirect(response, request, errorResponse);
        }

        return errorResponse;
    }

    /**
     * Handle redirect responses (3xx)
     * @private
     * @param {Response} response
     * @param {ApiRequest} request
     * @param {ClientResponse} parsedResponse
     * @returns {Promise<ClientResponse>}
     */
    async _handleRedirect(response, request, parsedResponse) {
        const redirectUrl = response.headers.get('Location') || parsedResponse.data?.redirect_url;

        if (!redirectUrl) {
            console.warn('⚠️ Redirect response without Location header');
            return parsedResponse;
        }

        console.log(`🔄 Redirect [${response.status}]: ${redirectUrl}`);

        // Auto-follow redirects if configured
        if (request.followRedirects !== false && this.config.followRedirects) {
            console.log('🔄 Following redirect...');
            
            // Preserve method for 307/308, use GET for others
            const newMethod = (response.status === 307 || response.status === 308) 
                ? request.method 
                : 'GET';

            return this._executeRequest({
                ...request,
                method: newMethod,
                endpoint: redirectUrl,
                followRedirects: false, // Prevent infinite redirects
            });
        }

        // Return redirect info to caller
        return {
            ...parsedResponse,
            success: true,
            message: parsedResponse.message || 'Redirect required',
        };
    }

    /**
     * Get default error message by status code
     * @private
     * @param {number} status
     * @returns {string}
     */
    _getErrorMessageByStatus(status) {
        const messages = {
            // 3xx Redirects
            301: 'Resource moved permanently',
            302: 'Resource found at new location',
            303: 'See other resource',
            304: 'Resource not modified',
            307: 'Temporary redirect',
            308: 'Permanent redirect',
            
            // 4xx Client Errors
            400: 'Bad request',
            401: 'Unauthorized - Please log in',
            403: 'Forbidden - Access denied',
            404: 'Resource not found',
            405: 'Method not allowed',
            409: 'Conflict',
            422: 'Validation failed',
            429: 'Too many requests',
            
            // 5xx Server Errors
            500: 'Internal server error',
            503: 'Service unavailable',
        };

        return messages[status] || `Request failed with status ${status}`;
    }

    /**
     * Handle unauthorized access
     * @private
     */
    _handleUnauthorized() {
        console.error('🔒 Unauthorized access - clearing token');
        localStorage.removeItem('auth_token');
        
        // Dispatch event for application to handle
        window.dispatchEvent(new CustomEvent('api-unauthorized'));
    }

    /**
     * Execute API request with retry logic
     * @private
     * @param {ApiRequest} request
     * @param {number} attempt
     * @returns {Promise<ClientResponse>}
     */
    async _executeRequest(request, attempt = 1) {
        try {
            // Execute request interceptors
            const modifiedRequest = await this._executeRequestInterceptors(request);

            // Build URL and headers
            const url = this._buildURL(modifiedRequest.endpoint, modifiedRequest.params);
            const headers = await this._buildHeaders(modifiedRequest);

            // Build fetch options
            const options = {
                method: modifiedRequest.method,
                headers: headers,
                credentials: 'same-origin',
                redirect: 'manual', // Handle redirects manually
            };

            // Add body for non-GET requests
            if (modifiedRequest.data && modifiedRequest.method !== 'GET') {
                options.body = JSON.stringify(modifiedRequest.data);
            }

            // Add timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                modifiedRequest.timeout || this.config.timeout
            );
            options.signal = controller.signal;

            console.log(`🚀 API Request [${modifiedRequest.method}]: ${url}`);

            // Execute fetch
            const response = await fetch(url, options);
            clearTimeout(timeoutId);

            // Execute response interceptors
            const modifiedResponse = await this._executeResponseInterceptors(response, modifiedRequest);

            // Handle response
            if (!modifiedResponse.ok && modifiedResponse.status < 300) {
                return await this._handleError(modifiedResponse, modifiedRequest);
            }

            // Handle 3xx redirects
            if (modifiedResponse.status >= 300 && modifiedResponse.status < 400) {
                return await this._handleRedirect(modifiedResponse, modifiedRequest, 
                    await this._parseResponse(modifiedResponse, modifiedRequest));
            }

            // Handle error responses
            if (!modifiedResponse.ok) {
                return await this._handleError(modifiedResponse, modifiedRequest);
            }

            const parsed = await this._parseResponse(modifiedResponse, modifiedRequest);
            console.log(`✅ API Success [${modifiedResponse.status}]:`, parsed);

            return parsed;

        } catch (error) {
            console.error(`❌ API Request failed (attempt ${attempt}):`, error);

            // Retry logic
            if (attempt < this.config.retryAttempts && !error.name?.includes('Abort')) {
                console.log(`🔄 Retrying request (attempt ${attempt + 1})...`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this._executeRequest(request, attempt + 1);
            }

            return {
                success: false,
                data: null,
                message: error.message || 'Request failed',
                status: 0,
                errors: [{ message: error.message }],
                meta: null,
                links: null,
                ui_context: {},
                error: error,
            };
        }
    }

    /**
     * Make GET request
     * @param {string} endpoint
     * @param {Object} params
     * @param {Object} options
     * @returns {Promise<ClientResponse>}
     */
    async get(endpoint, params = {}, options = {}) {
        return this._executeRequest({
            method: 'GET',
            endpoint,
            params,
            ...options,
        });
    }

    /**
     * Make POST request
     * @param {string} endpoint
     * @param {Object} data
     * @param {Object} options
     * @returns {Promise<ClientResponse>}
     */
    async post(endpoint, data = {}, options = {}) {
        return this._executeRequest({
            method: 'POST',
            endpoint,
            data,
            ...options,
        });
    }

    /**
     * Make PUT request
     * @param {string} endpoint
     * @param {Object} data
     * @param {Object} options
     * @returns {Promise<ClientResponse>}
     */
    async put(endpoint, data = {}, options = {}) {
        return this._executeRequest({
            method: 'PUT',
            endpoint,
            data,
            ...options,
        });
    }

    /**
     * Make PATCH request
     * @param {string} endpoint
     * @param {Object} data
     * @param {Object} options
     * @returns {Promise<ClientResponse>}
     */
    async patch(endpoint, data = {}, options = {}) {
        return this._executeRequest({
            method: 'PATCH',
            endpoint,
            data,
            ...options,
        });
    }

    /**
     * Make DELETE request
     * @param {string} endpoint
     * @param {Object} options
     * @returns {Promise<ClientResponse>}
     */
    async delete(endpoint, options = {}) {
        return this._executeRequest({
            method: 'DELETE',
            endpoint,
            ...options,
        });
    }

    /**
     * Add request interceptor
     * @param {Function} interceptor
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    /**
     * Add response interceptor
     * @param {Function} interceptor
     */
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }
}

// ---------------------------
// 🌐 GLOBAL API CLIENT INSTANCE
// ---------------------------
const apiClient = new ApiClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, apiClient };
}