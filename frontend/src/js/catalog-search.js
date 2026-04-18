(() => {
  const TYPE_LABEL = {
    attraction: 'Достопримечательность',
    restaurant: 'Ресторан',
    hotel: 'Отель',
    route: 'Маршрут',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function starString(rating) {
    const r = Number(rating || 0);
    const full = Math.max(0, Math.min(5, Math.floor(r)));
    const half = (r - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return `${'★'.repeat(full)}${half ? '☆' : ''}${'·'.repeat(empty)}`.replace(/·/g, '☆');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(place) {
    const images = Array.isArray(place.images) ? place.images.slice(0, 3) : [];
    const isSingle = images.length <= 1;

    const imgHtml = (images.length ? images : ['../../img/main/world.png'])
      .map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(place.name)}">`)
      .join('');

    return `
      <div class="card">
        <div class="card-images ${isSingle ? 'single' : ''}">
          ${imgHtml}
        </div>
        <div class="card-content">
          <h2>${escapeHtml(place.name)}</h2>
          <div class="meta">
            <span class="pill">${escapeHtml(place.country)}${place.city ? `, ${escapeHtml(place.city)}` : ''}</span>
            <span class="pill">${escapeHtml(TYPE_LABEL[place.type] || place.type)}</span>
            <span class="pill">Рейтинг: ${escapeHtml(place.rating)} ${escapeHtml(starString(place.rating))}</span>
          </div>
          <p>${escapeHtml(place.description)}</p>
          <span>Лучший сезон: ${escapeHtml(place.season || '—')}</span>
        </div>
      </div>
    `;
  }

  function renderResults(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML = `<div class="empty">Ничего не найдено. Попробуй изменить фильтры.</div>`;
      return;
    }
    container.innerHTML = items.map(renderCard).join('');
  }

  function getFilters() {
    const q = $('q').value || '';
    const country = $('country').value || '';
    const city = $('city').value || '';
    const type = $('type').value || '';
    const minRating = $('rating').value || '';
    return { q, country, city, type, minRating };
  }

  function setCityOptions(provider) {
    const country = $('country').value || '';
    const cities = provider.listCities(country);
    const citySelect = $('city');

    citySelect.innerHTML = '<option value="">Любой</option>';
    cities.forEach((c) => {
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

  document.addEventListener('DOMContentLoaded', () => {
    const provider = window.TravaPlacesProvider;
    if (!provider) return;

    const resultsEl = $('results');

    // Fill country list
    provider.listCountries().forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      $('country').appendChild(opt);
    });

    setCityOptions(provider);

    const runSearch = () => {
      const f = getFilters();
      provider.search({
        q: f.q,
        country: f.country,
        city: f.city,
        type: f.type,
        minRating: f.minRating,
      }).then((items) => {
        renderResults(resultsEl, items);
      });
    };

    const runSearchDebounced = debounce(runSearch, 200);

    $('q').addEventListener('input', runSearchDebounced);
    $('type').addEventListener('change', runSearch);
    $('rating').addEventListener('change', runSearch);

    $('country').addEventListener('change', () => {
      setCityOptions(provider);
      $('city').value = '';
      runSearch();
    });

    $('city').addEventListener('change', runSearch);

    $('reset').addEventListener('click', () => {
      $('q').value = '';
      $('country').value = '';
      $('type').value = '';
      $('rating').value = '';
      setCityOptions(provider);
      $('city').value = '';
      runSearch();
    });

    runSearch();
  });
})();

