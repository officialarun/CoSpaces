const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrow.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Webhook for payment gateway
router.post('/webhook/deposit', escrowController.handleDepositWebhook);

// Admin routes
router.get('/spv/:spvId', authenticate, authorize('admin'), escrowController.getEscrowBalance);
router.post('/release', authenticate, authorize('admin'), escrowController.releaseEscrow);
router.post('/refund', authenticate, authorize('admin'), escrowController.refundEscrow);
router.get('/transactions', authenticate, authorize('admin'), escrowController.getEscrowTransactions);

module.exports = router;

