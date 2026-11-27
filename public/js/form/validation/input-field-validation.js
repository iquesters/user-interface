// HTML Form validation using native browser capabilities with custom messages.
window.applyFieldValidation = function (field, input) {
  if (!input) return;

  // ✅ Set attributes immediately so the browser knows how to validate
  if (field.required) input.setAttribute(VALIDATION_KEYS.REQUIRED, "required");
  if (field.minLength) input.setAttribute(VALIDATION_KEYS.MIN_LENGTH, field.minLength);
  if (field.maxLength) input.setAttribute(VALIDATION_KEYS.MAX_LENGTH, field.maxLength);
  if (field.pattern) input.setAttribute(VALIDATION_KEYS.PATTERN, field.pattern);
  // 0 is a real limit (e.g. "min": 0 for amounts): only a missing value is skipped.
  const given = (v) => v !== undefined && v !== null && v !== '';
  if (given(field.min)) input.setAttribute(VALIDATION_KEYS.MIN, field.min);
  if (given(field.max)) input.setAttribute(VALIDATION_KEYS.MAX, field.max);
  if (given(field.step)) input.setAttribute(VALIDATION_KEYS.STEP, field.step);
  if (typeof blockNegativeNumberKeys === 'function') blockNegativeNumberKeys(field, input);
  // Mobile keyboards and autofill: "inputmode": "numeric", "autocomplete": "one-time-code".
  if (given(field.inputmode)) input.setAttribute('inputmode', field.inputmode);
  if (given(field.autocomplete)) input.setAttribute('autocomplete', field.autocomplete);
  if (field.digitsOnly === true) keepDigitsOnly(field, input);


  // input type file
  if (field.accept) input.setAttribute(VALIDATION_KEYS.ACCEPT, field.accept);   // allowed types
  if (field.multiple) input.setAttribute(VALIDATION_KEYS.MULTIPLE, "multiple"); // allow multiple files
  if (field.capture) input.setAttribute(VALIDATION_KEYS.CAPTURE, field.capture); // capture camera for mobile
  if (field.maxSize) input.dataset.maxSize = field.maxSize;       // custom max size (MB) for JS validation
  

  applyDateTimeRestrictions(field, input);
  applyFieldDependencies(field, input);

  // ✅ Listen to invalid event (fires only when checkValidity() or submit is called)
  input.addEventListener("invalid", () => {
    input.setCustomValidity(""); // reset previous message
    const type = input.type;
    const messages = field.messages;
    applyValidationMessage(type, field, input, messages);

    // The form has novalidate set (see setupFormBlock in form-block-builder.js)
    // specifically so the browser's own popup never shows — setCustomValidity()
    // alone is invisible without it, so render the message through the same
    // visible error UI used for backend validation errors instead.
    const form = input.form;
    if (form && typeof appendDynamicFormFieldError === 'function') {
      appendDynamicFormFieldError(form, field, input.validationMessage);
    }
  });

  // ✅ Live validation: reset message when typing
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    input.classList.remove("is-invalid");
    setFieldMessage(input.id, "");
  });

  // ✅ Live, character-by-character requirement feedback — separate from the
  // submit-time "invalid" messaging above. Only attaches when the schema
  // actually declares complexity requirements for this field (login's
  // password has none of these, so it never attaches there).
  if (field.type === VALIDATION_KEYS.PASSWORD) {
    if (field.password_mixed_case || field.password_numbers || field.password_symbols || field.minLength) {
      input.addEventListener("input", () => updatePasswordRequirementHint(field, input));
    }

    if (field.confirms) {
      // Scoped to this field's own form — the classic and schema-driven
      // columns both have a field named "password", so an unscoped
      // document-wide query can grab the wrong one.
      const sourceInput = input.form?.querySelector(`[name="${field.confirms}"]`);
      input.addEventListener("input", () => updateConfirmationHint(field, input));
      if (sourceInput) {
        // Editing the original password after already typing the
        // confirmation should re-check the match too, not just typing
        // in the confirmation field itself.
        sourceInput.addEventListener("input", () => updateConfirmationHint(field, input));
      }
    }
  }

};

/**
 * Which of a password field's declared requirements the current value
 * doesn't satisfy yet, in plain-English fragments (e.g. "a number").
 */
function getPasswordRequirementGaps(field, value) {
  const gaps = [];
  const minLength = field.minLength || 8;

  if (value.length < minLength) {
    gaps.push(`at least ${minLength} characters`);
  }
  if (field.password_mixed_case && !(/[a-z]/.test(value) && /[A-Z]/.test(value))) {
    gaps.push("uppercase and lowercase letters");
  }
  if (field.password_numbers && !/[0-9]/.test(value)) {
    gaps.push("a number");
  }
  if (field.password_symbols && !/[^a-zA-Z0-9\s]/.test(value)) {
    gaps.push("a special character");
  }

  return gaps;
}

// Both live-hints below render through the same shared, pre-reserved
// message slot as backend errors (getOrCreateFieldMessageSlot/
// setFieldMessage in form-block-builder.js) — one slot per field, created
// during initial rendering, so height never shifts either way.

function updatePasswordRequirementHint(field, input) {
  const gaps = getPasswordRequirementGaps(field, input.value);
  setFieldMessage(input.id, gaps.length > 0 ? `Needs: ${gaps.join(", ")}.` : "");
}

function updateConfirmationHint(field, input) {
  const sourceInput = input.form?.querySelector(`[name="${field.confirms}"]`);

  if (!sourceInput || input.value === "") {
    setFieldMessage(input.id, "");
    return;
  }

  setFieldMessage(input.id, input.value !== sourceInput.value ? "Passwords do not match." : "");
}




function applyDateTimeRestrictions(field, input) {
    if (![
        INPUT_TYPE.DATE,
        INPUT_TYPE.DATETIME_LOCAL,
        INPUT_TYPE.MONTH,
        INPUT_TYPE.WEEK,
        INPUT_TYPE.TIME
    ].includes(field.type)) return;

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const nowDateTime = now.toISOString().slice(0, 16);
    const currentMonth = now.toISOString().slice(0, 7);
    const currentTime = now.toISOString().slice(11, 16);
    const year = now.getFullYear();
    const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    const currentWeek = `${year}-W${week.toString().padStart(2, "0")}`;

    const limits = {
        [INPUT_TYPE.DATE]: todayDate,
        [INPUT_TYPE.DATETIME_LOCAL]: nowDateTime,
        [INPUT_TYPE.MONTH]: currentMonth,
        [INPUT_TYPE.WEEK]: currentWeek,
        [INPUT_TYPE.TIME]: currentTime
    };

    if (field.disableFuture) {
        input.setAttribute(ATTR_CONS.MAX, limits[field.type]);
    } else if (field.disablePast) {
        input.setAttribute(ATTR_CONS.MIN, limits[field.type]);
    }

    // 🔁 Handle end-start relationship
    if (["endDate", "end_time"].includes(field.id) || field.name === "end_date") {
        const startInput =
            document.getElementById("startDate") ||
            document.getElementById("start_time") ||
            document.querySelector("[name='start_date']");
        if (startInput) {
            startInput.addEventListener("change", () => {
                input.setAttribute(ATTR_CONS.MIN, startInput.value);
            });
        }
    }
}




/**
 * 🔁 Handles conditional visibility of fields
 * Example use: hide endDate when isCurrent checkbox is checked
 */
function applyFieldDependencies(field, input) {
  if (!field.dependencies || !field.dependencies.hide) return;

  // Delay until DOM is ready (ensures dependent fields exist)
  setTimeout(() => {
    field.dependencies.hide.forEach(dep => {
      const depInput =
        document.getElementById(dep.id) ||
        document.querySelector(`[name="${dep.id}"]`) ||
        document.querySelector(`[name="${dep.id}[]"]`);
      if (!depInput) return;

      const checkHideCondition = () => {
        const depValue = depInput.type === INPUT_TYPE.CHECKBOX
          ? depInput.checked
          : depInput.value;

        // Evaluate hide condition
        const shouldHide =
          dep.operator === "===" ? depValue === dep.value :
          dep.operator === "!==" ? depValue !== dep.value :
          false;

        const container =
          document.getElementById((field._domId || field.id) + SUFFIX.CONTAINER) ||
          document.getElementById(field.id + SUFFIX.CONTAINER);
        if (container) container.style.display = shouldHide ? "none" : "";

        // Optional: clear input when hidden
        if (shouldHide) input.value = "";
      };

      // Run initially and whenever dependency changes
      checkHideCondition();
      depInput.addEventListener("change", checkHideCondition);
    });
  }, 0);
}




/**
 * A number field that can't go below 0 (e.g. an amount): the minus sign and
 * the exponent ("e") can't be typed or pasted in, so a negative number never
 * shows. The browser still checks "min" on submit.
 */
function blockNegativeNumberKeys(field, input) {
  const min = Number(field?.min);
  if (input?.type !== 'number' || field?.min === undefined || field?.min === null || field?.min === '' || !(min >= 0)) {
    return;
  }
  input.addEventListener('keydown', (e) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
  });
  input.addEventListener('input', () => {
    if (input.value !== '' && Number(input.value) < 0) input.value = String(Math.abs(Number(input.value)));
  });
}


/**
 * "digitsOnly": true (e.g. a verification code): only digits can be typed or
 * pasted, and no more than maxLength of them; spaces or dashes in a pasted
 * code are dropped.
 */
function keepDigitsOnly(field, input) {
  const max = Number(field?.maxLength) || null;
  input.setAttribute('inputmode', field?.inputmode || 'numeric');
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return; // shortcuts, arrows, Backspace
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });
  input.addEventListener('input', () => {
    let digits = String(input.value || '').replace(/\D+/g, '');
    if (max) digits = digits.slice(0, max);
    if (digits !== input.value) input.value = digits;
  });
}
