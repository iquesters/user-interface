/**
 * api-client.js — Centralized API Communication Layer
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
 */

/**
 * Standard API Response Structure (from backend)
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {number} status - HTTP status code
 * @property {string} message - Response message
 * @property {*} [data] - Response data
 * @property {Object} [errors] - Error details
 * @property {Object} [meta] - Metadata (pagination, etc.)
 * @property {string} timestamp - Response timestamp
 */

/**
 * Client Response Structure (returned to caller)
 * @typedef {Object} ClientResponse
 * @property {boolean} success - Request success status
 * @property {*} [data] - Response data
 * @property {string} [message] - Response message
 * @property {number} [status] - HTTP status code
 * @property {Object} [errors] - Error details
 * @property {Object} [meta] - Metadata
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
     * Parse response
     * @private
     * @param {Response} response
     * @returns {Promise<ClientResponse>}
     */
    async _parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';

        try {
            // Handle JSON responses
            if (contentType.includes('application/json')) {
                const data = await response.json();

                // Backend should return standardized format
                return {
                    success: data.success || false,
                    data: data.data,
                    message: data.message || '',
                    status: data.status || response.status,
                    errors: data.errors,
                    meta: data.meta,
                };
            }

            // Handle HTML responses
            if (contentType.includes('text/html')) {
                const html = await response.text();
                return {
                    success: response.ok,
                    data: { html },
                    message: response.ok ? 'Content loaded' : 'Request failed',
                    status: response.status,
                };
            }

            // Handle text responses
            const text = await response.text();
            return {
                success: response.ok,
                data: text,
                message: response.ok ? 'Request successful' : 'Request failed',
                status: response.status,
            };

        } catch (error) {
            console.error('❌ Response parsing error:', error);
            return {
                success: false,
                message: 'Failed to parse response',
                status: response.status,
                error: error,
            };
        }
    }

    /**
     * Handle HTTP errors
     * @private
     * @param {Response} response
     * @returns {Promise<ClientResponse>}
     */
    async _handleError(response) {
        const parsed = await this._parseResponse(response);

        const errorResponse = {
            success: false,
            status: response.status,
            message: parsed.message || this._getErrorMessageByStatus(response.status),
            errors: parsed.errors,
            error: new Error(parsed.message || `HTTP ${response.status}`),
        };

        // Log error details
        console.error(`❌ API Error [${response.status}]:`, errorResponse);

        // Handle specific status codes
        if (response.status === 401) {
            this._handleUnauthorized();
        }

        return errorResponse;
    }

    /**
     * Get default error message by status code
     * @private
     * @param {number} status
     * @returns {string}
     */
    _getErrorMessageByStatus(status) {
        const messages = {
            400: 'Bad request',
            401: 'Unauthorized - Please log in',
            403: 'Forbidden - Access denied',
            404: 'Resource not found',
            422: 'Validation failed',
            429: 'Too many requests',
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
        
        // Optionally redirect to login
        // window.location.href = '/login';
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
            if (!modifiedResponse.ok) {
                return await this._handleError(modifiedResponse);
            }

            const parsed = await this._parseResponse(modifiedResponse);
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
                message: error.message || 'Request failed',
                status: 0,
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