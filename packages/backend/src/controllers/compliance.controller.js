const User = require('../models/User.model');
const SPV = require('../models/SPV.model');
const Subscription = require('../models/Subscription.model');

exports.checkInvestorEligibility = async (req, res, next) => {
  try {
    const { spvId } = req.body;
    
    const user = await User.findById(req.user._id);
    const spv = await SPV.findById(spvId);
    
    const checks = {
      kycApproved: user.kycStatus === 'approved',
      amlCleared: user.amlStatus === 'cleared',
      emailVerified: user.isEmailVerified,
      phoneVerified: user.isPhoneVerified,
      femaCompliant: user.isForeignInvestor ? user.femaApprovalStatus === 'approved' : true,
      spvHasCapacity: spv.canAcceptMoreInvestors(),
      eligible: false
    };
    
    checks.eligible = Object.values(checks).every(v => v === true);
    
    res.json({ success: true, data: { checks } });
  } catch (error) {
    next(error);
  }
};

exports.checkSPVLimits = async (req, res, next) => {
  try {
    const { spvId } = req.body;
    
    const spv = await SPV.findById(spvId);
    const maxInvestors = parseInt(process.env.MAX_INVESTORS_PER_SPV) || 200;
    
    const checks = {
      currentInvestorCount: spv.fundraising.investorCount,
      maxInvestors,
      canAcceptMore: spv.fundraising.investorCount < maxInvestors,
      raisedAmount: spv.fundraising.raisedAmount,
      targetAmount: spv.fundraising.targetAmount,
      fundraisingPercentage: spv.fundraisingPercentage
    };
    
    if (spv.fundraising.investorCount >= maxInvestors) {
      spv.compliance.maxInvestorsBreached = true;
      await spv.save();
    }
    
    res.json({ success: true, data: { checks } });
  } catch (error) {
    next(error);
  }
};

exports.checkPrivatePlacement = async (req, res, next) => {
  try {
    const { spvId } = req.body;
    
    const spv = await SPV.findById(spvId);
    
    const checks = {
      isPPMPublished: spv.privatePlacement.isPPMPublished,
      ppmPublishedDate: spv.privatePlacement.ppmPublishedDate,
      publicOfferingRestrictionDate: spv.privatePlacement.publicOfferingRestrictionDate,
      withinRestrictionPeriod: spv.privatePlacement.publicOfferingRestrictionDate > new Date(),
      investorCount: spv.fundraising.investorCount,
      maxInvestors: spv.fundraising.maxInvestors,
      compliant: true
    };
    
    if (spv.fundraising.investorCount > spv.fundraising.maxInvestors) {
      checks.compliant = false;
      checks.violations = ['Exceeded maximum investor limit for private placement'];
    }
    
    res.json({ success: true, data: { checks } });
  } catch (error) {
    next(error);
  }
};

exports.getComplianceFlags = async (req, res, next) => {
  try {
    // In production, query a ComplianceFlag model
    const flags = [];
    
    res.json({ success: true, data: { flags } });
  } catch (error) {
    next(error);
  }
};

exports.createComplianceFlag = async (req, res, next) => {
  try {
    const { entityType, entityId, flagType, severity, description } = req.body;
    
    // In production, create in ComplianceFlag model
    
    res.json({ success: true, message: 'Compliance flag created' });
  } catch (error) {
    next(error);
  }
};

exports.resolveComplianceFlag = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    
    // In production, update ComplianceFlag model
    
    res.json({ success: true, message: 'Compliance flag resolved' });
  } catch (error) {
    next(error);
  }
};

exports.getComplianceDashboard = async (req, res, next) => {
  try {
    const kycPending = await User.countDocuments({ kycStatus: 'submitted' });
    const kycApproved = await User.countDocuments({ kycStatus: 'approved' });
    const amlFlagged = await User.countDocuments({ amlStatus: 'flagged' });
    
    const subscriptionsPendingApproval = await Subscription.countDocuments({
      status: 'under_review'
    });
    
    const spvs = await SPV.find({});
    const spvsNearInvestorLimit = spvs.filter(
      spv => spv.fundraising.investorCount >= spv.fundraising.maxInvestors * 0.9
    ).length;
    
    const dashboard = {
      kyc: { pending: kycPending, approved: kycApproved },
      aml: { flagged: amlFlagged },
      subscriptions: { pendingApproval: subscriptionsPendingApproval },
      spvs: { nearInvestorLimit: spvsNearInvestorLimit }
    };
    
    res.json({ success: true, data: { dashboard } });
  } catch (error) {
    next(error);
  }
};

