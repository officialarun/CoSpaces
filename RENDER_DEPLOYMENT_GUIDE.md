# Render Deployment Guide

## Overview

This application should be deployed as **3 separate Web Services** on Render, not as a single service with concurrently. This allows each service to:
- Use its own PORT environment variable (assigned by Render)
- Scale independently
- Have proper health checks
- Consume instance hours efficiently

## Deployment Architecture

### Service 1: Backend API
- **Service Type**: Web Service
- **Build Command**: `npm run build:backend`
- **Start Command**: `npm run start:backend`
- **Health Check Path**: `/health`
- **Port**: Automatically assigned by Render (uses `process.env.PORT`)

### Service 2: Frontend
- **Service Type**: Web Service
- **Build Command**: `npm run build:frontend`
- **Start Command**: `npm run start:frontend`
- **Health Check Path**: `/`
- **Port**: Automatically assigned by Render (Next.js uses `process.env.PORT`)

### Service 3: Admin Frontend
- **Service Type**: Web Service
- **Build Command**: `npm run build:admin`
- **Start Command**: `npm run start:admin`
- **Health Check Path**: `/`
- **Port**: Automatically assigned by Render (Next.js uses `process.env.PORT`)

## Environment Variables

### Backend Service

**Required:**
- `NODE_ENV=production`
- `PORT` (automatically set by Render)
- `MONGODB_URI` (your MongoDB connection string)
- `JWT_SECRET` (generate a secure random string)
- `JWT_REFRESH_SECRET` (generate a secure random string)
- `ENCRYPTION_KEY` (32-character encryption key)
- `FRONTEND_URL` (URL of your frontend service on Render, e.g., `https://your-frontend.onrender.com`)
- `ADMIN_FRONTEND_URL` (URL of your admin service on Render, e.g., `https://your-admin.onrender.com`)

**Optional:**
- `API_VERSION=v1` (defaults to v1)
- `SESSION_SECRET` (generate a secure random string)
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS=100`
- Other service-specific keys (email, SMS, payment gateway, etc.)

### Frontend Service

**Required:**
- `NODE_ENV=production`
- `PORT` (automatically set by Render)
- `NEXT_PUBLIC_API_BASE_URL` (URL of your backend service, e.g., `https://your-backend.onrender.com/api/v1`)

### Admin Frontend Service

**Required:**
- `NODE_ENV=production`
- `PORT` (automatically set by Render)
- `NEXT_PUBLIC_API_URL` (URL of your backend service, e.g., `https://your-backend.onrender.com/api/v1`)

## Step-by-Step Deployment

### 1. Create Backend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fractional-land-backend` (or your preferred name)
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: Node
   - **Build Command**: `npm run build:backend`
   - **Start Command**: `npm run start:backend`
   - **Plan**: Free
4. Add environment variables (see Backend Service section above)
5. Deploy

### 2. Create Frontend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository (same repo)
3. Configure:
   - **Name**: `fractional-land-frontend` (or your preferred name)
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: Node
   - **Build Command**: `npm run build:frontend`
   - **Start Command**: `npm run start:frontend`
   - **Plan**: Free
4. Add environment variables (see Frontend Service section above)
5. **Important**: Set `NEXT_PUBLIC_API_BASE_URL` to your backend service URL (e.g., `https://your-backend.onrender.com/api/v1`)
6. Deploy

### 3. Create Admin Frontend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository (same repo)
3. Configure:
   - **Name**: `fractional-land-admin` (or your preferred name)
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: Node
   - **Build Command**: `npm run build:admin`
   - **Start Command**: `npm run start:admin`
   - **Plan**: Free
4. Add environment variables (see Admin Frontend Service section above)
5. **Important**: Set `NEXT_PUBLIC_API_URL` to your backend service URL (e.g., `https://your-backend.onrender.com/api/v1`)
6. Deploy

### 4. Update Backend CORS URLs

After all services are deployed, update the backend environment variables:
- `FRONTEND_URL`: Set to your frontend service URL (e.g., `https://your-frontend.onrender.com`)
- `ADMIN_FRONTEND_URL`: Set to your admin service URL (e.g., `https://your-admin.onrender.com`)

Then redeploy the backend service.

## Free Tier Limitations

### Instance Hours
- 750 free instance hours per workspace per month
- Shared across all free services
- If exceeded, all free services suspend until next month

### Auto Spin-Down
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take up to 1 minute (cold start)

### Resource Limits
- Limited CPU and memory per service
- May affect performance under higher loads

### Recommendations
- Monitor instance hours usage
- Consider upgrading to paid plans for production
- Use custom domains for better UX

## Custom Domains (Optional)

You can add custom domains to each service:

1. Go to service settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

After adding custom domains, update:
- Backend: `FRONTEND_URL` and `ADMIN_FRONTEND_URL` environment variables
- Frontend: `NEXT_PUBLIC_API_BASE_URL` environment variable
- Admin: `NEXT_PUBLIC_API_URL` environment variable

## Troubleshooting

### Port Conflicts
- **Issue**: "EADDRINUSE: address already in use"
- **Solution**: Ensure you're using separate services, not concurrently. Each service gets its own PORT from Render.

### CORS Errors
- **Issue**: "Not allowed by CORS"
- **Solution**: Verify `FRONTEND_URL` and `ADMIN_FRONTEND_URL` in backend environment variables match your actual service URLs (including https://)

### Build Failures
- **Issue**: "babel: not found" or missing dependencies
- **Solution**: Ensure all dependencies are in `dependencies` (not just `devDependencies`) for production builds

### Environment Variables Not Working
- **Issue**: Frontend can't connect to backend
- **Solution**: 
  - Verify `NEXT_PUBLIC_*` variables are set (required for Next.js client-side access)
  - Ensure backend URL includes `/api/v1` path
  - Check that backend CORS allows your frontend URL

## Local Development

Local development remains unchanged:
- Run `npm run dev` to start all services with concurrently
- Services run on:
  - Backend: `http://localhost:5000`
  - Frontend: `http://localhost:3000`
  - Admin: `http://localhost:3001`

## Production vs Development

### Development (Local)
- Uses `concurrently` to run all services
- CORS allows localhost origins
- Ports are hardcoded (5000, 3000, 3001)

### Production (Render)
- Each service runs independently
- CORS only allows production URLs from environment variables
- Ports are assigned by Render via `process.env.PORT`

