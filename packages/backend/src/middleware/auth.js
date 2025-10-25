const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        details: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }

    next();
  };
};

/**
 * Check specific permissions
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        details: `You don't have the required permission: ${permission}` 
      });
    }

    next();
  };
};

/**
 * Verify MFA token for sensitive operations
 */
const verifyMFA = async (req, res, next) => {
  try {
    const { mfaToken } = req.body;

    if (!req.user.mfaEnabled) {
      return next(); // MFA not enabled, skip verification
    }

    if (!mfaToken) {
      return res.status(400).json({ error: 'MFA token required' });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: req.user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  verifyMFA
};

