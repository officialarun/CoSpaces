const User = require('../models/User.model');
const Project = require('../models/Project.model');
const AuditLog = require('../models/AuditLog.model');
const Trust = require('../models/Trust.model');
const logger = require('../utils/logger');
const cloudinary = require('../config/cloudinary');

// ==================== TRUST MANAGEMENT ====================

exports.getAllTrusts = async (req, res, next) => {
  try {
    const trusts = await Trust.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: { trusts } });
  } catch (error) {
    logger.error('Error fetching trusts:', error);
    next(error);
  }
};

exports.createTrust = async (req, res, next) => {
  try {
    const trust = await Trust.create({ ...req.body, createdBy: req.user._id });
    await AuditLog.logEvent({
      eventType: 'trust_created',
      eventCategory: 'trust',
      performedBy: req.user._id,
      targetEntity: { entityType: 'trust', entityId: trust._id },
      action: 'Trust created by admin',
    });
    res.status(201).json({ success: true, data: { trust } });
  } catch (error) {
    logger.error('Error creating trust:', error);
    next(error);
  }
};

exports.updateTrust = async (req, res, next) => {
  try {
    const trust = await Trust.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    if (!trust) return res.status(404).json({ success: false, error: 'Trust not found' });
    await AuditLog.logEvent({
      eventType: 'trust_updated',
      eventCategory: 'trust',
      performedBy: req.user._id,
      targetEntity: { entityType: 'trust', entityId: trust._id },
      action: 'Trust updated by admin',
    });
    res.json({ success: true, data: { trust } });
  } catch (error) {
    logger.error('Error updating trust:', error);
    next(error);
  }
};

exports.deleteTrust = async (req, res, next) => {
  try {
    const SPV = require('../models/SPV.model');
    const spvCount = await SPV.countDocuments({ trust: req.params.id });
    if (spvCount > 0) {
      return res.status(400).json({ success: false, error: 'Cannot delete trust with associated SPVs' });
    }
    const trust = await Trust.findByIdAndDelete(req.params.id);
    if (!trust) return res.status(404).json({ success: false, error: 'Trust not found' });
    await AuditLog.logEvent({
      eventType: 'trust_deleted',
      eventCategory: 'trust',
      performedBy: req.user._id,
      targetEntity: { entityType: 'trust', entityId: trust._id },
      action: 'Trust deleted by admin',
    });
    res.json({ success: true, message: 'Trust deleted' });
  } catch (error) {
    logger.error('Error deleting trust:', error);
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with pagination and filters
 * GET /api/v1/admin/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      kycStatus = '',
      role = '',
      isActive = ''
    } = req.query;

    // Build query
    const query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by KYC status
    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    logger.info(`Admin ${req.user.email} retrieved ${users.length} users`);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalUsers: count
      }
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

/**
 * Get single user by ID with full details
 * GET /api/v1/admin/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

/**
 * Update user details
 * PUT /api/v1/admin/users/:id
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;

    await user.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'user_updated',
      eventCategory: 'user',
      performedBy: req.user._id,
      targetEntity: { entityType: 'user', entityId: user._id },
      action: 'User details updated by admin',
      metadata: { updatedFields: Object.keys(req.body) }
    });

    logger.info(`Admin ${req.user.email} updated user ${user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

/**
 * Deactivate user (soft delete)
 * DELETE /api/v1/admin/users/:id
 */
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'user_deactivated',
      eventCategory: 'user',
      performedBy: req.user._id,
      targetEntity: { entityType: 'user', entityId: user._id },
      action: 'User deactivated by admin'
    });

    logger.info(`Admin ${req.user.email} deactivated user ${user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deactivating user:', error);
    next(error);
  }
};

/**
 * Create staff member (Asset Manager or Compliance Officer)
 * POST /api/v1/admin/staff/create
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email, password, role'
      });
    }

    // Validate role
    if (!['asset_manager', 'compliance_officer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "asset_manager" or "compliance_officer"'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Import staff seed service
    const staffSeedService = require('../services/staffSeed.service');

    // Create and seed staff member
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      phone: phone || ''
    };

    const staffUser = await staffSeedService.seedStaffMember(userData, req.user._id);

    // Return user (excluding password)
    const userResponse = staffUser.toObject();
    delete userResponse.password;

    logger.info(`Admin ${req.user.email} created staff member: ${staffUser.email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        user: userResponse,
        loginInstructions: {
          email: staffUser.email,
          password: 'As set by admin',
          googleOAuth: `Can login via Google OAuth using ${staffUser.email}`,
          note: 'Staff member can login immediately with email/password or Google OAuth'
        }
      }
    });
  } catch (error) {
    logger.error('Error creating staff member:', error);
    
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    next(error);
  }
};

/**
 * Get all staff members (Asset Managers and Compliance Officers)
 * GET /api/v1/admin/staff
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      isActive = ''
    } = req.query;

    // Build query - only staff roles
    const query = {
      role: { $in: ['asset_manager', 'compliance_officer'] }
    };
    
    // Search by name or email
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role && ['asset_manager', 'compliance_officer'].includes(role)) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const staff = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    logger.info(`Admin ${req.user.email} retrieved ${staff.length} staff members`);

    res.json({
      success: true,
      data: {
        staff,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalStaff: count
      }
    });
  } catch (error) {
    logger.error('Error fetching staff members:', error);
    next(error);
  }
};

/**
 * Get user onboarding status
 * GET /api/v1/admin/users/:id/onboarding-status
 */
exports.getUserOnboardingStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'onboardingCompleted onboardingStep phone diditVerification.isVerified diditVerification.aadhaarVerified'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const status = {
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      phoneVerified: !!user.phone,
      diditVerified: user.diditVerification?.isVerified || false,
      aadhaarVerified: user.diditVerification?.aadhaarVerified || false
    };

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    logger.error('Error fetching onboarding status:', error);
    next(error);
  }
};

// ==================== PROJECT MANAGEMENT ====================

/**
 * Get all projects (all statuses)
 * GET /api/v1/admin/projects
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      isPublic = ''
    } = req.query;

    // Build query
    const query = {};

    // Search by name or code
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by public status
    if (isPublic !== '') {
      query.isPublic = isPublic === 'true';
    }

    const projects = await Project.find(query)
      .populate('assetManager', 'firstName lastName email role')
      .populate('spv', 'spvName spvCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Fix any projects that have SPV but wrong status (data consistency)
    for (const project of projects) {
      if (project.spv && project.status !== 'approved' && project.status !== 'acquired') {
        const oldStatus = project.status;
        project.status = 'approved';
        await project.save();
        logger.info(`Fixed project ${project.projectCode}: has SPV but status was ${oldStatus}, updated to approved`);
      }
    }

    const count = await Project.countDocuments(query);

    // Aggregate raised amounts from Payment model only
    const Payment = require('../models/Payment.model');
    const payAgg = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
    ]);
    const raisedMap = new Map(payAgg.map(p => [String(p._id), p.total || 0]));

    logger.info(`Admin ${req.user.email} retrieved ${projects.length} projects`);

    res.json({
      success: true,
      data: {
        projects: projects.map(p => {
          const o = p.toObject();
          o.funding = {
            raisedPaid: raisedMap.get(String(p._id)) || 0,
            target: p.financials?.targetRaise || 0,
          };
          return o;
        }),
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalProjects: count
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    next(error);
  }
};

/** Recalculate funding status for all active projects */
exports.recalculateFundingStatus = async (req, res, next) => {
  try {
    const Payment = require('../models/Payment.model');
    // Include 'under_acquisition' so projects can be moved from funded to under_acquisition
    const candidateStatuses = ['fundraising', 'listed', 'approved', 'under_acquisition'];
    const projects = await Project.find({ status: { $in: candidateStatuses } });
    let updated = 0;

    for (const project of projects) {
      // Aggregate from Payments only
      const payAgg = await Payment.aggregate([
        { $match: { project: project._id, status: 'captured' } },
        { $group: { _id: '$project', total: { $sum: { $ifNull: ['$amountInINR', 0] } } } }
      ]);

      const totalRaised = payAgg?.[0]?.total || 0;
      const target = project.financials?.targetRaise || 0;

      if (totalRaised >= target && target > 0) {
        // Move to 'under_acquisition' when funding is complete
        project.status = 'under_acquisition';
        project.timeline = project.timeline || {};
        project.timeline.fundraisingEndDate = new Date();
        await project.save();
        updated++;
        logger.info(`Project ${project.projectCode} marked as under_acquisition. Raised: ${totalRaised}, Target: ${target}`);
      }
    }

    res.json({ success: true, data: { updated } });
  } catch (error) {
    logger.error('Error recalculating funding:', error);
    next(error);
  }
};

/**
 * Create project (supports image upload)
 * POST /api/v1/admin/projects
 */
exports.createProject = async (req, res, next) => {
  try {
    const body = req.body || {};

    // Normalize minimal required fields mapping from admin form
    const project = new Project({
      projectName: body.projectName,
      projectCode: body.projectCode,
      description: body.description,
      shortDescription: body.shortDescription,
      landDetails: {
        location: {
          address: body.address,
          city: body.city,
          state: body.state,
          pincode: body.pincode,
        },
        totalArea: body.totalAreaValue ? {
          value: Number(body.totalAreaValue),
          unit: body.totalAreaUnit || 'sqft',
        } : undefined,
        landType: body.landType,
        zoning: body.zoning,
        surveyNumber: body.surveyNumber,
        plotNumber: body.plotNumber,
        titleDeedNumber: body.titleDeedNumber,
      },
      financials: {
        landValue: Number(body.landValue),
        acquisitionCost: body.acquisitionCost ? Number(body.acquisitionCost) : undefined,
        targetRaise: Number(body.targetRaise),
        minimumInvestment: Number(body.minimumInvestment || 100000),
        maximumInvestment: body.maximumInvestment ? Number(body.maximumInvestment) : undefined,
        expectedIRR: {
          low: body.irrLow ? Number(body.irrLow) : undefined,
          high: body.irrHigh ? Number(body.irrHigh) : undefined,
          target: body.irrTarget ? Number(body.irrTarget) : undefined,
        },
        holdingPeriod: Number(body.holdingPeriod || 0),
        exitStrategy: body.exitStrategy || 'resale',
        projectedExitValue: body.projectedExitValue ? Number(body.projectedExitValue) : undefined,
      },
      status: body.status || 'draft',
      isPublic: body.isPublic === 'true' || body.isPublic === true,
      reraCompliance: {
        applicable: body.reraApplicable === 'true' || body.reraApplicable === true || false,
      },
      createdBy: req.user._id,
      assetManager: req.user._id,
    });

    // Upload images if provided
    const files = req.files || {};
    if (files.siteImage && files.siteImage[0]) {
      const uploadRes = await cloudinary.uploader.upload_stream_async
        ? await cloudinary.uploader.upload_stream_async(files.siteImage[0].buffer, { folder: 'projects/covers' })
        : await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'projects/covers' }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
            stream.end(files.siteImage[0].buffer);
          });
      project.media = project.media || {};
      project.media.coverImage = uploadRes.secure_url;
    }

    if (files.gallery && files.gallery.length) {
      project.media = project.media || {};
      project.media.images = [];
      for (const file of files.gallery) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'projects/gallery' }, (err, resUpload) => {
            if (err) return reject(err);
            resolve(resUpload);
          });
          stream.end(file.buffer);
        });
        project.media.images.push(result.secure_url);
      }
    }

    await project.save();

    await AuditLog.logEvent({
      eventType: 'project_created',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project created by admin',
    });

    res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    logger.error('Error creating project:', error);
    next(error);
  }
};

/**
 * Update project (supports replacing images)
 * PUT /api/v1/admin/projects/:id
 */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const body = req.body || {};

    // Update fields
    if (body.projectName) project.projectName = body.projectName;
    if (body.projectCode) project.projectCode = body.projectCode;
    if (body.description) project.description = body.description;
    if (body.shortDescription !== undefined) project.shortDescription = body.shortDescription;

    project.landDetails = project.landDetails || {};
    project.landDetails.location = project.landDetails.location || {};
    if (body.address !== undefined) project.landDetails.location.address = body.address;
    if (body.city) project.landDetails.location.city = body.city;
    if (body.state) project.landDetails.location.state = body.state;
    if (body.pincode !== undefined) project.landDetails.location.pincode = body.pincode;
    if (body.totalAreaValue) {
      project.landDetails.totalArea = {
        value: Number(body.totalAreaValue),
        unit: body.totalAreaUnit || 'sqft',
      };
    }
    if (body.landType) project.landDetails.landType = body.landType;
    if (body.zoning !== undefined) project.landDetails.zoning = body.zoning;

    project.financials = project.financials || {};
    if (body.landValue) project.financials.landValue = Number(body.landValue);
    if (body.acquisitionCost) project.financials.acquisitionCost = Number(body.acquisitionCost);
    if (body.targetRaise) project.financials.targetRaise = Number(body.targetRaise);
    if (body.minimumInvestment) project.financials.minimumInvestment = Number(body.minimumInvestment);
    if (body.maximumInvestment) project.financials.maximumInvestment = Number(body.maximumInvestment);
    project.financials.expectedIRR = project.financials.expectedIRR || {};
    if (body.irrLow) project.financials.expectedIRR.low = Number(body.irrLow);
    if (body.irrHigh) project.financials.expectedIRR.high = Number(body.irrHigh);
    if (body.irrTarget) project.financials.expectedIRR.target = Number(body.irrTarget);
    if (body.holdingPeriod) project.financials.holdingPeriod = Number(body.holdingPeriod);
    if (body.exitStrategy) project.financials.exitStrategy = body.exitStrategy;
    if (body.projectedExitValue) project.financials.projectedExitValue = Number(body.projectedExitValue);

    if (body.status) project.status = body.status;
    if (body.isPublic !== undefined) project.isPublic = body.isPublic === 'true' || body.isPublic === true;
    if (body.reraApplicable !== undefined) {
      project.reraCompliance = project.reraCompliance || {};
      project.reraCompliance.applicable = body.reraApplicable === 'true' || body.reraApplicable === true;
    }
    project.updatedBy = req.user._id;

    // Handle images (replace if uploaded)
    const files = req.files || {};
    if (files.siteImage && files.siteImage[0]) {
      const cover = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'projects/covers' }, (err, resUpload) => {
          if (err) return reject(err);
          resolve(resUpload);
        });
        stream.end(files.siteImage[0].buffer);
      });
      project.media = project.media || {};
      project.media.coverImage = cover.secure_url;
    }

    if (files.gallery && files.gallery.length) {
      project.media = project.media || {};
      project.media.images = project.media.images || [];
      for (const file of files.gallery) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'projects/gallery' }, (err, resUpload) => {
            if (err) return reject(err);
            resolve(resUpload);
          });
          stream.end(file.buffer);
        });
        project.media.images.push(result.secure_url);
      }
    }

    await project.save();

    await AuditLog.logEvent({
      eventType: 'project_updated',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project updated by admin',
      metadata: { updatedFields: Object.keys(body) }
    });

    res.json({ success: true, data: { project } });
  } catch (error) {
    logger.error('Error updating project:', error);
    next(error);
  }
};

/**
 * Publish project (make visible to users)
 * PUT /api/v1/admin/projects/:id/publish
 */
exports.publishProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project.isPublic = true;
    
    // Update status to listed if not already
    if (project.status === 'approved' || project.status === 'draft') {
      project.status = 'listed';
      project.timeline.listedAt = new Date();
    }

    await project.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'project_published',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project published by admin'
    });

    logger.info(`Admin ${req.user.email} published project ${project.projectCode}`);

    res.json({
      success: true,
      message: 'Project published successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Error publishing project:', error);
    next(error);
  }
};

/**
 * Unpublish project (hide from users)
 * PUT /api/v1/admin/projects/:id/unpublish
 */
exports.unpublishProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project.isPublic = false;
    await project.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'project_unpublished',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project unpublished by admin'
    });

    logger.info(`Admin ${req.user.email} unpublished project ${project.projectCode}`);

    res.json({
      success: true,
      message: 'Project unpublished successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Error unpublishing project:', error);
    next(error);
  }
};

/**
 * Delete project
 * DELETE /api/v1/admin/projects/:id
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'project_deleted',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Project deleted by admin',
      metadata: { projectCode: project.projectCode, projectName: project.projectName }
    });

    logger.info(`Admin ${req.user.email} deleted project ${project.projectCode}`);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    next(error);
  }
};

// ==================== SPV MANAGEMENT ====================
exports.getAllSPVs = async (req, res, next) => {
  try {
    const { trust = '', search = '' } = req.query;
    const SPV = require('../models/SPV.model');
    const query = {};
    if (trust) query.trust = trust;
    if (search) {
      query.$or = [
        { spvName: { $regex: search, $options: 'i' } },
        { spvCode: { $regex: search, $options: 'i' } },
        { 'registrationDetails.cin': { $regex: search, $options: 'i' } },
      ];
    }
    const spvs = await SPV.find(query).populate({
      path: 'trust',
      select: 'name registrationNumber'
    });
    res.json({ success: true, data: { spvs } });
  } catch (error) {
    logger.error('Error fetching SPVs:', error);
    next(error);
  }
};

exports.createSPV = async (req, res, next) => {
  try {
    const SPV = require('../models/SPV.model');
    // Ensure trust exists
    if (!req.body.trust) return res.status(400).json({ success: false, error: 'trust is required' });
    const trust = await Trust.findById(req.body.trust);
    if (!trust) return res.status(400).json({ success: false, error: 'Invalid trust' });

    // Map form fields to model fields and set defaults
    const spvData = {
      // Map 'name' to 'spvName'
      spvName: req.body.name || req.body.spvName,
      // Generate spvCode if not provided
      spvCode: req.body.spvCode || `SPV-${Date.now()}`,
      // Map trust
      trust: req.body.trust,
      // Set registration number if provided
      ...(req.body.registrationNumber && {
        'registrationDetails.cin': req.body.registrationNumber
      }),
      // Set required fields with defaults
      shareStructure: {
        authorizedCapital: req.body.shareStructure?.authorizedCapital || req.body.authorizedCapital || 1000000, // Default 10L
        ...(req.body.shareStructure || {})
      },
      fundraising: {
        targetAmount: req.body.fundraising?.targetAmount || req.body.targetAmount || 1000000, // Default 10L
        minimumInvestment: req.body.fundraising?.minimumInvestment || req.body.minimumInvestment || 50000, // Default 50K
        ...(req.body.fundraising || {})
      },
      // Set createdBy
      createdBy: req.user._id,
      // Project is optional - will be assigned later via Assign SPV
      ...(req.body.project && { project: req.body.project }),
      // Set entity type if provided
      ...(req.body.entityType && { entityType: req.body.entityType }),
      // Include any other fields from req.body (but don't override what we've set)
      ...Object.keys(req.body).reduce((acc, key) => {
        if (!['name', 'spvCode', 'trust', 'registrationNumber', 'authorizedCapital', 'targetAmount', 'minimumInvestment'].includes(key)) {
          acc[key] = req.body[key];
        }
        return acc;
      }, {})
    };

    const spv = await SPV.create(spvData);
    await AuditLog.logEvent({ eventType: 'spv_created', eventCategory: 'spv', performedBy: req.user._id, targetEntity: { entityType: 'spv', entityId: spv._id }, action: 'SPV created by admin' });
    // Populate trust before returning
    await spv.populate({
      path: 'trust',
      select: 'name registrationNumber'
    });
    res.status(201).json({ success: true, data: { spv } });
  } catch (error) {
    logger.error('Error creating SPV:', error);
    next(error);
  }
};

exports.updateSPV = async (req, res, next) => {
  try {
    const SPV = require('../models/SPV.model');
    // Map form fields to model fields (same as createSPV)
    const updateData = {
      // Map 'name' to 'spvName'
      ...(req.body.name !== undefined && { spvName: req.body.name }),
      // Map registrationNumber to registrationDetails.cin
      ...(req.body.registrationNumber !== undefined && {
        'registrationDetails.cin': req.body.registrationNumber
      }),
      // Include other fields that match the model directly
      ...Object.keys(req.body).reduce((acc, key) => {
        if (!['name', 'registrationNumber'].includes(key)) {
          acc[key] = req.body[key];
        }
        return acc;
      }, {})
    };
    
    const spv = await SPV.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!spv) return res.status(404).json({ success: false, error: 'SPV not found' });
    // Populate trust before returning
    await spv.populate({
      path: 'trust',
      select: 'name registrationNumber'
    });
    await AuditLog.logEvent({ eventType: 'spv_updated', eventCategory: 'spv', performedBy: req.user._id, targetEntity: { entityType: 'spv', entityId: spv._id }, action: 'SPV updated by admin' });
    res.json({ success: true, data: { spv } });
  } catch (error) {
    logger.error('Error updating SPV:', error);
    next(error);
  }
};

exports.deleteSPV = async (req, res, next) => {
  try {
    const SPV = require('../models/SPV.model');
    // Prevent deletion if assigned to a project
    const assigned = await Project.countDocuments({ spv: req.params.id });
    if (assigned > 0) return res.status(400).json({ success: false, error: 'Cannot delete SPV assigned to a project' });
    const spv = await SPV.findByIdAndDelete(req.params.id);
    if (!spv) return res.status(404).json({ success: false, error: 'SPV not found' });
    await AuditLog.logEvent({ eventType: 'spv_deleted', eventCategory: 'spv', performedBy: req.user._id, targetEntity: { entityType: 'spv', entityId: spv._id }, action: 'SPV deleted by admin' });
    res.json({ success: true, message: 'SPV deleted' });
  } catch (error) {
    logger.error('Error deleting SPV:', error);
    next(error);
  }
};

// ==================== ASSIGN SPV TO PROJECT ====================
exports.assignSPVToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { spvId } = req.body;
    const SPV = require('../models/SPV.model');

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    if (project.spv) return res.status(409).json({ success: false, error: 'Project already has an SPV assigned' });

    const spv = await SPV.findById(spvId).populate('trust');
    if (!spv) return res.status(400).json({ success: false, error: 'Invalid SPV' });

    // Check if SPV is already assigned to another project
    if (spv.project && String(spv.project) !== String(projectId)) {
      return res.status(409).json({ success: false, error: 'SPV is already assigned to another project' });
    }

    // Update project with SPV
    project.spv = spv._id;
    // When SPV is assigned, move project from 'under_acquisition' to 'approved'
    // Also handle any existing projects that might have wrong status
    if (project.status === 'under_acquisition' || (project.spv && project.status !== 'approved')) {
      project.status = 'approved';
      project.timeline = project.timeline || {};
      project.timeline.expectedAcquisitionDate = project.timeline.expectedAcquisitionDate || new Date();
    } else if (['funded', 'fundraising', 'listed'].includes(project.status)) {
      // For other statuses, move to 'under_acquisition' first
      project.status = 'under_acquisition';
      project.timeline = project.timeline || {};
      project.timeline.expectedAcquisitionDate = project.timeline.expectedAcquisitionDate || new Date();
    }
    await project.save();

    // Update SPV with project (bidirectional link)
    spv.project = project._id;
    await spv.save();

    // Populate project fields before returning
    await project.populate('spv');
    await project.populate('assetManager', 'firstName lastName email');

    await AuditLog.logEvent({
      eventType: 'spv_assigned_to_project',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'SPV assigned to project',
      metadata: { spvId: spv._id, trustId: spv.trust?._id }
    });

    // Trigger equity distribution and SHA generation
    try {
      const equityController = require('./equity.controller');
      const distributionResult = await equityController.distributeEquity(
        spv._id.toString(),
        project._id.toString(),
        req.user._id.toString()
      );
      
      logger.info('Equity distribution triggered after SPV assignment', {
        projectId: project._id,
        spvId: spv._id,
        distributionsCount: distributionResult.distributions?.length || 0,
        agreementsCount: distributionResult.agreements?.length || 0
      });
    } catch (equityError) {
      // Log error but don't fail the SPV assignment
      logger.error('Failed to distribute equity after SPV assignment:', equityError);
      // Continue with response - equity can be distributed manually later if needed
    }

    res.json({ success: true, message: 'SPV assigned to project', data: { project } });
  } catch (error) {
    logger.error('Error assigning SPV:', error);
    next(error);
  }
};

/**
 * Assign Asset Manager to Project
 * POST /api/v1/admin/projects/:projectId/assign-asset-manager
 */
exports.assignAssetManagerToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { assetManagerId } = req.body;

    if (!assetManagerId) {
      return res.status(400).json({
        success: false,
        error: 'Asset manager ID is required'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Verify that the user exists and has asset_manager role
    const assetManager = await User.findById(assetManagerId);
    if (!assetManager) {
      return res.status(404).json({
        success: false,
        error: 'Asset manager not found'
      });
    }

    if (assetManager.role !== 'asset_manager') {
      return res.status(400).json({
        success: false,
        error: 'User must have asset_manager role'
      });
    }

    // Update project
    const previousAssetManager = project.assetManager;
    project.assetManager = assetManager._id;
    project.updatedBy = req.user._id;
    await project.save();

    // Populate before returning
    await project.populate('assetManager', 'firstName lastName email role');

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'asset_manager_assigned_to_project',
      eventCategory: 'project',
      performedBy: req.user._id,
      targetEntity: { entityType: 'project', entityId: project._id },
      action: 'Asset manager assigned to project',
      details: {
        projectName: project.projectName,
        projectCode: project.projectCode,
        assetManagerId: assetManager._id,
        assetManagerEmail: assetManager.email,
        previousAssetManagerId: previousAssetManager?.toString() || null
      }
    });

    logger.info(`Admin ${req.user.email} assigned asset manager ${assetManager.email} to project ${project.projectCode}`);

    res.json({
      success: true,
      message: 'Asset manager assigned successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Error assigning asset manager:', error);
    next(error);
  }
};

// ==================== KYC MANAGEMENT ====================

/**
 * Get all pending KYC submissions
 * GET /api/v1/admin/kyc/pending
 */
exports.getPendingKYC = async (req, res, next) => {
  try {
    const users = await User.find({
      kycStatus: { $in: ['pending', 'submitted'] },
      onboardingCompleted: true
    })
      .select('-password')
      .sort({ updatedAt: -1 });

    logger.info(`Admin ${req.user.email} retrieved ${users.length} pending KYC submissions`);

    res.json({
      success: true,
      data: { users, count: users.length }
    });
  } catch (error) {
    logger.error('Error fetching pending KYC:', error);
    next(error);
  }
};

/**
 * Get all KYC submissions with filter
 * GET /api/v1/admin/kyc/all
 */
exports.getAllKYC = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      kycStatus = ''
    } = req.query;

    const query = { onboardingCompleted: true };

    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalUsers: count
      }
    });
  } catch (error) {
    logger.error('Error fetching KYC submissions:', error);
    next(error);
  }
};

/**
 * Approve user KYC
 * PUT /api/v1/admin/kyc/:userId/approve
 */
exports.approveKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.kycStatus = 'approved';
    user.kycRejectionReason = undefined; // Clear any previous rejection reason
    await user.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'kyc_approved',
      eventCategory: 'kyc_aml',
      performedBy: req.user._id,
      targetEntity: { entityType: 'user', entityId: user._id },
      action: 'KYC approved by admin'
    });

    logger.info(`Admin ${req.user.email} approved KYC for user ${user.email}`);

    res.json({
      success: true,
      message: 'KYC approved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Error approving KYC:', error);
    next(error);
  }
};

/**
 * Reject user KYC
 * PUT /api/v1/admin/kyc/:userId/reject
 */
exports.rejectKYC = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.kycStatus = 'rejected';
    user.kycRejectionReason = reason;
    await user.save();

    // Log audit event
    await AuditLog.logEvent({
      eventType: 'kyc_rejected',
      eventCategory: 'kyc_aml',
      performedBy: req.user._id,
      targetEntity: { entityType: 'user', entityId: user._id },
      action: 'KYC rejected by admin',
      metadata: { reason }
    });

    logger.info(`Admin ${req.user.email} rejected KYC for user ${user.email}`);

    res.json({
      success: true,
      message: 'KYC rejected successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Error rejecting KYC:', error);
    next(error);
  }
};

// ==================== DASHBOARD STATS ====================

/**
 * Get dashboard statistics
 * GET /api/v1/admin/stats
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      approvedKYC,
      totalProjects,
      publishedProjects,
      draftProjects,
      fundraisingProjects
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ kycStatus: { $in: ['pending', 'submitted'] } }),
      User.countDocuments({ kycStatus: 'approved' }),
      Project.countDocuments(),
      Project.countDocuments({ isPublic: true }),
      Project.countDocuments({ status: 'draft' }),
      Project.countDocuments({ status: 'fundraising' })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      kyc: {
        pending: pendingKYC,
        approved: approvedKYC,
        total: totalUsers
      },
      projects: {
        total: totalProjects,
        published: publishedProjects,
        draft: draftProjects,
        fundraising: fundraisingProjects
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    next(error);
  }
};

/**
 * Get recent activity
 * GET /api/v1/admin/activity
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await AuditLog.find()
      .populate('performedBy', 'profile.firstName profile.lastName email')
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    next(error);
  }
};

