/**
 * Shared table constants only.
 * Keep this file free of runtime state so other table modules can depend on a predictable constants surface.
 */

const SHARED_UI_STYLE_CLASS = window.USER_INTERFACE_SHARED?.STYLE_CLASS || {};
const SHARED_UI_ROUTE = window.USER_INTERFACE_SHARED?.ROUTE || {};

const PREFETCH_THRESHOLD = 0.7;

const DEFAULT_DT_CONFIG = {
    processing: false,
    serverSide: true,
    searching: true,
    ordering: true,
    responsive: true,
    autoWidth: true,
    destroy: true,
    pagingType: "full_numbers",
    lengthMenu: [10, 25, 50, 100],
    language: {
        info: "_START_ to _END_ of _TOTAL_",
        infoEmpty: "0 to 0 of 0",
        infoFiltered: "",
        lengthMenu: "_MENU_",
        searchPlaceholder: "Search records...",
        search: "",
    },
};

const VIEW_MODE_TABLE = 'table';
const VIEW_MODE_INBOX = 'inbox';
const MIN_PANEL_WIDTH = 250;
const DEFAULT_LEFT_PANEL_WIDTH = 40;
const DETAIL_RENDER_MODE_COMPONENT = 'component';
const DETAIL_RENDER_MODE_FORM = 'form';

const TABLE_COMPONENT_LAB_FORM = 'userinterface::components.lab-form';
const TABLE_API_ENTITY_LIST_PREFIX = '/api/entity/list/';
const TABLE_API_COMPONENT_TEMPLATE_PREFIX = '/api/components/templates/';

const TABLE_SELECTOR_LAB_TABLE = '.lab-table';
const TABLE_SELECTOR_LAB_TABLE_SHELL = '.lab-table-shell';
const TABLE_SELECTOR_INBOX_LIST = '.inbox-list-table';
const TABLE_SELECTOR_INBOX_VIEW_CONTAINER = '.inbox-view-container';
const TABLE_SELECTOR_DETAIL_CONTENT = '.inbox-detail-content';
const TABLE_SELECTOR_ROW_CHECKBOX = '.row-checkbox';
const TABLE_SELECTOR_CHECKBOX_COLUMN = '.checkbox-column';
const TABLE_SELECTOR_ACTIVE_EDIT_FORM = '.inbox-detail-content .lab-form[data-form-mode="edit"], .inbox-detail-content .shoz-form[data-form-mode="edit"]';
const TABLE_SELECTOR_TABLE_SKELETON = '.table-skeleton';
const TABLE_SELECTOR_DETAIL_FORM = '.lab-form, .shoz-form';
const TABLE_SELECTOR_DT_CONTAINER = '.dt-container';
const TABLE_SELECTOR_DT_LAYOUT_CELL = '.dt-layout-cell';
const TABLE_SELECTOR_DT_LAYOUT_FULL = '.dt-layout-full';
const TABLE_SELECTOR_DT_PAGING_PAGINATION = '.dt-paging .pagination';
const TABLE_SELECTOR_DT_PAGE_LINK = '.dt-paging .page-link';
const TABLE_SELECTOR_DT_LENGTH_SELECT = '.dt-length select';
const TABLE_SELECTOR_DT_SEARCH_INPUT = '.dt-search input[type="search"]';
const TABLE_SELECTOR_DT_INFO_BLOCKS = '.dt-info, .dt-length, .dt-search';
const TABLE_SELECTOR_DT_SEARCH_OR_INPUT = '.dt-search, input[type="search"]';
const TABLE_SELECTOR_DT_LENGTH_OR_SELECT = '.dt-length, select';
const TABLE_SELECTOR_DT_PAGING_OR_PAGINATE = '.dt-paging, .dataTables_paginate';
const TABLE_SELECTOR_DT_INFO_OR_INFO = '.dt-info, .dataTables_info';
const TABLE_SELECTOR_THEAD_ROWS = 'thead tr';
const TABLE_SELECTOR_TBODY_ROWS = 'tbody tr';
const TABLE_SELECTOR_TABLE_CELLS = 'td, th';
const TABLE_SELECTOR_TABLE = 'table';
const TABLE_SELECTOR_THEAD = 'thead';
const TABLE_SELECTOR_TBODY = 'tbody';
const TABLE_SELECTOR_SCRIPTS = 'script';
const TABLE_SELECTOR_COMPONENT_BINDINGS = 'script[data-component-bindings]';
const TABLE_SELECTOR_SELECTED_ROW = 'tbody tr.bg-primary-subtle';
const TABLE_SELECTOR_SUMMARY_NODES = '.inbox-summary-component:not([data-summary-initialized="true"])';
const TABLE_SELECTOR_INBOX_SCROLL_FRAME = '.inbox-scroll-frame';
const TABLE_SELECTOR_TABLE_RESPONSIVE = '.table-responsive';
const TABLE_SELECTOR_DT_SCROLL_BODY = '.dt-scroll-body';
const TABLE_SELECTOR_INBOX_ROW = 'tbody tr';

const TABLE_ID_SELECT_ALL = 'select-all-table';
const TABLE_ID_SELECT_ALL_INBOX = 'select-all-inbox';

const TABLE_ATTRIBUTE_ENTITY_UID = 'data-entity-uid';

const TABLE_CLASS_HIDDEN = SHARED_UI_STYLE_CLASS.D_NONE || 'd-none';
const TABLE_CLASS_ROW = SHARED_UI_STYLE_CLASS.ROW || 'row';
const TABLE_CLASS_COL = SHARED_UI_STYLE_CLASS.COL || 'col';
const TABLE_CLASS_D_FLEX = SHARED_UI_STYLE_CLASS.D_FLEX || 'd-flex';
const TABLE_CLASS_GAP_2 = SHARED_UI_STYLE_CLASS.GAP_2 || 'gap-2';
const TABLE_CLASS_GAP_3 = SHARED_UI_STYLE_CLASS.GAP_3 || 'gap-3';
const TABLE_CLASS_SMALL = SHARED_UI_STYLE_CLASS.SMALL || 'small';
const TABLE_CLASS_BTN = SHARED_UI_STYLE_CLASS.BTN || 'btn';
const TABLE_CLASS_BTN_SM = SHARED_UI_STYLE_CLASS.BTN_SM || 'btn-sm';
const TABLE_CLASS_BTN_PRIMARY = SHARED_UI_STYLE_CLASS.BTN_PRIMARY || 'btn-primary';
const TABLE_CLASS_ALERT = SHARED_UI_STYLE_CLASS.ALERT || 'alert';
const TABLE_CLASS_ALERT_WARNING = SHARED_UI_STYLE_CLASS.ALERT_WARNING || 'alert-warning';
const TABLE_CLASS_ALERT_DANGER = SHARED_UI_STYLE_CLASS.ALERT_DANGER || 'alert-danger';
const TABLE_CLASS_MB_0 = SHARED_UI_STYLE_CLASS.MB_0 || 'mb-0';
const TABLE_CLASS_MB_2 = SHARED_UI_STYLE_CLASS.MB_2 || 'mb-2';
const TABLE_CLASS_MB_3 = SHARED_UI_STYLE_CLASS.MB_3 || 'mb-3';
const TABLE_CLASS_MT_1 = SHARED_UI_STYLE_CLASS.MT_1 || 'mt-1';
const TABLE_CLASS_P_1 = SHARED_UI_STYLE_CLASS.P_1 || 'p-1';
const TABLE_CLASS_P_3 = SHARED_UI_STYLE_CLASS.P_3 || 'p-3';
const TABLE_CLASS_P_4 = SHARED_UI_STYLE_CLASS.P_4 || 'p-4';
const TABLE_CLASS_PX_2 = SHARED_UI_STYLE_CLASS.PX_2 || 'px-2';
const TABLE_CLASS_PE_1 = SHARED_UI_STYLE_CLASS.PE_1 || 'pe-1';
const TABLE_CLASS_W_100 = SHARED_UI_STYLE_CLASS.W_100 || 'w-100';
const TABLE_CLASS_BORDER = SHARED_UI_STYLE_CLASS.BORDER || 'border';
const TABLE_CLASS_ROUNDED = SHARED_UI_STYLE_CLASS.ROUNDED || 'rounded';
const TABLE_CLASS_TEXT_MUTED = SHARED_UI_STYLE_CLASS.TEXT_MUTED || 'text-muted';
const TABLE_CLASS_TEXT_SECONDARY = SHARED_UI_STYLE_CLASS.TEXT_SECONDARY || 'text-secondary';
const TABLE_CLASS_TEXT_CENTER = SHARED_UI_STYLE_CLASS.TEXT_CENTER || 'text-center';
const TABLE_CLASS_ALIGN_ITEMS_CENTER = SHARED_UI_STYLE_CLASS.ALIGN_ITEMS_CENTER || 'align-items-center';
const TABLE_CLASS_JUSTIFY_CONTENT_END = SHARED_UI_STYLE_CLASS.JUSTIFY_CONTENT_END || 'justify-content-end';
const TABLE_CLASS_JUSTIFY_CONTENT_BETWEEN = SHARED_UI_STYLE_CLASS.JUSTIFY_CONTENT_BETWEEN || 'justify-content-between';
const TABLE_CLASS_BG_LIGHT_SUBTLE = SHARED_UI_STYLE_CLASS.BG_LIGHT_SUBTLE || 'bg-light-subtle';
const TABLE_CLASS_CARD_TEXT = SHARED_UI_STYLE_CLASS.CARD_TEXT || 'card-text';
const TABLE_CLASS_FLEX_COLUMN = 'flex-column';
const TABLE_CLASS_FLEX_GROW_1 = 'flex-grow-1';
const TABLE_CLASS_FLEX_SHRINK_0 = 'flex-shrink-0';
const TABLE_CLASS_OVERFLOW_HIDDEN = 'overflow-hidden';
const TABLE_CLASS_OVERFLOW_AUTO = 'overflow-auto';
const TABLE_CLASS_P_0 = 'p-0';
const TABLE_CLASS_M_0 = 'm-0';
const TABLE_CLASS_PT_2 = 'pt-2';
const TABLE_CLASS_PT_3 = 'pt-3';
const TABLE_CLASS_PB_1 = 'pb-1';
const TABLE_CLASS_PX_3 = 'px-3';
const TABLE_CLASS_PY_5 = 'py-5';
const TABLE_CLASS_BORDER_BOTTOM = 'border-bottom';
const TABLE_CLASS_BORDER_TOP = 'border-top';
const TABLE_CLASS_BORDER_START = 'border-start';
const TABLE_CLASS_BORDER_END = 'border-end';
const TABLE_CLASS_BORDER_2 = 'border-2';
const TABLE_CLASS_BORDER_LIGHT_SUBTLE = 'border-light-subtle';
const TABLE_CLASS_BG_LIGHT = 'bg-light';
const TABLE_CLASS_BG_INFO = 'bg-info';
const TABLE_CLASS_BORDER_INFO = 'border-info';
const TABLE_CLASS_BG_PRIMARY_SUBTLE = 'bg-primary-subtle';
const TABLE_CLASS_BTN_LINK_EDIT = 'btn btn-sm btn-link text-dark text-decoration-none d-inline-flex align-items-center gap-1 px-0';
const TABLE_CLASS_BTN_LINK_DELETE = 'btn btn-sm btn-link text-danger text-decoration-none d-inline-flex align-items-center gap-1 px-0';
const TABLE_CLASS_EMPTY_STATE = 'd-flex align-items-center justify-content-center h-100 w-100 text-center text-muted';
const TABLE_CLASS_DETAIL_ACTIONS = 'inbox-detail-actions d-flex align-items-center justify-content-end gap-3 px-3 pt-3 flex-shrink-0';
const TABLE_CLASS_DETAIL_PANEL_RESET = 'd-flex flex-column overflow-hidden p-0 m-0';
const TABLE_CLASS_DETAIL_PANEL_ACTIVE = 'd-flex flex-column h-100 overflow-hidden p-0 m-0';
const TABLE_CLASS_INBOX_LEFT_PANEL = 'inbox-left-panel';
const TABLE_CLASS_INBOX_RIGHT_PANEL = 'inbox-right-panel';
const TABLE_CLASS_INBOX_RESIZER = 'inbox-resizer';
const TABLE_CLASS_DT_LAYOUT_ROW = 'dt-layout-row';
const TABLE_CLASS_DT_LAYOUT_TABLE = 'dt-layout-table';
const TABLE_CLASS_H_AUTO = 'h-auto';
const TABLE_CLASS_DT_SELECT_ACTIVE = 'bg-primary bg-opacity-10';
const TABLE_CLASS_TEXT_UPPERCASE = 'text-uppercase';
const TABLE_CLASS_STICKY_TOP = 'sticky-top';
const TABLE_CLASS_POSITION_STICKY = 'position-sticky';
const TABLE_CLASS_BOTTOM_0 = 'bottom-0';
const TABLE_CLASS_Z_3 = 'z-3';

const TABLE_EVENT_UI_CLOSE = 'ui-close';
const TABLE_EVENT_INBOX_DETAIL_LOADED = 'inboxDetailLoaded';
const TABLE_EVENT_VIEW_MODE_CHANGED = 'viewModeChanged';
const TABLE_EVENT_ROW_SELECTION_CHANGED = 'rowSelectionChanged';

const TABLE_SCHEMA_KEY_SUMMARY_COMPONENT = ['summary_component', 'summary-component'];
const TABLE_DETAIL_TITLE_FIELDS = ['title', 'name', 'subject', 'uid', 'id'];

const TABLE_MESSAGE_LOADING = 'Loading...';
const TABLE_MESSAGE_LOADING_DETAILS = 'Loading details...';
const TABLE_MESSAGE_EMPTY_DETAIL = 'Select an item to view details';
const TABLE_MESSAGE_RECORD_INFO = 'Record Information';
const TABLE_MESSAGE_AUTH_REQUIRED = 'Authentication Required';
const TABLE_MESSAGE_LOGIN_REQUIRED = 'Please log in to view this table.';
const TABLE_MESSAGE_FAILED_FETCH_ENTITY = 'Failed to fetch entity data';
const TABLE_MESSAGE_FAILED_FETCH_COMPONENT_TEMPLATE = 'Failed to fetch component template';
const TABLE_MESSAGE_FAILED_PARSE_COMPONENT_BINDINGS = 'Failed to parse component bindings JSON:';
const TABLE_MESSAGE_FAILED_LOAD_SUMMARY_COMPONENT = 'Failed to load summary component template';
const TABLE_MESSAGE_FAILED_LOAD_DATA = 'Failed to load data';
const TABLE_MESSAGE_ERROR_LOADING_DETAILS = 'Error Loading Details';
const TABLE_MESSAGE_RELOAD_PAGE = 'Reload Page';
const TABLE_MESSAGE_DETAILS = 'Details';
const TABLE_MESSAGE_NO_DETAILS_AVAILABLE = 'No details available';
const TABLE_MESSAGE_CLOSE = 'Close';
const TABLE_MESSAGE_RESIZE_PANEL = 'Drag to resize';
const TABLE_MESSAGE_CONFIRM_DELETE = 'Delete this record? This action cannot be undone.';
const TABLE_MESSAGE_CONFIRM_UNSAVED = 'You have unsaved changes in edit mode. Switch rows and lose those changes?';
const TABLE_MESSAGE_TOGGLE_BUTTON_NOT_FOUND = 'Toggle button not found';
const TABLE_MESSAGE_TABLE_SCHEMA_NOT_FOUND = 'Table Schema not found';
const TABLE_MESSAGE_FAILED_LOCALSTORAGE_READ = 'Failed to read from localStorage:';
const TABLE_MESSAGE_FAILED_LOCALSTORAGE_WRITE = 'Failed to write to localStorage:';
const TABLE_MESSAGE_SELECTED_UIDS = 'Selected UIDs:';

const TABLE_LOG_REDIRECTING = '🔄 Redirecting to:';
const TABLE_LOG_REFRESHING_PAGE = '🔄 Refreshing page';
const TABLE_LOG_CLOSING_VIEW = '❌ Closing current view';
const TABLE_LOG_STORED_ORIGINAL_PARENT = '💾 Stored original parent:';
const TABLE_LOG_STORED_VIEW_MODE = '💾 Stored view mode for';
const TABLE_LOG_SWITCHING_VIEW_MODE = '🔄 Switching view mode:';
const TABLE_LOG_START_VIEW_RERENDER = '🔧 Starting view re-render...';
const TABLE_LOG_DESTROYING_DATATABLE = '🗑️ Destroying existing DataTable';
const TABLE_LOG_FINDING_ORIGINAL_PARENT = '🔍 Table still in DataTables wrapper, finding original parent';
const TABLE_LOG_MOVING_TABLE_TO_ORIGINAL_PARENT = '📤 Moving table back to original parent';
const TABLE_LOG_USING_ORIGINAL_PARENT_FALLBACK = '⚠️ Using stored original parent as fallback';
const TABLE_LOG_MISSING_PARENT = '❌ Cannot find valid parent element';
const TABLE_LOG_USING_PARENT = '✅ Using parent:';
const TABLE_LOG_REMOVING_EXISTING_INBOX = '🗑️ Removing existing inbox container';
const TABLE_LOG_ATTACHING_TABLE_TO_PARENT = '📌 Attaching table to parent';
const TABLE_LOG_RENDERING_VIEW = '🎨 Rendering view:';
const TABLE_LOG_TABLE_VISIBLE = '📊 Table element visible:';
const TABLE_LOG_TABLE_IN_DOM = '📊 Table in DOM:';
const TABLE_LOG_VIEW_RERENDER_COMPLETE = '✅ View re-render complete';
const TABLE_LOG_MISSING_TABLE_ID = '❌ Missing table id';
const TABLE_LOG_INITIALIZING_TABLE = '📋 Initializing table:';
const TABLE_LOG_VIEW_MODE_SELECTION_CLEAR = '👁️ View mode changed, clearing selections';
const TABLE_LOG_RENDER_INBOX_VIEW = '📧 renderInboxView called for:';
const TABLE_LOG_CREATED_INBOX_CONTAINER = '📦 Created inbox container';
const TABLE_LOG_ASSEMBLED_INBOX_CONTAINER = '📦 Assembled inbox container structure';
const TABLE_LOG_INBOX_PARENT_MISSING = '❌ Cannot render inbox view: no valid parent';
const TABLE_LOG_PARENT_NODE_FOUND = '🔗 Parent node found:';
const TABLE_LOG_INSERTING_CONTAINER_BEFORE_TABLE = '📍 Table is in parent, inserting before it';
const TABLE_LOG_APPENDING_CONTAINER = '📍 Table not in parent, appending container';
const TABLE_LOG_INBOX_CONTAINER_INSERTED = '✅ Inbox container inserted into parent';
const TABLE_LOG_CONTAINER_PARENT = '📍 Container is now child of:';
const TABLE_LOG_INITIALIZING_INBOX_DATATABLE = '🎨 Initializing DataTable for inbox list';
const TABLE_LOG_INBOX_VIEW_READY = '✅ Inbox view ready for:';
const TABLE_LOG_INBOX_VIEW_FULLY_READY = '✅ Inbox view fully initialized for:';
const TABLE_LOG_APPLYING_INBOX_STICKY = '🎨 Applying sticky styles to inbox DataTable';
const TABLE_LOG_DT_CONTAINER_MISSING = '⚠️ DataTables container not found';
const TABLE_LOG_DT_CONTAINER_FOUND = '✅ Found DataTables container';
const TABLE_LOG_LAYOUT_ELEMENTS_FOUND = '📊 Found layout elements:';
const TABLE_LOG_ROW_LAYOUT = 'Row layout state:';
const TABLE_LOG_STYLED_TOP_CONTROLS = '✅ Styled top controls at row';
const TABLE_LOG_STYLED_SCROLL_TABLE = '✅ Styled scrollable table at row';
const TABLE_LOG_STYLED_BOTTOM_PAGINATION = '✅ Styled bottom pagination at row';
const TABLE_LOG_STICKY_STYLES_COMPLETE = '✅ Sticky styles application complete';
const TABLE_LOG_DATATABLE_READY = '✅ DataTable ready for:';
const TABLE_LOG_REQUEST_PAGE = '📄 Request page:';
const TABLE_LOG_PAGE_SIZE_CHANGED = '🔄 Page size changed:';
const TABLE_LOG_SERVING_FROM_CACHE = '✨ Serving from cache:';
const TABLE_LOG_CACHE_MISS = '🌐 Cache miss - fetching from API';
const TABLE_LOG_PREFETCHING = '🔮 Prefetching next batch at offset';
const TABLE_LOG_PREFETCH_COMPLETE = '✅ Prefetch complete:';
const TABLE_LOG_SELECTED_ROWS = '📋 Selected rows:';
const TABLE_LOG_SKIP_SUMMARY_SYNC = '⚠️ Skipping inbox summary sync because detail context is incomplete.';
const TABLE_LOG_SKIP_SUMMARY_DT_UPDATE = '⚠️ Inbox summary sync skipped DataTable row update because the inbox list table is unavailable.';
const TABLE_LOG_SUMMARY_SYNC_COMPLETE = '✅ Synced inbox summary row after detail update.';
const TABLE_LOG_SUMMARY_ROW_NOT_FOUND = '⚠️ Inbox summary sync could not find the selected row in the current DataTable page.';
const TABLE_LOG_SKIP_DETAIL_MODE_SWITCH = '⚠️ Skipping detail mode switch because detail context is incomplete.';
const TABLE_LOG_SWITCHING_DETAIL_MODE = '🔁 Switching inbox detail mode.';
const TABLE_LOG_OPENING_DETAIL_EDITOR = '📝 Opening inbox detail form editor from component view.';
const TABLE_LOG_SKIP_DETAIL_DELETE = '⚠️ Skipping inbox detail delete because entity context is incomplete.';
const TABLE_LOG_DETAIL_DELETE_CANCELLED = 'ℹ️ Inbox detail delete canceled by user.';
const TABLE_LOG_DELETING_DETAIL_RECORD = '🗑️ Deleting inbox detail record from component view.';
const TABLE_LOG_DETAIL_DELETE_FAILED = '❌ Inbox detail delete failed.';
const TABLE_LOG_DETAIL_DELETE_REQUEST_FAILED = '❌ Inbox detail delete request failed.';
const TABLE_LOG_DETAIL_DELETE_SUCCESS = '✅ Inbox detail record deleted successfully from component view.';
const TABLE_LOG_LOADING_DETAIL_PANEL = '📥 Loading inbox detail panel.';
const TABLE_LOG_RESOLVED_DETAIL_STRATEGY = '🧭 Resolved inbox detail strategy.';
const TABLE_LOG_NO_DETAIL_RENDERER = '⚠️ No configured inbox detail renderer was found; using fallback detail view.';
const TABLE_LOG_LOADING_DETAIL_ATTEMPT = '📋 Loading detail';
const TABLE_LOG_FAILED_DETAIL_ATTEMPT = '⚠️ Failed detail';
const TABLE_LOG_MISSING_FORM_SCHEMA = '⚠️ Detail resolved to a missing form schema';
const TABLE_LOG_DETAIL_COMPONENT_LOADED = '✅ Detail component loaded successfully for UID:';
const TABLE_LOG_ALL_DETAIL_RENDERERS_FAILED = '⚠️ All configured inbox detail renderers failed; using fallback detail view.';
const TABLE_LOG_DETAIL_COMPONENT_ERROR = '❌ Error loading inbox detail component.';

const TABLE_ROUTE_LOGIN = SHARED_UI_ROUTE.LOGIN || '/login';
const TABLE_ROUTE_EDIT_PREFIX = '/edit/';

const TABLE_OPTION_SELECT_STYLE_SINGLE = 'single';
const TABLE_VALUE_CHECKBOX_COLUMN_WIDTH = '40px';
const TABLE_STYLE_INBOX_CONTAINER = 'display: flex !important; height: 100%; min-height: 0; position: relative;';
const TABLE_STYLE_INBOX_LEFT_PANEL_OVERFLOW = 'hidden';
const TABLE_STYLE_INBOX_RIGHT_PANEL = 'flex: 1; overflow: auto;';
const TABLE_STYLE_LIST_TABLE = 'margin: 0; cursor: pointer; width: 100%;';
const TABLE_STYLE_RESIZER = 'width: 2px; cursor: col-resize; user-select: none; transition: background-color 0.15s ease, border-color 0.15s ease;';
const TABLE_STYLE_DISPLAY_FLEX = 'flex';
const TABLE_STYLE_FLEX_DIRECTION_COLUMN = 'column';
const TABLE_STYLE_HEIGHT_FULL = '100%';
const TABLE_STYLE_MIN_HEIGHT_ZERO = '0';
const TABLE_STYLE_OVERFLOW_HIDDEN = 'hidden';
const TABLE_STYLE_GUTTER_X_ZERO = '0';
const TABLE_STYLE_MARGIN_ZERO = '0';
const TABLE_STYLE_FLEX_AUTO = '1 1 auto';
const TABLE_STYLE_POSITION_RELATIVE = 'relative';
const TABLE_STYLE_POSITION_STICKY = 'sticky';
const TABLE_STYLE_OVERFLOW_X_AUTO = 'auto';
const TABLE_STYLE_OVERFLOW_Y_SCROLL = 'scroll';
const TABLE_STYLE_SCROLLBAR_GUTTER_STABLE = 'stable';
const TABLE_STYLE_OVERFLOW_VISIBLE = 'visible';
const TABLE_STYLE_TOP_ZERO = '0';
const TABLE_STYLE_ZINDEX_STICKY = '10';
const TABLE_STYLE_BACKGROUND_INHERIT = 'inherit';
