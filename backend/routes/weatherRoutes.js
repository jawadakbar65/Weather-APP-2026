const express = require('express');
const { getWeather, getWeatherByCoordinates, getForecast, getHealth } = require('../controllers/weatherController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/weather', getWeather);
router.get('/weather/coordinates', getWeatherByCoordinates);
router.get('/forecast', getForecast);

module.exports = router;
