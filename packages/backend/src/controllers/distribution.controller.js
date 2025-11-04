const Distribution = require('../models/Distribution.model');
const CapTable = require('../models/CapTable.model');
const SPVEquityDistribution = require('../models/SPVEquityDistribution.model');
const SPV = require('../models/SPV.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const notificationController = require('./notification.controller');
const logger = require('../utils/logger');

exports.calculateDistribution = async (req, res, next) => {
  try {
    const { spvId, grossProceeds, distributionType, deductions, platformFees } = req.body;
    
    const spv = await SPV.findById(spvId);
    if (!spv) {
      return res.status(404).json({ error: 'SPV not found' });
    }
    
    // Check if SPV has project assigned
    const projectId = spv.project;
    if (!projectId) {
      return res.status(400).json({ 
        error: 'SPV must be assigned to a project before calculating distributions' 
      });
    }
    
    // Try SPVEquityDistribution first (primary source)
    let equityDistributions = await SPVEquityDistribution.find({ 
      spv: spvId, 
      project: projectId 
    }).populate('investor');
    
    let shareholders = [];
    let dataSource = 'equity_distribution';
    
    if (equityDistributions.length > 0) {
      // Use SPVEquityDistribution data - filter out entries with null investors
      shareholders = equityDistributions
        .filter(entry => entry.investor !== null && entry.investor !== undefined)
        .map(entry => ({
          investor: entry.investor,
          numberOfShares: entry.numberOfShares,
          equityPercentage: entry.equityPercentage,
          investmentAmount: entry.investmentAmount
        }));
      
      if (shareholders.length === 0) {
        return res.status(400).json({ 
          error: 'No valid shareholders found. Some investors may have been deleted or are missing.' 
        });
      }
    } else {
      // Fallback to CapTable (backwards compatibility)
      const capTable = await CapTable.find({ spv: spvId, status: 'active' })
        .populate('shareholder');
      
      if (capTable.length === 0) {
        return res.status(400).json({ 
          error: 'No shareholders found. Please ensure SPV is assigned to project and equity has been distributed.' 
        });
      }
      
      // Filter out entries with null shareholders
      shareholders = capTable
        .filter(entry => entry.shareholder !== null && entry.shareholder !== undefined)
        .map(entry => ({
          investor: entry.shareholder,
          numberOfShares: entry.numberOfShares,
          equityPercentage: null, // CapTable doesn't have equityPercentage
          investmentAmount: entry.investmentAmount || 0
        }));
      
      if (shareholders.length === 0) {
        return res.status(400).json({ 
          error: 'No valid shareholders found. Some shareholders may have been deleted or are missing.' 
        });
      }
      
      dataSource = 'cap_table';
    }
    
    // Calculate total deductions
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalPlatformFees = Object.values(platformFees || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // TDS calculation (simplified - 20% for capital gains)
    const tdsRate = 20;
    const tdsAmount = (grossProceeds - totalDeductions - totalPlatformFees) * (tdsRate / 100);
    
    const netDistributableAmount = grossProceeds - totalDeductions - totalPlatformFees - tdsAmount;
    
    // Calculate per-share distribution
    const totalShares = shareholders.reduce((sum, entry) => sum + entry.numberOfShares, 0);
    const distributionPerShare = netDistributableAmount / totalShares;
    
    // Create investor distributions
    const investorDistributions = shareholders.map(entry => {
      const grossAmount = entry.numberOfShares * distributionPerShare;
      const investorTDS = grossAmount * (tdsRate / 100);
      const netAmount = grossAmount - investorTDS;
      
      // Calculate ownership percentage
      const ownershipPercentage = entry.equityPercentage !== null 
        ? entry.equityPercentage 
        : (entry.numberOfShares / totalShares) * 100;
      
      // Safely get investor ID and bank account
      const investorId = entry.investor?._id || entry.investor || null;
      const bankAccount = entry.investor?.bankDetails?.[0] || {};
      
      if (!investorId) {
        throw new Error('Invalid investor data: investor ID is missing');
      }
      
      return {
        investor: investorId,
        numberOfShares: entry.numberOfShares,
        ownershipPercentage,
        grossAmount,
        tdsAmount: investorTDS,
        netAmount,
        bankAccount
      };
    });
    
    // Get project and asset manager
    const project = await Project.findById(spv.project).populate('assetManager');
    
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
    
    // Populate distribution for email
    await distribution.populate('project', 'projectName projectCode');
    await distribution.populate('spv', 'spvName');
    
    // Send email to asset manager if assigned (non-blocking)
    if (project && project.assetManager) {
      // Populate asset manager details if needed
      if (typeof project.assetManager === 'object' && project.assetManager._id) {
        notificationController.sendDistributionToAssetManagerEmail(project.assetManager, distribution).catch(err =>
          logger.error('Failed to send distribution to asset manager email', {
            userId: project.assetManager._id,
            error: err.message
          })
        );
      } else {
        // Fetch asset manager if not populated
        const assetManager = await User.findById(project.assetManager);
        if (assetManager) {
          notificationController.sendDistributionToAssetManagerEmail(assetManager, distribution).catch(err =>
            logger.error('Failed to send distribution to asset manager email', {
              userId: assetManager._id,
              error: err.message
            })
          );
        }
      }
    }
    
    // Log audit event
    await AuditLog.logEvent({
      eventType: 'distribution_calculated',
      eventCategory: 'distribution',
      performedBy: req.user._id,
      targetEntity: { entityType: 'distribution', entityId: distribution._id },
      action: 'Distribution calculated',
      details: {
        distributionNumber: distribution.distributionNumber,
        grossProceeds,
        netDistributableAmount
      }
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
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .populate('investorDistributions.investor', 'firstName lastName email')
      .populate('approvals.assetManagerApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.complianceApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.adminApproval.approvedBy', 'firstName lastName email');
      
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
          'approvals.assetManagerApproval.comments': comments,
          status: 'under_review' // Move to compliance review
        }
      },
      { new: true }
    ).populate('project');
    
    // Send email to compliance officers (non-blocking)
    const complianceOfficers = await User.find({ role: 'compliance_officer', isActive: { $ne: false } });
    
    // Populate approvedBy field for template
    if (distribution.approvals?.assetManagerApproval?.approvedBy && typeof distribution.approvals.assetManagerApproval.approvedBy === 'string') {
      const approvedByUser = await User.findById(distribution.approvals.assetManagerApproval.approvedBy);
      if (approvedByUser) {
        distribution.approvals.assetManagerApproval.approvedBy = approvedByUser;
      }
    }
    
    for (const officer of complianceOfficers) {
      notificationController.sendDistributionToComplianceEmail(officer, distribution).catch(err =>
        logger.error('Failed to send distribution to compliance email', {
          userId: officer._id,
          error: err.message
        })
      );
    }
    
    // Log audit event
    await AuditLog.logEvent({
      eventType: 'distribution_asset_manager_approved',
      eventCategory: 'distribution',
      performedBy: req.user._id,
      targetEntity: { entityType: 'distribution', entityId: distribution._id },
      action: 'Asset manager approved distribution',
      details: {
        distributionNumber: distribution.distributionNumber,
        comments: comments || ''
      }
    });
    
    logger.info(`Distribution ${distribution.distributionNumber} approved by asset manager ${req.user.email}`);
    
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
          'approvals.complianceApproval.comments': comments,
          // Status remains 'under_review' until admin approves
          status: 'under_review'
        }
      },
      { new: true }
    )
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .populate('approvals.assetManagerApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.complianceApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.adminApproval.approvedBy', 'firstName lastName email')
      .populate('investorDistributions.investor', 'firstName lastName email');
    
    // Log audit event
    await AuditLog.logEvent({
      eventType: 'distribution_compliance_approved',
      eventCategory: 'distribution',
      performedBy: req.user._id,
      targetEntity: { entityType: 'distribution', entityId: distribution._id },
      action: 'Compliance approved distribution',
      details: {
        distributionNumber: distribution.distributionNumber,
        comments: comments || ''
      }
    });
    
    logger.info(`Distribution ${distribution.distributionNumber} approved by compliance officer ${req.user.email}`);
    
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
    ).populate('project').populate('investorDistributions.investor');
    
    // Send distribution announced emails to all investors (non-blocking)
    if (distribution && distribution.investorDistributions) {
      for (const investorDist of distribution.investorDistributions) {
        if (investorDist.investor && investorDist.investor._id) {
          notificationController.sendDistributionEmail(investorDist.investor, distribution, 'announced').catch(err =>
            logger.error('Failed to send distribution announced email', { 
              userId: investorDist.investor._id, 
              error: err.message 
            })
          );
        }
      }
    }
    
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
    ).populate('project');
    
    // Send distribution paid email to this investor (non-blocking)
    const investor = await User.findById(req.params.investorId);
    if (investor && distribution) {
      notificationController.sendDistributionEmail(investor, distribution, 'paid').catch(err =>
        logger.error('Failed to send distribution paid email', { 
          userId: investor._id, 
          error: err.message 
        })
      );
    }
    
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

/**
 * Get all distributions (Admin only)
 * GET /api/v1/distributions
 */
exports.getAllDistributions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      projectId = '',
      assetManagerId = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by project
    if (projectId) {
      query.project = projectId;
    } else if (assetManagerId) {
      // Filter by asset manager (via project) - only if projectId not specified
      const projectsWithManager = await Project.find({ assetManager: assetManagerId }).select('_id');
      const projectIds = projectsWithManager.map(p => p._id);
      if (projectIds.length > 0) {
        query.project = { $in: projectIds };
      } else {
        // No projects found for this asset manager, return empty result
        return res.json({
          success: true,
          data: {
            distributions: [],
            totalPages: 0,
            currentPage: parseInt(page),
            totalDistributions: 0
          }
        });
      }
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    const distributions = await Distribution.find(query)
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode assetManager')
      .populate('project.assetManager', 'firstName lastName email')
      .populate('approvals.assetManagerApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.complianceApproval.approvedBy', 'firstName lastName email')
      .populate('approvals.adminApproval.approvedBy', 'firstName lastName email')
      .populate('investorDistributions.investor', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Distribution.countDocuments(query);

    logger.info(`Admin ${req.user.email} retrieved ${distributions.length} distributions`);

    res.json({
      success: true,
      data: {
        distributions,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalDistributions: count
      }
    });
  } catch (error) {
    logger.error('Error fetching all distributions:', error);
    next(error);
  }
};

/**
 * Get distributions by asset manager
 * GET /api/v1/distributions/by-asset-manager/:assetManagerId
 */
exports.getDistributionsByAssetManager = async (req, res, next) => {
  try {
    const { assetManagerId } = req.params;
    const { status = '', page = 1, limit = 20 } = req.query;

    // Verify asset manager exists and has correct role
    const assetManager = await User.findById(assetManagerId);
    if (!assetManager || assetManager.role !== 'asset_manager') {
      return res.status(404).json({
        success: false,
        error: 'Asset manager not found'
      });
    }

    // Find projects assigned to this asset manager
    const projects = await Project.find({ assetManager: assetManagerId }).select('_id');
    const projectIds = projects.map(p => p._id);

    // Build query
    const query = { project: { $in: projectIds } };

    // Filter by status
    if (status) {
      query.status = status;
    }

    const distributions = await Distribution.find(query)
      .populate('spv', 'spvName spvCode')
      .populate('project', 'projectName projectCode')
      .populate('approvals.assetManagerApproval.approvedBy', 'firstName lastName email')
      .populate('investorDistributions.investor', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Distribution.countDocuments(query);

    logger.info(`Retrieved ${distributions.length} distributions for asset manager ${assetManager.email}`);

    res.json({
      success: true,
      data: {
        distributions,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalDistributions: count,
        assetManager: {
          _id: assetManager._id,
          firstName: assetManager.firstName,
          lastName: assetManager.lastName,
          email: assetManager.email
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching distributions by asset manager:', error);
    next(error);
  }
};

/**
 * Update distribution
 * PUT /api/v1/distributions/:id
 */
exports.updateDistribution = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id);

    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: 'Distribution not found'
      });
    }

    // Only allow editing if status is 'draft' or 'calculated'
    if (!['draft', 'calculated'].includes(distribution.status)) {
      return res.status(400).json({
        success: false,
        error: 'Can only edit distributions with status "draft" or "calculated"'
      });
    }

    // Check if any approvals have been granted
    const hasApprovals = distribution.approvals.assetManagerApproval.approved ||
                        distribution.approvals.complianceApproval.approved ||
                        distribution.approvals.adminApproval.approved;

    if (hasApprovals) {
      return res.status(400).json({
        success: false,
        error: 'Cannot edit distribution that has approvals. Cancel it first.'
      });
    }

    // Allowed fields to update
    const allowedFields = [
      'distributionType',
      'grossProceeds',
      'deductions',
      'platformFees',
      'taxWithholding',
      'paymentDate',
      'notes'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Recalculate if grossProceeds or deductions changed
    if (updates.grossProceeds || updates.deductions || updates.platformFees || updates.taxWithholding) {
      distribution.grossProceeds = updates.grossProceeds || distribution.grossProceeds;
      distribution.deductions = { ...distribution.deductions, ...updates.deductions };
      distribution.platformFees = { ...distribution.platformFees, ...updates.platformFees };
      distribution.taxWithholding = { ...distribution.taxWithholding, ...updates.taxWithholding };
      
      // Recalculate net amount
      distribution.calculateNetAmount();
      
      // Recalculate investor distributions (if grossProceeds changed)
      if (updates.grossProceeds) {
        const projectId = distribution.project;
        
        // Try SPVEquityDistribution first (primary source)
        let equityDistributions = await SPVEquityDistribution.find({ 
          spv: distribution.spv, 
          project: projectId 
        }).populate('investor');
        
        let shareholders = [];
        
        if (equityDistributions.length > 0) {
          // Use SPVEquityDistribution data - filter out entries with null investors
          shareholders = equityDistributions
            .filter(entry => entry.investor !== null && entry.investor !== undefined)
            .map(entry => ({
              investor: entry.investor,
              numberOfShares: entry.numberOfShares,
              equityPercentage: entry.equityPercentage
            }));
        } else {
          // Fallback to CapTable (backwards compatibility)
          const capTable = await CapTable.find({ spv: distribution.spv, status: 'active' })
            .populate('shareholder');
          
          if (capTable.length > 0) {
            shareholders = capTable
              .filter(entry => entry.shareholder !== null && entry.shareholder !== undefined)
              .map(entry => ({
                investor: entry.shareholder,
                numberOfShares: entry.numberOfShares,
                equityPercentage: null
              }));
          }
        }
        
        if (shareholders.length > 0) {
          const totalShares = shareholders.reduce((sum, entry) => sum + entry.numberOfShares, 0);
          const distributionPerShare = distribution.netDistributableAmount / totalShares;
          const tdsRate = distribution.taxWithholding?.tdsRate || 20;
          
          distribution.investorDistributions = shareholders.map(entry => {
            const grossAmount = entry.numberOfShares * distributionPerShare;
            const investorTDS = grossAmount * (tdsRate / 100);
            const netAmount = grossAmount - investorTDS;
            
            // Calculate ownership percentage
            const ownershipPercentage = entry.equityPercentage !== null 
              ? entry.equityPercentage 
              : (entry.numberOfShares / totalShares) * 100;
            
            // Safely get investor ID and bank account
            const investorId = entry.investor?._id || entry.investor || null;
            const bankAccount = entry.investor?.bankDetails?.[0] || {};
            
            if (!investorId) {
              throw new Error('Invalid investor data: investor ID is missing');
            }
            
            return {
              investor: investorId,
              numberOfShares: entry.numberOfShares,
              ownershipPercentage,
              grossAmount,
              tdsAmount: investorTDS,
              netAmount,
              bankAccount,
              paymentStatus: 'pending'
            };
          });
          
          distribution.distributionPerShare = distributionPerShare;
        }
      }
    }

    // Apply other updates
    Object.assign(distribution, updates);
    distribution.updatedBy = req.user._id;
    await distribution.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'distribution_updated',
      eventCategory: 'distribution',
      performedBy: req.user._id,
      targetEntity: { entityType: 'distribution', entityId: distribution._id },
      action: 'Distribution updated',
      details: {
        distributionNumber: distribution.distributionNumber,
        updatedFields: Object.keys(updates)
      }
    });

    // Populate before returning
    await distribution.populate('spv', 'spvName spvCode');
    await distribution.populate('project', 'projectName projectCode');

    logger.info(`Distribution ${distribution.distributionNumber} updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Distribution updated successfully',
      data: { distribution }
    });
  } catch (error) {
    logger.error('Error updating distribution:', error);
    next(error);
  }
};

/**
 * Cancel distribution
 * PUT /api/v1/distributions/:id/cancel
 */
exports.cancelDistribution = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const distribution = await Distribution.findById(req.params.id);

    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: 'Distribution not found'
      });
    }

    // Only allow cancellation if status is 'calculated' or 'draft'
    if (!['draft', 'calculated'].includes(distribution.status)) {
      return res.status(400).json({
        success: false,
        error: 'Can only cancel distributions with status "draft" or "calculated"'
      });
    }

    // Check if any approvals have been granted
    const hasApprovals = distribution.approvals.assetManagerApproval.approved ||
                        distribution.approvals.complianceApproval.approved ||
                        distribution.approvals.adminApproval.approved;

    if (hasApprovals) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel distribution that has approvals'
      });
    }

    // Update status
    distribution.status = 'cancelled';
    distribution.updatedBy = req.user._id;
    
    // Add cancellation note
    if (reason) {
      distribution.notes = distribution.notes || [];
      distribution.notes.push({
        note: `Cancelled: ${reason}`,
        addedBy: req.user._id,
        addedAt: new Date()
      });
    }

    await distribution.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'distribution_cancelled',
      eventCategory: 'distribution',
      performedBy: req.user._id,
      targetEntity: { entityType: 'distribution', entityId: distribution._id },
      action: 'Distribution cancelled',
      details: {
        distributionNumber: distribution.distributionNumber,
        reason: reason || 'No reason provided'
      }
    });

    logger.info(`Distribution ${distribution.distributionNumber} cancelled by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Distribution cancelled successfully',
      data: { distribution }
    });
  } catch (error) {
    logger.error('Error cancelling distribution:', error);
    next(error);
  }
};

