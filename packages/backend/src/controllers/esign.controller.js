const ShareholderAgreement = require('../models/ShareholderAgreement.model');
const diditService = require('../services/didit.service');
const mockESignService = require('../services/mockESign.service');
const AuditLog = require('../models/AuditLog.model');
const logger = require('../utils/logger');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const notificationController = require('./notification.controller');

/**
 * Get SHA status for a user
 * GET /api/v1/esign/sha/my-agreements
 */
exports.getMyAgreements = async (req, res, next) => {
  try {
    const agreements = await ShareholderAgreement.find({
      investor: req.user._id
    })
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .populate('equityDistribution', 'equityPercentage investmentAmount numberOfShares')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { agreements }
    });
  } catch (error) {
    logger.error('Error fetching user agreements:', error);
    next(error);
  }
};

/**
 * Get pending SHAs for a user
 * GET /api/v1/esign/sha/pending
 */
exports.getPendingAgreements = async (req, res, next) => {
  try {
    const agreements = await ShareholderAgreement.find({
      investor: req.user._id,
      'eSign.status': { $in: ['pending', 'initiated', 'sent', 'viewed'] },
      status: { $ne: 'signed' }
    })
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .populate('equityDistribution', 'equityPercentage investmentAmount numberOfShares')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { agreements, count: agreements.length }
    });
  } catch (error) {
    logger.error('Error fetching pending agreements:', error);
    next(error);
  }
};

/**
 * Get specific SHA by ID
 * GET /api/v1/esign/sha/:agreementId
 */
exports.getAgreementById = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    const agreement = await ShareholderAgreement.findById(agreementId)
      .populate('spv', 'spvName spvCode registrationDetails')
      .populate('project', 'projectName projectCode')
      .populate('investor', 'firstName lastName email entityName')
      .populate('equityDistribution', 'equityPercentage investmentAmount numberOfShares');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found'
      });
    }

    // Check if user is authorized to view this agreement
    if (agreement.investor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this agreement'
      });
    }

    res.json({
      success: true,
      data: { agreement }
    });
  } catch (error) {
    logger.error('Error fetching agreement:', error);
    next(error);
  }
};

/**
 * Initiate/re-initiate SHA signing
 * POST /api/v1/esign/sha/:agreementId/initiate
 */
exports.initiateSHA = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    const agreement = await ShareholderAgreement.findById(agreementId)
      .populate('investor');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found'
      });
    }

    // Check if user is authorized
    if (agreement.investor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to sign this agreement'
      });
    }

    // Check if already signed
    if (agreement.isSigned()) {
      return res.status(400).json({
        success: false,
        error: 'Agreement is already signed'
      });
    }

    // If eSign already initiated, return existing signing URL
    if (agreement.eSign.diditRequestId && agreement.eSign.status === 'initiated') {
      return res.json({
        success: true,
        data: {
          agreement,
          signingUrl: agreement.eSign.signingUrl,
          eSignRequestId: agreement.eSign.diditRequestId
        }
      });
    }

    // Initiate eSign
    const signerDetails = {
      name: agreement.investor.entityName || 
            `${agreement.investor.firstName || ''} ${agreement.investor.lastName || ''}`.trim() || 
            agreement.investor.email,
      email: agreement.investor.email,
      phone: agreement.investor.phone || ''
    };

    const eSignResult = await diditService.initiateESign(
      agreement.documentUrl,
      signerDetails,
      req.user._id.toString(),
      {
        agreementId: agreement._id.toString(),
        projectId: agreement.project.toString(),
        spvId: agreement.spv.toString()
      }
    );

    // Update agreement
    agreement.eSign.diditRequestId = eSignResult.eSignRequestId;
    agreement.eSign.diditHash = eSignResult.hash;
    agreement.eSign.signingUrl = eSignResult.signingUrl;
    agreement.eSign.status = 'initiated';
    agreement.eSign.initiatedAt = new Date();
    agreement.eSign.expiredAt = eSignResult.expiresAt;
    agreement.eSign.signerDetails = signerDetails;
    agreement.status = 'pending_signature';
    await agreement.save();

    logger.info(`SHA eSign initiated for agreement ${agreementId}`, {
      eSignRequestId: eSignResult.eSignRequestId
    });

    res.json({
      success: true,
      data: {
        agreement,
        signingUrl: eSignResult.signingUrl,
        eSignRequestId: eSignResult.eSignRequestId
      }
    });
  } catch (error) {
    logger.error('Error initiating SHA signing:', error);
    next(error);
  }
};

/**
 * Get eSign status
 * GET /api/v1/esign/sha/:agreementId/status
 */
exports.getSHAStatus = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    const agreement = await ShareholderAgreement.findById(agreementId);

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found'
      });
    }

    // Check authorization
    if (agreement.investor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // If DIDIT request ID exists, check status with DIDIT
    if (agreement.eSign.diditRequestId) {
      try {
        const diditStatus = await diditService.getESignStatus(agreement.eSign.diditRequestId);
        
        // Update local status if changed
        if (diditStatus.status !== agreement.eSign.status) {
          agreement.eSign.status = diditStatus.status;
          if (diditStatus.signedAt) {
            agreement.eSign.signedAt = diditStatus.signedAt;
          }
          if (diditStatus.status === 'signed') {
            agreement.status = 'signed';
          }
          await agreement.save();
        }

        return res.json({
          success: true,
          data: {
            agreement,
            diditStatus
          }
        });
      } catch (diditError) {
        logger.warn('Failed to fetch DIDIT status, returning local status:', diditError);
      }
    }

    res.json({
      success: true,
      data: { agreement }
    });
  } catch (error) {
    logger.error('Error getting SHA status:', error);
    next(error);
  }
};

/**
 * Handle DIDIT webhook callback for eSign
 * POST /api/v1/esign/sha/callback
 */
exports.callbackSHA = async (req, res, next) => {
  try {
    const signature = req.headers['x-didit-signature'] || req.headers['signature'];
    const callbackData = req.body;

    logger.info('Received DIDIT eSign callback:', {
      signature: signature ? 'present' : 'missing',
      eSignRequestId: callbackData.eSignRequestId || callbackData.request_id,
      status: callbackData.status || callbackData.event_type
    });

    // Verify signature
    let verified = false;
    try {
      const verifiedData = await diditService.verifyESign(callbackData, signature);
      verified = true;

      // Find agreement by eSignRequestId
      const agreement = await ShareholderAgreement.findOne({
        'eSign.diditRequestId': verifiedData.eSignRequestId
      }).populate('investor');

      if (!agreement) {
        logger.warn(`Agreement not found for eSignRequestId: ${verifiedData.eSignRequestId}`);
        return res.status(404).json({
          success: false,
          error: 'Agreement not found'
        });
      }

      // Update agreement based on status
      if (verifiedData.status === 'signed' || callbackData.status === 'signed') {
        agreement.eSign.status = 'signed';
        agreement.eSign.signedAt = verifiedData.signedAt || new Date();
        agreement.eSign.signatureMetadata = {
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          certificate: verifiedData.certificate,
          signatureHash: verifiedData.signatureHash
        };
        agreement.eSign.callbackData = callbackData;
        agreement.status = 'signed';
        await agreement.save();

        // Update equity distribution status
        const SPVEquityDistribution = require('../models/SPVEquityDistribution.model');
        await SPVEquityDistribution.findByIdAndUpdate(agreement.equityDistribution, {
          status: 'agreement_signed'
        });

        // Log audit event
        await AuditLog.logEvent({
          eventType: 'sha_signed',
          eventCategory: 'document',
          performedBy: agreement.investor._id,
          targetEntity: {
            entityType: 'shareholder_agreement',
            entityId: agreement._id
          },
          action: 'SHA signed via DIDIT eSign',
          metadata: {
            eSignRequestId: verifiedData.eSignRequestId,
            signedAt: agreement.eSign.signedAt,
            spvId: agreement.spv.toString(),
            projectId: agreement.project.toString()
          }
        });

        logger.info(`SHA signed successfully: ${agreement._id}`, {
          eSignRequestId: verifiedData.eSignRequestId,
          investorId: agreement.investor._id
        });
      } else if (verifiedData.status === 'viewed') {
        agreement.eSign.status = 'viewed';
        agreement.eSign.viewedAt = new Date();
        await agreement.save();
      } else if (verifiedData.status === 'rejected' || verifiedData.status === 'failed') {
        agreement.eSign.status = verifiedData.status;
        agreement.eSign.callbackData = callbackData;
        await agreement.save();
      }

      res.json({
        success: true,
        message: 'Callback processed successfully'
      });
    } catch (verifyError) {
      logger.error('Failed to verify DIDIT callback:', verifyError);
      
      // Still acknowledge receipt to prevent retries
      res.json({
        success: false,
        error: 'Verification failed',
        message: verifyError.message
      });
    }
  } catch (error) {
    logger.error('Error processing DIDIT callback:', error);
    next(error);
  }
};

/**
 * Mock sign document (for testing/local use when DIDIT eSign is not available)
 * POST /api/v1/esign/sha/:agreementId/mock-sign
 */
exports.mockSignSHA = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    const agreement = await ShareholderAgreement.findById(agreementId)
      .populate('investor');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found'
      });
    }

    // Check if user is authorized
    if (agreement.investor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to sign this agreement'
      });
    }

    // Check if already signed
    if (agreement.isSigned()) {
      return res.status(400).json({
        success: false,
        error: 'Agreement is already signed'
      });
    }

    // Perform mock signing
    const mockSignResult = await mockESignService.mockSignDocument(
      agreement._id.toString(),
      req.user._id.toString(),
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );

    // Update agreement with mock signature
    agreement.eSign.status = 'signed';
    agreement.eSign.signedAt = mockSignResult.signedAt;
    agreement.eSign.signatureMetadata = {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      certificate: mockSignResult.certificate,
      signatureHash: mockSignResult.signatureHash
    };
    agreement.eSign.callbackData = mockSignResult.metadata;
    agreement.status = 'signed';
    await agreement.save();

    // Update equity distribution status
    const SPVEquityDistribution = require('../models/SPVEquityDistribution.model');
    await SPVEquityDistribution.findByIdAndUpdate(agreement.equityDistribution, {
      status: 'agreement_signed'
    });

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'sha_signed',
      eventCategory: 'document',
      performedBy: req.user._id,
      targetEntity: {
        entityType: 'shareholder_agreement',
        entityId: agreement._id
      },
      action: 'SHA signed via mock eSign',
      metadata: {
        eSignRequestId: mockSignResult.eSignRequestId,
        signedAt: agreement.eSign.signedAt,
        spvId: agreement.spv.toString(),
        projectId: agreement.project.toString(),
        isMock: true
      }
    });

    // Send SHA signed email (non-blocking)
    notificationController.sendSHAEmail(agreement.investor, agreement, 'signed').catch(err =>
      logger.error('Failed to send SHA signed email', { userId: agreement.investor._id, error: err.message })
    );

    logger.info(`SHA signed successfully via mock: ${agreement._id}`, {
      eSignRequestId: mockSignResult.eSignRequestId,
      investorId: req.user._id
    });

    res.json({
      success: true,
      message: 'Agreement signed successfully',
      data: {
        agreement,
        signedAt: agreement.eSign.signedAt,
        isMock: true
      }
    });
  } catch (error) {
    logger.error('Error in mock signing:', error);
    next(error);
  }
};

/**
 * Proxy PDF document from Cloudinary
 * GET /api/v1/esign/sha/:agreementId/document
 */
exports.getSHADocument = async (req, res, next) => {
  try {
    const { agreementId } = req.params;

    const agreement = await ShareholderAgreement.findById(agreementId)
      .populate('investor');

    if (!agreement) {
      return res.status(404).json({
        success: false,
        error: 'Agreement not found'
      });
    }

    // Check if user is authorized
    if (agreement.investor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this agreement'
      });
    }

    if (!agreement.documentUrl) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    try {
      logger.info('Fetching PDF from Cloudinary:', {
        agreementId,
        documentUrl: agreement.documentUrl.substring(0, 100) + '...'
      });

      // Method 1: Try to fetch directly using the original URL
      // For raw uploads, we need to add proper headers
      let response;
      try {
        response = await axios.get(agreement.documentUrl, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/pdf, */*'
          },
          timeout: 30000,
          maxRedirects: 5
        });
      } catch (directError) {
        // If direct fetch fails, try converting /raw/upload/ to /upload/
        if (agreement.documentUrl.includes('/raw/upload/')) {
          logger.info('Direct fetch failed, trying with modified URL');
          const modifiedUrl = agreement.documentUrl.replace('/raw/upload/', '/upload/');
          
          response = await axios.get(modifiedUrl, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/pdf, */*'
            },
            timeout: 30000,
            maxRedirects: 5
          });
        } else {
          throw directError;
        }
      }

      if (!response.data || response.data.length === 0) {
        throw new Error('Empty response from Cloudinary');
      }

      // Set proper headers for PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="shareholder-agreement-${agreementId}.pdf"`);
      res.setHeader('Content-Length', response.data.length);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Send PDF buffer
      res.send(Buffer.from(response.data));
    } catch (fetchError) {
      const statusCode = fetchError.response?.status;
      const is401 = statusCode === 401;
      const is403 = statusCode === 403;
      const is404 = statusCode === 404;

      logger.error('Error fetching PDF from Cloudinary:', {
        agreementId,
        documentUrl: agreement.documentUrl.substring(0, 100) + '...',
        error: fetchError.message,
        status: statusCode,
        statusText: fetchError.response?.statusText
      });
      
      // Provide specific error message based on status code
      if (is401 || is403) {
        return res.status(502).json({
          success: false,
          error: 'PDF delivery is restricted. Please enable "Allow delivery of PDF and ZIP files" in Cloudinary Settings > Security, or contact your administrator.',
          details: 'Cloudinary security settings are preventing PDF access. This needs to be enabled in the Cloudinary dashboard.'
        });
      }
      
      if (is404) {
        return res.status(404).json({
          success: false,
          error: 'Document not found in storage. The file may have been deleted or moved.'
        });
      }
      
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch document from storage',
        details: fetchError.message
      });
    }
  } catch (error) {
    logger.error('Error in getSHADocument:', error);
    next(error);
  }
};

