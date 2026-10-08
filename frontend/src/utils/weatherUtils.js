export const formatTemperature = (value) => `${Math.round(Number(value || 0))}°C`;

export const formatTime = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const countryToFlag = (countryCode = '') => {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  const code = countryCode.toUpperCase();
  return Array.from(code)
    .map((char) => 127397 + char.charCodeAt(0))
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join('');
};

export const getWeatherIcon = (condition = '', isNight = false) => {
  const normalized = (condition || '').toLowerCase();

  if (normalized.includes('thunderstorm')) return '⛈️';
  if (normalized.includes('rain')) return '🌧️';
  if (normalized.includes('snow')) return '❄️';
  if (normalized.includes('cloud')) return '☁️';
  if (normalized.includes('mist') || normalized.includes('fog')) return '🌫️';
  if (normalized.includes('clear')) return isNight ? '🌙' : '☀️';

  return '🌤️';
};

export const getConditionTheme = (condition = 'Clear', localTime = '') => {
  const normalized = (condition || '').toLowerCase();
  const hour = localTime ? new Date(localTime).getHours() : new Date().getHours();
  const isNight = hour < 6 || hour >= 18;

  if (normalized.includes('rain') || normalized.includes('drizzle')) {
    return { className: 'theme-rain', isNight };
  }

  if (normalized.includes('snow')) {
    return { className: 'theme-snow', isNight };
  }

  if (normalized.includes('thunder')) {
    return { className: 'theme-storm', isNight };
  }

  if (normalized.includes('cloud')) {
    return { className: 'theme-cloud', isNight };
  }

  if (isNight) {
    return { className: 'theme-night', isNight: true };
  }

  return { className: 'theme-clear', isNight: false };
};

export const buildAlerts = (current = {}, location = {}) => {
  const alerts = [];

  const temperature = Number(current.temperature || 0);
  const condition = (current.condition || '').toLowerCase();
  const windSpeed = Number(current.windSpeed || 0);

  if (temperature >= 35) {
    alerts.push({
      type: 'danger',
      title: '🔥 Heat Alert',
      message: `The temperature in ${location.city || 'this location'} is currently ${Math.round(temperature)}°C. Stay hydrated and avoid prolonged exposure to direct sunlight.`,
    });
  }

  if (temperature <= 5) {
    alerts.push({
      type: 'warning',
      title: '🥶 Cold Alert',
      message: `The temperature in ${location.city || 'this location'} is very low. Dress warmly and take necessary precautions.`,
    });
  }

  if (condition.includes('rain') || condition.includes('drizzle')) {
    alerts.push({
      type: 'info',
      title: '🌧️ Rain Alert',
      message: `Rain is expected in ${location.city || 'this location'}. Don’t forget your umbrella.`,
    });
  }

  if (condition.includes('thunder')) {
    alerts.push({
      type: 'danger',
      title: '⛈️ Thunderstorm Alert',
      message: `Thunderstorms may affect ${location.city || 'this location'}. Stay indoors when possible.`,
    });
  }

  if (windSpeed >= 28) {
    alerts.push({
      type: 'warning',
      title: '💨 Wind Alert',
      message: `Strong winds are currently affecting ${location.city || 'this location'}. Take appropriate precautions.`,
    });
  }

  if (condition.includes('snow')) {
    alerts.push({
      type: 'warning',
      title: '❄️ Snow Advisory',
      message: `Snow conditions may impact ${location.city || 'this location'}. Travel carefully and check local updates.`,
    });
  }

  return alerts.slice(0, 2);
};
