const express = require('express');
const router = express.Router();
const spvController = require('../controllers/spv.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Investor routes
router.get('/', authenticate, spvController.getAllSPVs);
router.get('/:id', authenticate, spvController.getSPVById);
router.get('/:id/captable', authenticate, spvController.getCapTable);

// Asset Manager/Admin routes
router.post('/', authenticate, authorize('asset_manager', 'admin'), spvController.createSPV);
router.put('/:id', authenticate, authorize('asset_manager', 'admin'), spvController.updateSPV);
router.put('/:id/status', authenticate, authorize('admin'), spvController.updateSPVStatus);
router.post('/:id/publish-ppm', authenticate, authorize('legal_officer', 'admin'), spvController.publishPPM);
router.post('/:id/incorporate', authenticate, authorize('admin'), spvController.incorporateSPV);

module.exports = router;

