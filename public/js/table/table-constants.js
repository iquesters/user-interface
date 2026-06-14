/**
 * Shared table constants only.
 * Keep this file free of runtime state so other table modules can depend on a predictable constants surface.
 */

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
const TABLE_SELECTOR_DETAIL_CONTENT = '.inbox-detail-content';
const TABLE_SELECTOR_ROW_CHECKBOX = '.row-checkbox';
const TABLE_SELECTOR_ACTIVE_EDIT_FORM = '.inbox-detail-content .lab-form[data-form-mode="edit"], .inbox-detail-content .shoz-form[data-form-mode="edit"]';
const TABLE_SELECTOR_TABLE_SKELETON = '.table-skeleton';
const TABLE_SELECTOR_DETAIL_FORM = '.lab-form, .shoz-form';

const TABLE_ID_SELECT_ALL = 'select-all-table';
const TABLE_ID_SELECT_ALL_INBOX = 'select-all-inbox';

const TABLE_ATTRIBUTE_ENTITY_UID = 'data-entity-uid';

const TABLE_CLASS_HIDDEN = 'd-none';

const TABLE_EVENT_UI_CLOSE = 'ui-close';
const TABLE_EVENT_INBOX_DETAIL_LOADED = 'inboxDetailLoaded';

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

const TABLE_ROUTE_LOGIN = '/login';
