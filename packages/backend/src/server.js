const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const kycRoutes = require('./routes/kyc.routes');
const projectRoutes = require('./routes/project.routes');
const spvRoutes = require('./routes/spv.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const escrowRoutes = require('./routes/escrow.routes');
const documentRoutes = require('./routes/document.routes');
const complianceRoutes = require('./routes/compliance.routes');
const distributionRoutes = require('./routes/distribution.routes');
const auditRoutes = require('./routes/audit.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/kyc`, kycRoutes);
app.use(`/api/${API_VERSION}/projects`, projectRoutes);
app.use(`/api/${API_VERSION}/spv`, spvRoutes);
app.use(`/api/${API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`/api/${API_VERSION}/escrow`, escrowRoutes);
app.use(`/api/${API_VERSION}/documents`, documentRoutes);
app.use(`/api/${API_VERSION}/compliance`, complianceRoutes);
app.use(`/api/${API_VERSION}/distributions`, distributionRoutes);
app.use(`/api/${API_VERSION}/audit`, auditRoutes);
app.use(`/api/${API_VERSION}/reports`, reportRoutes);

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
  process.exit(1);
});

module.exports = app;

