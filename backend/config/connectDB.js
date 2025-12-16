const mongoose = require('mongoose');

const isSrvDnsLookupError = (err) => {
  const code = err?.code;
  const message = String(err?.message || '');
  return (
    code === 'ETIMEOUT' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    message.includes('queryTxt')
  );
};

const connectDB = async ({ mongoUri, mongoUriDirect, dbName } = {}) => {
  try {
    const primaryMongoUri = mongoUri || process.env.MONGO_URI;
    const directMongoUri = mongoUriDirect || process.env.MONGO_URI_DIRECT;
    const resolvedDbName = dbName || process.env.MONGO_DB_NAME || 'mernproject';

    if (!primaryMongoUri) {
      throw new Error('Missing MONGO_URI environment variable');
    }

    try {
      await mongoose.connect(primaryMongoUri, { dbName: resolvedDbName });
      console.log(`MongoDB connected successfully (db: ${resolvedDbName})`);
      return { mongoUri: primaryMongoUri, dbName: resolvedDbName, usedDirectUri: false };
    } catch (error) {
      const canFallbackToDirect =
        Boolean(directMongoUri) &&
        typeof primaryMongoUri === 'string' &&
        primaryMongoUri.startsWith('mongodb+srv://') &&
        isSrvDnsLookupError(error);

      if (!canFallbackToDirect) {
        throw error;
      }

      console.warn(
        `MongoDB SRV DNS lookup failed (${error.code || 'UNKNOWN'}). Falling back to MONGO_URI_DIRECT.`
      );

      await mongoose.connect(directMongoUri, { dbName: resolvedDbName });
      console.log(`MongoDB connected successfully (db: ${resolvedDbName})`);
      return { mongoUri: directMongoUri, dbName: resolvedDbName, usedDirectUri: true };
    }
  } catch (error) {
    const details = `${error?.code ? `${error.code}: ` : ''}${error?.message || error}`;
    console.error('MongoDB connection failed:', details);
    throw error;
  }
};

module.exports = connectDB;