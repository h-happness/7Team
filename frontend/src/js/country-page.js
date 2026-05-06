(function() {
  "use strict";

  const urlParams = new URLSearchParams(window.location.search);
  const countryName = urlParams.get('country') || urlParams.get('name') || 'Китай';
  const decodedCountry = decodeURIComponent(countryName);

  const heroTitle = document.getElementById('heroCountryName');
  const heroSlogan = document.getElementById('heroSlogan');
  const heroSection = document.getElementById('countryHero');
  const dynamicContainer = document.getElementById('dynamicContent');

  let currentCountryData = null;

  function renderLoading() {
    dynamicContainer.innerHTML = `
      <div class="status-container">
        <div class="loader"></div>
        <p style="margin-top: 1rem;">Загружаем информацию о стране...</p>
        <p style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">
          <i class="fas fa-database"></i> Поиск данных...
        </p>
      </div>
    `;
    heroTitle.textContent = decodedCountry;
    heroSlogan.textContent = 'Загрузка...';
  }

  function renderError(message, showBackLink = true) {
    dynamicContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
        ${message || 'Не удалось загрузить информацию о стране.'}
      </div>
      ${showBackLink ? `
        <div style="text-align: center; margin: 2rem;">
          <a href="catalog.html" class="btn-inline">
            <i class="fas fa-arrow-left"></i> Вернуться в каталог
          </a>
        </div>
      ` : ''}
    `;
  }

  function renderPlaceList(items, type) {
    if (!items || Object.keys(items).length === 0) {
      return `<li class="place-item">
        <div class="place-icon"><i class="fas fa-info-circle"></i></div>
        <div class="place-info">
          <div class="place-name">Нет данных</div>
          <div class="place-meta">Информация появится позже</div>
        </div>
      </li>`;
    }

    const itemsArray = Object.values(items);
    return itemsArray.map(item => {
      let metaHtml = '';
      let icon = 'fa-map-pin';

      if (type === 'attraction') {
        metaHtml = item.rating ? `<span><i class="fas fa-star" style="color: #f90;"></i> ${item.rating}</span>` : '';
        icon = 'fa-landmark';
      } else if (type === 'cafe') {
        if (item.rating) metaHtml += `<span><i class="fas fa-star" style="color: #f90;"></i> ${item.rating}</span>`;
        icon = 'fa-utensils';
      } else if (type === 'hotel') {
        if (item.rating) metaHtml += `<span><i class="fas fa-star" style="color: #f90;"></i> ${item.rating}</span>`;
        icon = 'fa-hotel';
      }

      return `
        <li class="place-item">
          <div class="place-icon"><i class="fas ${icon}"></i></div>
          <div class="place-info">
            <div class="place-name">${item.name}</div>
            <div class="place-meta">
              ${metaHtml}
            </div>
            ${item.description ? `<div style="font-size: 0.85rem; color: #777; margin-top: 4px;">${item.description.substring(0, 60)}...</div>` : ''}
          </div>
        </li>
      `;
    }).join('');
  }

  function renderCountryPage(data, countryKey) {
    currentCountryData = data;

    heroTitle.textContent = data.name || decodedCountry;
    heroSlogan.textContent = data.capital?.name ? `Столица: ${data.capital.name}` : '';

    let imagePath = null;
    let imageFlag = null;

    if (data.capital?.path) {
      imagePath = data.capital.path;
    } else {
      imagePath = '../img/placeholder-country.jpg';
    }
    if (data.flag) {
      imageFlag = data.flag;
    } else {
      imagePath = '../img/placeholder-country.jpg';
    }

    if (imagePath) {
      heroSection.style.backgroundImage = `linear-gradient(rgba(73, 35, 8, 0.5), rgba(139, 69, 19, 0.6)), url('${imagePath}')`;
    }

    const factsHtml = `
      <div class="fact-item">
        <div class="fact-icon"><i class="fas fa-coins"></i></div>
        <div class="fact-text">
          <strong>Валюта</strong>
          <span>${data.currency || '—'}</span>
        </div>
      </div>
      <div class="fact-item">
        <div class="fact-icon"><i class="fas fa-language"></i></div>
        <div class="fact-text">
          <strong>Официальный язык</strong>
          <span>${data.language || '—'}</span>
        </div>
      </div>
      <div class="fact-item">
        <div class="fact-icon"><i class="fas fa-clock"></i></div>
        <div class="fact-text">
          <strong>Часовой пояс</strong>
          <span>${data.timezone || '—'}</span>
        </div>
      </div>
    `;

    const seasonsHtml = (data.popularSeason || []).map(s =>
      `<span class="season-badge"><i class="fas fa-calendar-alt"></i> ${s}</span>`
    ).join('') || '<span class="season-badge"><i class="fas fa-calendar-alt"></i> Круглый год</span>';

    const photoHtml = `
      <img
        src="${imageFlag}"
        alt="${data.name}"
        onerror="this.onerror=null; this.src='../img/placeholder-country.jpg'"
        width="400"
        height="250"
      >
    `;

    // Собираем достопримечательности из всех городов
    const attractions = {};
    Object.values(data.attractions || {}).forEach(cityAttractions => {
      Object.assign(attractions, cityAttractions);
    });

    // Собираем отели из всех городов
    const hotels = {};
    Object.values(data.hotels || {}).forEach(cityHotels => {
      Object.assign(hotels, cityHotels);
    });

    // Собираем кафе из всех городов
    const cafes = {};
    Object.values(data.cafes || {}).forEach(cityCafes => {
      Object.assign(cafes, cityCafes);
    });

    dynamicContainer.innerHTML = `
      <div class="bio-card">
        <div class="bio-grid">
          <div class="bio-photo">
            ${photoHtml}
          </div>
          <div class="bio-content">
            <h2>${data.name}</h2>
            <div class="quick-facts">
              ${factsHtml}
            </div>
            <div class="description">
              <i class="fas fa-quote-left" style="color: #ccc; margin-right: 5px;"></i>
              ${data.discription || data.description || 'Прекрасная страна с богатой историей и культурой. Подробное описание появится позже.'}
            </div>
              <div class="seasons">
                <strong><i class="fas fa-umbrella-beach"></i> Лучшее время для посещения:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                  ${seasonsHtml}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 class="sections-title">Что посмотреть и где остановиться</h2>
        <div class="sections-grid">
          <div class="section-card">
            <div class="section-header">
              <i class="fas fa-landmark"></i>
              <span>Достопримечательности</span>
              ${Object.keys(attractions).length ? `<span class="badge">${Object.keys(attractions).length}</span>` : ''}
            </div>
            <ul class="place-list">
              ${renderPlaceList(attractions, 'attraction')}
            </ul>
            ${Object.keys(attractions).length > 0 ? `
              <div style="margin-top: 1rem; text-align: center;">
                <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=attraction" class="btn-inline" style="font-size: 0.9rem;">
                  Все достопримечательности <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            ` : ''}
          </div>

          <div class="section-card">
            <div class="section-header">
              <i class="fas fa-hotel"></i>
              <span>Отели</span>
              ${Object.keys(hotels).length ? `<span class="badge">${Object.keys(hotels).length}</span>` : ''}
            </div>
            <ul class="place-list">
              ${renderPlaceList(hotels, 'hotel')}
            </ul>
            ${Object.keys(hotels).length > 0 ? `
              <div style="margin-top: 1rem; text-align: center;">
                <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=hotel" class="btn-inline" style="font-size: 0.9rem;">
                  Все отели <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            ` : ''}
          </div>

          <div class="section-card">
            <div class="section-header">
              <i class="fas fa-utensils"></i>
              <span>Рестораны</span>
              ${Object.keys(cafes).length ? `<span class="badge">${Object.keys(cafes).length}</span>` : ''}
            </div>
            <ul class="place-list">
              ${renderPlaceList(cafes, 'cafe')}
            </ul>
            ${Object.keys(cafes).length > 0 ? `
              <div style="margin-top: 1rem; text-align: center;">
                <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=cafe" class="btn-inline" style="font-size: 0.9rem;">
                  Все рестораны <i class="fas fa-arrow-right"></i>
                </a>
              </div>
            ` : ''}
          </div>
        </div>

        <div style="text-align: center; margin: 2rem 5% 3rem;">
          <a href="catalog.html?country=${encodeURIComponent(data.name)}" class="btn">
            <i class="fas fa-search"></i> Смотреть все места в ${data.name}
          </a>
        </div>
      `;
    }

    async function loadCountryData() {
      renderLoading();

      try {
        // Загружаем данные из JSON
        const response = await fetch('../../json/DateBase.json');
        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const countries = data.countries;

        // Ищем страну по имени или ключу
        let countryData = null;
        let countryKey = null;

        // Сначала ищем по названию (name)
        for (const key in countries) {
          if (countries[key].name === decodedCountry) {
            countryData = countries[key];
            countryKey = key;
            break;
          }
        }

        // Если не нашли по названию, ищем по ключу (например, 'china')
        if (!countryData && countries[decodedCountry]) {
          countryData = countries[decodedCountry];
          countryKey = decodedCountry;
        }

        if (countryData) {
          renderCountryPage(countryData, countryKey);
        } else {
          renderError(`К сожалению, информация о стране "${decodedCountry}" пока недоступна.`);
        }
      } catch (error) {
        console.error('[CountryPage] Ошибка загрузки:', error);

        // В случае ошибки показываем заглушку
        const fallbackData = getFallbackCountryData(decodedCountry);
        if (fallbackData) {
          renderCountryPage(fallbackData, null);
        } else {
          renderError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        }
      }
    }

    function getFallbackCountryData(country) {
      const fallbackMap = {
        'китай': {
          name: 'Китай',
          capital: { name: 'Пекин' },
          currency: 'Китайский юань (CNY)',
          language: 'Мандаринский китайский',
          timezone: 'UTC+8',
          discription: 'Страна с богатым культурным наследием, разнообразными ландшафтами — от пустынь до тропических лесов, а также контрастным сочетанием древних традиций и современных мегаполисов.',
          popularSeason: ['апрель-май', 'сентябрь-октябрь'],
          attractions: {},
          hotels: {}
        },
        'италия': {
          name: 'Италия',
          capital: { name: 'Рим' },
          currency: 'Евро (EUR)',
          language: 'Итальянский',
          timezone: 'UTC+1 / UTC+2',
          description: 'Италия — средиземноморское государство, родина Римской империи и Ренессанса.',
          popularSeason: ['Весна', 'Осень'],
          attractions: [
            { name: 'Колизей', rating: 4.7 },
            { name: 'Ватикан', rating: 4.8 }
          ],
          hotels: [
            { name: 'Hotel Eden', rating: 4.8 }
          ]
        }
      };

      const normalized = country.toLowerCase();
      return fallbackMap[normalized] || {
        name: country,
        capital: { name: '—' },
        currency: '—',
        language: '—',
        timezone: '—',
        description: `${country} — прекрасная страна. Информация уточняется.`,
        popularSeason: ['Круглый год'],
        attractions: {},
        hotels: {}
      };
    }

    // Запуск загрузки данных при готовности страницы
    document.addEventListener('DOMContentLoaded', loadCountryData);
    })();
