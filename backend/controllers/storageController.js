const historyStore = [];
const favoritesStore = [];

const getHistory = (req, res) => {
  res.json({ success: true, data: historyStore.slice(-10).reverse() });
};

const addHistory = (req, res) => {
  const city = String(req.body?.city || '').trim();

  if (!city) {
    const error = new Error('City is required.');
    error.statusCode = 400;
    throw error;
  }

  const existingIndex = historyStore.findIndex((entry) => entry.city.toLowerCase() === city.toLowerCase());
  if (existingIndex !== -1) {
    historyStore.splice(existingIndex, 1);
  }

  historyStore.push({ id: Date.now().toString(), city, createdAt: new Date().toISOString() });
  res.status(201).json({ success: true, data: historyStore.slice(-10).reverse() });
};

const clearHistory = (req, res) => {
  historyStore.length = 0;
  res.json({ success: true, data: [] });
};

const getFavorites = (req, res) => {
  res.json({ success: true, data: favoritesStore });
};

const addFavorite = (req, res) => {
  const city = String(req.body?.city || '').trim();

  if (!city) {
    const error = new Error('City is required.');
    error.statusCode = 400;
    throw error;
  }

  const exists = favoritesStore.some((item) => item.city.toLowerCase() === city.toLowerCase());
  if (exists) {
    return res.status(200).json({ success: true, data: favoritesStore });
  }

  const entry = { id: Date.now().toString(), city, createdAt: new Date().toISOString() };
  favoritesStore.push(entry);
  res.status(201).json({ success: true, data: favoritesStore });
};

const removeFavorite = (req, res) => {
  const { id } = req.params;
  const filtered = favoritesStore.filter((item) => item.id !== id);
  favoritesStore.length = 0;
  filtered.forEach((item) => favoritesStore.push(item));
  res.json({ success: true, data: favoritesStore });
};

module.exports = {
  getHistory,
  addHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
};
