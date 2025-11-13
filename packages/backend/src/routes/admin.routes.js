const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const requireAdmin = require('../middleware/adminAuth');
const adminController = require('../controllers/admin.controller');
const upload = require('../middleware/upload');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users with filters
router.get('/users', adminController.getAllUsers);

// Get single user by ID
router.get('/users/:id', adminController.getUserById);

// Update user details
router.put('/users/:id', adminController.updateUser);

// Deactivate user (soft delete)
router.delete('/users/:id', adminController.deactivateUser);

// Get user onboarding status
router.get('/users/:id/onboarding-status', adminController.getUserOnboardingStatus);

// ==================== STAFF MANAGEMENT ROUTES ====================

// Get all staff members
router.get('/staff', adminController.getAllStaff);

// Create staff member
router.post('/staff/create', adminController.createStaff);

// ==================== PROJECT MANAGEMENT ROUTES ====================

// Get all projects (all statuses)
router.get('/projects', adminController.getAllProjects);
router.post('/projects/recalculate-funding', adminController.recalculateFundingStatus);

// Create project (with optional images)
router.post(
  '/projects',
  upload.fields([
    { name: 'siteImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
  adminController.createProject
);

// Update project (with optional images)
router.put(
  '/projects/:id',
  upload.fields([
    { name: 'siteImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ]),
  adminController.updateProject
);

// Publish project (make visible to users)
router.put('/projects/:id/publish', adminController.publishProject);

// Unpublish project (hide from users)
router.put('/projects/:id/unpublish', adminController.unpublishProject);

// Delete project
router.delete('/projects/:id', adminController.deleteProject);

// ==================== TRUST & SPV MANAGEMENT ====================

// Trust CRUD
router.get('/trusts', adminController.getAllTrusts);
router.post('/trusts', adminController.createTrust);
router.put('/trusts/:id', adminController.updateTrust);
router.delete('/trusts/:id', adminController.deleteTrust);

// SPV CRUD
router.get('/spvs', adminController.getAllSPVs);
router.post('/spvs', adminController.createSPV);
router.put('/spvs/:id', adminController.updateSPV);
router.delete('/spvs/:id', adminController.deleteSPV);

// Assign SPV to project
router.post('/projects/:projectId/assign-spv', adminController.assignSPVToProject);

// Assign Asset Manager to project
router.post('/projects/:projectId/assign-asset-manager', adminController.assignAssetManagerToProject);

// ==================== KYC MANAGEMENT ROUTES ====================

// Get all pending KYC submissions
router.get('/kyc/pending', adminController.getPendingKYC);

// Get all KYC submissions with filter
router.get('/kyc/all', adminController.getAllKYC);

// Approve user KYC
router.put('/kyc/:userId/approve', adminController.approveKYC);

// Reject user KYC
router.put('/kyc/:userId/reject', adminController.rejectKYC);

// ==================== DASHBOARD STATS ROUTES ====================

// Get dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Get recent activity
router.get('/activity', adminController.getRecentActivity);

module.exports = router;

