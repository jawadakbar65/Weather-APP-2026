const axios = require('axios');

const WEATHER_API_BASE = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';

const DEMO_CONDITIONS = [
  { main: 'Clear', description: 'clear sky', icon: '01d' },
  { main: 'Clouds', description: 'few clouds', icon: '02d' },
  { main: 'Rain', description: 'light rain', icon: '10d' },
  { main: 'Thunderstorm', description: 'stormy conditions', icon: '11d' },
  { main: 'Snow', description: 'light snow', icon: '13d' },
];

const toLocalTime = (timestamp, timezoneOffsetSeconds) => {
  const utcMs = timestamp * 1000;
  const localMs = utcMs + timezoneOffsetSeconds * 1000;
  return new Date(localMs).toISOString();
};

const getDemoCondition = (seed = 0) => {
  const index = Math.abs(seed) % DEMO_CONDITIONS.length;
  return DEMO_CONDITIONS[index];
};

const createDemoWeatherData = (city = 'Karachi', lat = 24.86, lon = 67.01) => {
  const normalizedCity = String(city || 'Karachi').trim() || 'Karachi';
  const latitude = Number.isFinite(lat) ? Number(lat) : 24.86;
  const longitude = Number.isFinite(lon) ? Number(lon) : 67.01;
  const seed = Math.round((latitude + longitude + normalizedCity.length) * 10);
  const condition = getDemoCondition(seed);
  const temp = 20 + ((seed % 18) + 6);
  const feelsLike = temp + ((seed % 5) - 2);
  const date = new Date();
  const timezoneOffset = Math.max(-12, Math.min(14, Math.round(longitude / 15)));
  const localNow = new Date(date.getTime() + timezoneOffset * 60 * 60 * 1000);
  const sunrise = new Date(localNow.getTime() - 6 * 60 * 60 * 1000);
  const sunset = new Date(localNow.getTime() + 5 * 60 * 60 * 1000);

  return {
    location: {
      city: normalizedCity,
      country: 'PK',
      latitude,
      longitude,
      timezone: 'UTC' + (timezoneOffset >= 0 ? '+' : '') + timezoneOffset,
      localDate: localNow.toISOString(),
      localTime: localNow.toISOString(),
    },
    current: {
      temperature: Math.round(temp),
      feelsLike: Math.round(feelsLike),
      minTemperature: Math.round(temp - 3),
      maxTemperature: Math.round(temp + 5),
      humidity: 58 + (seed % 18),
      pressure: 1010 + (seed % 20),
      visibility: 8 + (seed % 6),
      clouds: 30 + (seed % 55),
      uvIndex: 3 + (seed % 6),
      windSpeed: 10 + (seed % 13),
      windDegree: 120 + (seed % 180),
      windGust: 15 + (seed % 21),
      condition: condition.main,
      description: condition.description,
      icon: condition.icon,
      category: condition.main,
    },
    sun: {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
    },
    alerts: [{
      type: 'info',
      title: 'Demo mode active',
      message: 'No live OpenWeatherMap key is configured, so this is a safe local demo response.',
    }],
  };
};

const createDemoForecast = (city = 'Karachi') => {
  const normalizedCity = String(city || 'Karachi').trim() || 'Karachi';
  const list = Array.from({ length: 5 }, (_, index) => {
    const current = new Date();
    current.setDate(current.getDate() + index + 1);
    const condition = getDemoCondition(index + normalizedCity.length);
    const low = 18 + ((index * 3) % 9);
    const high = low + 7 + ((index * 2) % 6);

    return {
      date: current.toISOString().split('T')[0],
      day: current.toLocaleDateString('en-US', { weekday: 'short' }),
      min: low,
      max: high,
      condition: condition.main,
      description: condition.description,
      icon: condition.icon,
      humidity: 52 + (index * 6),
      windSpeed: 8 + (index * 3),
    };
  });

  return {
    city: normalizedCity,
    country: 'PK',
    list,
  };
};

const normalizeWeatherData = (data) => {
  const timezone = data.timezone || 'UTC';
  const offset = data.timezone_offset || 0;

  return {
    location: {
      city: data.name || 'Unknown City',
      country: data.sys?.country || 'Unknown Country',
      latitude: data.coord?.lat ?? 0,
      longitude: data.coord?.lon ?? 0,
      timezone,
      localDate: new Date((Date.now() + offset * 1000)).toISOString(),
      localTime: new Date((Date.now() + offset * 1000)).toISOString(),
    },
    current: {
      temperature: Math.round((data.main?.temp ?? 0) - 273.15),
      feelsLike: Math.round((data.main?.feels_like ?? 0) - 273.15),
      minTemperature: Math.round((data.main?.temp_min ?? 0) - 273.15),
      maxTemperature: Math.round((data.main?.temp_max ?? 0) - 273.15),
      humidity: data.main?.humidity ?? 0,
      pressure: data.main?.pressure ?? 0,
      visibility: Math.round((data.visibility ?? 0) / 1000),
      clouds: data.clouds?.all ?? 0,
      uvIndex: data.uvi ?? 0,
      windSpeed: data.wind?.speed ?? 0,
      windDegree: data.wind?.deg ?? 0,
      windGust: data.wind?.gust ?? 0,
      condition: data.weather?.[0]?.main || 'Clear',
      description: data.weather?.[0]?.description || 'Clear sky',
      icon: data.weather?.[0]?.icon || '01d',
      category: data.weather?.[0]?.main || 'Clear',
    },
    sun: {
      sunrise: toLocalTime(data.sys?.sunrise ?? Date.now() / 1000, offset),
      sunset: toLocalTime(data.sys?.sunset ?? Date.now() / 1000, offset),
    },
    alerts: [],
  };
};

const fetchWeatherByCity = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return createDemoWeatherData(city);
  }

  const url = `${WEATHER_API_BASE}/weather`;
  const response = await axios.get(url, {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
    },
  });

  return normalizeWeatherData(response.data);
};

const fetchWeatherByCoordinates = async (lat, lon) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return createDemoWeatherData('Current Location', lat, lon);
  }

  const url = `${WEATHER_API_BASE}/weather`;
  const response = await axios.get(url, {
    params: {
      lat,
      lon,
      appid: apiKey,
      units: 'metric',
    },
  });

  return normalizeWeatherData(response.data);
};

const fetchForecastByCity = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return createDemoForecast(city);
  }

  const url = `${WEATHER_API_BASE}/forecast`;
  const response = await axios.get(url, {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
      cnt: 40,
    },
  });

  const items = response.data.list || [];
  const daily = {};

  items.forEach((entry) => {
    const date = entry.dt_txt.split(' ')[0];
    if (!daily[date]) {
      daily[date] = {
        date,
        day: new Date(entry.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        condition: entry.weather[0].main,
        description: entry.weather[0].description,
        icon: entry.weather[0].icon,
        humidity: entry.main.humidity,
        windSpeed: entry.wind?.speed || 0,
      };
    }

    daily[date].min = Math.min(daily[date].min, entry.main.temp_min);
    daily[date].max = Math.max(daily[date].max, entry.main.temp_max);
  });

  return {
    city: response.data.city?.name || city,
    country: response.data.city?.country || '',
    list: Object.values(daily).slice(0, 5).map((item) => ({
      ...item,
      min: Math.round(item.min),
      max: Math.round(item.max),
    })),
  };
};

module.exports = {
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  fetchForecastByCity,
};
