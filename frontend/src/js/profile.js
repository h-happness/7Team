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
    const avatarFileNameEl = $('avatar-file-name');
    let interests = [];
    let avatarDataUrl = '';

    function setAvatarFileLabel(text) {
      if (!avatarFileNameEl) return;
      avatarFileNameEl.textContent = text || '';
    }

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
          // Avoid showing native "no file chosen" text; show a friendly state instead.
          setAvatarFileLabel(avatarDataUrl ? 'Аватар уже загружен' : '');
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
      if (!file) {
        setAvatarFileLabel(avatarDataUrl ? 'Аватар уже загружен' : '');
        return;
      }
      if (!String(file.type || '').startsWith('image/')) return;
      setAvatarFileLabel(file.name);

      const msg = $('save-message');
      msg.textContent = '';
      msg.className = 'message';

      // Backend currently accepts form-urlencoded; big data URLs can be rejected by server limits.
      // Compress + resize client-side to keep payload small.
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = String(reader.result || '');

          const img = new Image();
          img.onload = () => {
            const maxSide = 512;
            const w = img.naturalWidth || img.width || 1;
            const h = img.naturalHeight || img.height || 1;
            const scale = Math.min(1, maxSide / Math.max(w, h));
            const cw = Math.max(1, Math.round(w * scale));
            const ch = Math.max(1, Math.round(h * scale));

            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');
            ctx.drawImage(img, 0, 0, cw, ch);

            // JPEG drastically reduces size; quality can be tuned if needed.
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            avatarDataUrl = compressed;
            setAvatar($('avatar-box'), avatarImg, avatarLetter, email, avatarDataUrl);

            // Warn if still too big (rough heuristic).
            if (avatarDataUrl.length > 1_500_000) {
              msg.textContent = 'Аватар все еще слишком большой. Попробуй выбрать картинку меньшего размера.';
              msg.classList.add('error');
            } else {
              // No success text here; user saves via "Сохранить".
              msg.textContent = '';
            }
          };
          img.onerror = () => {
            throw new Error('Не удалось прочитать изображение');
          };
          img.src = dataUrl;
        } catch (err) {
          msg.textContent = (err && err.message) ? err.message : 'Не удалось обработать изображение';
          msg.classList.add('error');
        }
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
