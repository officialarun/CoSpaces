const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

// User profile routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/phone', authenticate, userController.updatePhone);

// Bank Details routes
router.post('/bank-details', authenticate, userController.addBankDetails);
router.get('/bank-details', authenticate, userController.getBankDetails);
router.put('/bank-details/:bankDetailsId', authenticate, userController.updateBankDetails);
router.delete('/bank-details/:bankDetailsId', authenticate, userController.deleteBankDetails);
router.put('/bank-details/:bankDetailsId/primary', authenticate, userController.setPrimaryBank);

// Onboarding routes
router.put('/onboarding/step1', authenticate, userController.updateOnboardingStep1);
router.put('/onboarding/step2', authenticate, userController.updateOnboardingStep2);

// Admin routes
router.get('/', authenticate, authorize('admin', 'compliance_officer'), userController.getAllUsers);
router.get('/:id', authenticate, authorize('admin', 'compliance_officer'), userController.getUserById);
router.put('/:id/role', authenticate, authorize('admin'), userController.updateUserRole);
router.put('/:id/status', authenticate, authorize('admin'), userController.updateUserStatus);

module.exports = router;

