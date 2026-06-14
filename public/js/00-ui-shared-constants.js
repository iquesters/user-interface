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
