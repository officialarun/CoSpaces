const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distribution.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Investor routes
router.get('/my-distributions', authenticate, distributionController.getMyDistributions);
router.get('/:id', authenticate, distributionController.getDistributionById);

// Asset Manager/Admin routes
router.post('/calculate', authenticate, authorize('asset_manager', 'admin'), distributionController.calculateDistribution);
router.get('/spv/:spvId', authenticate, authorize('asset_manager', 'admin'), distributionController.getDistributionsBySPV);

// Approval routes
router.put('/:id/approve/asset-manager', authenticate, authorize('asset_manager', 'admin'), distributionController.approveAssetManager);
router.put('/:id/approve/compliance', authenticate, authorize('compliance_officer', 'admin'), distributionController.approveCompliance);
router.put('/:id/approve/admin', authenticate, authorize('admin'), distributionController.approveAdmin);

// Payment processing
router.post('/:id/process-payments', authenticate, authorize('admin'), distributionController.processPayments);
router.put('/:id/investor/:investorId/mark-paid', authenticate, authorize('admin'), distributionController.markInvestorPaid);

module.exports = router;

