# Global Weather Application

A production-style weather dashboard built with React, Vite, Node.js, Express, and OpenWeatherMap. The application lets users search any city, view live weather and forecasts, use geolocation, manage favorites and recent searches, and receive automatic in-app and browser alerts.

## Features

- Search weather by city name
- Search by latitude and longitude
- Current weather details and local time
- Multi-day forecast cards
- Automatic weather notifications
- Browser notification support
- Favorite locations using localStorage
- Recent search history using localStorage
- Dynamic weather-themed UI
- Responsive design for desktop, tablet, and mobile
- Express backend with clean REST endpoints
- Secure API key handling on the backend

## Architecture

### Frontend

The React frontend is a Vite app that communicates only with the backend API. It never exposes the weather API key to the browser.

### Backend

The Express API validates input, calls OpenWeatherMap, transforms the data, and sends clean JSON responses to the frontend.

### Database

MongoDB support is included as an optional connection layer, but the app gracefully continues in local-storage mode when no MongoDB URI is set.

## Project structure

```bash
Weather Application/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── config/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── README.md
└── .gitignore
```

## Environment setup

### Backend

Create a file called `backend/.env` and add:

```env
PORT=5050
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5
MONGODB_URI=
CLIENT_URL=http://localhost:5173,http://localhost:5177
```

Get a free API key from OpenWeatherMap and paste it into `WEATHER_API_KEY`.

### Frontend

Create a file called `frontend/.env` and add:

```env
VITE_API_URL=http://localhost:5050/api
```

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## How the app works

1. User enters a city or uses geolocation.
2. The frontend sends a request to the backend.
3. The backend validates the request and calls OpenWeatherMap.
4. Data is sanitized and returned as a clean JSON payload.
5. React renders the weather dashboard and forecast.
6. Weather alerts are generated automatically based on conditions.

## API endpoints

- `GET /api/health`
- `GET /api/weather?city=Karachi`
- `GET /api/weather/coordinates?lat=24.86&lon=67.00`
- `GET /api/forecast?city=Karachi`
- `GET /api/history`
- `POST /api/history`
- `DELETE /api/history`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:id`

## Notes

- The app works without MongoDB by falling back to localStorage for favorites and history.
- If `MONGODB_URI` is set, the backend attempts to connect to MongoDB.
- The frontend is intentionally decoupled from the weather provider for security.

## Deployment

For deployment, set the environment variables in your hosting platform and update the frontend `VITE_API_URL` to the deployed backend URL.
