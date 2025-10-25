const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

// User profile routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/bank-details', authenticate, userController.updateBankDetails);

// Admin routes
router.get('/', authenticate, authorize('admin', 'compliance_officer'), userController.getAllUsers);
router.get('/:id', authenticate, authorize('admin', 'compliance_officer'), userController.getUserById);
router.put('/:id/role', authenticate, authorize('admin'), userController.updateUserRole);
router.put('/:id/status', authenticate, authorize('admin'), userController.updateUserStatus);

module.exports = router;

