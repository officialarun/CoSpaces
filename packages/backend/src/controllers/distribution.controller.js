const Distribution = require('../models/Distribution.model');
const CapTable = require('../models/CapTable.model');
const SPV = require('../models/SPV.model');
const Project = require('../models/Project.model');

exports.calculateDistribution = async (req, res, next) => {
  try {
    const { spvId, grossProceeds, distributionType, deductions, platformFees } = req.body;
    
    const spv = await SPV.findById(spvId);
    if (!spv) {
      return res.status(404).json({ error: 'SPV not found' });
    }
    
    // Get cap table
    const capTable = await CapTable.find({ spv: spvId, status: 'active' })
      .populate('shareholder');
    
    if (capTable.length === 0) {
      return res.status(400).json({ error: 'No shareholders found' });
    }
    
    // Calculate total deductions
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalPlatformFees = Object.values(platformFees || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // TDS calculation (simplified - 20% for capital gains)
    const tdsRate = 20;
    const tdsAmount = (grossProceeds - totalDeductions - totalPlatformFees) * (tdsRate / 100);
    
    const netDistributableAmount = grossProceeds - totalDeductions - totalPlatformFees - tdsAmount;
    
    // Calculate per-share distribution
    const totalShares = capTable.reduce((sum, entry) => sum + entry.numberOfShares, 0);
    const distributionPerShare = netDistributableAmount / totalShares;
    
    // Create investor distributions
    const investorDistributions = capTable.map(entry => {
      const grossAmount = entry.numberOfShares * distributionPerShare;
      const investorTDS = grossAmount * (tdsRate / 100);
      const netAmount = grossAmount - investorTDS;
      
      return {
        investor: entry.shareholder._id,
        numberOfShares: entry.numberOfShares,
        ownershipPercentage: (entry.numberOfShares / totalShares) * 100,
        grossAmount,
        tdsAmount: investorTDS,
        netAmount,
        bankAccount: entry.shareholder.bankDetails?.[0] || {}
      };
    });
    
    const distribution = await Distribution.create({
      spv: spvId,
      project: spv.project,
      distributionNumber: `DIST${Date.now()}`,
      distributionType,
      grossProceeds,
      deductions: { ...deductions, totalDeductions },
      platformFees: { ...platformFees, totalPlatformFees },
      taxWithholding: { tdsRate, tdsAmount },
      netDistributableAmount,
      distributionPerShare,
      investorDistributions,
      status: 'calculated',
      calculatedAt: new Date(),
      calculatedBy: req.user._id,
      createdBy: req.user._id
    });
    
    res.status(201).json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.getMyDistributions = async (req, res, next) => {
  try {
    const distributions = await Distribution.find({
      'investorDistributions.investor': req.user._id
    })
      .populate('spv', 'spvName')
      .populate('project', 'projectName')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { distributions } });
  } catch (error) {
    next(error);
  }
};

exports.getDistributionById = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id)
      .populate('spv')
      .populate('project')
      .populate('investorDistributions.investor', 'firstName lastName email');
      
    if (!distribution) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.getDistributionsBySPV = async (req, res, next) => {
  try {
    const distributions = await Distribution.find({ spv: req.params.spvId })
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { distributions } });
  } catch (error) {
    next(error);
  }
};

exports.approveAssetManager = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const distribution = await Distribution.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.assetManagerApproval.approved': true,
          'approvals.assetManagerApproval.approvedBy': req.user._id,
          'approvals.assetManagerApproval.approvedAt': new Date(),
          'approvals.assetManagerApproval.comments': comments
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.approveCompliance = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const distribution = await Distribution.findByIdAndUpdate(
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
    
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.approveAdmin = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const distribution = await Distribution.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.adminApproval.approved': true,
          'approvals.adminApproval.approvedBy': req.user._id,
          'approvals.adminApproval.approvedAt': new Date(),
          'approvals.adminApproval.comments': comments,
          status: 'approved',
          approvedAt: new Date()
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.processPayments = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    
    if (!distribution.areAllApprovalsGranted()) {
      return res.status(400).json({ error: 'All approvals required' });
    }
    
    distribution.status = 'processing';
    await distribution.save();
    
    // In production, integrate with payment gateway
    // For now, mark as processing
    
    res.json({ success: true, message: 'Payment processing initiated', data: { distribution } });
  } catch (error) {
    next(error);
  }
};

exports.markInvestorPaid = async (req, res, next) => {
  try {
    const { transactionId, utr, paymentDate } = req.body;
    
    const distribution = await Distribution.findOneAndUpdate(
      { _id: req.params.id, 'investorDistributions.investor': req.params.investorId },
      {
        $set: {
          'investorDistributions.$.paymentStatus': 'completed',
          'investorDistributions.$.transactionId': transactionId,
          'investorDistributions.$.utr': utr,
          'investorDistributions.$.paymentDate': paymentDate || new Date(),
          'investorDistributions.$.confirmationSent': true,
          'investorDistributions.$.confirmationSentAt': new Date()
        }
      },
      { new: true }
    );
    
    // Check if all payments completed
    const allCompleted = distribution.investorDistributions.every(
      inv => inv.paymentStatus === 'completed'
    );
    
    if (allCompleted) {
      distribution.status = 'completed';
      distribution.completedAt = new Date();
      await distribution.save();
    }
    
    res.json({ success: true, data: { distribution } });
  } catch (error) {
    next(error);
  }
};

