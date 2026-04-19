(() => {
  const TYPE_LABEL = {
    attraction: 'Достопримечательность',
    restaurant: 'Ресторан',
    hotel: 'Отель',
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
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCountryLink(countryName) {
    if (!countryName) return escapeHtml(countryName);
    return `<a href="country.html?country=${encodeURIComponent(countryName)}"
                class="country-link"
                title="Подробнее о ${escapeHtml(countryName)}">
                ${escapeHtml(countryName)}
            </a>`;
  }

  function renderCard(place) {
    const images = Array.isArray(place.images) ? place.images.slice(0, 3) : [];
    const isSingle = images.length <= 1;

    const imgHtml = (images.length ? images : ['../../img/main/world.png'])
      .map((src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(place.name)}">`)
      .join('');

    const countryDisplay = place.country ? createCountryLink(place.country) : '—';
    const cityDisplay = place.city ? escapeHtml(place.city) : '';

    return `
      <div class="card">
        <div class="card-images ${isSingle ? 'single' : ''}">
          ${imgHtml}
        </div>
        <div class="card-content">
          <h2>${escapeHtml(place.name)}</h2>
          <div class="meta">
            <span class="pill">
              ${countryDisplay}${cityDisplay ? `, ${cityDisplay}` : ''}
            </span>
            <span class="pill">${escapeHtml(TYPE_LABEL[place.type] || place.type)}</span>
            <span class="pill">Рейтинг: ${escapeHtml(place.rating)} ${escapeHtml(starString(place.rating))}</span>
          </div>
          <p>${escapeHtml(place.description)}</p>
          <div class="card-footer">
            <span class="season">📅 ${escapeHtml(place.season || 'Круглый год')}</span>
            <a href="country.html?country=${encodeURIComponent(place.country)}" class="card-country-link">
              🌍 Все места в ${escapeHtml(place.country)} →
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderResults(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <p>🔍 Ничего не найдено. Попробуйте изменить фильтры.</p>
        </div>
      `;
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

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const countryParam = params.get('country');
    const cityParam = params.get('city');
    const qParam = params.get('q');

    if (typeParam) {
      const typeSelect = $('type');
      for (let opt of typeSelect.options) {
        if (opt.value === typeParam) {
          opt.selected = true;
          break;
        }
      }
    }

    if (countryParam) {
      const countrySelect = $('country');
      for (let opt of countrySelect.options) {
        if (opt.value === countryParam) {
          opt.selected = true;
          break;
        }
      }
      if (window.TravaPlacesProvider) {
        setCityOptions(window.TravaPlacesProvider);
      }
    }

    if (cityParam) {
      const citySelect = $('city');
      setTimeout(() => {
        for (let opt of citySelect.options) {
          if (opt.value === cityParam) {
            opt.selected = true;
            break;
          }
        }
      }, 50);
    }

    if (qParam) {
      $('q').value = qParam;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const provider = window.TravaPlacesProvider;
    if (!provider) return;

    const resultsEl = $('results');

    provider.listCountries().forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      $('country').appendChild(opt);
    });

    applyUrlParams();
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

    function renderCountryQuickFilters(provider) {
        if (document.querySelector('.quick-countries')) return;

        const filtersSection = document.querySelector('.filters');
        if (!filtersSection) return;

        const container = document.createElement('div');
        container.className = 'quick-countries';

        const label = document.createElement('span');
        label.className = 'quick-countries-label';
        label.textContent = 'Популярные страны:';
        container.appendChild(label);

        const countries = provider.listCountries();

        const flags = {};

        countries.slice(0, 6).forEach(country => {
            const btn = document.createElement('button');
            btn.className = 'quick-country-btn';
            btn.innerHTML = `${flags[country] || ''} ${country}`;

            btn.addEventListener('click', () => {
                const countrySelect = $('country');
                for (let opt of countrySelect.options) {
                    if (opt.value === country) {
                        opt.selected = true;
                        break;
                    }
                }
                countrySelect.dispatchEvent(new Event('change'));
            });

            container.appendChild(btn);
        });

        filtersSection.insertAdjacentElement('afterend', container);
    }

    renderCountryQuickFilters(provider);
    runSearch();
  });
})();