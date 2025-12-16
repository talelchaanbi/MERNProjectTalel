const path = require('path');
const https = require('https');
const fs = require('fs');
const dns = require('dns');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

const configureMongoDnsServers = () => {
  const raw = process.env.MONGO_DNS_SERVERS;
  if (!raw) return;

  const servers = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (servers.length === 0) return;
  dns.setServers(servers);
  console.log(`Using custom DNS servers for MongoDB lookups: ${servers.join(', ')}`);
};

// Azure/App Service runs behind a reverse proxy (TLS terminates at the edge).
// Trust X-Forwarded-* so secure cookies work in production.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const connectDB = require('./config/connectDB');
const seedRoles = require('./config/seed/seedRoles');
const seedAdminUser = require('./config/seed/seedAdminUser');

const startServer = async () => {
  try {
    configureMongoDnsServers();

    const { mongoUri, dbName } = await connectDB();

    const sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      dbName,
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
        proxy: process.env.NODE_ENV === 'production',
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: cookieConfig,
      })
    );

    await seedRoles();
    await seedAdminUser();

    // routes
    app.use('/api/auth', require('./routes/auth.route'));

    // Serve React build (copied to backend/public) in production.
    const publicDir = path.join(__dirname, 'public');
    const indexHtmlPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      app.use(express.static(publicDir));
      // Express 5 route pattern: use regex ("*") can be problematic.
      app.get(/^(?!\/api).*/, (req, res) => res.sendFile(indexHtmlPath));
    }

    const PORT = process.env.PORT || 4500;

    const clearSessionsOnStartup =
      process.env.CLEAR_SESSIONS_ON_STARTUP === 'true' &&
      process.env.NODE_ENV !== 'production';
    if (clearSessionsOnStartup) {
      await sessionStore.clear();
      console.log('Session store cleared (startup)');
    }

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
    const details = `${error?.code ? `${error.code}: ` : ''}${error?.message || error}`;
    console.error('Server bootstrap failed:', details);

    if (
      String(details).includes('queryTxt') ||
      error?.code === 'ETIMEOUT' ||
      error?.code === 'ENOTFOUND' ||
      error?.code === 'EAI_AGAIN'
    ) {
      console.error(
        'Hint: this looks like a DNS/TXT lookup issue resolving an Atlas `mongodb+srv://` URI. ' +
          'Try setting `MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8` or provide `MONGO_URI_DIRECT` (non-SRV) as a fallback.'
      );
    }
    process.exit(1);
  }
};

startServer();