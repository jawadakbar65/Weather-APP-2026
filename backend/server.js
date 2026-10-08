require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const weatherRoutes = require('./routes/weatherRoutes');
const historyRoutes = require('./routes/historyRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5050;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5177')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Global Weather API is active.',
    endpoints: {
      weather: '/api/weather?city=Karachi',
      forecast: '/api/forecast?city=Karachi',
      history: '/api/history',
      favorites: '/api/favorites',
    },
  });
});

app.use('/api', weatherRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use(notFound);
app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
