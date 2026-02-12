# Deployment Guide

## Environment Variables Setup

### Required Variables

#### `MONGODB_URI`
Your MongoDB Atlas connection string.

**How to get it:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name (e.g., `/fbpa`)

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/fbpa?retryWrites=true&w=majority
```

**Security Notes:**
- ⚠️ NEVER commit this to git
- ✅ Store in environment variables only
- 🔒 Rotate credentials if accidentally exposed

#### `JWT_SECRET`
Secret key for signing JWT tokens (minimum 32 characters recommended).

**Generate a secure secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use a password generator
openssl rand -hex 32
```

**Example:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Optional Variables

#### `PORT`
Server port (default: 4000)

#### `NODE_ENV`
Environment mode: `development` | `production` | `test`

#### `CORS_ORIGIN`
Comma-separated list of allowed frontend origins.

**Example:**
```
CORS_ORIGIN=https://fbpa-ui.onrender.com,https://www.yourdomain.com
```

#### `JWT_EXPIRES_IN`
JWT token expiration time (default: 1h)

**Examples:**
```
JWT_EXPIRES_IN=1h    # 1 hour
JWT_EXPIRES_IN=7d    # 7 days
JWT_EXPIRES_IN=30m   # 30 minutes
```

---

## Deployment Platforms

### Railway Deployment

1. **Create New Project:**
   - Visit https://railway.app/dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `josephmabbinante-a11y/FBPA-api`

2. **Add Environment Variables:**
   - Go to project → "Variables" tab
   - Add each variable:
     ```
     MONGODB_URI = <your-mongodb-connection-string>
     JWT_SECRET = <your-generated-secret>
     NODE_ENV = production
     CORS_ORIGIN = <your-frontend-url>
     ```

3. **Deploy:**
   - Railway auto-deploys on git push to main
   - Check logs to verify MongoDB connection

4. **Get API URL:**
   - Go to "Settings" → "Domains"
   - Copy the Railway-provided URL (e.g., `https://fbpa-api.up.railway.app`)

---

### Render Deployment

1. **Create Web Service:**
   - Visit https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name:** `fbpa-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free or paid tier

3. **Environment Variables:**
   - Scroll to "Environment" section
   - Click "Add Environment Variable"
   - Add:
     ```
     MONGODB_URI = <your-mongodb-connection-string>
     JWT_SECRET = <your-generated-secret>
     NODE_ENV = production
     CORS_ORIGIN = <your-frontend-url>
     ```

4. **Deploy:**
   - Click "Create Web Service"
   - Monitor deployment logs
   - Verify MongoDB connection in logs: `[mongodb] Connected`

---

### Vercel Deployment (Serverless)

**Note:** Vercel is optimized for serverless functions. For a persistent Express server, Railway or Render is recommended.

If using Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Add Environment Variables:**
   ```bash
   vercel env add MONGODB_URI
   # Paste your connection string when prompted

   vercel env add JWT_SECRET
   # Paste your JWT secret
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## MongoDB Atlas Setup

### Create Database User

1. **Go to MongoDB Atlas:**
   - Visit https://cloud.mongodb.com/
   - Select your project

2. **Create User:**
   - Click "Database Access" (left sidebar)
   - Click "+ ADD NEW DATABASE USER"
   - **Authentication Method:** Password
   - **Username:** `fbpa_api_user` (or your choice)
   - **Password:** Generate a secure password (save it!)
   - **Database User Privileges:** 
     - Select "Built-in Role"
     - Choose "Read and write to any database"
   - Click "Add User"

### Whitelist IP Addresses

1. **Network Access:**
   - Click "Network Access" (left sidebar)
   - Click "+ ADD IP ADDRESS"

2. **For Development:**
   - Click "ADD CURRENT IP ADDRESS" (your local machine)

3. **For Production (Railway/Render):**
   - **Option 1:** Add `0.0.0.0/0` (allow from anywhere - less secure but simpler)
   - **Option 2:** Add specific IPs from your hosting platform

4. **Click "Confirm"**

---

## Testing Your Deployment

### Check Health Endpoint

```bash
curl https://your-api-url.railway.app/api/health
```

**Expected response:**
```json
{
  "ok": true,
  "dbStatus": "connected",
  "uptimeSec": 123,
  "timestamp": "2026-02-12T..."
}
```

### Test Login Endpoint

```bash
curl -X POST https://your-api-url.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting

### ❌ "MONGODB_URI not set, running without database"

**Solution:** Environment variable is missing or empty.
- Verify variable is set in deployment platform
- Check for typos in variable name
- Redeploy after adding variable

### ❌ "MONGODB_URI contains placeholder brackets"

**Solution:** You haven't replaced `<username>` and `<password>` in connection string.
- Get credentials from MongoDB Atlas
- Replace placeholders with actual values

### ❌ "MongoNetworkError" or "connection timeout"

**Solution:** IP address not whitelisted in MongoDB Atlas.
- Go to Network Access in Atlas
- Add `0.0.0.0/0` or your deployment platform's IPs
- Wait 1-2 minutes for changes to propagate

### ❌ "Authentication failed"

**Solution:** Wrong username/password in connection string.
- Verify credentials in MongoDB Atlas → Database Access
- Regenerate password if needed
- Update `MONGODB_URI` with new credentials
- **URL-encode** special characters in password

---

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Never commit `.env` or credentials to git
- [ ] Use strong, randomly generated `JWT_SECRET`
- [ ] Rotate credentials if accidentally exposed
- [ ] Use environment variables in deployment platforms
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Use HTTPS in production (automatic on Railway/Render)
- [ ] Set `NODE_ENV=production` in production

---

## Frontend Configuration

Once your API is deployed, configure your frontend (`fbpa-ui`):

### Add Environment Variable

**Local (.env.local):**
```
VITE_API_URL=http://localhost:4000
```

**Production (Render/Vercel):**
```
VITE_API_URL=https://your-api-url.railway.app
```

Your existing `src/api/client.js` already reads this variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

✅ No code changes needed in frontend!

---

## Need Help?

- **MongoDB Atlas Issues:** https://docs.atlas.mongodb.com/
- **Railway Support:** https://docs.railway.app/
- **Render Support:** https://render.com/docs
- **Environment Variables:** See `.env.example` in this repo
