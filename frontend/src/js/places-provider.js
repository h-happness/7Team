(() => {
  const API_BASE = window.API_BASE_URL || 'http://localhost:8080';

  async function search(params = {}) {
    const url = new URL(`${API_BASE}/places`);
    if (params.country) url.searchParams.set('country', params.country);
    if (params.city) url.searchParams.set('city', params.city);
    if (params.type) url.searchParams.set('type', params.type.toUpperCase());

    const res = await fetch(url.toString());
    let data = await res.json();

    if (params.q) {
      const q = params.q.toLowerCase();
      data = data.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
      );
    }

    if (params.minRating) {
      data = data.filter(p => p.rating >= Number(params.minRating));
    }

    return data;
  }

  async function listCountries() {
    const res = await fetch(`${API_BASE}/places`);
    const data = await res.json();
    return [...new Set(data.map(p => p.country))].sort();
  }

  async function listCities(country) {
    const res = await fetch(`${API_BASE}/places`);
    const data = await res.json();
    return [...new Set(
      data
        .filter(p => !country || p.country === country)
        .map(p => p.city)
    )].sort();
  }

  async function getPlaceById(id) {
    try {
      const response = await fetch(`http://localhost:8080/places/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.place || data;
    } catch (error) {
      console.error('Error fetching place by ID:', error);
      throw error;
    }
  }

  async function getReviews(placeId) {
    const res = await fetch(`${API_BASE}/reviews/place/${placeId}`);
    return await res.json();
  }

  async function addReview(placeId, userId, text, rating) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId, userId, text, rating })
    });
    return await res.json();
  }

  window.TravaPlacesProvider = { search, listCountries, listCities, getReviews, addReview, getPlaceById };
})();