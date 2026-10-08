import { useEffect, useMemo, useState } from 'react';
import {
  FaBell,
  FaGlobeAmericas,
  FaHeart,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaSearch,
  FaSun,
} from 'react-icons/fa';
import './App.css';
import {
  fetchForecastByCity,
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
} from './services/weatherApi';
import {
  buildAlerts,
  countryToFlag,
  formatDate,
  formatTemperature,
  formatTime,
  getConditionTheme,
  getWeatherIcon,
} from './utils/weatherUtils';

const FAVORITES_KEY = 'weather-app-favorites';
const HISTORY_KEY = 'weather-app-history';

const readStored = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

function App() {
  const [query, setQuery] = useState('Karachi');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [favorites, setFavorites] = useState(() => readStored(FAVORITES_KEY, []));
  const [history, setHistory] = useState(() => readStored(HISTORY_KEY, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('unsupported');
    }
  }, []);

  const theme = useMemo(
    () => getConditionTheme(weather?.current?.condition || 'Clear', weather?.location?.localTime || ''),
    [weather],
  );

  const pushNotification = ({ type = 'info', title, message }) => {
    setNotifications((current) => [
      {
        id: Date.now() + Math.random(),
        type,
        title,
        message,
      },
      ...current,
    ].slice(0, 4));
  };

  const removeNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      pushNotification({
        type: 'info',
        title: 'Browser notifications unavailable',
        message: 'This browser does not support desktop notifications, so in-app alerts will continue to work.',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);

    if (permission === 'granted') {
      pushNotification({
        type: 'success',
        title: 'Notifications enabled',
        message: 'Weather alerts will now appear in your browser.',
      });
    } else {
      pushNotification({
        type: 'warning',
        title: 'Notifications blocked',
        message: 'Browser notifications are off, but in-app alerts remain available.',
      });
    }
  };

  const handleWeatherSuccess = (weatherData) => {
    const alerts = buildAlerts(weatherData.current, weatherData.location);

    alerts.forEach((alert) => {
      pushNotification(alert);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, { body: alert.message });
      }
    });
  };

  const loadWeather = async (cityName, shouldTrackHistory = true) => {
    const city = cityName.trim();

    if (!city) {
      setError('Please enter a city or location.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const weatherData = await fetchWeatherByCity(city);
      const forecastData = await fetchForecastByCity(city);

      setWeather(weatherData);
      setForecast(forecastData.list || []);
      setQuery(city);

      if (shouldTrackHistory) {
        setHistory((current) => {
          const next = [city, ...current.filter((item) => item.toLowerCase() !== city.toLowerCase())].slice(0, 7);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
          return next;
        });
      }

      handleWeatherSuccess(weatherData);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadWeather(query);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weatherData = await fetchWeatherByCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          const forecastData = await fetchForecastByCity(weatherData.location.city);
          setWeather(weatherData);
          setForecast(forecastData.list || []);
          setQuery(weatherData.location.city);
          setHistory((current) => {
            const next = [weatherData.location.city, ...current.filter((item) => item.toLowerCase() !== weatherData.location.city.toLowerCase())].slice(0, 7);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
            return next;
          });
          handleWeatherSuccess(weatherData);
          setError('');
        } catch (err) {
          setError(err.message || 'Unable to load weather from your location.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access was denied. You can still search for a city manually.');
        setLoading(false);
      },
    );
  };

  const toggleFavorite = (cityName) => {
    const city = cityName.trim();
    if (!city) return;

    setFavorites((current) => {
      const exists = current.some((item) => item.toLowerCase() === city.toLowerCase());
      const next = exists
        ? current.filter((item) => item.toLowerCase() !== city.toLowerCase())
        : [city, ...current].slice(0, 8);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = weather ? favorites.some((item) => item.toLowerCase() === weather.location.city.toLowerCase()) : false;

  useEffect(() => {
    loadWeather('Karachi', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`weather-app ${theme.className}`}>
      <div className="background-glow" />
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-icon"><FaGlobeAmericas /></div>
          <div>
            <p className="brand-label">WeatherSense</p>
            <span className="brand-subtitle">Global forecast dashboard</span>
          </div>
        </div>

        <div className="toolbar">
          {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
            <button type="button" className="secondary-btn" onClick={requestBrowserPermission}>
              <FaBell /> Allow alerts
            </button>
          )}
          <button type="button" className="primary-btn" onClick={handleGeolocation}>
            <FaLocationArrow /> Use My Location
          </button>
        </div>
      </header>

      <form className="search-form" onSubmit={handleSubmit}>
        <label htmlFor="city-search" className="sr-only">
          Search city
        </label>
        <input
          id="city-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search city or country..."
          aria-label="Search city or country"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Loading...' : <><FaSearch /> Search</>}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <section className="loading-panel" aria-live="polite">
          <div className="spinner" />
          <p>Loading weather data...</p>
        </section>
      ) : weather ? (
        <>
          <section className="hero-card">
            <div className="hero-main">
              <div className="location-row">
                <span className="country-flag"><FaMapMarkerAlt /></span>
                <div>
                  <p className="subtitle">Current weather</p>
                  <h1>
                    {weather.location.city}, {weather.location.country}
                  </h1>
                </div>
              </div>

              <div className="temperature-row">
                <div className="weather-icon">{getWeatherIcon(weather.current.condition, theme.isNight)}</div>
                <div>
                  <p className="temperature">{formatTemperature(weather.current.temperature)}</p>
                  <p className="condition-text">{weather.current.description}</p>
                </div>
              </div>

              <div className="meta-row">
                <span>Feels like {formatTemperature(weather.current.feelsLike)}</span>
                <span>High {formatTemperature(weather.current.maxTemperature)}</span>
                <span>Low {formatTemperature(weather.current.minTemperature)}</span>
              </div>
            </div>

            <div className="hero-side">
              <div className="summary-card">
                <span className="summary-label">Local time</span>
                <strong>{formatTime(weather.location.localTime)}</strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">Sunrise</span>
                <strong>{formatTime(weather.sun.sunrise)}</strong>
              </div>
              <div className="summary-card">
                <span className="summary-label">Sunset</span>
                <strong>{formatTime(weather.sun.sunset)}</strong>
              </div>
              <button type="button" className="favorite-btn" onClick={() => toggleFavorite(weather.location.city)}>
                {isFavorite ? <><FaHeart /> Remove Favorite</> : <><FaHeart /> Add Favorite</>}
              </button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <span>Humidity</span>
              <strong>{weather.current.humidity}%</strong>
            </article>
            <article className="stat-card">
              <span>Pressure</span>
              <strong>{weather.current.pressure} hPa</strong>
            </article>
            <article className="stat-card">
              <span>Visibility</span>
              <strong>{weather.current.visibility} km</strong>
            </article>
            <article className="stat-card">
              <span>Cloud cover</span>
              <strong>{weather.current.clouds}%</strong>
            </article>
            <article className="stat-card">
              <span>Wind speed</span>
              <strong>{weather.current.windSpeed} m/s</strong>
            </article>
            <article className="stat-card">
              <span>Wind direction</span>
              <strong>{weather.current.windDegree}°</strong>
            </article>
            <article className="stat-card">
              <span>Coordinates</span>
              <strong>
                {weather.location.latitude.toFixed(2)}, {weather.location.longitude.toFixed(2)}
              </strong>
            </article>
            <article className="stat-card">
              <span>Local date</span>
              <strong>{formatDate(weather.location.localDate)}</strong>
            </article>
          </section>

          <section className="forecast-panel">
            <div className="panel-header">
              <h2>5-Day forecast</h2>
            </div>

            <div className="forecast-list">
              {forecast.map((day) => (
                <div key={`${day.date}-${day.day}`} className="forecast-card">
                  <p className="forecast-day">{day.day}</p>
                  <div className="forecast-icon">{getWeatherIcon(day.condition, false)}</div>
                  <p className="forecast-temp">
                    {day.max}° / {day.min}°
                  </p>
                  <p className="forecast-condition">{day.condition}</p>
                  <div className="forecast-info">
                    <span>💧 {day.humidity}%</span>
                    <span>💨 {day.windSpeed} m/s</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bottom-grid">
            <aside className="panel">
              <div className="panel-header">
                <h3>Favorite places</h3>
              </div>
              <div className="pill-list">
                {favorites.length ? (
                  favorites.map((city) => (
                    <button type="button" key={city} className="pill" onClick={() => loadWeather(city)}>
                      ❤️ {city}
                    </button>
                  ))
                ) : (
                  <p className="empty-state">Save cities you check often.</p>
                )}
              </div>
            </aside>

            <aside className="panel">
              <div className="panel-header">
                <h3>Recent searches</h3>
                <button type="button" className="clear-history" onClick={() => setHistory([])}>
                  Clear
                </button>
              </div>
              <div className="pill-list">
                {history.length ? (
                  history.map((city) => (
                    <button type="button" key={city} className="pill" onClick={() => loadWeather(city)}>
                      🕘 {city}
                    </button>
                  ))
                ) : (
                  <p className="empty-state">No recent searches yet.</p>
                )}
              </div>
            </aside>
          </section>
        </>
      ) : null}

      <div className="notification-stack" aria-live="polite" aria-atomic="true">
        {notifications.map((notification) => (
          <div key={notification.id} className={`toast toast-${notification.type}`}>
            <div className="toast-header">
              <strong>{notification.title}</strong>
              <button type="button" onClick={() => removeNotification(notification.id)} aria-label="Dismiss notification">
                ×
              </button>
            </div>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
