const diditService = require('../services/didit.service');
const logger = require('../utils/logger');

/**
 * Verify ID document directly
 */
exports.verifyDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { metadata } = req.body;

    // Get document image from file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Document image is required'
      });
    }

    logger.info(`Document verification requested for user ${userId}`);

    // Verify document with DIDIT
    const result = await diditService.verifyIdDocument(
      req.file.buffer,
      userId,
      metadata ? JSON.parse(metadata) : {}
    );

    res.json({
      success: true,
      message: result.verified ? 'Verification completed successfully' : 'Verification declined',
      data: {
        verified: result.verified,
        status: result.data.id_verification?.status,
        documentType: result.data.id_verification?.document_type
      }
    });
  } catch (error) {
    logger.error('Document verification error:', error);
    next(error);
  }
};

/**
 * Get verification status for authenticated user
 */
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const status = await diditService.getVerificationStatus(userId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting verification status:', error);
    next(error);
  }
};
