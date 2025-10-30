/**
 * Admin Authorization Middleware
 * 
 * Ensures the authenticated user has admin role
 * Must be used after the authenticate middleware
 */

const logger = require('../utils/logger');

/**
 * Middleware to check if authenticated user is an admin
 * @requires authenticate middleware must be called before this
 */
const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      logger.warn('requireAdmin called without authenticated user');
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      logger.warn(`Non-admin user ${req.user._id} attempted to access admin route`, {
        userId: req.user._id,
        role: req.user.role,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // User is admin, proceed to next middleware
    logger.debug(`Admin ${req.user.email} accessing admin route: ${req.path}`);
    next();
  } catch (error) {
    logger.error('Error in requireAdmin middleware:', error);
    next(error);
  }
};

module.exports = requireAdmin;

