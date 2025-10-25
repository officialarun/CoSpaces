const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (listed projects)
router.get('/listed', projectController.getListedProjects);
router.get('/:id/public', projectController.getPublicProjectDetails);

// Investor routes
router.get('/', authenticate, projectController.getProjects);
router.get('/:id', authenticate, projectController.getProjectById);

// Asset Manager routes
router.post('/', authenticate, authorize('asset_manager', 'admin'), projectController.createProject);
router.put('/:id', authenticate, authorize('asset_manager', 'admin'), projectController.updateProject);
router.put('/:id/status', authenticate, authorize('asset_manager', 'admin'), projectController.updateProjectStatus);
router.post('/:id/upload-document', authenticate, authorize('asset_manager', 'admin'), projectController.uploadProjectDocument);

// Approval routes
router.put('/:id/approve/legal', authenticate, authorize('legal_officer', 'admin'), projectController.approveLegal);
router.put('/:id/approve/compliance', authenticate, authorize('compliance_officer', 'admin'), projectController.approveCompliance);
router.put('/:id/approve/asset-manager', authenticate, authorize('asset_manager', 'admin'), projectController.approveAssetManager);
router.put('/:id/approve/admin', authenticate, authorize('admin'), projectController.approveAdmin);

module.exports = router;

