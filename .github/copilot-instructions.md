# Copilot Instructions for FBPA API

## Project Overview

This is the **Freight Bill Payment Audit (FBPA) API** — a Node.js/Express REST API backend for auditing freight invoices, tracking carrier billing discrepancies, and managing payment workflows for HDH Transport. It stores data in MongoDB and includes a bundled React frontend (Vite) and an optional Next.js frontend in `my-mongodb-app/`.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js |
| Database | MongoDB via Mongoose ODM |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` password hashing |
| File uploads | Multer (CSV / images) |
| CSV parsing | `csv-parse` |
| Email | Nodemailer |
| Validation | `express-validator` |
| Frontend | React 18 + Vite (in `src/`) |
| Alt frontend | Next.js + TypeScript + Tailwind (in `my-mongodb-app/`) |
| Deployment | Railway · Render · Vercel · Heroku |

## Module System

The project uses **ES modules** (`"type": "module"` in `package.json`). Always use `import`/`export` syntax — **never** `require()`/`module.exports`. All `import` statements must appear at the top of each file.

## Repository Structure

```
index.js                  # Main Express server entry point (port 4000)
package.json              # Project config & scripts
.env.example              # Environment variable template — copy to .env

# Route handlers (root-level, legacy style)
customers.js
carriers.js
invoices.js
exceptions.js
messages.js
rateLogic.js
dashboard.js
reports.js
uploads.js
invoiceImages.js
edi.js

# Route handlers (modular style under routes/)
routes/auth.js            # /api/auth  — register & login
routes/audits.js          # /api/audits
routes/dashboard.js       # /api/dashboard
routes/exceptions.js      # /api/exceptions
routes/invoices.js        # /api/invoices
routes/reports.js         # /api/reports
routes/uploads.js         # /api/uploads

# Mongoose models
models/Users.js           # User schema (model name: "Users")
models/Audit.js
models/Carrier.js
models/Customer.js
models/Exception.js
models/Invoice.js

# Supporting directories
db/connection.js          # MongoDB connection helper
middleware/validators.js  # express-validator rule sets
scripts/addUser.js        # CLI utility to add a user
src/                      # React/Vite frontend source
public/                   # Static HTML pages
my-mongodb-app/           # Separate Next.js application
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (auto-restarts on change)
npm run dev         # runs: nodemon index.js  (API on http://localhost:4000)

# Start production server
npm start           # runs: node index.js

# Vite frontend dev server
npm run dev:ui      # http://localhost:5173

# Build frontend for production
npm run build       # outputs to dist/

# Preview production build
npm run preview

# Health check (requires jq or falls back to plain curl)
npm run health

# Integration tests (spawns server + HTTP smoke tests)
npm run test:backend-flow   # runs: node backend-flow-test.js
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values before running locally.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (also accepts `MONGODB_URL`, `MONGO_URL`, `MONGO_URI`, `DATABASE_URL`) |
| `JWT_SECRET` | Yes | Minimum 32-character secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default `1h`) |
| `PORT` | No | Server port (default `4000`) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Comma-separated list of additional allowed origins |
| `SERVE_STATIC` | No | Set to `true` to serve Vite build from Express |
| `SMTP_HOST/USER/PASS/FROM` | No | SMTP credentials for Nodemailer |

## API Endpoints

All routes are prefixed with `/api`.

| Prefix | File | Purpose |
|---|---|---|
| `/api/auth` | `routes/auth.js` | Register & login (returns JWT) |
| `/api/customers` | `customers.js` | Customer CRUD + CSV bulk upload |
| `/api/carriers` | `carriers.js` | Carrier CRUD |
| `/api/invoices` | `invoices.js` / `routes/invoices.js` | Invoice CRUD + file upload |
| `/api/exceptions` | `exceptions.js` / `routes/exceptions.js` | Billing discrepancy CRUD |
| `/api/audits` | `routes/audits.js` | Audit log CRUD |
| `/api/dashboard` | `dashboard.js` / `routes/dashboard.js` | Summary metrics |
| `/api/reports` | `reports.js` / `routes/reports.js` | Monthly & exception reports |
| `/api/uploads` | `uploads.js` / `routes/uploads.js` | Upload history |
| `/api/invoice-images` | `invoiceImages.js` | Invoice image upload & verify |
| `/api/messages` | `messages.js` | Email / notification sending |
| `/api/rate-logic` | `rateLogic.js` | Shipping rate calculation |
| `/api/edi` | `edi.js` | EDI system integration |
| `/api/health` | `index.js` | Server & DB health check |

## Coding Conventions

- **ES modules only**: use `import`/`export` throughout; never CommonJS.
- **Async/await**: prefer `async`/`await` over callbacks or raw `.then()` chains.
- **Error handling**: wrap route handlers in `try/catch` and return `res.status(4xx|5xx).json({ error: '...' })` on failure. Always include a meaningful `error` string.
- **Mongoose models**: import from `models/<Name>.js`. The User model is registered as `"Users"` — use `ref: 'Users'` in any schema that references users.
- **Validation**: use `express-validator` middleware (see `middleware/validators.js`) for request body validation before reaching route logic.
- **JWT auth**: decode/verify the `Authorization: Bearer <token>` header in protected routes using `jsonwebtoken`.
- **CORS**: allowed origins are configured in `index.js`. Add new production origins to the `defaultAllowedOrigins` array or via the `CORS_ORIGIN` environment variable.
- **File uploads**: use `multer` for multipart form data; upload directory is `uploads/`.
- **No linting tools are configured**: maintain consistent style manually (2-space indentation, single quotes, semicolons).

## Testing

There is no Jest/Mocha/Vitest setup. The project ships with a single custom integration test:

```bash
npm run test:backend-flow   # node backend-flow-test.js
```

This script starts the server on a random port, waits for the DB health check, then exercises the main API endpoints with HTTP requests. New tests should follow the same pattern in `backend-flow-test.js`.

## Deployment Notes

- **Railway**: `railway.json` and `Procfile` configure the start command (`node index.js`).
- **Render**: `render.yaml` defines the web service build and start commands.
- **Vercel**: the optional Next.js frontend (`my-mongodb-app/`) can be deployed to Vercel independently.
- The server requires Node.js ≥ 18 (declared in `engines` in `package.json`).
- Set `SERVE_STATIC=true` only if deploying the Express API and the Vite React frontend from the same process.
