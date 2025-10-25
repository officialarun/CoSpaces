const User = require('../models/User.model');
const { encrypt } = require('../utils/encryption');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateBankDetails = async (req, res, next) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, bankName, branchName, accountType } = req.body;
    
    const user = await User.findById(req.user._id);
    user.bankDetails.push({
      accountNumber: encrypt(accountNumber),
      ifscCode,
      accountHolderName,
      bankName,
      branchName,
      accountType,
      isPrimary: user.bankDetails.length === 0
    });
    await user.save();
    
    res.json({ success: true, message: 'Bank details added successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, kycStatus } = req.query;
    const query = {};
    if (role) query.role = role;
    if (kycStatus) query.kycStatus = kycStatus;
    
    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const count = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: { users, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, permissions } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role, permissions, updatedBy: req.user._id } },
      { new: true }
    );
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive, updatedBy: req.user._id } },
      { new: true }
    );
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

