# Deploying to Railway

This guide covers everything you need to successfully deploy the FBPA API to [Railway](https://railway.app).

## Why the app crashes on Railway without configuration

Railway deployments do **not** include your local `.env` file. The app validates critical environment variables at startup and intentionally crashes in `production` mode if they are missing, preventing silent authentication failures.

The most common crash message is:

```
Error: [startup] JWT_SECRET is missing or too short (must be at least 32 characters).
Fix: set JWT_SECRET in your environment.
  • Railway: Dashboard → your service → Variables → add JWT_SECRET
  ...
```

**Solution: set the required variables in Railway's Variables UI before deploying.**

---

## Step-by-step Railway deployment

### 1. Create the Railway service

1. Go to [railway.app](https://railway.app) and open (or create) your project.
2. Click **+ New** → **GitHub Repo** and select `josephmabbinante-a11y/FBPA-api`.
3. Railway will auto-detect the `railway.toml` and use Nixpacks to build.

### 2. Set required environment variables

In the Railway dashboard:

1. Click on your service → **Variables** tab.
2. Add each variable below using **Raw Editor** or the **+ New Variable** button.

#### Required variables

| Variable | Example value | Notes |
|---|---|---|
| `JWT_SECRET` | *(see generation instructions below)* | **Must be ≥ 32 characters.** Never use a guessable value. |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` | Also accepts `MONGODB_URL`, `MONGO_URL`, `MONGO_URI`, or `DATABASE_URL`. |

#### Optional but recommended

| Variable | Example value | Notes |
|---|---|---|
| `JWT_EXPIRES_IN` | `8h` | Token lifetime. Examples: `1h`, `24h`, `7d`. Defaults to `8h`. |
| `CORS_ORIGIN` | `https://myapp.vercel.app,https://www.mysite.com` | Comma-separated list of allowed origins. Omit to allow all (not recommended for production). |
| `SERVE_STATIC` | `true` | Set if you want this service to also serve the React front-end from `dist/`. |
| `VITE_API_URL` | `https://fbpaapi.up.railway.app` | Required at **build time** for the Vite front-end bundle. |

> **Note:** `PORT` and `NODE_ENV=production` are already set automatically — `PORT` by Railway at runtime, `NODE_ENV` via `railway.toml`.

### 3. Generate a secure `JWT_SECRET`

Run one of these commands locally and copy the output into Railway:

**Node.js (recommended):**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**openssl:**
```bash
openssl rand -hex 48
```

The output will be a 96-character hex string — well above the 32-character minimum.

> ⚠️ **Security rules:**
> - Never hard-code or commit secrets.
> - Never share your `JWT_SECRET`.
> - Rotate it if you suspect it has been exposed.

### 4. Deploy

After setting all variables, click **Deploy** (or push a new commit). Railway will rebuild and start the app.

Confirm success by checking the deploy logs — you should see the server start without any `[startup]` errors.

---

## Troubleshooting

### `JWT_SECRET is missing or too short`

You have not set `JWT_SECRET` in Railway Variables, or the value is shorter than 32 characters.

**Fix:**
1. Railway dashboard → your service → **Variables**.
2. Add `JWT_SECRET` with a value ≥ 32 characters (see generation instructions above).
3. Redeploy.

### `dotenv ... injecting env (0) from .env`

This is expected on Railway — there is no `.env` file in the container. It is not an error by itself; it just means dotenv found nothing to load. All configuration must come from Railway Variables.

### Database features unavailable / 503 responses

The MongoDB connection URI is not set or is a placeholder.

**Fix:** Set `MONGODB_URI` in Railway Variables to your Atlas (or other MongoDB) connection string.

### Health check failing

The `railway.toml` configures a health check at `/api/health`. If the service crashes before binding to the port, the health check will fail and Railway will restart the container (up to 3 times).

Check the **deploy logs** tab in Railway for the actual error.

---

## Reference

- [Railway Variables documentation](https://docs.railway.app/guides/variables)
- [Railway Nixpacks documentation](https://nixpacks.com)
- Project `railway.toml` — controls build, start command, restart policy, and health check path.
- `.env.example` — template of all supported environment variables.
