# MERNProject Backend

Secure Express/MongoDB backend supporting user registration, login, session-based authentication, and role seeding.

## Features

- MongoDB connection via Mongoose with role seeding.
- Multer-based profile picture upload with default avatar fallback.
- Session authentication stored in MongoDB (`express-session` + `connect-mongo`).
- HTTPS-ready server configuration with optional self-signed certificates.
- Protected routes (`/api/auth/me`, `/api/auth/logout`).

## Prerequisites

- Node.js 18+
- npm
- MongoDB instance (Atlas or local)
- OpenSSL (for local HTTPS certificates)

## Setup

```bash
cd backend
npm install
```

Create `backend/.env` (values below are examples):

```
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/mernproject
MONGO_DB_NAME=mernproject
SESSION_SECRET=supersecurecookiesecret
SESSION_MAX_AGE_HOURS=6
HTTPS_ENABLED=false
HTTPS_KEY_PATH=certs/server.key
HTTPS_CERT_PATH=certs/server.crt
PORT=4500
```

## Optional: Self-signed HTTPS (development)

```bash
cd backend
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -subj "/CN=localhost"
```
Set `HTTPS_ENABLED=true` (and paths) in `.env`.

## Run

```bash
npm run dev
```
- HTTP: `http://localhost:4500`
- HTTPS (if enabled): `https://localhost:4500`

Server clears all sessions on startup. Cookies are `httpOnly`, `secure` in HTTPS mode, and expire based on `SESSION_MAX_AGE_HOURS`.

## API Endpoints

### POST `/api/auth/register`
- Body: JSON or multipart form
```json
{
  "username": "lea.dupont",
  "email": "lea.dupont@example.com",
  "password": "StrongPass!23",
  "phone": "+21612345678",
  "role": "CONSULTANT"
}
```
- Optional: `profilePicture` file (form-data). If omitted, default avatar applies.

### POST `/api/auth/login`
- Body:
```json
{
  "email": "lea.dupont@example.com",
  "password": "StrongPass!23"
}
```
- Response sets a session cookie (`sid`).

### GET `/api/auth/me`
- Requires session cookie. Returns current user data.

### POST `/api/auth/logout`
- Requires session. Destroys session and clears cookie.

## Testing with Postman

1. Login request; inspect the `sid` cookie in the cookie jar.
2. Subsequent `GET /api/auth/me` uses the cookie automatically.
3. `POST /api/auth/logout` clears the session.
4. Restarting the server wipes the session store; re-login afterward.

## Folder Structure

```
backend/
  certs/             # HTTPS certificates (optional)
  config/            # DB connection + role seed
  controllers/       # Auth logic
  middleware/        # Session auth
  models/            # Mongoose models (User, Role)
  routes/            # Express routes
  uploads/           # Multer uploads
  utils/             # Multer configuration
```

## Future Improvements

- Add request validation (Joi/Zod)
- Rate-limit login attempts
- Add CSRF protection for cookie-based sessions
- Implement refresh tokens or MFA if requirements grow

## Deployment (Azure App Service + MongoDB Atlas)

This repo is set up so Azure can deploy the whole repository as a single Node app:

- Root `package.json` builds the React app (`frontend/`) and copies it into `backend/public/`.
- `backend/server.js` serves the SPA in production (and still serves `/api/*` + `/uploads`).

### 1) MongoDB Atlas

- Create a cluster and database user.
- Add Network Access:
  - For a quick test: allow `0.0.0.0/0` (not recommended long-term)
  - Better: allow your Azure App Service outbound IPs.

### 2) Azure Web App

- Create **Web App** (Linux) with **Node.js** runtime.
- Deployment source: GitHub (recommended) or Local Git.

### 3) App Service Configuration (Environment Variables)

In **App Service → Configuration → Application settings**, set:

- `NODE_ENV=production`
- `MONGO_URI=...` (your Atlas connection string)
- `MONGO_DB_NAME=mernproject`
- `SESSION_SECRET=...` (long random string)
- `SESSION_MAX_AGE_HOURS=6`
- `HTTPS_ENABLED=false`
- `CLEAR_SESSIONS_ON_STARTUP=false`

Do not hardcode `PORT` on Azure; App Service injects it and the server uses `process.env.PORT`.

### 4) Startup Command

Set the startup command to:

```bash
npm start
```

### 5) What Azure Builds

Azure will run the root scripts:

- `postinstall`: installs `backend/` + `frontend/` dependencies
- `build`: builds `frontend/` and copies output into `backend/public/`
- `start`: runs the backend server

### 6) Verify

Open your App Service URL and verify:

- Frontend loads (served by Express)
- API works under `/api/auth/*`
- Uploads are reachable under `/uploads/*`
