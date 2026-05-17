
(() => {
    const API_BASE = 'http://localhost:8080';

    async function checkAdminRole() {
    const email = localStorage.getItem('trava_email');
    if (!email) { window._isAdmin = false; return; }
    try {
        const res = await fetch(`${API_BASE}/profile?email=${encodeURIComponent(email)}`);
        const profile = await res.json();
        window._isAdmin = profile.role === 'ADMIN';
    } catch {
        window._isAdmin = false;
    }
}

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function starString(rating) {
        const r = Number(rating || 0);
        const full = Math.min(5, Math.floor(r));
        const empty = 5 - full;
        return '★'.repeat(full) + '☆'.repeat(empty);
    }

    const TYPE_LABEL = {
        ATTRACTION: 'Достопримечательность',
        RESTAURANT: 'Ресторан',
        HOTEL: 'Отель'
    };

    // Проверка авторизации
    function isUserAuthenticated() {
        return !!localStorage.getItem('trava_email');
    }

    function requireAuth() {
        console.log({
            email: localStorage.getItem('trava_email'),
            userId: localStorage.getItem('trava_user_id')
        });
        if (!isUserAuthenticated()) {
            console.warn('Авторизация не пройдена:', {
                email: localStorage.getItem('trava_email'),
                userId: localStorage.getItem('trava_user_id')
            });
            showNotification('Для оставления отзыва необходимо войти в аккаунт', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        return true;
    }

    // Функция уведомлений
    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;

        if (type === 'success') {
            notification.style.background = '#d4edda';
            notification.style.color = '#155724';
            notification.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            notification.style.background = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.border = '1px solid #f5c6cb';
        } else {
            notification.style.background = '#d1ecf1';
            notification.style.color = '#0c5460';
            notification.style.border = '1px solid #bee5eb';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 5000);
    }

    function getReviewFormHtml(placeId) {
        if (!isUserAuthenticated()) {
            return `
        <div class="review-form">
          <div class="muted" style="padding:16px; text-align:center;">
            <a href="login.html" style="color:#492308; text-decoration:underline;">Войдите</a>, чтобы оставить отзыв
          </div>
        </div>
      `;
        }

        return `
      <div class="review-form">
        <h3 style="color:#643411; margin-bottom:16px;">Оставить отзыв</h3>
        <div class="form-group">
          <label for="review-rating-${placeId}">Оценка:</label>
          <div class="rating-stars">
            ${[5, 4, 3, 2, 1].map(rating => `
              <label class="star-label">
                <input type="radio" name="review-rating-${placeId}" value="${rating}" required>
                <span class="star">★</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label for="review-text-${placeId}">Текст отзыва:</label>
          <textarea id="review-text-${placeId}" placeholder="Поделитесь впечатлениями о месте..."
                  style="width:100%; padding:12px 15px; border-radius:8px; border:1px solid #d6c2b3; background:white; color:#3a2d22; font-family:'Montserrat',sans-serif; font-size:14px; resize:vertical; min-height:80px;"></textarea>
        </div>
        <button
          type="button"
          id="submit-review-${placeId}"
          class="submit-review-btn">
          Отправить отзыв
        </button>
        <div id="review-msg-${placeId}" style="margin-top:8px; font-size:13px;"></div>
      </div>
    `;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');
    const container = document.getElementById('place-container');

    async function loadPlaceDetail() {
        await checkAdminRole();
        if (!placeId) {
            container.innerHTML = '<div class="error">Не указан ID места</div>';
            return;
        }

        // Проверка существования провайдера и метода
        if (!window.TravaPlacesProvider) {
            console.error('TravaPlacesProvider не инициализирован');
            container.innerHTML = '<div class="error">Ошибка инициализации провайдера</div>';
            return;
        }

        if (typeof window.TravaPlacesProvider.getPlaceById !== 'function') {
            console.error('Метод getPlaceById не найден в провайдере');
            container.innerHTML = '<div class="error">Метод загрузки места недоступен</div>';
            return;
        }

        try {
            const place = await window.TravaPlacesProvider.getPlaceById(placeId);
            if (!place) {
                container.innerHTML = `<div class="error">Место не найдено</div>`;
                return;
            }
            renderPlaceDetail(place);
        } catch (error) {
            console.error('Ошибка загрузки места:', error);
            container.innerHTML = `<div class="error">Ошибка загрузки данных</div>`;
        }
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
        <button
          type="button"
          id="submit-review-${placeId}"
          style="margin-top:8px; background:#492308; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
          Отправить
        </button>
        <div id="review-msg-${placeId}" style="margin-top:6px; font-size:13px;"></div>
      </div>
    `;
    }

    function renderPlaceDetail(place) {
        const imgSrc = place.image || '../../img/main/world.png';

        const descriptionSection = place.description ? `
      <section class="place-description">
        <h2>Описание</h2>
        <p>${escapeHtml(place.description)}</p>
      </section>
    ` : '';

        container.innerHTML = `
      <div class="place-page">

        <div class="place-grid">

          <div class="place-image-col">
            <img src="${imgSrc}" 
                 alt="${escapeHtml(place.name)}" 
                 class="place-image">
          </div>

          <div class="place-info-col">

            <h1 class="place-name">${escapeHtml(place.name)}</h1>

            <div class="place-meta">

              <div class="meta-item">
                <span class="meta-label">Страна:</span>
                <span class="meta-value">${escapeHtml(place.country)}</span>
              </div>

              <div class="meta-item">
                <span class="meta-label">Город:</span>
                <span class="meta-value">${escapeHtml(place.city || 'Не указан')}</span>
              </div>

              <div class="meta-item">
                <span class="meta-label">Тип:</span>
                <span class="meta-value">
                  ${escapeHtml(TYPE_LABEL[place.type] || place.type)}
                </span>
              </div>

              <div class="meta-item">
                <span class="meta-label">Рейтинг:</span>
                <span class="meta-value rating">
                  ${place.rating} ${starString(place.rating)}
                </span>
              </div>

            </div>

            ${descriptionSection}

            <section class="reviews-section">
              <h2>Отзывы</h2>

              <div id="reviews-list" class="reviews-list">
                Загрузка отзывов...
              </div>

              ${getReviewFormHtml(place.id)}
            </section>

            <div class="country-link">
              <a href="country.html?country=${encodeURIComponent(place.country)}"
                 class="btn country-btn">
                 ↵ Перейти к стране: ${escapeHtml(place.country)}
              </a>
            </div>

          </div>

        </div>

      </div>
    `;

        loadReviews(place.id);

        const btn = document.getElementById(`submit-review-${place.id}`);
        if (btn) {
            btn.addEventListener('click', () => {
                console.log('CLICK WORKS');
                submitReview(place.id);
            });
        }
    }

    function renderReviews(reviews, placeId) {
        const userId = localStorage.getItem('trava_email');
        const isAdmin = window._isAdmin === true;

        if (!reviews || reviews.length === 0) {
            return '<div class="muted" style="padding:16px; text-align:center;">Отзывов пока нет</div>';
        }

        return reviews.map(r => `
    <div class="comment">
      <div class="comment-header">
        <span class="comment-user">${escapeHtml(r.user?.displayName || r.user?.email || 'Пользователь')}</span>
        <div class="comment-rating">
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
          ${isAdmin ? `<button class="action-btn action-btn--danger action-btn--sm" onclick="deleteReview(${r.id}, ${placeId})">Удалить</button>` : ''}
        </div>
      </div>
      <div class="comment-text">${escapeHtml(r.text || '')}</div>
    </div>
  `).join('');
    }

    async function loadReviews(placeId) {
        const list = document.getElementById('reviews-list');
        try {
            const reviews = await window.TravaPlacesProvider.getReviews(placeId);
            list.innerHTML = renderReviews(reviews, placeId);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            list.innerHTML = '<div class="error">Не удалось загрузить отзывы</div>';
        }
    }

    async function updatePlaceRating(placeId) {
        try {
            const placeRes = await fetch(`${API_BASE}/places/${placeId}`);
            const placeData = await placeRes.json();
            const ratingPill = document.querySelector(`.card[data-place-id="${placeId}"] .pill:nth-child(3)`);
            if (ratingPill) {
                ratingPill.textContent = `Рейтинг: ${placeData.place.rating} ${starString(placeData.place.rating)}`;
            }
        } catch (error) {
            console.error('Ошибка обновления рейтинга:', error);
        }
    }

    window.submitReview = async function(placeId) {
        if (!requireAuth()) return;
        const email = localStorage.getItem('trava_email');
        const profileRes = await fetch(`http://localhost:8080/profile?email=${encodeURIComponent(email)}`);
        const profile = await profileRes.json();

        const text = document.getElementById(`review-text-${placeId}`)?.value?.trim();
        const rating = Number(document.getElementById(`review-rating-${placeId}`)?.value || 0);
        const msg = document.getElementById(`review-msg-${placeId}`);
        const submitBtn = document.getElementById(`submit-review-${placeId}`);

        // Валидация
        if (!text) {
            msg.textContent = 'Напишите текст отзыва';
            msg.style.color = '#c62828';
            return;
        }

        if (rating === 0) {
            msg.textContent = 'Выберите оценку';
            msg.style.color = '#c62828';
            return;
        }

        // Блокируем кнопку на время отправки
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        msg.textContent = '';

        try {
            await window.TravaPlacesProvider.addReview(placeId, profile.id, text, rating);

            msg.textContent = 'Отзыв успешно добавлен!';
            msg.style.color = '#2e7d32';

            document.getElementById(`review-text-${placeId}`).value = '';
            document.getElementById(`review-rating-${placeId}`).value = '5';

            await loadReviews(placeId);

            await updatePlaceRating(placeId);
        } catch (error) {
            const errText = await error.message || 'Ошибка отправки. Попробуйте ещё раз.';
            

            if (error.message.includes('User not found')) {
                msg.textContent = 'Пользователь не найден. Войдите заново.';
                setTimeout(() => window.location.href = 'login.html', 3000);
            } else {
                msg.textContent = errText;
            }
            msg.style.color = '#c62828';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить отзыв';
        }
    };

    // Функция удаления отзыва (для админов)
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

window.deleteReview = async function(reviewId, placeId) {
    const email = localStorage.getItem('trava_email');
    showConfirmModal('Удалить этот отзыв?', async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/review/${reviewId}?adminEmail=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                showNotification('Нет прав для удаления', 'error');
                return;
            }
            showNotification('Отзыв удалён', 'success');
            await loadReviews(placeId);
            await updatePlaceRating(placeId);
        } catch (error) {
            showNotification('Не удалось удалить отзыв', 'error');
        }
    });
};

    loadPlaceDetail();
})();
