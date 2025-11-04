// datalist-validation.js
window.applyDatalistValidation = function (field, input, datalist) {
  if (!input) return;

  // ✅ Apply standard attributes
  if (field.required) input.setAttribute(VALIDATION_KEYS.REQUIRED, "required");
  if (field.minLength) input.setAttribute(VALIDATION_KEYS.MIN_LENGTH, field.minLength);
  if (field.maxLength) input.setAttribute(VALIDATION_KEYS.MAX_LENGTH, field.maxLength);
  if (field.pattern) input.setAttribute(VALIDATION_KEYS.PATTERN, field.pattern);

   // ✅ Listen for invalid event (like you did for <select>)
    input.addEventListener("invalid", () => {
        input.setCustomValidity(""); // reset message
        const messages = field.messages;
        applyValidationMessage("datalist", field, input, messages);
    });

  // ✅ Listen to events
  input.addEventListener("input", () => {
    input.setCustomValidity(""); // reset
  });

  // input.addEventListener("blur", () => {
  //   input.reportValidity();
  // });

};
