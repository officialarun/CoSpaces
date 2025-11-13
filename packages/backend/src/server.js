const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
// require('dotenv').config();
require("dotenv").config({
  path: process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env"
});


const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectDB, getConnectionStatus } = require('./config/database');

// Passport config
require('./config/passport')(passport);

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const kycRoutes = require('./routes/kyc.routes');
const projectRoutes = require('./routes/project.routes');
const spvRoutes = require('./routes/spv.routes');
const escrowRoutes = require('./routes/escrow.routes');
const documentRoutes = require('./routes/document.routes');
const complianceRoutes = require('./routes/compliance.routes');
const distributionRoutes = require('./routes/distribution.routes');
const auditRoutes = require('./routes/audit.routes');
const reportRoutes = require('./routes/report.routes');
const diditRoutes = require('./routes/didit.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const esignRoutes = require('./routes/esign.routes');
const bankPaymentRoutes = require('./routes/bankPayment.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [];

// Add production URLs from environment variables
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.ADMIN_FRONTEND_URL) {
  allowedOrigins.push(process.env.ADMIN_FRONTEND_URL);
}

// In development, always allow localhost origins
// In production, only allow the URLs specified in environment variables
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log rejected origin for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(`CORS: Rejected origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Express session
// Note: MemoryStore is not suitable for production with multiple instances
// For production, consider using MongoDB session store or Redis
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Suppress MemoryStore warning in production if using a single instance
// For multi-instance deployments, use MongoDB store or Redis
if (process.env.NODE_ENV === 'production') {
  // In production with single instance, MemoryStore is acceptable
  // For multi-instance, configure MongoDBStore or RedisStore
  sessionConfig.name = 'sessionId'; // Custom session name
}

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB (non-blocking - server will start even if DB fails)
connectDB().catch(err => {
  logger.error('Initial database connection failed:', err.message);
  logger.warn('Server will start without database connection. Health check will show DB status.');
});

// Health check with database status
app.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: dbStatus.connected,
      readyState: dbStatus.readyState,
      host: dbStatus.host
    }
  };
  
  // Return 200 even if DB is disconnected (server is still running)
  res.json(health);
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/kyc`, kycRoutes);
app.use(`/api/${API_VERSION}/projects`, projectRoutes);
app.use(`/api/${API_VERSION}/spv`, spvRoutes);
app.use(`/api/${API_VERSION}/escrow`, escrowRoutes);
app.use(`/api/${API_VERSION}/documents`, documentRoutes);
app.use(`/api/${API_VERSION}/compliance`, complianceRoutes);
app.use(`/api/${API_VERSION}/distributions`, distributionRoutes);
app.use(`/api/${API_VERSION}/audit`, auditRoutes);
app.use(`/api/${API_VERSION}/reports`, reportRoutes);
app.use(`/api/${API_VERSION}/didit`, diditRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/esign`, esignRoutes);
app.use(`/api/${API_VERSION}/bank-payments`, bankPaymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Don't exit in production - log and continue
  // Exit only in development for faster debugging
  if (process.env.NODE_ENV !== 'production') {
    logger.error('Exiting due to unhandled rejection in development mode');
    process.exit(1);
  } else {
    logger.error('Unhandled rejection in production - server will continue running');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Always exit on uncaught exceptions as they indicate serious issues
  logger.error('Exiting due to uncaught exception');
  process.exit(1);
});

module.exports = app;

