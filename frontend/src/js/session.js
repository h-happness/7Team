(() => {
  function getEmail() {
    return String(localStorage.getItem('trava_email') || '').trim().toLowerCase();
  }

  function logout() {
    localStorage.removeItem('trava_email');
  }

  function applyNavState() {
    const email = getEmail();
    const isAuthed = Boolean(email);

    document.querySelectorAll('[data-auth="in"]').forEach((el) => {
      el.style.display = isAuthed ? '' : 'none';
    });
    document.querySelectorAll('[data-auth="out"]').forEach((el) => {
      el.style.display = isAuthed ? 'none' : '';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyNavState();

    document.querySelectorAll('[data-logout]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        window.location.href = 'main.html';
      });
    });
  });
})();
