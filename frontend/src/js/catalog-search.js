(() => {
  const TYPE_LABEL = {
    ATTRACTION: 'Достопримечательность',
    RESTAURANT: 'Ресторан',
    HOTEL: 'Отель',
  };

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function starString(rating) {
    const r = Number(rating || 0);
    const full = Math.min(5, Math.floor(r));
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  function renderReviews(reviews, placeId) {
    const currentEmail = localStorage.getItem('trava_email');
    const isAdmin = window._isAdmin === true;

    

    if (!reviews || reviews.length === 0) {
      return '<div class="muted" style="padding:10px">Отзывов пока нет</div>';
    }
    return reviews.map(r => `
      <div class="comment" style="margin:8px 0; padding:10px; border:1px solid #e8d5c4; border-radius:8px; background:#fffdfb; position:relative;">
        <div style="font-size:12px; color:#7a6656; margin-bottom:4px;">
          ${escapeHtml(r.user?.displayName || r.user?.email || 'Пользователь')} • 
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          ${isAdmin ? `<button onclick="deleteReview(${r.id}, ${placeId})" style="margin-left:10px; background:#c62828; color:white; border:none; padding:2px 8px; border-radius:4px; cursor:pointer; font-size:11px;">Удалить</button>` : ''}
        </div>
        <div>${escapeHtml(r.text || '')}</div>
      </div>
    `).join('');
}

  function getReviewFormHtml(placeId) {
    const email = localStorage.getItem('trava_email');
    if (!email) {
      return `<div class="muted" style="padding:10px">
        <a href="login.html" style="color:#492308">Войдите</a> чтобы оставить отзыв
      </div>`;
    }
    return `
      <div style="margin-top:12px;">
        <div style="margin-bottom:8px;">
          <label style="font-weight:600; color:#4a3220;">Оценка:</label>
          <select id="review-rating-${placeId}" style="margin-left:8px; padding:4px 8px; border-radius:6px; border:1px solid #d6c2b3;">
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
        <textarea id="review-text-${placeId}" placeholder="Напишите отзыв..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #d6c2b3; min-height:80px; font-family:inherit; resize:vertical;"></textarea>
        <button onclick="submitReview(${placeId})" 
          style="margin-top:8px; background:#492308; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
          Отправить
        </button>
        <div id="review-msg-${placeId}" style="margin-top:6px; font-size:13px;"></div>
      </div>
    `;
}

    function renderCard(place) {
        const imgSrc = place.image || '../../img/main/world.png';
        const email = localStorage.getItem('trava_email');
        return `
    <div class="card" id="place-card-${place.id}">
        
        <div class="card-images single">
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(place.name)}">
        </div>
        <div class="card-content" style="cursor:pointer">
            <a href="place.html?id=${place.id}" style="text-decoration:none; color:inherit;">
                <h2>${escapeHtml(place.name)}</h2>
            </a>
          <div class="meta">
            <span class="pill">${escapeHtml(place.country)}${place.city ? ', ' + escapeHtml(place.city) : ''}</span>
            <span class="pill">${escapeHtml(TYPE_LABEL[place.type] || place.type)}</span>
            <span class="pill">Рейтинг: ${place.rating} ${starString(place.rating)}</span>
          </div>
          <p>${escapeHtml(place.description || '')}</p>
          
            <button onclick="toggleReviews(${place.id}); event.stopPropagation()"
                    style="background:none; border:none; color:#492308; font-size:13px; cursor:pointer; text-decoration:underline;">
              Нажмите чтобы посмотреть отзывы ▼
            </button>
            <button onclick="toggleFavorite(${place.id})" 
            id="fav-btn-${place.id}"
            style="background:none; border:none; font-size:20px; cursor:pointer; padding:4px;">
            ${window._favoriteIds?.includes(place.id) ? '❤️' : '🤍'}
            </button>
          ${window._isAdmin && place.userAdded ? `
            <button onclick="deletePlace(${place.id})"
              style="margin-top:8px; background:#c62828; color:white; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:13px;">
              Удалить место
            </button>` : ''}
        </div>
      <div id="reviews-${place.id}" style="display:none; padding:16px; border-top:1px solid #e8d5c4;">
        <h3 style="color:#643411; margin-bottom:10px;">Отзывы</h3>
        <div id="reviews-list-${place.id}">Загрузка...</div>
        <h3 style="color:#643411; margin-top:14px; margin-bottom:8px;">Оставить отзыв</h3>
        ${getReviewFormHtml(place.id)}
      </div>
    </div>
  `;
    }


  function renderResults(container, items) {
      if (!items || items.length === 0) {
          container.innerHTML = `<div class="empty"><p>🔍 Ничего не найдено.</p></div>`;
          return;
      }
      if (items.length === 1) {
          container.classList.add('single-card');
      } else {
          container.classList.remove('single-card');
      }
      container.innerHTML = items.map(renderCard).join('');
    }

  // Глобальные функции для onclick
  window.toggleReviews = async function(placeId) {
    const block = document.getElementById(`reviews-${placeId}`);
    if (!block) return;

    const isOpen = block.style.display !== 'none';

  
    // Закрываем все открытые блоки
    document.querySelectorAll('[id^="reviews-"]:not([id^="reviews-list-"]):not([id^="reviews-msg-"])').forEach(el => {
        el.style.display = 'none';
    });

    // Если блок был закрыт — открываем его
    if (!isOpen) {
        block.style.display = 'block';
        const list = document.getElementById(`reviews-list-${placeId}`);
        try {
            const reviews = await window.TravaPlacesProvider.getReviews(placeId);
            list.innerHTML = renderReviews(reviews, placeId);
        } catch {
            list.innerHTML = '<div class="muted">Не удалось загрузить отзывы</div>';
        }
    }
};

  window.submitReview = async function(placeId) {
    console.log('submitReview called', placeId); // добавь эту строку
    const email = localStorage.getItem('trava_email');
    
    if (!email) return;

    const text = document.getElementById(`review-text-${placeId}`)?.value?.trim();
    const rating = Number(document.getElementById(`review-rating-${placeId}`)?.value);
    const msg = document.getElementById(`review-msg-${placeId}`);

    if (!text) {
      msg.textContent = 'Напишите текст отзыва';
      msg.style.color = '#c62828';
      return;
    }

    try {
      const profileRes = await fetch(`http://localhost:8080/profile?email=${encodeURIComponent(email)}`);
      const profile = await profileRes.json();

      console.log('profile:', profile); // добавь эту строку

      await window.TravaPlacesProvider.addReview(placeId, profile.id, text, rating);

      const list = document.getElementById(`reviews-list-${placeId}`);
      const reviews = await window.TravaPlacesProvider.getReviews(placeId);
      
      console.log('reviews:', reviews);
      
      list.innerHTML = renderReviews(reviews, placeId);

      const placeRes = await fetch(`http://localhost:8080/places/${placeId}`);
      const placeData = await placeRes.json();
      const ratingPill = document.querySelector(`#place-card-${placeId} .pill:nth-child(3)`);
      if (ratingPill) {
          ratingPill.textContent = `Рейтинг: ${placeData.place.rating} ${starString(placeData.place.rating)}`;
      }

      document.getElementById(`review-text-${placeId}`).value = '';
      msg.textContent = 'Отзыв добавлен!';
      msg.style.color = '#2e7d32';
    } catch(e) {
    console.log('error:', e);
    msg.textContent = e.message || 'Ошибка отправки';
    msg.style.color = '#c62828';
}
};

  async function setCityOptions(provider) {
    const country = $('country').value || '';
    const cities = await provider.listCities(country);
    const citySelect = $('city');
    citySelect.innerHTML = '<option value="">Любой</option>';
    cities.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = cities.length === 0;
  }

  function debounce(fn, ms) {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await checkAdminRole(); 
    const email = localStorage.getItem('trava_email');
    if (email) {
        try {
            window._favoriteIds = await window.TravaPlacesProvider.getFavoriteIds(email);
        } catch {
            window._favoriteIds = [];
        }
    } else {
        window._favoriteIds = [];
    }

    const provider = window.TravaPlacesProvider;
    if (!provider) return;

    const resultsEl = $('results');

    // Загружаем страны с бэкенда
    const countries = await provider.listCountries();
    countries.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      $('country').appendChild(opt);
    });

    await setCityOptions(provider);
    // Применяем параметры из URL
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const countryParam = params.get('country');

    if (countryParam) {
        const countrySelect = $('country');
        for (let opt of countrySelect.options) {
            if (opt.value.toLowerCase() === countryParam.toLowerCase()) {
                opt.selected = true;
                break;
            }
        }
        await setCityOptions(provider);
    }

    if (typeParam) {
        const typeSelect = $('type');
        for (let opt of typeSelect.options) {
            if (opt.value.toLowerCase() === typeParam.toLowerCase()) {
                opt.selected = true;
                break;
            }
        }
}

    const runSearch = async () => {
    const f = {
        q: $('q').value || '',
        country: $('country').value || '',
        city: $('city').value || '',
        type: $('type').value || '',
        minRating: $('rating').value || '',
    };
    let items = await provider.search(f);

    // Фильтр избранного
   const favOnly = document.getElementById('favorites-only')?.checked;
if (favOnly) {
    const favIds = (window._favoriteIds || []).map(Number);
    items = items.filter(p => favIds.includes(Number(p.id)));
}

    renderResults(resultsEl, items);
};

    const runSearchDebounced = debounce(runSearch, 300);

    $('q').addEventListener('input', runSearchDebounced);
    $('type').addEventListener('change', runSearch);
    $('rating').addEventListener('change', runSearch);
    $('country').addEventListener('change', async () => {
      await setCityOptions(provider);
      $('city').value = '';
      runSearch();
    });
    $('city').addEventListener('change', runSearch);
    $('reset').addEventListener('click', async () => {
      $('q').value = '';
      $('country').value = '';
      $('type').value = '';
      $('rating').value = '';
      await setCityOptions(provider);
      $('city').value = '';
      runSearch();
    });
    document.getElementById('favorites-only')?.addEventListener('change', runSearch);


    window._runSearch = runSearch;
    runSearch();

    
  });
  // Проверяем роль при загрузке
async function checkAdminRole() {
    const email = localStorage.getItem('trava_email');
    if (!email) {
        window._isAdmin = false;
        return;
    }
    try {
        const res = await fetch(`http://localhost:8080/profile?email=${encodeURIComponent(email)}`);
        const profile = await res.json();
        window._isAdmin = profile.role === 'ADMIN';
    } catch {
        window._isAdmin = false;
    }
}

window.deleteReview = async function(reviewId, placeId) {
    const email = localStorage.getItem('trava_email');
    showConfirmModal('Удалить этот отзыв?', async () => {
        try {
            await fetch(`http://localhost:8080/admin/review/${reviewId}?adminEmail=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            const list = document.getElementById(`reviews-list-${Number(placeId)}`);
            const reviews = await window.TravaPlacesProvider.getReviews(Number(placeId));
            list.innerHTML = renderReviews(reviews, Number(placeId));
        } catch(e) {
            alert('Ошибка удаления');
        }
    });
};

window.deletePlace = async function(placeId) {
    const email = localStorage.getItem('trava_email');
    showConfirmModal('Удалить это место?', async () => {
        try {
            const res = await fetch(`http://localhost:8080/admin/place/${placeId}?adminEmail=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            const text = await res.text();
            if (!res.ok) {
                alert(text || 'Ошибка удаления');
                return;
            }
            document.getElementById(`place-card-${placeId}`).remove();
        } catch {
            alert('Ошибка удаления');
        }
    });
};


window.openAddPlaceModal = function() {
    const modal = document.getElementById('add-place-modal');
    modal.classList.add('show');
};

window.closeAddPlaceModal = function() {
    const modal = document.getElementById('add-place-modal');
    modal.classList.remove('show');
    document.getElementById('add-place-message').textContent = '';
    document.getElementById('new-place-name').value = '';
    document.getElementById('new-place-desc').value = '';
    document.getElementById('new-place-country').value = '';
    document.getElementById('new-place-city').value = '';
    document.getElementById('new-place-preview').innerHTML = '';
    document.getElementById('new-place-file-name').textContent = '';
};



window._runSearch = null;

})();

function showAddPlaceBtn() {
    const email = localStorage.getItem('trava_email');
    const wrap = document.getElementById('add-place-btn-wrap');
    if (wrap) wrap.style.display = email ? 'block' : 'none';
}


document.addEventListener('DOMContentLoaded', () => {
    showAddPlaceBtn();

    const fileInput = document.getElementById('new-place-file');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            document.getElementById('new-place-file-name').textContent = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                const img = document.createElement('img');
                img.src = reader.result;
                img.style.cssText = 'width:100%; border-radius:8px; max-height:200px; object-fit:cover;';
                document.getElementById('new-place-preview').innerHTML = '';
                document.getElementById('new-place-preview').appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    document.getElementById('add-place-form')?.addEventListener('submit', async (e) => {
        e.preventDefault(); // блокируем стандартную отправку формы
        const email = localStorage.getItem('trava_email');
        const name = document.getElementById('new-place-name').value.trim();
        const desc = document.getElementById('new-place-desc').value.trim();
        const country = document.getElementById('new-place-country').value.trim();
        const city = document.getElementById('new-place-city').value.trim();
        const type = document.getElementById('new-place-type').value;
        const msg = document.getElementById('add-place-message');
        const file = document.getElementById('new-place-file').files[0];

        if (!name || !country || !city) {
            msg.textContent = 'Заполните название, страну и город';
            msg.style.color = '#c62828';
            return;
        }

        let imageData = '';
        if (file) {
            imageData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const maxSide = 800;
                        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                        canvas.width = Math.round(img.width * scale);
                        canvas.height = Math.round(img.height * scale);
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }

        try {
            const res = await fetch('http://localhost:8080/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, description: desc, country, city, type,
                    image: imageData, rating: 0, userAdded: true
                })
            });

            if (!res.ok) throw new Error(await res.text());

            msg.textContent = 'Место добавлено!';
            msg.style.color = '#2e7d32';
            setTimeout(() => {
                closeAddPlaceModal();
                if (window._runSearch) window._runSearch();
            }, 1000);
        } catch(e) {
            msg.textContent = e.message || 'Ошибка добавления';
            msg.style.color = '#c62828';
        }
    });
    
});
window.closeConfirmModal = function() {
    document.getElementById('confirm-modal').style.display = 'none';
};

function showConfirmModal(text, onConfirm) {
    document.getElementById('confirm-text').textContent = text;
    document.getElementById('confirm-modal').style.display = 'flex';
    const btn = document.getElementById('confirm-yes');
    btn.onclick = () => {
        closeConfirmModal();
        onConfirm();
    };
}
window.toggleFavorite = async function(placeId) {
    const email = localStorage.getItem('trava_email');
    if (!email) {
        const btn = document.getElementById(`fav-btn-${placeId}`);
        if (btn && !btn.nextSibling?.classList?.contains('fav-msg')) {
            const msg = document.createElement('span');
            msg.textContent = 'Войдите чтобы добавить в избранное';
            msg.className = 'fav-msg';
            msg.style.cssText = 'font-size:12px; color:#c62828; margin-left:8px;';
            btn.parentNode.insertBefore(msg, btn.nextSibling);
            setTimeout(() => msg.remove(), 3000);
        }
        return;
    }

    const numId = Number(placeId);
    const isFav = (window._favoriteIds || []).map(Number).includes(numId);
    const btn = document.getElementById(`fav-btn-${placeId}`);

    try {
        if (isFav) {
            await window.TravaPlacesProvider.removeFavorite(numId, email);
            window._favoriteIds = window._favoriteIds.filter(id => Number(id) !== numId);
            if (btn) btn.textContent = '🤍';
        } else {
            await window.TravaPlacesProvider.addFavorite(numId, email);
            window._favoriteIds = [...(window._favoriteIds || []), numId];
            if (btn) btn.textContent = '❤️';
        }
    } catch {
        alert('Ошибка');
    }
};