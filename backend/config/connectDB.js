const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'mernproject';

    if (!mongoUri) {
      throw new Error('Missing MONGO_URI environment variable');
    }

    await mongoose.connect(mongoUri, { dbName });
    console.log(`MongoDB connected successfully (db: ${dbName})`);
  } catch (error) {
    console.log('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;