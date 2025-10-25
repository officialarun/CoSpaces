const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticate, authorize, verifyMFA } = require('../middleware/auth');

// Investor routes
router.post('/', authenticate, verifyMFA, subscriptionController.createSubscription);
router.get('/my-subscriptions', authenticate, subscriptionController.getMySubscriptions);
router.get('/:id', authenticate, subscriptionController.getSubscriptionById);
router.post('/:id/sign-documents', authenticate, subscriptionController.signDocuments);
router.post('/:id/upload-payment-proof', authenticate, subscriptionController.uploadPaymentProof);
router.put('/:id/cancel', authenticate, subscriptionController.cancelSubscription);

// Admin/Compliance routes
router.get('/', authenticate, authorize('admin', 'compliance_officer'), subscriptionController.getAllSubscriptions);
router.put('/:id/approve/compliance', authenticate, authorize('compliance_officer', 'admin'), subscriptionController.approveCompliance);
router.put('/:id/approve/operations', authenticate, authorize('admin'), subscriptionController.approveOperations);
router.put('/:id/confirm-payment', authenticate, authorize('admin'), subscriptionController.confirmPayment);
router.put('/:id/allocate-shares', authenticate, authorize('admin'), subscriptionController.allocateShares);
router.put('/:id/reject', authenticate, authorize('compliance_officer', 'admin'), subscriptionController.rejectSubscription);

module.exports = router;

