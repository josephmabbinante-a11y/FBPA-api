# FBPA-API Deployment Guide

## Overview

This guide covers deployment, restart, and lifecycle management for the FBPA-API server.

## Server Lifecycle Management

### Starting the Server

**Production:**
```bash
npm start
```

**Development (with auto-restart):**
```bash
npm run dev
```

### Stopping the Server

The server supports graceful shutdown via system signals (SIGTERM, SIGINT).

**What happens during graceful shutdown:**
1. Server stops accepting new connections
2. Existing connections are allowed to complete
3. MongoDB connections are properly closed
4. Server logs shutdown status
5. Process exits cleanly

### Restarting the Server

**Local restart:**
```bash
npm run restart
```

**On Render:**
- Manual restart: Use the "Manual Deploy" button in Render dashboard
- Automatic restart: Push changes to the main branch

### Health Checks

Check server health status:

```bash
# Using npm script
npm run health

# Or directly with curl
curl http://localhost:4000/api/health

# Expected response:
{
  "ok": true,
  "dbStatus": "connected",
  "uptimeSec": 123,
  "timestamp": "2026-02-12T15:00:00.000Z"
}
```

## Render Deployment

### Initial Setup

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `josephmabbinante-a11y/FBPA-api`
   - Select branch: `main`

2. **Configure Service**
   - Render auto-detects `render.yaml`
   - Service name: `fbpa-api`
   - Build command: `npm install`
   - Start command: `node index.js`

3. **Set Environment Variables**

   **Required:**
   - `MONGODB_URI` - Your MongoDB connection string
     ```
     mongodb+srv://username:password@cluster.mongodb.net/dbname
     ```

   **Auto-Generated:**
   - `PORT` - Set by Render
   - `JWT_SECRET` - Auto-generated for authentication

   **Optional:**
   - `CORS_ORIGIN` - Comma-separated list of allowed origins
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - For email features
   - `NODE_ENV` - Set to `production`
   - `SERVE_STATIC` - Set to `false` for API-only mode

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Monitor logs for successful deployment

### Redeployment

**Automatic (Recommended):**
1. Push changes to the `main` branch
2. Render automatically detects changes
3. Triggers new build and deployment
4. Zero-downtime deployment with health checks

**Manual:**
1. Go to Render Dashboard
2. Select your `fbpa-api` service
3. Click "Manual Deploy" → "Deploy latest commit"

### Health Checks

Render automatically monitors the health check endpoint:
- **Path:** `/api/health`
- **Expected:** HTTP 200 with `{"ok": true, ...}`
- **Frequency:** Every 30 seconds
- **Timeout:** 5 seconds

If health checks fail:
1. Render will attempt to restart the service
2. Check logs in Render Dashboard
3. Verify environment variables are set
4. Ensure MongoDB connection is working

### Rolling Deployments

Render uses zero-downtime deployments:
1. New instance starts and passes health checks
2. Traffic gradually shifts to new instance
3. Old instance drains existing connections
4. Old instance shuts down gracefully

## Troubleshooting

### Server Won't Start

1. **Check Environment Variables**
   - Verify `MONGODB_URI` is set correctly
   - Ensure no placeholder brackets in connection string

2. **Check Logs**
   - On Render: View logs in dashboard
   - Locally: Check console output

3. **Common Issues:**
   - Missing `MONGODB_URI`
   - Invalid MongoDB connection string
   - Port already in use
   - Missing dependencies

### Database Connection Fails

1. **Verify Connection String**
   - No placeholder text in URI
   - Correct database name
   - Network access allowed (MongoDB Atlas)

2. **Check MongoDB Atlas**
   - IP whitelist includes `0.0.0.0/0` or Render IPs
   - Database user has correct permissions
   - Cluster is running

## Monitoring

### Key Metrics to Monitor

1. **Health Status**
   - Endpoint: `/api/health`
   - Should return 200 with `ok: true`

2. **Database Connection**
   - `dbStatus` should be "connected"
   - Monitor connection errors in logs

3. **Response Times**
   - Health check should respond < 100ms
   - API endpoints should respond < 1s

4. **Error Rates**
   - Monitor 5xx errors in logs
   - Track uncaught exceptions

### Logging

All server events are logged:
- Startup/shutdown events
- Database connections/disconnections
- HTTP requests (in dev mode)
- Errors and exceptions

**Access logs on Render:**
1. Go to service dashboard
2. Click "Logs" tab
3. Filter by time range or search terms

## Best Practices

1. **Always Use Graceful Shutdown**
   - Prevents data corruption
   - Allows connections to complete
   - Ensures clean database closure

2. **Monitor Health Checks**
   - Set up alerts for failed health checks
   - Investigate failures immediately

3. **Environment Variables**
   - Never commit secrets to repository
   - Use Render's environment variable management
   - Rotate secrets regularly

4. **Database Connections**
   - Always close connections on shutdown
   - Handle connection errors gracefully
   - Use connection pooling

5. **Deployment Strategy**
   - Test changes locally first
   - Use feature branches for development
   - Merge to main only after testing
   - Monitor deployments in Render dashboard

## Quick Reference

```bash
# Start server
npm start

# Start with auto-restart (dev)
npm run dev

# Check health
npm run health

# Verify configuration
node --check index.js
```

## Emergency Procedures

### Service is Down

1. Check Render Dashboard status
2. Review recent deployments
3. Check health endpoint
4. Verify environment variables
5. Manual restart via Render Dashboard

### Database Connection Lost

1. Check MongoDB Atlas status
2. Verify connection string
3. Check IP whitelist
4. Restart service to reconnect

### Memory/CPU Issues

1. Check Render metrics
2. Review resource usage patterns
3. Consider upgrading instance size
4. Optimize database queries

## Updates and Maintenance

### Updating Dependencies

1. Update `package.json`
2. Test locally
3. Commit changes
4. Push to trigger deployment

### Database Migrations

1. Create migration script
2. Test on staging database
3. Schedule maintenance window
4. Run migration
5. Verify data integrity

### Security Updates

1. Regular dependency audits: `npm audit`
2. Update vulnerable packages
3. Test thoroughly
4. Deploy with monitoring
