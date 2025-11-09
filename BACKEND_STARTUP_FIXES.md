# Backend Startup Fixes for Render Deployment

## Issues Fixed

### 1. Database Connection Causing Server Crash
**Problem**: If MongoDB connection failed, `process.exit(1)` was called, crashing the server immediately.

**Solution**:
- Made database connection non-blocking
- Server starts even if DB connection fails
- Automatic retry logic with exponential backoff
- Health check endpoint reports DB status
- Server continues running without DB (API endpoints will fail gracefully)

### 2. Deprecated Mongoose Options
**Problem**: `useNewUrlParser` and `useUnifiedTopology` options are deprecated in Mongoose 6+ and cause warnings.

**Solution**:
- Removed deprecated options from `mongoose.connect()`
- Mongoose 6+ handles these automatically

### 3. Duplicate Schema Index Warning
**Problem**: KYC model had duplicate index on `user` field - both `unique: true` (auto-index) and explicit `schema.index({ user: 1 })`.

**Solution**:
- Removed explicit `kycSchema.index({ user: 1 })` 
- Kept `unique: true` in schema definition (which automatically creates the index)

### 4. Unhandled Promise Rejections
**Problem**: Unhandled promise rejections caused server to exit in production.

**Solution**:
- In production: Log errors but don't exit (server continues running)
- In development: Exit on unhandled rejections for faster debugging
- Added handler for uncaught exceptions (always exits, as these indicate serious issues)

### 5. Session Store Warning
**Problem**: MemoryStore warning about not being suitable for production.

**Solution**:
- Added comments explaining MemoryStore limitations
- For single-instance deployments (Render free tier), MemoryStore is acceptable
- For multi-instance deployments, MongoDBStore or RedisStore should be used
- Warning is informational and doesn't break functionality

## Files Modified

### 1. `packages/backend/src/config/database.js`
**Changes**:
- Removed deprecated Mongoose options
- Made connection non-blocking (doesn't exit on failure)
- Added retry logic with max attempts
- Set up event listeners only once (prevents duplicates)
- Added `getConnectionStatus()` function for health checks
- Improved error handling and logging

### 2. `packages/backend/src/server.js`
**Changes**:
- Updated database connection to be non-blocking
- Enhanced health check endpoint to include DB status
- Improved error handling for unhandled rejections
- Added comments for session store configuration
- Added uncaught exception handler

### 3. `packages/backend/src/models/KYC.model.js`
**Changes**:
- Removed duplicate index on `user` field
- Added comment explaining why explicit index was removed

## Key Improvements

### Database Connection
- **Non-blocking**: Server starts even if DB is unavailable
- **Automatic retries**: Up to 5 retry attempts with 5-second delays
- **Status tracking**: Health check endpoint shows DB connection status
- **Event listeners**: Set up only once to prevent duplicates
- **Mongoose reconnection**: Leverages Mongoose's built-in reconnection logic

### Error Handling
- **Production**: Server continues running on non-critical errors
- **Development**: Exits on errors for faster debugging
- **Logging**: Comprehensive error logging for troubleshooting
- **Graceful degradation**: API endpoints fail gracefully if DB is unavailable

### Health Check Endpoint
The `/health` endpoint now returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": {
    "connected": true,
    "readyState": 1,
    "readyStateText": "connected",
    "host": "mongodb-host",
    "name": "database-name"
  }
}
```

## Testing

### Local Development
```bash
# Start backend (with or without MongoDB)
npm run dev:backend

# Health check
curl http://localhost:5000/health
```

### Production (Render)
1. Server starts successfully even if MongoDB is unavailable
2. Health check endpoint reports DB status
3. API endpoints fail gracefully if DB is disconnected
4. Automatic reconnection attempts in background

## Environment Variables

### Required
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (auto-set by Render)
- `NODE_ENV`: Environment (production/development)

### Optional
- `SESSION_SECRET`: Session secret (defaults to insecure value in dev)
- Other service-specific variables

## Next Steps

1. ✅ Database connection non-blocking
2. ✅ Deprecated options removed
3. ✅ Duplicate index fixed
4. ✅ Error handling improved
5. 📋 Test on Render deployment
6. 📋 Monitor health check endpoint
7. 📋 Set up proper session store if scaling to multiple instances

## Notes

- **MemoryStore**: Acceptable for single-instance deployments (Render free tier)
- **Multi-instance**: Consider MongoDBStore or RedisStore for session management
- **Database**: Server will start without DB, but API endpoints require DB connection
- **Retries**: Automatic retries stop after 5 attempts, but Mongoose continues trying
- **Health Check**: Always returns 200, but DB status indicates connection state

