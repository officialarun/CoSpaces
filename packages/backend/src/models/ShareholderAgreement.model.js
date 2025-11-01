const mongoose = require('mongoose');

const shareholderAgreementSchema = new mongoose.Schema({
  // SPV Reference
  spv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPV',
    required: true
  },
  
  // Project Reference
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Investor Reference
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Equity Distribution Reference
  equityDistribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPVEquityDistribution',
    required: true
  },
  
  // Document Details
  documentUrl: {
    type: String,
    required: true // Cloudinary URL
  },
  
  documentHash: {
    type: String // SHA-256 hash of document for integrity
  },
  
  documentVersion: {
    type: Number,
    default: 1
  },
  
  // DIDIT eSign Details
  eSign: {
    required: {
      type: Boolean,
      default: true
    },
    
    status: {
      type: String,
      enum: ['pending', 'initiated', 'sent', 'viewed', 'signed', 'rejected', 'expired', 'failed'],
      default: 'pending'
    },
    
    diditRequestId: String, // eSignRequestId from DIDIT
    diditHash: String, // Hash from DIDIT
    
    signingUrl: String, // URL to redirect user for signing
    
    initiatedAt: Date,
    sentAt: Date,
    viewedAt: Date,
    signedAt: Date,
    expiredAt: Date,
    
    // Signer Details
    signerDetails: {
      name: String,
      email: String,
      phone: String
    },
    
    // Signature Metadata
    signatureMetadata: {
      ipAddress: String,
      userAgent: String,
      certificate: String, // eSign certificate
      signatureHash: String
    },
    
    // Callback Data
    callbackData: mongoose.Schema.Types.Mixed
  },
  
  // Notification Status
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  notificationSentAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'generated', 'pending_signature', 'sent_for_signing', 'signed', 'archived'],
    default: 'draft'
  },
  
  // Notes
  notes: String,
  
  // Metadata
  generatedAt: Date,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
shareholderAgreementSchema.index({ spv: 1, investor: 1 });
shareholderAgreementSchema.index({ project: 1, investor: 1 });
shareholderAgreementSchema.index({ investor: 1, 'eSign.status': 1 });
shareholderAgreementSchema.index({ 'eSign.diditRequestId': 1 });
shareholderAgreementSchema.index({ status: 1, 'eSign.status': 1 });

// Method to check if agreement is ready for signing
shareholderAgreementSchema.methods.isReadyForSigning = function() {
  return this.status === 'generated' && this.eSign.status === 'pending';
};

// Method to check if agreement is signed
shareholderAgreementSchema.methods.isSigned = function() {
  return this.eSign.status === 'signed' && this.status === 'signed';
};

const ShareholderAgreement = mongoose.model('ShareholderAgreement', shareholderAgreementSchema);

module.exports = ShareholderAgreement;

