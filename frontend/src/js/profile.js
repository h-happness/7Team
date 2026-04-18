(() => {
  function $(id) {
    return document.getElementById(id);
  }

  function setAvatar(box, imgEl, letterEl, email, avatarDataUrl) {
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

  function renderInterests(container, interests, onRemove) {
    container.innerHTML = '';
    (interests || []).forEach((value, idx) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = value;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Удалить интерес');
      btn.textContent = '×';
      btn.addEventListener('click', () => onRemove(idx));

      tag.appendChild(btn);
      container.appendChild(tag);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const api = window.TravaProfileApi;
    if (!api) return;

    const email = String(localStorage.getItem('trava_email') || '').trim().toLowerCase();
    if (!email) {
      window.location.href = 'login.html';
      return;
    }

    $('my-email').textContent = email;

    const avatarImg = $('avatar-img');
    const avatarLetter = $('avatar-letter');
    const interestsEl = $('interests');
    let interests = [];
    let avatarDataUrl = '';

    function updateInterests() {
      renderInterests(interestsEl, interests, (idx) => {
        interests.splice(idx, 1);
        updateInterests();
      });
    }

    function renderUsersList(container, profiles, currentEmail) {
      container.innerHTML = '';
      const others = (profiles || []).filter((p) => (p.email || '') !== currentEmail);

      if (others.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'muted';
        empty.textContent = 'Пока нет других пользователей.';
        container.appendChild(empty);
        return;
      }

      others.forEach((p) => {
        const row = document.createElement('div');
        row.className = 'user-item';

        const left = document.createElement('div');
        const a = document.createElement('a');
        a.href = `profile-view.html?email=${encodeURIComponent(p.email)}`;
        a.textContent = p.displayName || p.email;
        left.appendChild(a);

        const right = document.createElement('div');
        right.className = 'muted';
        right.textContent = p.email;

        row.appendChild(left);
        row.appendChild(right);
        container.appendChild(row);
      });
    }

    function refreshUsers() {
      api.listProfiles()
        .then((profiles) => {
          renderUsersList($('user-list'), profiles, email);
        })
        .catch(() => {
          renderUsersList($('user-list'), [], email);
        });
    }

    function load() {
      api.fetchProfile(email)
        .then((p) => {
          $('display-name').value = p.displayName || '';
          $('bio').value = p.bio || '';
          interests = Array.isArray(p.interests) ? [...p.interests] : [];
          avatarDataUrl = p.avatarDataUrl || '';
          setAvatar($('avatar-box'), avatarImg, avatarLetter, email, avatarDataUrl);
          updateInterests();
          refreshUsers();
        })
        .catch(() => {
          // If backend has no profile yet, keep empty UI.
          updateInterests();
          refreshUsers();
        });
    }

    updateInterests();
    load();

    $('add-interest').addEventListener('click', () => {
      const raw = $('interest-input').value || '';
      const v = raw.trim();
      if (!v) return;
      if (interests.some((x) => String(x).toLowerCase() === v.toLowerCase())) {
        $('interest-input').value = '';
        return;
      }
      interests.push(v);
      $('interest-input').value = '';
      updateInterests();
    });

    $('avatar-file').addEventListener('change', () => {
      const file = $('avatar-file').files && $('avatar-file').files[0];
      if (!file) return;
      if (!String(file.type || '').startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result || '');
        setAvatar($('avatar-box'), avatarImg, avatarLetter, email, url);
        avatarDataUrl = url;
      };
      reader.readAsDataURL(file);
    });

    $('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('save-message');
      msg.textContent = '';
      msg.className = 'message';

      const displayName = ($('display-name').value || '').trim();
      const bio = ($('bio').value || '').trim();

      try {
        const interestsCsv = interests.join(', ');
        await api.updateProfile({
          email,
          displayName,
          bio,
          interests: interestsCsv,
          avatarDataUrl,
        });

        msg.textContent = 'Сохранено';
        msg.classList.add('success');
        refreshUsers();
      } catch (err) {
        msg.textContent = (err && err.message) ? err.message : 'Ошибка сохранения';
        msg.classList.add('error');
      }
    });
  });
})();
