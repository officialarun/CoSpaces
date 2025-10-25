const Subscription = require('../models/Subscription.model');
const SPV = require('../models/SPV.model');
const CapTable = require('../models/CapTable.model');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');

exports.createSubscription = async (req, res, next) => {
  try {
    const { spvId, committedAmount } = req.body;
    
    // Validate SPV
    const spv = await SPV.findById(spvId);
    if (!spv) {
      return res.status(404).json({ error: 'SPV not found' });
    }
    
    // Check investor eligibility
    const user = await User.findById(req.user._id);
    if (user.kycStatus !== 'approved') {
      return res.status(400).json({ error: 'KYC not approved' });
    }
    
    if (user.amlStatus !== 'cleared') {
      return res.status(400).json({ error: 'AML screening not cleared' });
    }
    
    // Check SPV limits
    if (!spv.canAcceptMoreInvestors()) {
      return res.status(400).json({ error: 'SPV has reached maximum investor limit' });
    }
    
    if (committedAmount < spv.fundraising.minimumInvestment) {
      return res.status(400).json({
        error: `Minimum investment is ₹${spv.fundraising.minimumInvestment}`
      });
    }
    
    // Calculate shares
    const numberOfShares = Math.floor(committedAmount / spv.shareStructure.faceValuePerShare);
    
    const subscriptionData = {
      investor: req.user._id,
      spv: spvId,
      project: spv.project,
      subscriptionNumber: `SUB${Date.now()}`,
      committedAmount,
      numberOfShares,
      pricePerShare: spv.shareStructure.faceValuePerShare,
      status: 'submitted',
      submittedAt: new Date(),
      'investorVerification.kycVerified': user.kycStatus === 'approved',
      'investorVerification.amlCleared': user.amlStatus === 'cleared'
    };
    
    const subscription = await Subscription.create(subscriptionData);
    
    await AuditLog.logEvent({
      eventType: 'subscription_created',
      eventCategory: 'subscription',
      performedBy: req.user._id,
      targetEntity: { entityType: 'subscription', entityId: subscription._id },
      action: 'Subscription created'
    });
    
    res.status(201).json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ investor: req.user._id })
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { subscriptions } });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('investor', 'firstName lastName email')
      .populate('spv')
      .populate('project');
      
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Check authorization
    if (subscription.investor._id.toString() !== req.user._id.toString() && 
        !['admin', 'compliance_officer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.signDocuments = async (req, res, next) => {
  try {
    const { ppmAccepted, riskDisclosureAccepted, signatureData } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'documents.ppmAccepted': ppmAccepted,
          'documents.ppmAcceptedAt': ppmAccepted ? new Date() : undefined,
          'documents.riskDisclosureAccepted': riskDisclosureAccepted,
          'documents.riskDisclosureAcceptedAt': riskDisclosureAccepted ? new Date() : undefined,
          'documents.subscriptionAgreementSigned': true,
          'documents.subscriptionAgreementSignedAt': new Date(),
          'eSignMetadata.ipAddress': req.ip,
          'eSignMetadata.userAgent': req.get('user-agent'),
          'eSignMetadata.timestamp': new Date()
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const { transactionId, utr, paymentDate, proofDocument } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'payment_initiated',
          'payment.transactionId': transactionId,
          'payment.utr': utr,
          'payment.paymentDate': paymentDate,
          'payment.proofDocument': proofDocument,
          'payment.method': req.body.paymentMethod || 'rtgs'
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'cancelled',
          'cancellation.cancelledAt': new Date(),
          'cancellation.cancelledBy': req.user._id,
          'cancellation.reason': reason
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, spvId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (spvId) query.spv = spvId;
    
    const subscriptions = await Subscription.find(query)
      .populate('investor', 'firstName lastName email')
      .populate('spv', 'spvName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const count = await Subscription.countDocuments(query);
    
    res.json({
      success: true,
      data: { subscriptions, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.approveCompliance = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.complianceApproval.approved': true,
          'approvals.complianceApproval.approvedBy': req.user._id,
          'approvals.complianceApproval.approvedAt': new Date(),
          'approvals.complianceApproval.comments': comments
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.approveOperations = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.operationsApproval.approved': true,
          'approvals.operationsApproval.approvedBy': req.user._id,
          'approvals.operationsApproval.approvedAt': new Date(),
          'approvals.operationsApproval.comments': comments,
          status: 'approved',
          approvedAt: new Date()
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'payment_confirmed',
          paidAmount: req.body.paidAmount || subscription.committedAmount,
          'payment.paymentConfirmedDate': new Date(),
          'payment.reconciledBy': req.user._id,
          'payment.reconciledAt': new Date(),
          'payment.reconciliationStatus': 'matched',
          paymentCompletedAt: new Date()
        }
      },
      { new: true }
    );
    
    // Update SPV raised amount
    await SPV.findByIdAndUpdate(subscription.spv, {
      $inc: { 'fundraising.raisedAmount': subscription.paidAmount }
    });
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

exports.allocateShares = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('spv');
    
    if (subscription.status !== 'payment_confirmed') {
      return res.status(400).json({ error: 'Payment not confirmed' });
    }
    
    // Create cap table entry
    const capTableEntry = await CapTable.create({
      spv: subscription.spv._id,
      shareholder: subscription.investor,
      shareClass: subscription.shareClass,
      numberOfShares: subscription.numberOfShares,
      faceValuePerShare: subscription.pricePerShare,
      investmentAmount: subscription.paidAmount,
      subscription: subscription._id,
      certificateNumber: `CERT${Date.now()}`,
      certificateIssueDate: new Date(),
      acquisitionDate: new Date(),
      'capitalAccount.contributed': subscription.paidAmount,
      'capitalAccount.currentBalance': subscription.paidAmount,
      createdBy: req.user._id
    });
    
    // Update subscription
    subscription.status = 'shares_allocated';
    subscription.sharesAllocatedAt = new Date();
    subscription.documents.shareCertificateIssued = true;
    subscription.documents.shareCertificateIssuedAt = new Date();
    subscription.documents.shareCertificateNumber = capTableEntry.certificateNumber;
    await subscription.save();
    
    // Update SPV investor count
    await SPV.findByIdAndUpdate(subscription.spv._id, {
      $inc: { 'fundraising.investorCount': 1 }
    });
    
    res.json({ success: true, data: { subscription, capTableEntry } });
  } catch (error) {
    next(error);
  }
};

exports.rejectSubscription = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'rejected',
          'rejection.rejectedAt': new Date(),
          'rejection.rejectedBy': req.user._id,
          'rejection.reason': reason,
          'rejection.details': details
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

