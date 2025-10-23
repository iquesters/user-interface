window.applyValidationMessage = function (type, field, input, messages) {
  // console.log("type received:", type, "input:", input); 

  // ✅ Attach "change" event listener for file inputs (only once)
  if (type === VALIDATION_KEYS.FILE && !input.dataset.validationAttached) {
    input.addEventListener("change", function () {
      // Call validation again when file is changed
      window.applyValidationMessage(VALIDATION_KEYS.FILE, field, input, messages);
    });
    input.dataset.validationAttached = "true"; // Prevent multiple listeners
  }





  // ✅ Global check for "required" — applies to ALL input types
  if (!input || !input.validity) return; // ✅ Stop if input not ready
  if (!messages) return; // ✅ Stop if no messages provided
  if (input.validity.valueMissing && !!messages.required) {
    input.setCustomValidity(messages.required);
    return; // stop here, no need to check other rules
  }
  
  switch (type) {
    case VALIDATION_KEYS.TEXT:
    case VALIDATION_KEYS.PASSWORD:
    case VALIDATION_KEYS.EMAIL:
    // case VALIDATION_KEYS.TEXTAREA: 
      switch (true) {
        case input.validity.tooShort && !!messages.minLength:
          input.setCustomValidity(messages.minLength);
          break;

        case input.validity.tooLong && !!messages.maxLength:
          input.setCustomValidity(messages.maxLength);
          break;

        case input.validity.patternMismatch && !!messages.pattern:
          input.setCustomValidity(messages.pattern);
          break;

        default:
          // no custom message -> browser default message
          break;
      }
      break;



    // TEXTAREA 
    case VALIDATION_KEYS.TEXTAREA:
      const value = input.value.trim();

      const minLen = field.minLength || 0;
      const maxLen = field.maxLength || Infinity;

      // Manual validation since textarea may not have minlength, maxlength, or pattern attributes
      switch (true) {
        case !!messages.minLength && value.length < minLen:
          input.setCustomValidity(messages.minLength);
          break;

        case !!messages.maxLength && value.length > maxLen:
          input.setCustomValidity(messages.maxLength);
          break;

        case !!messages.pattern && field.pattern && !new RegExp(field.pattern).test(value):
          input.setCustomValidity(messages.pattern);
          break;

        // All good
        default:
          input.setCustomValidity('');
          break;
      }
      break;








    case VALIDATION_KEYS.NUMBER:
    case VALIDATION_KEYS.DATE:
    case VALIDATION_KEYS.DATE_TIME_LOCAL:
    case VALIDATION_KEYS.TIME:
      switch (true) {
        case input.validity.rangeUnderflow && !!messages.min:
          input.setCustomValidity(messages.min);
          break;

        case input.validity.rangeOverflow && !!messages.max:
          input.setCustomValidity(messages.max);
          break;

        default:
          // no custom message -> browser default message
          break;
      }
      break;

    case VALIDATION_KEYS.FILE:
      console.log("file");
      switch (true) {
        case input.validity.typeMismatch && !!messages.accept:
          input.setCustomValidity(messages.accept);
          break;
        
        case field.maxSize && input.files[0] && input.files[0].size > field.maxSize && !!messages.maxSize:
          input.setCustomValidity(messages.maxSize);
          break;

        default:
          input.setCustomValidity("");
          break;
      }
      break;

    case VALIDATION_KEYS.RADIO:
      switch (true) {
        case !document.querySelector(`input[name="${field.id}"]:checked`) && !!messages.required:
          input.setCustomValidity(messages.required);
          break;
        default:
          break;
      }
      break;

    case VALIDATION_KEYS.CHECKBOX:
      switch (true) {
        case !input.checked && !!messages.required:
          input.setCustomValidity(messages.required);
          break;
        default:
          break;
      }
      break;


    default:
      // add other types if needed
      break;
  }
};
