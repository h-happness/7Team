(() => {
  const API_BASE = window.API_BASE_URL || 'http://localhost:8080';

  function friendlyNetworkError() {
    // "Failed to fetch" is usually: backend not running / wrong port / CORS / mixed-content.
    return new Error(
      `Не удалось подключиться к бэкенду (${API_BASE}). ` +
      `Проверь: (1) бэкенд запущен, (2) порт совпадает, (3) фронт открыт через http:// (не file://). ` +
      `Если порт другой, задай window.API_BASE_URL (например, http://localhost:8100) перед подключением profile-api.js.`
    );
  }

  async function getJson(path, params = {}) {
    const url = new URL(`${API_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === 'undefined' || v === null) return;
      url.searchParams.set(k, String(v));
    });

    let res;
    try {
      res = await fetch(url.toString(), { method: 'GET' });
    } catch {
      throw friendlyNetworkError();
    }
    const text = await res.text();
    if (!res.ok) throw new Error(text && text.trim() ? text : `HTTP ${res.status}`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text && text.trim() ? text : 'Bad JSON');
    }
  }

  async function postForm(path, params = {}) {
    const body = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === 'undefined' || v === null) return;
      body.set(k, String(v));
    });

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body,
      });
    } catch {
      throw friendlyNetworkError();
    }
    const text = await res.text();
    if (!res.ok) throw new Error(text && text.trim() ? text : `HTTP ${res.status}`);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  window.TravaProfileApi = {
    fetchProfile: (email) => getJson('/profile', { email }),
    listProfiles: () => getJson('/profile/list'),
    updateProfile: (payload) => postForm('/profile/update', payload),
    addComment: (payload) => postForm('/profile/comment', payload),
    apiBase: API_BASE,
  };
})();
