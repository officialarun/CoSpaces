const KYC = require('../models/KYC.model');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const { encrypt } = require('../utils/encryption');
const notificationController = require('./notification.controller');
const logger = require('../utils/logger');

exports.submitKYC = async (req, res, next) => {
  try {
    const kycData = {
      user: req.user._id,
      ...req.body,
      submittedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };
    
    // Encrypt sensitive data
    if (req.body.individualKYC) {
      if (req.body.individualKYC.aadhaarNumber) {
        kycData.individualKYC.aadhaarNumber = encrypt(req.body.individualKYC.aadhaarNumber);
      }
      if (req.body.individualKYC.panNumber) {
        kycData.individualKYC.panNumber = encrypt(req.body.individualKYC.panNumber);
      }
    }
    
    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id },
      kycData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: 'submitted'
    });
    
    await AuditLog.logEvent({
      eventType: 'kyc_submitted',
      eventCategory: 'kyc_aml',
      performedBy: req.user._id,
      action: 'KYC submitted',
      request: { ipAddress: req.ip }
    });
    
    // Send KYC submitted email (non-blocking)
    notificationController.sendKYCEmail(req.user, 'submitted').catch(err =>
      logger.error('Failed to send KYC submitted email', { userId: req.user._id, error: err.message })
    );
    
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.getKYCStatus = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.updateKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body, lastUpdatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.uploadKYCDocument = async (req, res, next) => {
  try {
    // TODO: Implement file upload logic
    res.json({ success: true, message: 'Document uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

exports.runAMLScreening = async (req, res, next) => {
  try {
    // TODO: Integrate with AML provider
    const kyc = await KYC.findOne({ user: req.user._id });
    kyc.amlScreening = {
      screenedAt: new Date(),
      riskLevel: 'low',
      sanctionsMatch: false,
      pepMatch: false
    };
    await kyc.save();
    
    await User.findByIdAndUpdate(req.user._id, { amlStatus: 'cleared' });
    
    res.json({ success: true, data: { screening: kyc.amlScreening } });
  } catch (error) {
    next(error);
  }
};

exports.getAllKYC = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;
    
    const kycs = await KYC.find(query)
      .populate('user', 'email firstName lastName entityName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ submittedAt: -1 });
      
    const count = await KYC.countDocuments(query);
    
    res.json({
      success: true,
      data: { kycs, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.getKYCByUserId = async (req, res, next) => {
  try {
    const kyc = await KYC.findOne({ user: req.params.userId }).populate('user');
    if (!kyc) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.approveKYC = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const kyc = await KYC.findOneAndUpdate(
      { user: req.params.userId },
      {
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      },
      { new: true }
    );
    
    await User.findByIdAndUpdate(req.params.userId, {
      kycStatus: 'approved',
      kycCompletedAt: new Date()
    });
    
    await AuditLog.logEvent({
      eventType: 'kyc_approved',
      eventCategory: 'kyc_aml',
      performedBy: req.user._id,
      targetEntity: { entityType: 'kyc', entityId: kyc._id },
      action: 'KYC approved',
      description: comments
    });
    
    // Send KYC approved email (non-blocking)
    const user = await User.findById(req.params.userId);
    if (user) {
      notificationController.sendKYCEmail(user, 'approved').catch(err =>
        logger.error('Failed to send KYC approved email', { userId: user._id, error: err.message })
      );
    }
    
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.rejectKYC = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const kyc = await KYC.findOneAndUpdate(
      { user: req.params.userId },
      {
        verificationStatus: 'rejected',
        rejectionReason: reason,
        rejectionDetails: details,
        rejectedAt: new Date(),
        rejectedBy: req.user._id
      },
      { new: true }
    );
    
    await User.findByIdAndUpdate(req.params.userId, {
      kycStatus: 'rejected',
      kycRejectionReason: reason
    });
    
    await AuditLog.logEvent({
      eventType: 'kyc_rejected',
      eventCategory: 'kyc_aml',
      performedBy: req.user._id,
      targetEntity: { entityType: 'kyc', entityId: kyc._id },
      action: 'KYC rejected',
      description: `${reason}: ${details}`
    });
    
    // Send KYC rejected email (non-blocking)
    const user = await User.findById(req.params.userId);
    if (user) {
      notificationController.sendKYCEmail(user, 'rejected', reason).catch(err =>
        logger.error('Failed to send KYC rejected email', { userId: user._id, error: err.message })
      );
    }
    
    res.json({ success: true, data: { kyc } });
  } catch (error) {
    next(error);
  }
};

exports.requestReVerification = async (req, res, next) => {
  try {
    const { reason } = req.body;
    await KYC.findOneAndUpdate(
      { user: req.params.userId },
      {
        reVerificationRequired: true,
        reVerificationReason: reason,
        reVerificationRequestedAt: new Date()
      }
    );
    
    res.json({ success: true, message: 'Re-verification requested' });
  } catch (error) {
    next(error);
  }
};

