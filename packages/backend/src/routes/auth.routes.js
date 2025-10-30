const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-phone', authController.verifyPhone);
router.post('/resend-verification', authController.resendVerification);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/change-password', authenticate, authController.changePassword);

// MFA routes
router.post('/mfa/setup', authenticate, authController.setupMFA);
router.post('/mfa/verify', authenticate, authController.verifyMFA);
router.post('/mfa/disable', authenticate, authController.disableMFA);
router.post('/mfa/verify-login', authController.verifyMFALogin);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    // Pass state parameter through to callback
    const state = req.query.state;
    const options = {
      scope: ['profile', 'email'],
      state: state // Preserve state for callback
    };
    passport.authenticate('google', options)(req, res, next);
  }
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google OAuth Error:', err);
        // Determine redirect URL from state parameter
        let redirectURL = 'http://localhost:3000/login?error=auth_failed';
        try {
          if (req.query.state) {
            const state = JSON.parse(decodeURIComponent(req.query.state));
            if (state.isAdmin && state.redirectUrl) {
              redirectURL = `${state.redirectUrl}/login?error=auth_failed`;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse state:', parseError);
        }
        return res.redirect(redirectURL);
      }

      if (!user) {
        console.warn('Google OAuth: No user returned');
        // Determine redirect URL from state parameter
        let redirectURL = 'http://localhost:3000/login?error=no_user';
        try {
          if (req.query.state) {
            const state = JSON.parse(decodeURIComponent(req.query.state));
            if (state.isAdmin && state.redirectUrl) {
              redirectURL = `${state.redirectUrl}/login?error=no_user`;
            }
          }
        } catch (parseError) {
          console.error('Failed to parse state:', parseError);
        }
        return res.redirect(redirectURL);
      }

      // Authentication successful
      req.user = user;
      next();
    })(req, res, next);
  },
  authController.googleCallback
);

module.exports = router;

