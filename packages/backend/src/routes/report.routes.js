const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Investor reports
router.get('/tax/:userId', authenticate, reportController.getTaxReport);
router.get('/capital-account/:userId', authenticate, reportController.getCapitalAccountStatement);
router.get('/portfolio', authenticate, reportController.getPortfolioReport);

// Admin reports
router.get('/platform-summary', authenticate, authorize('admin'), reportController.getPlatformSummary);
router.get('/spv/:spvId/summary', authenticate, authorize('admin', 'asset_manager'), reportController.getSPVSummary);

module.exports = router;

