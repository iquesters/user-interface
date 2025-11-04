// HTML Form validation using native browser capabilities with custom messages.
window.applyFieldValidation = function (field, input) {
  if (!input) return;

  // ✅ Set attributes immediately so the browser knows how to validate
  if (field.required) input.setAttribute(VALIDATION_KEYS.REQUIRED, "required");
  if (field.minLength) input.setAttribute(VALIDATION_KEYS.MIN_LENGTH, field.minLength);
  if (field.maxLength) input.setAttribute(VALIDATION_KEYS.MAX_LENGTH, field.maxLength);
  if (field.pattern) input.setAttribute(VALIDATION_KEYS.PATTERN, field.pattern);
  if (field.min) input.setAttribute(VALIDATION_KEYS.MIN, field.min);
  if (field.max) input.setAttribute(VALIDATION_KEYS.MAX, field.max);
  if (field.step) input.setAttribute(VALIDATION_KEYS.STEP, field.step);


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
  });

  // ✅ Live validation: reset message when typing
  input.addEventListener("input", () => input.setCustomValidity(""));

};




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
      const depInput = document.getElementById(dep.id);
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

        const container = document.getElementById(field.id + SUFFIX.CONTAINER);
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



