const path = require('path');
const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

// middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('Missing SESSION_SECRET environment variable');
  process.exit(1);
}

const sessionHours = parseInt(process.env.SESSION_MAX_AGE_HOURS || '6', 10);
const sessionMs = sessionHours * 60 * 60 * 1000;

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: sessionMs,
};

if (process.env.HTTPS_ENABLED === 'true') {
  cookieConfig.secure = true;
  cookieConfig.sameSite = 'none';
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  dbName: process.env.MONGO_DB_NAME,
  collectionName: 'sessions',
  ttl: sessionHours * 60 * 60,
});

sessionStore.on('error', (err) => {
  console.error('Session store error:', err);
});

app.use(
  session({
    name: 'sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: cookieConfig,
  })
);

const connectDB = require('./config/connectDB');
const seedRoles = require('./config/seed/seedRoles');
const seedAdminUser = require('./config/seed/seedAdminUser');

const startServer = async () => {
  try {
    await connectDB();
    await seedRoles();
    await seedAdminUser();

    // routes
    app.use('/api/auth', require('./routes/auth.route'));

    const PORT = process.env.PORT || 4500;

  await sessionStore.clear();
  console.log('Session store cleared (startup)');

  if (process.env.HTTPS_ENABLED === 'true') {
      const keyPath = process.env.HTTPS_KEY_PATH;
      const certPath = process.env.HTTPS_CERT_PATH;

      if (!keyPath || !certPath) {
        console.error('HTTPS enabled but HTTPS_KEY_PATH or HTTPS_CERT_PATH missing.');
        process.exit(1);
      }

      const key = fs.readFileSync(path.resolve(keyPath));
      const cert = fs.readFileSync(path.resolve(certPath));

      https.createServer({ key, cert }, app).listen(PORT, (err) => {
        if (err) {
          console.error('HTTPS server error:', err);
        } else {
          console.log(`HTTPS server running on https://localhost:${PORT}`);
        }
      });
    } else {
      app.listen(PORT, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`HTTP server running on http://localhost:${PORT}`);
        }
      });
    }
  } catch (error) {
    console.error('Server bootstrap failed:', error.message);
    process.exit(1);
  }
};

startServer();