const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const esignController = require('../controllers/esign.controller');

// Get user's agreements
router.get('/sha/my-agreements', authenticate, esignController.getMyAgreements);

// Get pending agreements
router.get('/sha/pending', authenticate, esignController.getPendingAgreements);

// Get specific agreement
router.get('/sha/:agreementId', authenticate, esignController.getAgreementById);

// Get/Serve PDF document (proxy from Cloudinary)
router.get('/sha/:agreementId/document', authenticate, esignController.getSHADocument);

// Get eSign status
router.get('/sha/:agreementId/status', authenticate, esignController.getSHAStatus);

// Initiate/re-initiate signing
router.post('/sha/:agreementId/initiate', authenticate, esignController.initiateSHA);

// Mock sign document (for local/testing when DIDIT eSign is not available)
router.post('/sha/:agreementId/mock-sign', authenticate, esignController.mockSignSHA);

// DIDIT webhook callback (no auth required - verified by signature)
router.post('/sha/callback', esignController.callbackSHA);

module.exports = router;

