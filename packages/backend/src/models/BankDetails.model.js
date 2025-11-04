const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const bankDetailsSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Account Details
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  
  accountNumber: {
    type: String,
    required: true,
    select: false // Encrypted - not returned by default
  },
  
  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format']
  },
  
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  
  branchName: {
    type: String,
    trim: true
  },
  
  accountType: {
    type: String,
    enum: ['savings', 'current'],
    required: true,
    default: 'savings'
  },
  
  // Primary Account Flag
  isPrimary: {
    type: Boolean,
    default: false
  },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  
  verifiedAt: Date,
  
  verificationNotes: String,
  
  // Active Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  addedAt: {
    type: Date,
    default: Date.now
  },
  
  lastUsedAt: Date
}, {
  timestamps: true
});

// Indexes
bankDetailsSchema.index({ user: 1, isPrimary: 1 });
bankDetailsSchema.index({ user: 1, isActive: 1 });
bankDetailsSchema.index({ ifscCode: 1 });

// Pre-save hook: Encrypt account number
bankDetailsSchema.pre('save', async function(next) {
  if (this.isModified('accountNumber') && this.accountNumber) {
    // Only encrypt if not already encrypted (encrypted values are base64 strings)
    // Check if it's a plain number string (not encrypted)
    if (/^\d+$/.test(this.accountNumber)) {
      this.accountNumber = encrypt(this.accountNumber);
    }
  }
  next();
});

// Method to decrypt account number
bankDetailsSchema.methods.getDecryptedAccountNumber = function() {
  if (!this.accountNumber) return null;
  try {
    // Try to decrypt (if encrypted)
    const decrypted = decrypt(this.accountNumber);
    return decrypted || this.accountNumber;
  } catch (error) {
    // If decryption fails, return as-is (might be plain text in dev)
    return this.accountNumber;
  }
};

// Static method to ensure only one primary account per user
bankDetailsSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isNew) {
    // Unset primary flag for other accounts of the same user
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

// Virtual for masked account number (last 4 digits)
bankDetailsSchema.virtual('maskedAccountNumber').get(function() {
  try {
    const decrypted = this.getDecryptedAccountNumber();
    if (decrypted && decrypted.length >= 4) {
      return `****${decrypted.slice(-4)}`;
    }
    return '****';
  } catch (error) {
    return '****';
  }
});

// Transform to include masked account number in JSON
bankDetailsSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.accountNumber; // Don't expose encrypted account number
    return ret;
  }
});

const BankDetails = mongoose.model('BankDetails', bankDetailsSchema);

module.exports = BankDetails;

