const express = require('express');
const router = express.Router();
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

module.exports = router;

