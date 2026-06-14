/**
 * style class constants
 * example:
 * STYLE_CLASS.BUTTON_PRIMARY = 'btn-primary'
 */
const SHARED_STYLE_CLASS = window.USER_INTERFACE_SHARED?.STYLE_CLASS || {};

const STYLE_CLASS = {
    ...SHARED_STYLE_CLASS,
    COLL_12: "col-12",
    FORM_CHECK_GROUP:"form-check-group",
    FORM_LABEL:"form-label", 
    FW_BOLD:"fw-bold",
    FORM_CHECK:"form-check",
    FORM_CHECK_INPUT:"form-check-input",
    FORM_CHECK_LABEL:"form-check-label",
    FORM_BLOCK:'form-block',
    FORM_SPACER:'form-spacer',
    ROW_COLS_1:'row-cols-1', 
    G_2:'g-2', 
    NEEDS_VALIDATION:'needs-validation',
    FORM_TEXT:"form-text",
    FORM_CONTROL_PLAINTEXT:"form-control-plaintext",
    FORM_FLOATING:"form-floating",
    FORM_SELECT:"form-select",
    FORM_CONTROL:"form-control",
    BTN_SECONDARY:"btn-secondary",
    BTN_OUTLINE_SECONDARY:"btn-outline-secondary",
    BTN_PRIMARY:"btn-primary",
    BTN_OUTLINE_PRIMARY:"btn-outline-primary",

    CARD:"card",
    BG_WHITE: "bg-white",      
    TRANSITION_ALL: "transition-all", 
    SKELETON_WRAPPER:"skeleton-wrapper",
    COL_4:"col-4",
    PLACEHOLDER_GLOW:"placeholder-glow",
    PLACEHOLDER_WAVE:"placeholder-wave",
    WAS_VALIDATED:'was-validated',
    COL_3:"col-3",
    









    DEFAULT_PLACEHOLDER_COLOR : 'bg-secondary',
    SUPPORTED_ACTION_ELEMENT_TYPES : ['a', 'button'],
    DEFAULT_ACTION_ELEMENT_TYPE : 'a',

    SUPPORTED_ACTION_ELEMENT_SIZES : ['sm', 'lg'],
    DEFAULT_ACTION_ELEMENT_SIZE : 'sm',

    SUPPORTED_ACTION_ELEMENT_COLORS : ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
    DEFAULT_ACTION_ELEMENT_COLOR : 'secondary',

    SUPPORTED_ACTION_ELEMENT_VARIANTS : ['outline', 'link'],
    DEFAULT_ACTION_ELEMENT_VARIANT : 'outline',

    HELPER_TEXT_FONT_SIZE:'0.75rem',
}
