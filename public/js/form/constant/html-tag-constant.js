/**
 * html tag constants
 * example:
 * HTML_TAG.DIV = 'div'
 */
const SHARED_HTML_TAG = window.USER_INTERFACE_SHARED?.HTML_TAG || {};

const HTML_TAG = {
    ...SHARED_HTML_TAG,
    OPTION:"option",
    TEXTAREA:"textarea",
    DATALIST:"datalist",
}
