const Project = require('../models/Project.model');
const AuditLog = require('../models/AuditLog.model');

exports.createProject = async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      assetManager: req.user._id,
      createdBy: req.user._id,
      'timeline.draftCreatedAt': new Date()
    };
    
    // Generate unique project code
    projectData.projectCode = `PROJ${Date.now()}`;
    
    const project = await Project.create(projectData);
    
    await AuditLog.logEvent({
      eventType: 'project_created',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project created'
    });
    
    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const projects = await Project.find(query)
      .populate('assetManager', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const count = await Project.countDocuments(query);
    
    res.json({
      success: true,
      data: { projects, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.getListedProjects = async (req, res, next) => {
  try {
    // Return all publicly visible projects (listed, fundraising, and approved)
    const projects = await Project.find({
      status: { $in: ['listed', 'fundraising', 'approved'] },
      isPublic: true
    })
      .select('-checklist -dueDiligence')
      .sort({ 'timeline.listedAt': -1, createdAt: -1 });
      
    res.json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assetManager', 'firstName lastName email')
      .populate('spv');
      
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Attach funding progress (subscriptions + payments)
    const Subscription = require('../models/Subscription.model');
    const Payment = require('../models/Payment.model');
    const [subAgg, payAgg] = await Promise.all([
      Subscription.aggregate([
        { $match: { project: project._id, status: { $in: ['payment_confirmed', 'shares_allocated', 'completed'] } } },
        { $group: { _id: '$project', totalPaid: { $sum: { $ifNull: ['$paidAmount', 0] } } } }
      ]),
      Payment.aggregate([
        { $match: { project: project._id, status: 'captured' } },
        { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
      ])
    ]);

    const raisedPaid = (subAgg?.[0]?.totalPaid || 0) + (payAgg?.[0]?.total || 0);
    const projObj = project.toObject();
    projObj.funding = { raisedPaid, target: project.financials?.targetRaise || 0 };
    
    res.json({ success: true, data: { project: projObj } });
  } catch (error) {
    next(error);
  }
};

exports.getPublicProjectDetails = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('-checklist -dueDiligence.titleChain -approvals');
      
    if (!project || !project.isPublic) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedBy: req.user._id } },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedBy: req.user._id } },
      { new: true }
    );
    
    await AuditLog.logEvent({
      eventType: 'project_status_changed',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: `Project status changed to ${status}`
    });
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.uploadProjectDocument = async (req, res, next) => {
  try {
    // TODO: Implement file upload logic
    res.json({ success: true, message: 'Document uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

exports.approveLegal = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.legalApproval': {
            approved: true,
            approvedBy: req.user._id,
            approvedAt: new Date(),
            comments
          }
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.approveCompliance = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.complianceApproval': {
            approved: true,
            approvedBy: req.user._id,
            approvedAt: new Date(),
            comments
          }
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.approveAssetManager = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.assetManagerApproval': {
            approved: true,
            approvedBy: req.user._id,
            approvedAt: new Date(),
            comments
          }
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

exports.approveAdmin = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'approvals.adminApproval': {
            approved: true,
            approvedBy: req.user._id,
            approvedAt: new Date(),
            comments
          }
        }
      },
      { new: true }
    );
    
    // If all approvals granted, change status
    if (project.areAllApprovalsGranted()) {
      project.status = 'approved';
      await project.save();
    }
    
    res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

