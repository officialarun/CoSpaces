const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Audit log routes (admin, auditor, compliance)
router.get('/logs', authenticate, authorize('admin', 'auditor', 'compliance_officer'), auditController.getAuditLogs);
router.get('/logs/:id', authenticate, authorize('admin', 'auditor'), auditController.getAuditLogById);
router.get('/user/:userId', authenticate, authorize('admin', 'auditor'), auditController.getUserAuditLogs);
router.get('/entity/:entityType/:entityId', authenticate, authorize('admin', 'auditor'), auditController.getEntityAuditLogs);

module.exports = router;

