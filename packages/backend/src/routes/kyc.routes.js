const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Investor KYC routes
router.post('/submit', authenticate, kycController.submitKYC);
router.get('/status', authenticate, kycController.getKYCStatus);
router.put('/update', authenticate, kycController.updateKYC);

// Document upload
router.post('/upload-document', authenticate, kycController.uploadKYCDocument);

// AML screening
router.post('/aml-screening', authenticate, kycController.runAMLScreening);

// Admin/Compliance routes
router.get('/', authenticate, authorize('admin', 'compliance_officer'), kycController.getAllKYC);
router.get('/:userId', authenticate, authorize('admin', 'compliance_officer'), kycController.getKYCByUserId);
router.put('/:userId/approve', authenticate, authorize('compliance_officer', 'admin'), kycController.approveKYC);
router.put('/:userId/reject', authenticate, authorize('compliance_officer', 'admin'), kycController.rejectKYC);
router.post('/:userId/request-reVerification', authenticate, authorize('compliance_officer'), kycController.requestReVerification);

module.exports = router;

