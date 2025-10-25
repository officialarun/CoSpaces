const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  // User Type
  userType: {
    type: String,
    enum: ['individual', 'entity'],
    required: true,
    default: 'individual'
  },
  
  // For individuals
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  
  // For entities
  entityName: String,
  entityType: {
    type: String,
    enum: ['private_limited', 'llp', 'partnership', 'trust', 'huf', 'other']
  },
  incorporationDate: Date,
  cin: String, // Corporate Identification Number
  
  // Role & Permissions
  role: {
    type: String,
    enum: [
      'investor',
      'asset_manager',
      'compliance_officer',
      'legal_officer',
      'admin',
      'auditor',
      'trustee'
    ],
    default: 'investor'
  },
  permissions: [{
    type: String
  }],
  
  // Investor Classification
  investorType: {
    type: String,
    enum: ['retail', 'accredited', 'institutional', 'hni'],
    default: 'retail'
  },
  accreditationStatus: {
    isAccredited: { type: Boolean, default: false },
    accreditedAt: Date,
    accreditationDocument: String,
    netWorth: Number,
    annualIncome: Number
  },
  
  // KYC Status
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  kycCompletedAt: Date,
  kycExpiryDate: Date,
  kycRejectionReason: String,
  
  // AML Status
  amlStatus: {
    type: String,
    enum: ['pending', 'cleared', 'flagged', 'rejected'],
    default: 'pending'
  },
  amlCheckedAt: Date,
  amlFlags: [{
    type: { type: String },
    description: String,
    flaggedAt: Date,
    resolvedAt: Date,
    resolution: String
  }],
  isPEP: { type: Boolean, default: false },
  
  // Address
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Bank Details
  bankDetails: [{
    accountHolderName: String,
    accountNumber: { type: String, select: false }, // Encrypted
    ifscCode: String,
    bankName: String,
    branchName: String,
    accountType: { type: String, enum: ['savings', 'current'] },
    isPrimary: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    }
  }],
  
  // Tax Information
  pan: { type: String, select: false }, // Encrypted
  taxResidency: { type: String, default: 'India' },
  
  // FEMA/FDI (for foreign investors)
  isForeignInvestor: { type: Boolean, default: false },
  nationality: String,
  femaApprovalRequired: { type: Boolean, default: false },
  femaApprovalStatus: {
    type: String,
    enum: ['not_required', 'pending', 'approved', 'rejected']
  },
  femaApprovalDocument: String,
  
  // MFA
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false },
  mfaBackupCodes: [{ type: String, select: false }],
  
  // Security
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  phoneVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  
  // Consents
  consents: {
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: Date,
    privacyPolicyAccepted: { type: Boolean, default: false },
    privacyPolicyAcceptedAt: Date,
    marketingConsent: { type: Boolean, default: false },
    dataProcessingConsent: { type: Boolean, default: false }
  },
  
  // Profile
  profilePicture: String,
  bio: String,
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ amlStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Get full name
userSchema.virtual('fullName').get(function() {
  if (this.userType === 'individual') {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  return this.entityName;
});

// Get display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

