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

# Optional: override DNS resolvers used for Atlas SRV TXT lookups
MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8

# Optional: fallback if your network blocks SRV/TXT lookups (use Atlas "Standard connection string")
MONGO_URI_DIRECT=mongodb://user:password@host1:27017,host2:27017,host3:27017/mernproject?replicaSet=...&ssl=true&authSource=admin

MONGO_DB_NAME=mernproject
SESSION_SECRET=supersecurecookiesecret
SESSION_MAX_AGE_HOURS=6
HTTPS_ENABLED=false
HTTPS_KEY_PATH=certs/server.key
HTTPS_CERT_PATH=certs/server.crt
PORT=4500
```

## Troubleshooting: `queryTxt ETIMEOUT ...mongodb.net`

If you see `MongoDB connection failed: ETIMEOUT: queryTxt ...`, your network/DNS is timing out on the Atlas SRV/TXT lookup used by `mongodb+srv://`.

- First try: set `MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8`
- If it still fails: set `MONGO_URI_DIRECT` to the Atlas **Standard connection string (mongodb://)**
- Also check Atlas **Network Access** allows your current IP (or temporarily `0.0.0.0/0` for dev)
# MERN Project — Démo (FR)

Application de démonstration full‑stack (MERN) mettant en œuvre :
- Authentification sécurisée (sessions côté serveur)
- Gestion des rôles (ADMIN, RECRUT, CONSULTANT)
- Uploads de profil, gestion des utilisateurs (admin)
- Formulaire de contact/support (landing page) + table de messages consultable par l'admin
- Déploiement prévu pour Azure + MongoDB Atlas

Le README suivant explique l'installation locale, les variables d'environnement importantes et les points d'API principaux.

## Fonctionnalités principales
- Authentification (email + mot de passe) avec sessions stockées en MongoDB
- Rôles utilisateurs et contrôle d'accès basé sur rôle
- Upload d'avatar (multer) et utilisation de FormData côté client
- **Formulaire de contact** sur la landing page ; messages persistés en base et consultables par les administrateurs (`/api/messages`)
- Déploiement/serving du build React par Express en production

## Prérequis
- Node.js 18+
- npm
- MongoDB (Atlas ou local)

## Installation & démarrage (dev)

1. Installer les dépendances backend :

```bash
cd backend
npm install
```

2. Installer les dépendances frontend :

```bash
cd frontend
npm install
```

3. Variables d'environnement (ex. `backend/.env`) :

```
MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/mernproject
MONGO_DB_NAME=mernproject
SESSION_SECRET=une_chaine_longue_et_secrete
SESSION_MAX_AGE_HOURS=6
HTTPS_ENABLED=false
PORT=4500
```

Si vous utilisez Atlas et rencontrez des erreurs DNS (TXT query timeout), essayez `MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8` ou fournissez `MONGO_URI_DIRECT` (connexion non-SRV).

4. Lancer en local (chaque dossier dans un terminal) :

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Le frontend est accessible en développement via Vite (habituellement http://localhost:5173) et le backend en http://localhost:4500.

## Endpoints importants

- Auth : `/api/auth/*` (register, login, me, logout, users)
- Messages (contact/support) :
  - POST `/api/messages` — création d'un message (public)
  - GET `/api/messages` — liste (ADMIN only)
  - GET `/api/messages/:id` — détail (ADMIN only)
  - PATCH `/api/messages/:id/read` — marquer lu (ADMIN only)

## Utilisation

- Sur la landing page, un bouton **Contact / Support** ouvre un formulaire. Les messages envoyés sont stockés et visibles par un administrateur via l'interface "Messages".
- Les administrateurs peuvent marquer les messages comme lus, exporter ou répondre en dehors de l'application (par email).

## Déploiement (notes rapides)

- Pousser la branche sur un service CI (Azure App Service recommandé).
- Le script `build` du repo construit le frontend et copie le build dans `backend/public` pour que Express serve le SPA en production.

## Tests & Debug
- Aucune suite de tests intégrée pour l'instant. Pour tester rapidement :
  1. Lancer backend et frontend
  2. Utiliser le formulaire de contact (landing) et vérifier que le message apparaît dans **Messages** après connexion avec un compte ADMIN

## Contribuer
- Ouvrez une issue ou envoyez une PR pour corrections, améliorations UI/UX, tests ou ajout de fonctionnalités (notifications email, export CSV des messages, pagination).

