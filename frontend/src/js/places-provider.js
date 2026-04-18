(() => {
  /**
   * Provider interface (for future Google Maps / external APIs):
   *   provider.search({ q, country, city, type, minRating }) -> Promise<Place[]>
   *
   * Place shape:
   *   { id, name, country, city, type, rating, description, season, images[] }
   */

  const DATA = [
    {
      id: 'paris-attraction-eiffel',
      name: 'Эйфелева башня',
      country: 'Франция',
      city: 'Париж',
      type: 'attraction',
      rating: 4.8,
      description: 'Главный символ Парижа и одна из самых узнаваемых достопримечательностей мира.',
      season: 'апрель–июнь, сентябрь–октябрь',
      images: ['../../img/paris1.jpg'],
    },
    {
      id: 'rome-attraction-colosseum',
      name: 'Колизей',
      country: 'Италия',
      city: 'Рим',
      type: 'attraction',
      rating: 4.7,
      description: 'Древний амфитеатр и сердце античного Рима.',
      season: 'март–май, сентябрь–октябрь',
      images: ['../../img/rome.jpg'],
    },
    {
      id: 'barcelona-attraction-sagrada',
      name: 'Саграда Фамилия',
      country: 'Испания',
      city: 'Барселона',
      type: 'attraction',
      rating: 4.7,
      description: 'Базилика Гауди с уникальной архитектурой и атмосферой.',
      season: 'май–июль, сентябрь',
      images: ['../../img/barcelona1.jpg'],
    },
    {
      id: 'paris-restaurant-bistro',
      name: 'Bistro du Quartier',
      country: 'Франция',
      city: 'Париж',
      type: 'restaurant',
      rating: 4.5,
      description: 'Уютное бистро с классическими французскими блюдами.',
      season: 'круглый год',
      images: ['../../img/paris1.jpg'],
    },
    {
      id: 'rome-restaurant-trattoria',
      name: 'Trattoria Roma',
      country: 'Италия',
      city: 'Рим',
      type: 'restaurant',
      rating: 4.4,
      description: 'Паста, пицца и итальянская классика в центре города.',
      season: 'круглый год',
      images: ['../../img/rome.jpg'],
    },
    {
      id: 'barcelona-hotel-mar',
      name: 'Hotel Mar',
      country: 'Испания',
      city: 'Барселона',
      type: 'hotel',
      rating: 4.3,
      description: 'Комфортный отель рядом с морем и историческим центром.',
      season: 'май–октябрь',
      images: ['../../img/barcelona1.jpg'],
    },
    {
      id: 'paris-route-day',
      name: 'Маршрут: Париж за 1 день',
      country: 'Франция',
      city: 'Париж',
      type: 'route',
      rating: 4.6,
      description: 'Собор, набережные Сены, Лувр и вечерний Трокадеро.',
      season: 'весна–осень',
      images: ['../../img/paris1.jpg', '../../img/main/world.png'],
    },
  ];

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function matchesText(place, q) {
    if (!q) return true;
    const hay = [
      place.name,
      place.country,
      place.city,
      place.type,
      place.description,
    ].map(norm).join(' ');
    return hay.includes(norm(q));
  }

  function normalizeType(type) {
    const t = norm(type);
    return t;
  }

  function search(params = {}) {
    const q = norm(params.q);
    const country = norm(params.country);
    const city = norm(params.city);
    const type = normalizeType(params.type);
    const minRating = params.minRating === '' || typeof params.minRating === 'undefined' || params.minRating === null
      ? null
      : Number(params.minRating);

    const result = DATA.filter((p) => {
      if (country && norm(p.country) !== country) return false;
      if (city && norm(p.city) !== city) return false;
      if (type && norm(p.type) !== type) return false;
      if (minRating !== null && Number(p.rating || 0) < minRating) return false;
      if (!matchesText(p, q)) return false;
      return true;
    });

    // mimic async provider (future API calls)
    return Promise.resolve(result);
  }

  function listCountries() {
    return Array.from(new Set(DATA.map((p) => p.country))).sort((a, b) => a.localeCompare(b));
  }

  function listCities(country) {
    const c = norm(country);
    const filtered = c ? DATA.filter((p) => norm(p.country) === c) : DATA;
    return Array.from(new Set(filtered.map((p) => p.city))).sort((a, b) => a.localeCompare(b));
  }

  window.TravaPlacesProvider = {
    search,
    listCountries,
    listCities,
  };
})();

