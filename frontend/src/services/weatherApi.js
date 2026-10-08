const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

async function request(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Something went wrong while fetching weather data.');
  }

  return payload.data ?? payload;
}

export const fetchWeatherByCity = async (city) => {
  return request('/weather', { city });
};

export const fetchWeatherByCoordinates = async ({ lat, lon }) => {
  return request('/weather/coordinates', { lat, lon });
};

export const fetchForecastByCity = async (city) => {
  return request('/forecast', { city });
};
