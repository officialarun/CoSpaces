const SPV = require('../models/SPV.model');
const Project = require('../models/Project.model');
const CapTable = require('../models/CapTable.model');
const AuditLog = require('../models/AuditLog.model');

exports.createSPV = async (req, res, next) => {
  try {
    const spvData = {
      ...req.body,
      spvCode: `SPV${Date.now()}`,
      createdBy: req.user._id,
      'importantDates.formationDate': new Date()
    };
    
    const spv = await SPV.create(spvData);
    
    // Link SPV to project
    await Project.findByIdAndUpdate(req.body.project, { spv: spv._id });
    
    await AuditLog.logEvent({
      eventType: 'spv_created',
      eventCategory: 'spv',
      performedBy: req.user._id,
      targetEntity: { entityType: 'spv', entityId: spv._id },
      action: 'SPV created'
    });
    
    res.status(201).json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.getAllSPVs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const spvs = await SPV.find(query)
      .populate('project', 'projectName projectCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const count = await SPV.countDocuments(query);
    
    res.json({
      success: true,
      data: { spvs, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSPVById = async (req, res, next) => {
  try {
    const spv = await SPV.findById(req.params.id)
      .populate('project')
      .populate('directors.user', 'firstName lastName email');
      
    if (!spv) {
      return res.status(404).json({ error: 'SPV not found' });
    }
    
    res.json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.updateSPV = async (req, res, next) => {
  try {
    const spv = await SPV.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedBy: req.user._id } },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.updateSPVStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const spv = await SPV.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedBy: req.user._id } },
      { new: true }
    );
    
    await AuditLog.logEvent({
      eventType: 'spv_status_changed',
      eventCategory: 'spv',
      performedBy: req.user._id,
      targetEntity: { entityType: 'spv', entityId: spv._id },
      action: `SPV status changed to ${status}`
    });
    
    res.json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.publishPPM = async (req, res, next) => {
  try {
    const { ppmDocument } = req.body;
    
    const spv = await SPV.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'privatePlacement.isPPMPublished': true,
          'privatePlacement.ppmDocument': ppmDocument,
          'privatePlacement.ppmPublishedDate': new Date(),
          'privatePlacement.publicOfferingRestrictionDate': new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 180 days
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.incorporateSPV = async (req, res, next) => {
  try {
    const { incorporationDate, cin, registrationDetails } = req.body;
    
    const spv = await SPV.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'incorporated',
          'importantDates.incorporationDate': incorporationDate,
          'registrationDetails.cin': cin,
          'registrationDetails': { ...registrationDetails }
        }
      },
      { new: true }
    );
    
    await AuditLog.logEvent({
      eventType: 'spv_incorporated',
      eventCategory: 'spv',
      performedBy: req.user._id,
      targetEntity: { entityType: 'spv', entityId: spv._id },
      action: 'SPV incorporated'
    });
    
    res.json({ success: true, data: { spv } });
  } catch (error) {
    next(error);
  }
};

exports.getCapTable = async (req, res, next) => {
  try {
    const capTable = await CapTable.find({ spv: req.params.id, status: 'active' })
      .populate('shareholder', 'firstName lastName email entityName')
      .sort({ acquisitionDate: 1 });
      
    const totalShares = capTable.reduce((sum, entry) => sum + entry.numberOfShares, 0);
    const totalInvestment = capTable.reduce((sum, entry) => sum + entry.investmentAmount, 0);
    
    res.json({
      success: true,
      data: {
        capTable,
        summary: { totalShares, totalInvestment, investorCount: capTable.length }
      }
    });
  } catch (error) {
    next(error);
  }
};

