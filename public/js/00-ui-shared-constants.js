/**
 * Shared UI constants used by multiple feature areas.
 * Keep only truly cross-cutting values here so form/table can extend them
 * without duplicating the same Bootstrap classes or HTML tags.
 */

window.USER_INTERFACE_SHARED = window.USER_INTERFACE_SHARED || {};

window.USER_INTERFACE_SHARED.HTML_TAG = Object.freeze({
    DIV: "div",
    LABEL: "label",
    INPUT: "input",
    SELECT: "select",
    BUTTON: "button",
    SPAN: "span",
    P: "p",
});

window.USER_INTERFACE_SHARED.STYLE_CLASS = Object.freeze({
    ROW: "row",
    COL: "col",
    D_FLEX: "d-flex",
    GAP_2: "gap-2",
    GAP_3: "gap-3",
    SMALL: "small",
    BTN: "btn",
    BTN_SM: "btn-sm",
    BTN_PRIMARY: "btn-primary",
    BTN_SECONDARY: "btn-secondary",
    ALERT: "alert",
    ALERT_WARNING: "alert-warning",
    ALERT_DANGER: "alert-danger",
    ALERT_INFO: "alert-info",
    ALERT_SUCCESS: "alert-success",
    MB_0: "mb-0",
    MB_1: "mb-1",
    MB_2: "mb-2",
    MB_3: "mb-3",
    MT_1: "mt-1",
    MT_2: "mt-2",
    MT_3: "mt-3",
    P_1: "p-1",
    P_3: "p-3",
    P_4: "p-4",
    PX_2: "px-2",
    PE_1: "pe-1",
    W_100: "w-100",
    BORDER: "border",
    ROUNDED: "rounded",
    ROUNDED_3: "rounded-3",
    SHADOW: "shadow",
    SHADOW_SM: "shadow-sm",
    SHADOW_LG: "shadow-lg",
    PLACEHOLDER: "placeholder",
    TEXT_MUTED: "text-muted",
    TEXT_SECONDARY: "text-secondary",
    TEXT_CENTER: "text-center",
    ALIGN_ITEMS_CENTER: "align-items-center",
    JUSTIFY_CONTENT_END: "justify-content-end",
    JUSTIFY_CONTENT_BETWEEN: "justify-content-between",
    DISABLED: "disabled",
    D_NONE: "d-none",
    BG_LIGHT_SUBTLE: "bg-light-subtle",
    CARD_TEXT: "card-text",
    VALID_FEEDBACK: "valid-feedback",
    INVALID_FEEDBACK: "invalid-feedback",
});

window.USER_INTERFACE_SHARED.ROUTE = Object.freeze({
    LOGIN: "/login",
});

window.USER_INTERFACE_SHARED.HTTP_STATUS = Object.freeze({
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    CONTENT_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    I_AM_A_TEAPOT: 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
});

window.USER_INTERFACE_SHARED.HTTP_STATUS_MESSAGE = Object.freeze({
    100: "Continue",
    101: "Switching protocols",
    102: "Processing",
    103: "Early hints",
    200: "Request successful",
    201: "Resource created successfully",
    202: "Request accepted for processing",
    203: "Non-authoritative information",
    204: "No content",
    205: "Reset content",
    206: "Partial content",
    207: "Multi-status",
    208: "Already reported",
    226: "IM used",
    300: "Multiple choices",
    301: "Resource moved permanently",
    302: "Resource found at new location",
    303: "See other resource",
    304: "Resource not modified",
    305: "Use proxy",
    307: "Temporary redirect",
    308: "Permanent redirect",
    400: "Bad request",
    401: "Unauthorized - Please log in",
    402: "Payment required",
    403: "Forbidden - Access denied",
    404: "Resource not found",
    405: "Method not allowed",
    406: "Not acceptable",
    407: "Proxy authentication required",
    408: "Request timeout",
    409: "Conflict",
    410: "Resource gone",
    411: "Length required",
    412: "Precondition failed",
    413: "Content too large",
    414: "URI too long",
    415: "Unsupported media type",
    416: "Range not satisfiable",
    417: "Expectation failed",
    418: "I'm a teapot",
    421: "Misdirected request",
    422: "Validation failed",
    423: "Resource locked",
    424: "Failed dependency",
    425: "Too early",
    426: "Upgrade required",
    428: "Precondition required",
    429: "Too many requests",
    431: "Request header fields too large",
    451: "Unavailable for legal reasons",
    500: "Internal server error",
    501: "Not implemented",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
    505: "HTTP version not supported",
    506: "Variant also negotiates",
    507: "Insufficient storage",
    508: "Loop detected",
    510: "Not extended",
    511: "Network authentication required",
});

window.USER_INTERFACE_SHARED.httpStatus = Object.freeze({
    isInformational(status) {
        return status >= window.USER_INTERFACE_SHARED.HTTP_STATUS.CONTINUE
            && status < window.USER_INTERFACE_SHARED.HTTP_STATUS.OK;
    },

    isSuccess(status) {
        return status >= window.USER_INTERFACE_SHARED.HTTP_STATUS.OK
            && status < window.USER_INTERFACE_SHARED.HTTP_STATUS.MULTIPLE_CHOICES;
    },

    isRedirect(status) {
        return status >= window.USER_INTERFACE_SHARED.HTTP_STATUS.MULTIPLE_CHOICES
            && status < window.USER_INTERFACE_SHARED.HTTP_STATUS.BAD_REQUEST;
    },

    isClientError(status) {
        return status >= window.USER_INTERFACE_SHARED.HTTP_STATUS.BAD_REQUEST
            && status < window.USER_INTERFACE_SHARED.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    },

    isServerError(status) {
        return status >= window.USER_INTERFACE_SHARED.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    },

    isError(status) {
        return this.isClientError(status) || this.isServerError(status);
    },

    getMessage(status) {
        return window.USER_INTERFACE_SHARED.HTTP_STATUS_MESSAGE[status]
            || `Request failed with status ${status}`;
    },
});
