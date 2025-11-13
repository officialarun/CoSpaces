const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

let isConnected = false;
let connectionRetries = 0;
let eventListenersSetup = false;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Set up connection event listeners (only once)
const setupEventListeners = () => {
  if (eventListenersSetup) return;
  eventListenersSetup = true;

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
    isConnected = true;
    connectionRetries = 0;
  });

  // Mongoose handles automatic reconnection, but we track status
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
    isConnected = true;
    connectionRetries = 0;
  });
};

const connectDB = async () => {
  // Don't attempt connection if MONGODB_URI is not set
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI not set. Database connection will not be established.');
    return false;
  }

  // Set up event listeners (only once)
  setupEventListeners();

  // If already connected, return true
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  try {
    // Mongoose 6+ handles connection options automatically
    // No need for useNewUrlParser, useUnifiedTopology (deprecated)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    connectionRetries = 0;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    return true;
  } catch (error) {
    connectionRetries++;
    logger.error(`Error connecting to MongoDB (attempt ${connectionRetries}/${MAX_RETRIES}):`, error.message);
    
    // Don't exit process - allow server to start without DB
    // Retry connection in background
    if (connectionRetries < MAX_RETRIES) {
      logger.info(`Retrying MongoDB connection in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => {
        connectDB().catch(err => {
          // Error already logged in catch block
        });
      }, RETRY_DELAY);
    } else {
      logger.error('Max retry attempts reached. Server will continue without database connection.');
      logger.error('Please check MONGODB_URI and network connectivity.');
      logger.info('Mongoose will continue attempting to reconnect automatically.');
    }
    
    return false;
  }
};

const getConnectionStatus = () => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    connected: isConnected && readyState === 1,
    readyState: readyState,
    readyStateText: states[readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

module.exports = { connectDB, getConnectionStatus };

