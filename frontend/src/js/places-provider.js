let DATA = [];
let COUNTRY_INFO = {};

async function loadData() {
  try {
    console.log('Начинаем загрузку JSON...');
    const response = await fetch('../json/DateBase.json');

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const jsonData = await response.json();
    DATA = [];
    COUNTRY_INFO = jsonData.countries || {};

    Object.keys(COUNTRY_INFO).forEach(countryKey => {
      const country = COUNTRY_INFO[countryKey];

      // Извлекаем отели
      if (country.hotels) {
        Object.keys(country.hotels).forEach(cityKey => {
          const cityHotels = country.hotels[cityKey];
          Object.keys(cityHotels).forEach(hotelKey => {
            const hotel = cityHotels[hotelKey];
            DATA.push({
              id: `${countryKey}-hotel-${hotelKey}`,
              name: hotel.name,
              country: country.name,
              city: cityKey,
              type: 'hotel',
              rating: hotel.rating,
              description: `Отель в ${cityKey}, ${country.name}`,
              season: 'Круглый год',
              images: [hotel.path]
            });
          });
        });
      }

      // Извлекаем достопримечательности
      if (country.attractions) {
        Object.keys(country.attractions).forEach(cityKey => {
          const cityAttractions = country.attractions[cityKey];
          Object.keys(cityAttractions).forEach(attractionKey => {
            const attraction = cityAttractions[attractionKey];
            DATA.push({
              id: `${countryKey}-attraction-${attractionKey}`,
              name: attraction.name,
              country: country.name,
              city: cityKey,
              type: 'attraction',
              rating: attraction.rating,
              description: `Достопримечательность в ${cityKey}, ${country.name}`,
              season: 'Круглый год',
              images: [attraction.path]
            });
          });
        });
      }

      // Извлекаем кафе/рестораны
      if (country.cafes) {
        Object.keys(country.cafes).forEach(cityKey => {
          const cityCafes = country.cafes[cityKey];
          Object.keys(cityCafes).forEach(cafeKey => {
            const cafe = cityCafes[cafeKey];
            DATA.push({
              id: `${countryKey}-cafe-${cafeKey}`,
              name: cafe.name,
              country: country.name,
              city: cityKey,
              type: 'restaurant',
              rating: cafe.rating,
              description: `Ресторан/кафе в ${cityKey}, ${country.name}`,
              season: 'Круглый год',
              images: [cafe.path]
            });
          });
        });
      }
    });

    console.log('Данные успешно загружены:', {
      totalPlaces: DATA.length,
      countries: Object.keys(COUNTRY_INFO),
      samplePlace: DATA[0] || 'Нет мест для примера'
    });
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    DATA = [];
    COUNTRY_INFO = {};
  }
}


function norm(s) {
  return String(s || '').trim().toLowerCase();
}

function matchesText(place, q) {
  if (!q) return true;
  const hay = [place.name, place.country, place.city, place.type, place.description].map(norm).join(' ');
  return hay.includes(norm(q));
}

async function search(params = {}) {
  await loadData(); // Загружаем данные перед поиском

  const q = norm(params.q);
  const country = norm(params.country);
  const city = norm(params.city);
  const type = norm(params.type);
  const minRating = params.minRating ? Number(params.minRating) : null;

  const result = DATA.filter((p) => {
    if (country && norm(p.country) !== country) return false;
    if (city && norm(p.city) !== city) return false;
    if (type && norm(p.type) !== type) return false;
    if (minRating !== null && Number(p.rating || 0) < minRating) return false;
    if (!matchesText(p, q)) return false;
    return true;
  });

  return result;
}

function listCountries() {
  return Object.keys(COUNTRY_INFO).sort((a, b) => a.localeCompare(b));
}

function listCities(country) {
  const c = norm(country);
  const filtered = c ? DATA.filter((p) => norm(p.country) === c) : DATA;
  return Array.from(new Set(filtered.map((p) => p.city))).sort((a, b) => a.localeCompare(b));
}

async function getCountryData(countryName) {
  await loadData();

  const countryInfo = Object.values(COUNTRY_INFO).find(c => c.name === countryName);
  if (!countryInfo) return null;

  // Извлекаем отели для этой страны
  const hotels = [];
  if (countryInfo.hotels) {
    Object.keys(countryInfo.hotels).forEach(cityKey => {
      const cityHotels = countryInfo.hotels[cityKey];
      Object.keys(cityHotels).forEach(hotelKey => {
        const hotel = cityHotels[hotelKey];
        hotels.push({
          name: hotel.name,
          location: cityKey,
          rating: hotel.rating
        });
      });
    });
  }

  // Извлекаем достопримечательности
  const attractions = [];
  if (countryInfo.attractions) {
    Object.keys(countryInfo.attractions).forEach(cityKey => {
      const cityAttractions = countryInfo.attractions[cityKey];
      Object.keys(cityAttractions).forEach(attractionKey => {
        const attraction = cityAttractions[attractionKey];
        attractions.push({
          name: attraction.name,
          location: cityKey,
          rating: attraction.rating
        });
      });
    });
  }

  // Извлекаем кафе/рестораны
  const cafes = [];
  if (countryInfo.cafes) {
    Object.keys(countryInfo.cafes).forEach(cityKey => {
      const cityCafes = countryInfo.cafes[cityKey];
      Object.keys(cityCafes).forEach(cafeKey => {
        const cafe = cityCafes[cafeKey];
        cafes.push({
          name: cafe.name,
          location: cityKey,
          rating: cafe.rating
        });
      });
    });
  }

  return {
    name: countryInfo.name,
    capital: countryInfo.capital?.name || '—',
    currency: countryInfo.currency || '—',
    language: countryInfo.language || '—',
    timezone: countryInfo.timezone || '—',
    description: countryInfo.discription || 'Информация уточняется.',
    popularSeasons: countryInfo.popularSeason || ['Круглый год'],
    heroImage: countryInfo.flag || null,
    photo: countryInfo.capital?.path || null,
    hotels: hotels,
    attractions: attractions,
    cafes: cafes,
    totalPlaces: hotels.length + attractions.length + cafes.length
  };
}

window.TravaPlacesProvider = { search, listCountries, listCities, getCountryData };