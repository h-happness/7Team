(function() {
    "use strict";

    const urlParams = new URLSearchParams(window.location.search);
    const countryName = urlParams.get('country') || urlParams.get('name') || 'Италия';

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
        if (!items || items.length === 0) {
            return `<li class="place-item">
                <div class="place-icon"><i class="fas fa-info-circle"></i></div>
                <div class="place-info">
                    <div class="place-name">Нет данных</div>
                    <div class="place-meta">Информация появится позже</div>
                </div>
            </li>`;
        }

        return items.map(item => {
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
                        <div class="place-name">
                            <a href="place.html?id=${item.id}">
                                ${item.name}
                            </a>
                        </div>
                        <div class="place-meta">
                            ${item.location ? `<span><i class="fas fa-location-dot"></i> ${item.location}</span>` : ''}
                            ${metaHtml}
                        </div>
                        ${item.description ? `<div style="font-size: 0.85rem; color: #777; margin-top: 4px;">${item.description.substring(0, 60)}...</div>` : ''}
                    </div>
                </li>
            `;
        }).join('');
    }

    function renderCountryPage(data) {
        currentCountryData = data;

        heroTitle.textContent = data.name || decodedCountry;
        heroSlogan.textContent = data.capital?.name ? `Столица: ${data.capital.name}` : '';

        if (data.capital?.path) {
            heroSection.style.backgroundImage = `
            linear-gradient(
            rgba(73,35,8,0.5),
            rgba(139,69,19,0.6)
        ),
        url('${data.capital.path}')
    `;

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
            ${data.totalPlaces ? `
                <div class="fact-item">
                    <div class="fact-icon"><i class="fas fa-map-marked-alt"></i></div>
                    <div class="fact-text">
                        <strong>Мест в каталоге</strong>
                        <span>${data.totalPlaces}</span>
                    </div>
                </div>
            ` : ''}
        `;

        const seasonsHtml = (data.popularSeasons || []).map(s =>
            `<span class="season-badge"><i class="fas fa-calendar-alt"></i> ${s}</span>`
        ).join('') || '<span class="season-badge"><i class="fas fa-calendar-alt"></i> Круглый год</span>';

            const photoHtml = data.flag
                ? `<img src="${data.flag}" alt="${data.name}">`
                : `<div class="photo-placeholder">
                <i class="fas fa-flag"></i>
                </div>`;

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
                            ${data.description || 'Прекрасная страна с богатой историей и культурой. Подробное описание появится позже.'}
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
                        ${data.attractions?.length ? `<span class="badge">${data.attractions.length}</span>` : ''}
                    </div>
                    <ul class="place-list">
                        ${renderPlaceList(data.attractions || [], 'attraction')}
                    </ul>
                    ${data.attractions?.length > 0 ? `
                        <div style="margin-top: 1rem; text-align: center;">
                            <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=attraction" class="btn-inline" style="font-size: 0.9rem;">
                                Все достопримечательности <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <i class="fas fa-utensils"></i>
                        <span>Кафе и рестораны</span>
                        ${data.cafes?.length ? `<span class="badge">${data.cafes.length}</span>` : ''}
                    </div>
                    <ul class="place-list">
                        ${renderPlaceList(data.cafes || [], 'cafe')}
                    </ul>
                    ${data.cafes?.length > 0 ? `
                        <div style="margin-top: 1rem; text-align: center;">
                            <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=restaurant" class="btn-inline" style="font-size: 0.9rem;">
                                Все рестораны <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <i class="fas fa-hotel"></i>
                        <span>Отели</span>
                        ${data.hotels?.length ? `<span class="badge">${data.hotels.length}</span>` : ''}
                    </div>
                    <ul class="place-list">
                        ${renderPlaceList(data.hotels || [], 'hotel')}
                    </ul>
                    ${data.hotels?.length > 0 ? `
                        <div style="margin-top: 1rem; text-align: center;">
                            <a href="catalog.html?country=${encodeURIComponent(data.name)}&type=hotel" class="btn-inline" style="font-size: 0.9rem;">
                                Все отели <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div style="text-align: center; margin: 2rem 5% 3rem;">
                <a href="catalog.html?country=${encodeURIComponent(data.name)}" class="btn">
                    <i class="fas fa-search"></i> Смотреть все места
                </a>
            </div>
        `;
        }

    async function loadLocalCountryData() {
        try {
            const res = await fetch('../../json/DateBase.json');
            return await res.json();
        } catch (e) {
            console.error('Ошибка загрузки локального JSON:', e);
            return null;
        }
    }

    async function loadCountryData() {
        renderLoading();

        try {
            let backendData = null;
            if (
                window.TravaPlacesProvider &&
                typeof window.TravaPlacesProvider.getCountryData === 'function'
            ) {
                backendData =
                    await window.TravaPlacesProvider.getCountryData(decodedCountry);
            }
            const localDb = await loadLocalCountryData();
            const localCountry = Object.values(localDb.countries || {}).find(
                c => c.name?.toLowerCase() === decodedCountry.toLowerCase()
            );
            const mergedData = {
                ...(localCountry || {}),
                ...(backendData || {})
            };
            const placesRes = await fetch(
                `http://localhost:8080/places?country=${encodeURIComponent(decodedCountry)}`
            );
            const places = await placesRes.json();
            const attractions = places.filter(
                p => p.type === 'ATTRACTION'
            );

            const cafes = places.filter(
                p => p.type === 'RESTAURANT'
            );

            const hotels = places.filter(
                p => p.type === 'HOTEL'
            );

            if (mergedData && mergedData.name) {
                renderCountryPage({
                    ...localCountry, attractions, cafes, hotels, totalPlaces: places.length});
            } else {
                renderError(
                    `Информация о стране "${decodedCountry}" не найдена`
                );
            }

        } catch (error) {
            console.error('[CountryPage] Ошибка загрузки:', error);
            renderError('Ошибка загрузки данных');
        }
    }

    loadCountryData();

})();