document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('../../json/DateBase.json');
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    Object.entries(data.countries).forEach(([key, country]) => {
      console.log(`Страна "${key}":`, {
        hasName: !!country.name,
        hasCapital: !!country.capital,
        hasPath: !!country.capital?.path
      });
    });

    const countries = Object.values(data.countries).slice(0, 3);
    const grid = document.getElementById('popular-destinations-grid');

    if (!grid) return;

    grid.innerHTML = '';

    countries.forEach((country, index) => {
      const countryKey = Object.keys(data.countries)[index];
      const imagePath = country.capital.path;
      const countryName = country.name || countryKey;
      const capitalName = country.capital.name || 'Столица';

      const cardHTML = `
        <a href="country.html?country=${encodeURIComponent(countryName)}" class="dest-card-link">
          <div class="dest-card">
            <img src="${imagePath}" alt="${countryName}" width="400" height="250">
            <div class="dest-info">
              <h3>${capitalName}, ${countryName}</h3>
              <p>${country.discription || 'Откройте для себя эту удивительную страну!'}</p>
            </div>
          </div>
        </a>
      `;
      grid.insertAdjacentHTML('beforeend', cardHTML);
    });
  } catch (error) {
    console.error('Критическая ошибка:', error);
  }
});