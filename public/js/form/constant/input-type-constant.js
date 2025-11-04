/** 
 * Input Type Constants
 * example:
 * INPUT_TYPE.TEXT = "text"
 */

const INPUT_TYPE = {
    TEXT : "text",
    PASSWORD : "password",
    EMAIL : "email",
    NUMBER : "number",
    DATE : "date",
    DATE_TIME_LOCAL : "datetime-local",
    TIME: "time",
    FILE : "file",
    TEXTAREA : "textarea",
    SELECT : "select",
    RADIO: "radio",
    CHECKBOX: "checkbox",
    DATALIST: "datalist",
    HIDDEN:"hidden",
    FORMID:"formId",
    



    TYPE_PASSWORD : "password",
     DATA_TYPE_DATETIME : "datetime",
     DTP_FORMAT_YEAR : "YYYY",
     DTP_FORMAT_MONTH : "MMM, YYYY",
     DTP_FORMAT_DATE : "MMM DD, YYYY",
     DTP_FORMAT_TIME : "HH:mm:ss",
    //  DTP_FORMAT_DATE_TIME : DTP_FORMAT_DATE + " " + DTP_FORMAT_TIME,
    /* datetime is default */
     DTP_VIEW_MODE_DATE_TIME : "datetime",
     DTP_VIEW_MODE_YEARS : "years",
     DTP_VIEW_MODE_MONTHS : "months",
     DTP_VIEW_MODE_DATE : "date",
     DTP_VIEW_MODE_TIME : "time",

     FORM_GROUP_CONTAINER : "<div class=\"form-floating\"></div>",
     INPUT_GROUP_CONTAINER : "<div class=\"input-group\"></div>"
}

INPUT_TYPE.DTP_FORMAT_DATE_TIME = `${INPUT_TYPE.DTP_FORMAT_DATE} ${INPUT_TYPE.DTP_FORMAT_TIME}`;


const SUFFIX = {
  ITEM: "-item",
  FIELD: "-field",
  LABEL: "-label",
  CONTAINER:"-container",
  HELP:"-help",
  LIST:"-list",

};