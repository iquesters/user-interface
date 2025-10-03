/**
 * This file is capable of handling multiple custom input elements
 * 
 * 1. json-editor: This editor will help us to write better json
 */

// Global options for JSON Editor
const GLOBAL_JSON_EDITOR_OPTIONS = {
    mode: 'tree',
    modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // allowed modes
};

// get all the json editor elements
const jsonEditorElements = document.getElementsByClassName('json-editor') || [];

const jsonEditors = {};

Array.from(jsonEditorElements).forEach(element => {
    // create the editor
    GLOBAL_JSON_EDITOR_OPTIONS.onChangeText = ((jsonString) => {
        inputField = document.getElementById(element.dataset.input);
        inputField.innerHTML = jsonString
    });

    jsonEditors[element.id] = new JSONEditor(
        element,
        {
            ...GLOBAL_JSON_EDITOR_OPTIONS,
            ...(element?.options || {})
         }
    );
    // set json
    jsonEditors[element.id].set(JSON.parse(element.dataset?.jsonSchema || "{}"))
})