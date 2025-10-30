const express = require('express');
const router = express.Router();
const multer = require('multer');
const diditController = require('../controllers/didit.controller');
const { authenticate } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @route   POST /api/v1/didit/verify-document
 * @desc    Verify ID document directly with DIDIT
 * @access  Private (authenticated users)
 */
router.post('/verify-document', authenticate, upload.single('document'), diditController.verifyDocument);

/**
 * @route   GET /api/v1/didit/status
 * @desc    Get verification status for current user
 * @access  Private (authenticated users)
 */
router.get('/status', authenticate, diditController.getVerificationStatus);

module.exports = router;
