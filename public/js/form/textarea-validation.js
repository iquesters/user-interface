// textarea-validation.js
window.applyTextareaValidation = function (field, textarea) {
  if (!textarea) return;

  // ✅ Apply attributes for validation
  if (field.required) textarea.setAttribute(VALIDATION_KEYS.REQUIRED, "required");
  if (field.minLength) textarea.setAttribute(VALIDATION_KEYS.MIN_LENGTH, field.minLength);
  if (field.maxLength) textarea.setAttribute(VALIDATION_KEYS.MAX_LENGTH, field.maxLength);
  if (field.pattern) textarea.setAttribute(VALIDATION_KEYS.PATTERN, field.pattern);

  // ✅ Listen for validation errors
  textarea.addEventListener("invalid", () => {
    textarea.setCustomValidity(""); // reset any previous message
    const messages = field.messages;
    applyValidationMessage("textarea", field, textarea, messages);
  });

  // ✅ Clear custom message on input
  textarea.addEventListener("input", () => textarea.setCustomValidity(""));

  // ✅ Optional: check validity on blur for better UX
  // textarea.addEventListener("blur", () => textarea.reportValidity());
};
