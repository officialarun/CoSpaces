const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Compliance checks
router.post('/check-investor-eligibility', authenticate, complianceController.checkInvestorEligibility);
router.post('/check-spv-limits', authenticate, authorize('compliance_officer', 'admin'), complianceController.checkSPVLimits);
router.post('/check-private-placement', authenticate, authorize('compliance_officer', 'admin'), complianceController.checkPrivatePlacement);

// Compliance flags
router.get('/flags', authenticate, authorize('compliance_officer', 'admin'), complianceController.getComplianceFlags);
router.post('/flag', authenticate, authorize('compliance_officer', 'admin'), complianceController.createComplianceFlag);
router.put('/flag/:id/resolve', authenticate, authorize('compliance_officer', 'admin'), complianceController.resolveComplianceFlag);

// Dashboard
router.get('/dashboard', authenticate, authorize('compliance_officer', 'admin'), complianceController.getComplianceDashboard);

module.exports = router;

