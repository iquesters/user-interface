// select-validation.js
window.applySelectValidation = function (field, select) {
  if (!select) return;

  // ✅ Apply attributes
  if (field.required) select.setAttribute(VALIDATION_KEYS.REQUIRED, "required");

  // ✅ Add options if provided in field.options
  if (field.options && Array.isArray(field.options)) {
    select.innerHTML = ""; // clear existing
    field.options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.selected) option.selected = true;
      select.appendChild(option);
    });
  }

  // ✅ Listen for invalid event (fires on submit or checkValidity())
  select.addEventListener("invalid", () => {
    select.setCustomValidity(""); // reset message
    const messages = field.messages;
    applyValidationMessage("select", field, select, messages);
  });

  // ✅ Reset error message when user changes selection
  select.addEventListener("change", () => select.setCustomValidity(""));

  // ✅ Optional: validate immediately on blur
  select.addEventListener("blur", () => select.reportValidity());
};

