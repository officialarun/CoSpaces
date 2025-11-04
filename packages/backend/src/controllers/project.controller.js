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
    const { status, page = 1, limit = 20, assetManager } = req.query;
    const query = {};
    if (status) query.status = status;
    
    // Filter by asset manager if provided
    if (assetManager) {
      query.assetManager = assetManager;
    }
    
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
    // Return all publicly visible projects (listed, fundraising, under_acquisition, and approved)
    const projects = await Project.find({
      status: { $in: ['listed', 'fundraising', 'under_acquisition', 'approved'] },
      isPublic: true
    })
      .populate('spv', 'spvName spvCode')
      .select('-checklist -dueDiligence')
      .sort({ 'timeline.listedAt': -1, createdAt: -1 });

    // Fix any projects that have SPV but wrong status (data consistency)
    for (const project of projects) {
      // Check if project has SPV (either ObjectId or populated object)
      const hasSPV = project.spv && (typeof project.spv === 'object' ? project.spv._id : project.spv);
      if (hasSPV && project.status !== 'approved' && project.status !== 'acquired') {
        project.status = 'approved';
        await project.save();
      }
    }

    // Calculate funding progress for all projects (using Payment model only)
    const Payment = require('../models/Payment.model');
    
    const projectIds = projects.map(p => p._id);
    
    // Aggregate payments
    const payAgg = await Payment.aggregate([
      { $match: { project: { $in: projectIds }, status: 'captured' } },
      { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
    ]);
    
    // Create a map of project ID to raised amount
    const raisedMap = new Map();
    payAgg.forEach(p => {
      raisedMap.set(String(p._id), (raisedMap.get(String(p._id)) || 0) + (p.total || 0));
    });
    
    // Add funding data to each project
    const projectsWithFunding = projects.map(project => {
      const projObj = project.toObject();
      projObj.funding = {
        raisedPaid: raisedMap.get(String(project._id)) || 0,
        target: project.financials?.targetRaise || 0,
      };
      return projObj;
    });
      
    res.json({ success: true, data: { projects: projectsWithFunding } });
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

    // Attach funding progress (payments only)
    const Payment = require('../models/Payment.model');
    const payAgg = await Payment.aggregate([
      { $match: { project: project._id, status: 'captured' } },
      { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
    ]);

    const raisedPaid = payAgg?.[0]?.total || 0;
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

