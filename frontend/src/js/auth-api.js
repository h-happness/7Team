(() => {
  // By default we call relative URLs (same origin).
  // If you run the frontend separately, you can set window.API_BASE_URL in the console.
  // Default points to the Spring Boot backend.
  const API_BASE = window.API_BASE_URL || 'http://localhost:8080';

  function setFormMessage(form, message, kind) {
    const el = form.querySelector('.form-message');
    if (!el) return;
    el.textContent = message || '';
    el.classList.remove('error', 'success');
    if (kind) el.classList.add(kind);
  }

  async function postFormUrlencoded(path, params) {
    const body = new URLSearchParams(params);
    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body,
      });
    } catch (e) {
      // Typically network/CORS. We don't touch backend, so suggest local proxy server.
      throw new Error(
        'Не удалось подключиться к бэкенду. Проверь, что он запущен на http://localhost:8080'
      );
    }

    const text = await res.text();
    if (!res.ok) {
      const trimmed = (text || '').trim();
      const looksLikeHtml = /<!doctype html|<html|<title>/i.test(trimmed);

      // Most common case: frontend opened via a static server (WebStorm/LiveServer),
      // so "/auth/*" hits that server and returns a 404 HTML page.
      if (res.status === 404 && looksLikeHtml && API_BASE === 'http://localhost:8080') {
        throw new Error(
          'Бэкенд вернул 404. Проверь, что он запущен и что эндпоинты доступны: POST http://localhost:8080/auth/register и POST http://localhost:8080/auth/login'
        );
      }

      const msg = trimmed.length
        ? (looksLikeHtml ? `HTTP ${res.status}` : trimmed)
        : `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }

    return text;
  }

  function disableForm(form, disabled) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = disabled;
  }

  function wireLogin(form) {
    // Friendly message after registration redirect
    const url = new URL(window.location.href);
    if (url.searchParams.get('registered') === '1') {
      setFormMessage(form, 'Регистрация успешна. Теперь можно войти.', 'success');
    }

    form.addEventListener('submit', async (e) => {
      // If the validation script already blocked submit, do nothing.
      if (e.defaultPrevented) return;
      e.preventDefault();

      const email = (form.querySelector('input[name="email"]')?.value || '').trim();
      const password = (form.querySelector('input[name="password"]')?.value || '').trim();

      setFormMessage(form, '', null);
      disableForm(form, true);

      try {
        await postFormUrlencoded('/auth/login', { email, password });
        localStorage.setItem('trava_email', email);
        window.location.href = 'main.html';
      } catch (err) {
        const msg = (err && err.message) ? err.message : 'Ошибка входа';
        setFormMessage(form, msg, 'error');
      } finally {
        disableForm(form, false);
      }
    });
  }

  function wireRegister(form) {
    form.addEventListener('submit', async (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();

      const name = (form.querySelector('input[name="name"]')?.value || '').trim();
      const email = (form.querySelector('input[name="email"]')?.value || '').trim();
      const password = (form.querySelector('input[name="password"]')?.value || '').trim();

      setFormMessage(form, '', null);
      disableForm(form, true);

      try {
        // Backend uses only email/password, but extra params are harmless.
        await postFormUrlencoded('/auth/register', { name, email, password });
        localStorage.setItem('trava_email', email);
        window.location.href = 'login.html?registered=1';
      } catch (err) {
        const msg = (err && err.message) ? err.message : 'Ошибка регистрации';
        setFormMessage(form, msg, 'error');
      } finally {
        disableForm(form, false);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[data-auth-form="login"]');
    if (loginForm) wireLogin(loginForm);

    const registerForm = document.querySelector('form[data-auth-form="register"]');
    if (registerForm) wireRegister(registerForm);
  });
})();
