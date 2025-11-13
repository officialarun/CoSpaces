const express = require('express');
const router = express.Router();
const bankPaymentController = require('../controllers/bankPayment.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Process bulk payments (Admin only)
router.post('/process-bulk', authenticate, authorize('admin'), bankPaymentController.processBulkPayments);

// Get payment history (Admin can view any user, users can view their own)
router.get('/history/:userId', authenticate, async (req, res, next) => {
  // Allow users to view their own history, or admins to view any user
  if (req.user._id.toString() === req.params.userId || req.user.role === 'admin') {
    return bankPaymentController.getPaymentHistory(req, res, next);
  }
  return res.status(403).json({ error: 'Forbidden: You can only view your own payment history' });
});

module.exports = router;

