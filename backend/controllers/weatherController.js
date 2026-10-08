const { fetchWeatherByCity, fetchWeatherByCoordinates, fetchForecastByCity } = require('../services/weatherService');

const getHealth = (req, res) => {
  res.json({
    success: true,
    message: 'Weather API is running.',
    timestamp: new Date().toISOString(),
  });
};

const getWeather = async (req, res, next) => {
  try {
    const city = req.query.city?.trim();

    if (!city) {
      const error = new Error('Please enter a city or location.');
      error.statusCode = 400;
      throw error;
    }

    const weatherData = await fetchWeatherByCity(city);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    next(error);
  }
};

const getWeatherByCoordinates = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      const error = new Error('Latitude and longitude are required.');
      error.statusCode = 400;
      throw error;
    }

    const weatherData = await fetchWeatherByCoordinates(lat, lon);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    next(error);
  }
};

const getForecast = async (req, res, next) => {
  try {
    const city = req.query.city?.trim();

    if (!city) {
      const error = new Error('Please enter a city or location.');
      error.statusCode = 400;
      throw error;
    }

    const forecastData = await fetchForecastByCity(city);
    res.json({ success: true, data: forecastData });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHealth, getWeather, getWeatherByCoordinates, getForecast };
