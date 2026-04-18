(() => {
  const REQUIRED_MESSAGE = 'Поле не должно быть пустым';
  const EMAIL_MESSAGE = 'Введите корректный email';

  /**
   * Treat whitespace-only input as empty.
   * Also surfaces a nice inline message instead of the browser popup.
   */
  function validateInput(input) {
    const raw = input.value ?? '';
    const value = String(raw);
    const trimmed = value.trim();

    // Required + whitespace-only
    if (input.required && trimmed.length === 0) {
      return REQUIRED_MESSAGE;
    }

    // Keep native type=email semantics, but show our own message.
    if (input.type === 'email' && trimmed.length > 0 && input.validity.typeMismatch) {
      return EMAIL_MESSAGE;
    }

    return '';
  }

  function getErrorEl(input) {
    // Convention: <input id="x"> has <div id="x-error"> next to it
    if (!input.id) return null;
    return document.getElementById(`${input.id}-error`);
  }

  function setError(input, message) {
    const errorEl = getErrorEl(input);
    if (errorEl) errorEl.textContent = message;

    if (message) input.classList.add('input-error');
    else input.classList.remove('input-error');
  }

  function wireForm(form) {
    const inputs = Array.from(form.querySelectorAll('input'));

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        setError(input, validateInput(input));
      });

      input.addEventListener('blur', () => {
        setError(input, validateInput(input));
      });
    });

    form.addEventListener('submit', (e) => {
      let firstInvalid = null;

      inputs.forEach((input) => {
        const message = validateInput(input);
        setError(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-auth-form]');
    forms.forEach(wireForm);
  });
})();

