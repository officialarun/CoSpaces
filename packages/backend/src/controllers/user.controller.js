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
    
    // Prevent updating sensitive fields directly
    delete updates.password;
    delete updates.role;
    delete updates.kycStatus;
    delete updates.amlStatus;
    delete updates.googleId;
    
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

exports.updatePhone = async (req, res, next) => {
  try {
    const logger = require('../utils/logger');
    const phone = req.body.phone?.trim();
    
    // Validate phone number
    if (!phone || phone.length === 0) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Convert to string and trim - do this early so we can use phoneValue consistently
    const phoneValue = String(phone).trim();
    
    // Check if phone already exists (use phoneValue for consistency)
    const existingUser = await User.findOne({ phone: phoneValue, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }
    
    // Update phone number using findByIdAndUpdate with explicit phone value
    let updateResult;
    try {
      updateResult = await User.findByIdAndUpdate(
        req.user._id,
        { 
          $set: { 
            phone: phoneValue,
            isPhoneVerified: false, // Will be verified via OTP
            updatedBy: req.user._id 
          }
        },
        { 
          new: true, 
          runValidators: true,
          setDefaultsOnInsert: true // Ensure defaults are set if creating new fields
        }
      );
      
      if (!updateResult) {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (updateError) {
      logger.error('Error during phone update', { 
        userId: req.user._id, 
        error: updateError.message,
        code: updateError.code 
      });
      
      // If it's a duplicate key error, provide better message
      if (updateError.code === 11000) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
      
      throw updateError;
    }
    
    // Always refresh user from database to ensure we have the latest persisted data
    // Use lean() to get plain JavaScript object, then explicitly select phone
    const updatedUser = await User.findById(req.user._id).lean();
    
    // If phone is still null or missing, force update it using direct document save
    if (!updatedUser.phone || updatedUser.phone === null || updatedUser.phone === undefined || updatedUser.phone === '') {
      try {
        // Force update using direct document save
        const userDoc = await User.findById(req.user._id);
        userDoc.phone = phoneValue;
        
        await userDoc.save({ validateBeforeSave: true });
        
        // Re-fetch to verify
        const finalUser = await User.findById(req.user._id).lean();
        
        if (!finalUser.phone || finalUser.phone === null) {
          logger.error('Phone is still null after force save', { userId: req.user._id });
        }
        
        // Convert back to Mongoose document for response
        const finalUserDoc = await User.findById(req.user._id);
        
        res.json({ 
          success: true, 
          message: 'Phone number updated. Please verify via OTP.',
          data: { user: finalUserDoc } 
        });
        return;
      } catch (saveError) {
        logger.error('Error during force save', { 
          userId: req.user._id, 
          error: saveError.message 
        });
        throw saveError;
      }
    }
    
    // Convert back to Mongoose document for response
    const finalUserDoc = await User.findById(req.user._id);
    
    // Verify phone was actually saved - if still null, log error
    if (!finalUserDoc.phone || finalUserDoc.phone === null || finalUserDoc.phone === undefined) {
      logger.error('Phone update failed - phone still null after update', { 
        userId: req.user._id,
        email: finalUserDoc.email,
        attemptedPhone: phoneValue
      });
    }
    
    // Return the refreshed user data
    res.json({ 
      success: true, 
      message: 'Phone number updated. Please verify via OTP.',
      data: { user: finalUserDoc } 
    });
    return;
    
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.join(', ') 
      });
    }
    
    // Handle duplicate key error (phone already exists)
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }
    
    next(error);
  }
};

// Bank Details CRUD - Using BankDetails model
const BankDetails = require('../models/BankDetails.model');

exports.addBankDetails = async (req, res, next) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, bankName, branchName, accountType, isPrimary } = req.body;
    
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      await BankDetails.updateMany(
        { user: req.user._id },
        { $set: { isPrimary: false } }
      );
    }

    // Check if this is the first account (auto-set as primary)
    const existingAccounts = await BankDetails.countDocuments({ user: req.user._id });
    const setAsPrimary = isPrimary || existingAccounts === 0;

    const bankDetails = await BankDetails.create({
      user: req.user._id,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      accountHolderName,
      bankName,
      branchName,
      accountType,
      isPrimary: setAsPrimary,
      verificationStatus: 'pending'
    });

    res.json({ 
      success: true, 
      message: 'Bank details added successfully',
      data: { bankDetails } 
    });
  } catch (error) {
    next(error);
  }
};

exports.getBankDetails = async (req, res, next) => {
  try {
    const bankDetails = await BankDetails.find({ 
      user: req.user._id,
      isActive: true 
    }).sort({ isPrimary: -1, createdAt: -1 });

    res.json({ 
      success: true, 
      data: { bankDetails } 
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBankDetails = async (req, res, next) => {
  try {
    const { bankDetailsId } = req.params;
    const { accountNumber, ifscCode, accountHolderName, bankName, branchName, accountType, isPrimary } = req.body;

    const bankDetails = await BankDetails.findOne({
      _id: bankDetailsId,
      user: req.user._id
    });

    if (!bankDetails) {
      return res.status(404).json({ error: 'Bank details not found' });
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary && !bankDetails.isPrimary) {
      await BankDetails.updateMany(
        { user: req.user._id, _id: { $ne: bankDetailsId } },
        { $set: { isPrimary: false } }
      );
    }

    // Update fields
    if (accountNumber) bankDetails.accountNumber = accountNumber;
    if (ifscCode) bankDetails.ifscCode = ifscCode.toUpperCase();
    if (accountHolderName) bankDetails.accountHolderName = accountHolderName;
    if (bankName) bankDetails.bankName = bankName;
    if (branchName !== undefined) bankDetails.branchName = branchName;
    if (accountType) bankDetails.accountType = accountType;
    if (isPrimary !== undefined) bankDetails.isPrimary = isPrimary;

    await bankDetails.save();

    res.json({ 
      success: true, 
      message: 'Bank details updated successfully',
      data: { bankDetails } 
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBankDetails = async (req, res, next) => {
  try {
    const { bankDetailsId } = req.params;

    const bankDetails = await BankDetails.findOne({
      _id: bankDetailsId,
      user: req.user._id
    });

    if (!bankDetails) {
      return res.status(404).json({ error: 'Bank details not found' });
    }

    // Soft delete
    bankDetails.isActive = false;
    await bankDetails.save();

    res.json({ 
      success: true, 
      message: 'Bank details deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

exports.setPrimaryBank = async (req, res, next) => {
  try {
    const { bankDetailsId } = req.params;

    const bankDetails = await BankDetails.findOne({
      _id: bankDetailsId,
      user: req.user._id,
      isActive: true
    });

    if (!bankDetails) {
      return res.status(404).json({ error: 'Bank details not found' });
    }

    // Unset all other primary accounts
    await BankDetails.updateMany(
      { user: req.user._id, _id: { $ne: bankDetailsId } },
      { $set: { isPrimary: false } }
    );

    // Set this as primary
    bankDetails.isPrimary = true;
    await bankDetails.save();

    res.json({ 
      success: true, 
      message: 'Primary bank account updated successfully',
      data: { bankDetails } 
    });
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

// Onboarding Step 1 - Professional Details
exports.updateOnboardingStep1 = async (req, res, next) => {
  try {
    const { occupation, company, designation, yearsOfExperience, education, annualIncome, dateOfBirth, address, gender } = req.body;
    
    // Get current user to check DIDIT verification status
    const currentUser = await User.findById(req.user._id);
    
    // Prepare update object
    const updateData = {
      'professionalDetails.occupation': occupation,
      'professionalDetails.company': company,
      'professionalDetails.designation': designation,
      'professionalDetails.yearsOfExperience': yearsOfExperience,
      'professionalDetails.education': education,
      'professionalDetails.annualIncome': annualIncome,
      onboardingStep: 1,
      updatedBy: req.user._id
    };
    
    // Handle verified vs manual input for each field
    const verificationData = currentUser.diditVerification?.verificationData;
    
    // DOB: Use verified if available, otherwise manual
    if (verificationData?.verifiedDOB) {
      updateData.dateOfBirth = verificationData.verifiedDOB;
    } else if (dateOfBirth) {
      updateData.dateOfBirth = dateOfBirth;
    }
    
    // Gender: Use verified if available, otherwise manual
    if (verificationData?.verifiedGender) {
      // Normalize gender
      const genderMap = {
        'M': 'male',
        'Male': 'male', 
        'MALE': 'male',
        'F': 'female',
        'Female': 'female',
        'FEMALE': 'female',
        'O': 'other',
        'Other': 'other',
        'OTHER': 'other'
      };
      updateData.gender = genderMap[verificationData.verifiedGender] || verificationData.verifiedGender.toLowerCase();
    } else if (gender) {
      updateData.gender = gender;
    }
    
    // Address: Merge verified data with manual input intelligently
    if (address) {
      // Start with manual input
      updateData.address = { ...address };
      
      // If DIDIT verified specific fields, override with verified data
      if (currentUser.diditVerification?.addressVerified && verificationData?.verifiedAddress) {
        // Only override fields that DIDIT actually verified (not null/empty)
        if (verificationData.verifiedAddress.street) {
          updateData.address.street = verificationData.verifiedAddress.street;
        }
        if (verificationData.verifiedAddress.city) {
          updateData.address.city = verificationData.verifiedAddress.city;
        }
        if (verificationData.verifiedAddress.state) {
          updateData.address.state = verificationData.verifiedAddress.state;
        }
        if (verificationData.verifiedAddress.pincode) {
          updateData.address.pincode = verificationData.verifiedAddress.pincode;
        }
        if (verificationData.verifiedAddress.country) {
          updateData.address.country = verificationData.verifiedAddress.country;
        }
      }
      
    } else if (currentUser.diditVerification?.addressVerified && verificationData?.verifiedAddress) {
      // No manual input, use verified data only
      updateData.address = verificationData.verifiedAddress;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Step 1 completed', 
      data: { 
        user,
        diditVerified: currentUser.diditVerification?.isVerified || false
      } 
    });
  } catch (error) {
    next(error);
  }
};

// Onboarding Step 2 - Investment Preferences
exports.updateOnboardingStep2 = async (req, res, next) => {
  try {
    const { landTypes, preferredLocations, investmentGoal, riskAppetite, investmentHorizon, minimumInvestmentAmount, maximumInvestmentAmount } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'investmentPreferences.landTypes': landTypes,
          'investmentPreferences.preferredLocations': preferredLocations,
          'investmentPreferences.investmentGoal': investmentGoal,
          'investmentPreferences.riskAppetite': riskAppetite,
          'investmentPreferences.investmentHorizon': investmentHorizon,
          'investmentPreferences.minimumInvestmentAmount': minimumInvestmentAmount,
          'investmentPreferences.maximumInvestmentAmount': maximumInvestmentAmount,
          onboardingStep: 2,
          onboardingCompleted: true,
          updatedBy: req.user._id
        }
      },
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, message: 'Onboarding completed!', data: { user } });
  } catch (error) {
    next(error);
  }
};

