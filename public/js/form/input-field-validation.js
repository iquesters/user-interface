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
  

  // ✅ Listen to invalid event (fires only when checkValidity() or submit is called)
  input.addEventListener("invalid", () => {
    input.setCustomValidity(""); // reset previous message
    const type = input.type;
    const messages = field.messages;
    applyValidationMessage(type, field, input, messages);
  });

  // ✅ Live validation: reset message when typing
  input.addEventListener("input", () => input.setCustomValidity(""));

  // ✅ Live validation: check on blur (optional but useful)
  input.addEventListener("blur", () => input.reportValidity());
};

