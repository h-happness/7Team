(() => {
  function $(id) {
    return document.getElementById(id);
  }

  function setAvatar(imgEl, letterEl, email, avatarDataUrl) {
    const firstLetter = (String(email || 'P').trim()[0] || 'P').toUpperCase();
    if (avatarDataUrl) {
      imgEl.src = avatarDataUrl;
      imgEl.style.display = 'block';
      letterEl.textContent = '';
    } else {
      imgEl.removeAttribute('src');
      imgEl.style.display = 'none';
      letterEl.textContent = firstLetter;
    }
  }

  function parseEmailParam() {
    const url = new URL(window.location.href);
    return (url.searchParams.get('email') || '').trim().toLowerCase();
  }

  function renderTags(container, interests) {
    container.innerHTML = '';
    const list = Array.isArray(interests) ? interests : [];
    if (list.length === 0) {
      const muted = document.createElement('div');
      muted.className = 'muted';
      muted.textContent = 'Нет интересов';
      container.appendChild(muted);
      return;
    }
    list.forEach((v) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = v;
      container.appendChild(tag);
    });
  }

  function renderComments(container, comments) {
    container.innerHTML = '';
    const list = Array.isArray(comments) ? comments : [];
    if (list.length === 0) {
      const muted = document.createElement('div');
      muted.className = 'muted';
      muted.textContent = 'Комментариев пока нет';
      container.appendChild(muted);
      return;
    }

    list.forEach((c) => {
        const item = document.createElement('div');
        item.className = 'comment';

        const meta = document.createElement('div');
        meta.className = 'meta';
        const who = c.authorName || c.authorEmail || 'Аноним';
        const when = c.createdAt ? new Date(c.createdAt).toLocaleString() : '';
        meta.textContent = when ? `${who} • ${when}` : who;

        const text = document.createElement('div');
        text.className = 'text';
        text.textContent = c.text || '';

        item.appendChild(meta);
        item.appendChild(text);
        container.appendChild(item);
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const api = window.TravaProfileApi;
    if (!api) return;

    const targetEmail = parseEmailParam();
    if (!targetEmail) {
      $('view-title').textContent = 'Профиль не найден';
      $('comment-hint').textContent = 'Не указан email в ссылке.';
      return;
    }

    const avatarImg = $('view-avatar-img');
    const avatarLetter = $('view-avatar-letter');
    const commentsEl = $('comments');

    function applyProfile(profile) {
      $('view-title').textContent = profile.displayName || 'Профиль';
      $('view-email').textContent = profile.email;
      $('view-name').textContent = profile.displayName || profile.email;
      $('view-bio').textContent = profile.bio || '—';
      renderTags($('view-interests'), profile.interests);
      setAvatar(avatarImg, avatarLetter, profile.email, profile.avatarDataUrl);
      renderComments(commentsEl, profile.comments);
    }

    function loadProfile() {
      return api.fetchProfile(targetEmail)
        .then((profile) => {
          applyProfile(profile);
          return profile;
        })
        .catch(() => {
          $('view-title').textContent = 'Профиль не найден';
          $('view-email').textContent = targetEmail;
          $('comment-hint').textContent = 'Пользователь не найден или бэкенд недоступен.';
          return null;
        });
    }

    const currentEmail = String(localStorage.getItem('trava_email') || '').trim().toLowerCase();
    const commentForm = $('comment-form');
    const hint = $('comment-hint');

    if (!currentEmail) {
      hint.textContent = 'Чтобы оставить комментарий, нужно войти.';
      commentForm.style.display = 'none';
      // Still show profile info for guests.
      loadProfile();
      return;
    }

    if (currentEmail === targetEmail) {
      hint.textContent = 'Это ваш профиль. Посмотреть его можно, редактировать — на странице "Профиль".';
    } else {
      hint.textContent = '';
    }

    commentForm.style.display = '';
    loadProfile();
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('comment-message');
      msg.textContent = '';
      msg.className = 'message';

      const text = ($('comment-text').value || '').trim();
      if (!text) {
        msg.textContent = 'Комментарий не должен быть пустым';
        msg.classList.add('error');
        return;
      }

      api.addComment({
        targetEmail,
        authorEmail: currentEmail,
        text,
      })
        .then(() => loadProfile())
        .then(() => {
          $('comment-text').value = '';
          msg.textContent = 'Отправлено';
          msg.classList.add('success');
        })
        .catch((err) => {
          msg.textContent = (err && err.message) ? err.message : 'Ошибка отправки';
          msg.classList.add('error');
        });
    });
  });
})();
