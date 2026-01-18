const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const dns = require('dns');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { Server: SocketIOServer } = require('socket.io');
const { setSocketServer } = require('./utils/realtime');
const ChatThread = require('./models/ChatThread');
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
      if (String(err?.message || '').includes('Unable to find the session to touch')) return;
      console.error('Session store error:', err);
    });

    // suppress noisy touch errors when a stale session cookie is presented
    if (typeof sessionStore.touch === 'function') {
      const originalTouch = sessionStore.touch.bind(sessionStore);
      sessionStore.touch = (sid, session, callback) => {
        return originalTouch(sid, session, (err) => {
          if (String(err?.message || '').includes('Unable to find the session to touch')) {
            return callback?.();
          }
          return callback?.(err);
        });
      };
    }

    const sessionMiddleware = session({
      name: 'sid',
      secret: sessionSecret,
      proxy: process.env.NODE_ENV === 'production',
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: cookieConfig,
    });
    app.use(sessionMiddleware);

    await seedRoles();
    await seedAdminUser();

    // routes
    app.use('/api/auth', require('./routes/auth.route'));
    app.use('/api/messages', require('./routes/message.route'));
    app.use('/api/jobs', require('./routes/job.route'));
    app.use('/api/applications', require('./routes/application.route'));
    app.use('/api/profiles', require('./routes/profile.route'));
    app.use('/api/social', require('./routes/social.route'));
    app.use('/api/chat', require('./routes/chat.route'));
    app.use('/api/notifications', require('./routes/notification.route'));
    app.use('/api/recommendations', require('./routes/recommendation.route'));
    app.use('/api/stats', require('./routes/stats.route'));

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

    let server;
    if (process.env.HTTPS_ENABLED === 'true') {
      const keyPath = process.env.HTTPS_KEY_PATH;
      const certPath = process.env.HTTPS_CERT_PATH;

      if (!keyPath || !certPath) {
        console.error('HTTPS enabled but HTTPS_KEY_PATH or HTTPS_CERT_PATH missing.');
        process.exit(1);
      }

      const key = fs.readFileSync(path.resolve(keyPath));
      const cert = fs.readFileSync(path.resolve(certPath));

      server = https.createServer({ key, cert }, app);
    } else {
      server = http.createServer(app);
    }

    const clientOrigin = process.env.CLIENT_ORIGIN || 'https://localhost:5173';
    const io = new SocketIOServer(server, {
      cors: {
        origin: clientOrigin,
        credentials: true,
      },
    });

    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });

    const onlineUsers = new Set();

    io.on('connection', (socket) => {
      const userId = socket.request?.session?.userId;
      if (!userId) {
        socket.disconnect(true);
        return;
      }
      socket.join(`user:${userId}`);
      onlineUsers.add(String(userId));
      io.emit('presence:update', { userId: String(userId), online: true });

      socket.on('joinThread', async (threadId) => {
        try {
          if (!threadId) return;
          const thread = await ChatThread.findById(threadId).select('participants').lean();
          if (!thread) return;
          const participants = (thread.participants || []).map(String);
          if (!participants.includes(String(userId))) return;
          socket.join(`thread:${threadId}`);
        } catch (err) {
          // ignore
        }
      });

      socket.on('threadRead', async (threadId) => {
        try {
          if (!threadId) return;
          const thread = await ChatThread.findById(threadId).select('participants').lean();
          if (!thread) return;
          const participants = (thread.participants || []).map(String);
          if (!participants.includes(String(userId))) return;
          await require('./models/ChatMessage').updateMany(
            { thread: threadId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
          );
          io.to(`thread:${threadId}`).emit('chat:read', { threadId: String(threadId), userId: String(userId) });
        } catch (err) {
          // ignore
        }
      });

      socket.on('disconnect', () => {
        onlineUsers.delete(String(userId));
        io.emit('presence:update', { userId: String(userId), online: false });
      });
    });

    setSocketServer(io);

    server.listen(PORT, (err) => {
      if (err) {
        console.error('Server error:', err);
      } else if (process.env.HTTPS_ENABLED === 'true') {
        console.log(`HTTPS server running on https://localhost:${PORT}`);
      } else {
        console.log(`HTTP server running on http://localhost:${PORT}`);
      }
    });
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