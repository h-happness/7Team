(() => {
  const TYPE_LABEL = {
    attraction: 'Достопримечательность',
    restaurant: 'Ресторан',
    hotel: 'Отель'
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
            <a href="country.html?country=${encodeURIComponent(place.country)}" class="card-country-link">
              🌍 ${escapeHtml(place.country)} подробности →
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

    container.innerHTML = `
      <div class="results-info">
        Найдено мест: <strong>${items.length}</strong>
      </div>
    ` + items.map(renderCard).join('');
  }

  function getFilters() {
    const q = $('q').value || '';
    const country = $('country').value || '';
    const city = $('city').value || '';
    const type = $('type').value || '';
    const minRating = $('rating').value || '';
    return { q, country, city, type, minRating };
  }

  async function loadCountriesAndCities() {
    try {
      const path = '../../json/DateBase.json';

      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        console.log('Данные загружены успешно из:', path);
        return data;
      }
    } catch (error) {
      console.error('Ошибка загрузки JSON:', error.message);
      return { countries: {} };
    }
  }

  function populateCountrySelect(countriesData) {
    const countrySelect = $('country');
    if (!countrySelect) {
      console.error('Элемент #country не найден в HTML');
      return;
    }

    countrySelect.innerHTML = '<option value="">Любая страна</option>';

    if (!countriesData || !countriesData.countries || typeof countriesData.countries !== 'object') {
      countrySelect.disabled = true;
      console.warn('Список стран пуст или данные не загружены корректно');
      return;
    }
    const countriesArray = Object.values(countriesData.countries);

    if (countriesArray.length === 0) {
      countrySelect.disabled = true;
      return;
    }

    countriesArray.forEach(country => {
      if (country && country.name) {
        const opt = document.createElement('option');
        opt.value = country.name;
        opt.textContent = country.name;
        countrySelect.appendChild(opt);
      }
    });
  }

  function populateCitySelect(countryName, countriesData) {
    const citySelect = $('city');
    if (!citySelect) {
      console.error('Элемент #city не найден в HTML');
      return;
    }

    if (!countryName) {
      citySelect.innerHTML = '<option value="">Любой город</option>';
      citySelect.disabled = true;
      return;
    }

    const countryEntry = Object.values(countriesData.countries).find(c => c.name === countryName);
    if (!countryEntry || !countryEntry.cities || !Array.isArray(countryEntry.cities) || countryEntry.cities.length === 0) {
      citySelect.innerHTML = '<option value="">Городов нет</option>';
      citySelect.disabled = true;
      return;
    }

    citySelect.innerHTML = '<option value="">Любой город</option>';
    countryEntry.cities.forEach(city => {
      const opt = document.createElement('option');
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = false;
  }

  function runSearch(resultsEl, countriesData) {
    resultsEl.innerHTML = '<div class="loading">⏳ Загрузка...</div>';

    const f = getFilters();
    const filteredItems = filterLocalData(f, countriesData);

    setTimeout(() => {
      renderResults(resultsEl, filteredItems);
    }, 300);
  }

  function filterLocalData(filters, countriesData) {
    const results = [];

    Object.values(countriesData.countries).forEach(country => {
      if (!country || !country.name) return;

      if (filters.country && filters.country !== country.name) return;

      (country.cities || []).forEach(city => {
        if (filters.city && filters.city !== city) return;

        const filterType = filters.type.toLowerCase();

        // Обрабатываем отели
        const hotels = country.hotels?.[city] || {};
        Object.values(hotels).forEach(hotel => {
          if (!hotel) return;

          const matchesType = !filters.type || filterType === 'hotel';
          const matchesQuery = !filters.q ||
            hotel.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            city.toLowerCase().includes(filters.q.toLowerCase()) ||
            country.name.toLowerCase().includes(filters.q.toLowerCase());
          const matchesRating = !filters.minRating || (hotel.rating || 0) >= parseFloat(filters.minRating);

          if (matchesType && matchesQuery && matchesRating) {
            results.push({
              name: hotel.name,
              type: 'hotel',
              country: country.name,
              city: city,
              rating: hotel.rating,
              description: `Отель в ${city}, ${country.name}`,
              images: [hotel.path]
            });
          }
        });

        // Обрабатываем достопримечательности
        const attractions = country.attractions?.[city] || {};
        Object.values(attractions).forEach(attraction => {
          if (!attraction) return;

          const matchesType = !filters.type || filterType === 'attraction';
          const matchesQuery = !filters.q ||
            attraction.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            city.toLowerCase().includes(filters.q.toLowerCase()) ||
            country.name.toLowerCase().includes(filters.q.toLowerCase());
          const matchesRating = !filters.minRating || (attraction.rating || 0) >= parseFloat(filters.minRating);

          if (matchesType && matchesQuery && matchesRating) {
            results.push({
              name: attraction.name,
              type: 'attraction',
              country: country.name,
              city: city,
              rating: attraction.rating,
              description: `Достопримечательность в ${city}, ${country.name}`,
              images: [attraction.path]
            });
          }
        });

        // Обрабатываем рестораны (cafes)
        const restaurants = country.cafes?.[city] || {};
        Object.values(restaurants).forEach(restaurant => {
          if (!restaurant) return;

          const matchesType = !filters.type || filterType === 'restaurant';
          const matchesQuery = !filters.q ||
            restaurant.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            city.toLowerCase().includes(filters.q.toLowerCase()) ||
            country.name.toLowerCase().includes(filters.q.toLowerCase());
          const matchesRating = !filters.minRating || (restaurant.rating || 0) >= parseFloat(filters.minRating);

          if (matchesType && matchesQuery && matchesRating) {
            results.push({
              name: restaurant.name,
              type: 'restaurant',
              country: country.name,
              city: city,
              rating: restaurant.rating,
              description: `Ресторан в ${city}, ${country.name}`,
              images: [restaurant.path]
            });
          }
        });
      });
    });

    return results;
  }

  function applyUrlParams(runSearchCallback, countriesData, resultsEl) {
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
        populateCitySelect(countryParam, countriesData);
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

      setTimeout(() => runSearchCallback(resultsEl, countriesData), 100);
    }

  function renderCountryQuickFilters(countriesData) {
    if (document.querySelector('.quick-countries')) return;

    const filtersSection = document.querySelector('.filters');
    if (!filtersSection) return;

    const container = document.createElement('div');
    container.className = 'quick-countries';

    const label = document.createElement('span');
    label.className = 'quick-countries-label';
    label.textContent = 'Популярные страны:';
    container.appendChild(label);

    // Берём первые 6 стран из объекта countries
    const countriesArray = Object.values(countriesData.countries).slice(0, 7);

    countriesArray.forEach(country => {
      if (!country || !country.name) return;

      const btn = document.createElement('button');
      btn.className = 'quick-country-btn';
      btn.innerHTML = `${country.name}`;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.quick-country-btn').forEach(b =>
          b.classList.remove('active')
        );
        btn.classList.add('active');

        const countrySelect = $('country');
        for (let opt of countrySelect.options) {
          if (opt.value === country.name) {
            opt.selected = true;
            break;
          }
        }
        populateCitySelect(country.name, countriesData);
        $('city').value = '';
        runSearch($('results'), countriesData);
      });

      container.appendChild(btn);
    });

    filtersSection.insertAdjacentElement('afterend', container);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const resultsEl = $('results');

    // Загружаем данные о странах и городах
    const countriesData = await loadCountriesAndCities();

    // Заполняем список стран
    populateCountrySelect(countriesData);

    // Обработчик смены страны
    const countrySelect = $('country');
    if (countrySelect) {
      countrySelect.addEventListener('change', () => {
        populateCitySelect(countrySelect.value, countriesData);
        runSearch(resultsEl, countriesData);
      });
    }

    applyUrlParams(runSearch, countriesData, resultsEl);
    renderCountryQuickFilters(countriesData);

    // Дебаунс для поиска по запросу
    const runSearchDebounced = debounce(() => runSearch(resultsEl, countriesData), 200);

    $('q').addEventListener('input', runSearchDebounced);
    $('type').addEventListener('change', () => runSearch(resultsEl, countriesData));
    $('rating').addEventListener('change', () => runSearch(resultsEl, countriesData));
  });

  // Утилита дебаунса
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
})();