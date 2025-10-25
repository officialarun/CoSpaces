const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Document management
router.post('/upload', authenticate, documentController.uploadDocument);
router.get('/:id', authenticate, documentController.getDocument);
router.get('/:id/download', authenticate, documentController.downloadDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

// eSign routes
router.post('/:id/initiate-esign', authenticate, documentController.initiateESign);
router.post('/:id/sign', authenticate, documentController.signDocument);
router.get('/:id/sign-status', authenticate, documentController.getSignStatus);

// Admin routes
router.get('/', authenticate, authorize('admin', 'compliance_officer'), documentController.getAllDocuments);
router.put('/:id/verify', authenticate, authorize('compliance_officer', 'legal_officer', 'admin'), documentController.verifyDocument);

module.exports = router;

