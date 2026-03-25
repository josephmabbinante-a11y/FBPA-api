# FBPA API

A Node.js / Express REST API for freight billing and payment auditing. Includes JWT authentication, MongoDB persistence, and a bundled React front-end (Vite).

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in the values
cp .env.example .env

# 3. Start the server (development)
node index.js
```

## Environment variables

Copy `.env.example` to `.env` for local development. **Never commit `.env` to source control.**

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **Yes** | Random secret used to sign JWTs. Must be ≥ 32 characters. See below for how to generate one. |
| `MONGODB_URI` | **Yes** (for DB features) | MongoDB connection string. Also accepts `MONGODB_URL`, `MONGO_URL`, `MONGO_URI`, or `DATABASE_URL`. |
| `PORT` | No | HTTP port to listen on (default: `3000`). Railway sets this automatically. |
| `NODE_ENV` | No | Set to `production` on hosted deployments. Railway sets this via `railway.toml`. |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `8h`). Examples: `1h`, `24h`, `7d`. |
| `CORS_ORIGIN` | No | Comma-separated list of allowed CORS origins. Leave unset to allow all (development only). |
| `SERVE_STATIC` | No | Set to `true` to serve the React build from `dist/` on this server. |
| `VITE_API_URL` | No | Backend URL used during the Vite front-end build (e.g. `https://fbpaapi.up.railway.app`). |

### Generating a secure `JWT_SECRET`

**Node.js (recommended):**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**openssl:**
```bash
openssl rand -hex 48
```

Copy the output and use it as the value for `JWT_SECRET`. Never share or commit this value.

## Deploying to Railway

See **[docs/railway.md](docs/railway.md)** for full Railway deployment instructions, including how to set environment variables and troubleshoot startup failures.

## Project structure

```
index.js          # Express app entry point & startup validation
routes/           # API route handlers (auth, customers, carriers, …)
models/           # Mongoose models
middleware/       # Auth verification, validators, etc.
scripts/          # Utility scripts (DB ping, add user)
docs/             # Deployment documentation
public/           # Static assets
src/              # React front-end source (Vite)
```

## API overview

| Prefix | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login and receive a JWT |
| `POST /api/auth/refresh` | Refresh an existing JWT |
| `GET /api/health` | Health-check endpoint (no auth required) |
| `/api/customers` | Customer CRUD |
| `/api/carriers` | Carrier CRUD |
| `/api/invoices` | Invoice management |
| `/api/exceptions` | Exception tracking |
| `/api/loads` | Load management |
| `/api/drivers` | Driver management |
| `/api/vehicles` | Vehicle management |
| `/api/trips` | Trip management |
| `/api/locations` | Location management |
| `/api/shipments` | Shipment management |

All routes except `/api/auth/*` and `/api/health` require a `Bearer <token>` header.
