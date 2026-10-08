const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MongoDB URI not configured. Running in local-storage-only mode.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed. Continuing without database features.');
    console.warn(error.message);
    return false;
  }
};

module.exports = { connectDB };
