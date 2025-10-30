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
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Check if phone already exists
    const existingUser = await User.findOne({ phone, _id: { $ne: req.user._id } });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          phone,
          isPhoneVerified: false, // Will be verified via OTP
          updatedBy: req.user._id 
        }
      },
      { new: true, runValidators: true }
    );
    
    // TODO: Send OTP to phone number for verification
    
    res.json({ 
      success: true, 
      message: 'Phone number updated. Please verify via OTP.',
      data: { user } 
    });
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
      
      console.log('📝 Merged address data:', updateData.address);
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

