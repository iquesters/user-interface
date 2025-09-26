<?php

namespace Iquesters\UserInterface\Constants;

class FormValidationStatus
{
    // Form input types
    const TEXT             = 'text';
    const PASSWORD         = 'password';
    const EMAIL            = 'email';
    const NUMBER           = 'number';
    const DATE             = 'date';
    const DATE_TIME_LOCAL  = 'datetime-local';
    const TIME             = 'time';
    const FILE             = 'file';
    const TEXTAREA         = 'textarea';
    const SELECT           = 'select';
    const RADIO            = 'radio';
    const CHECKBOX         = 'checkbox';
    const DATALIST         = 'datalist';

    // Basic requirements
    const REQUIRED         = 'required';
    const DISABLED         = 'disabled';
    const READONLY         = 'readonly';

    // Length constraints
    const MIN_LENGTH       = 'minLength';
    const MAX_LENGTH       = 'maxLength';
    const SIZE             = 'size';

    // Pattern matching
    const PATTERN          = 'pattern';

    // Placeholder
    const PLACEHOLDER      = 'placeholder';

    // Number/date range constraints
    const MIN              = 'min';
    const MAX              = 'max';
    const STEP             = 'step';

    // Input attributes
    const TYPE             = 'type';        // text, number, email, etc.
    const VALUE            = 'value';
    const DEFAULT_VALUE    = 'defaultValue';

    // Name & ID
    const NAME             = 'name';
    const ID               = 'id';

    // Autocomplete & focus behavior
    const AUTOFOCUS        = 'autofocus';
    const AUTOCOMPLETE     = 'autocomplete';

    // File input attributes
    const ACCEPT           = 'accept';
    const MULTIPLE         = 'multiple';
    const CAPTURE          = 'capture';     // for mobile file inputs
    const INVALIDTYPE      = 'invalidType'; // custom error message for invalid file type

    // Other useful attributes
    const INPUT_MODE       = 'inputmode';   // numeric, text, email etc.
    const LIST             = 'list';        // datalist id
}
