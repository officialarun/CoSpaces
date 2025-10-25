const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // Document Identification
  documentName: {
    type: String,
    required: true
  },
  
  documentType: {
    type: String,
    required: true,
    enum: [
      // Legal Documents
      'ppm', 'subscription_agreement', 'shareholder_agreement', 'share_certificate',
      'incorporation_certificate', 'moa', 'aoa', 'board_resolution',
      
      // KYC Documents
      'aadhaar', 'pan', 'passport', 'driving_license', 'address_proof',
      'selfie', 'bank_statement',
      
      // Entity Documents
      'cin_certificate', 'gst_certificate', 'director_kyc',
      
      // Project Documents
      'title_deed', 'encumbrance_certificate', 'survey_document',
      'valuation_report', 'noc', 'legal_opinion', 'rera_certificate',
      
      // Financial Documents
      'payment_receipt', 'tax_document', 'distribution_statement',
      'financial_statement', 'audit_report',
      
      // Escrow Documents
      'escrow_agreement', 'escrow_release_authorization',
      
      // Others
      'other'
    ]
  },
  
  // Related Entities
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['user', 'kyc', 'project', 'spv', 'subscription', 'distribution'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  
  // File Details
  file: {
    originalName: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    
    storageType: {
      type: String,
      enum: ['s3', 'local', 'azure', 'gcs'],
      default: 's3'
    },
    
    storagePath: String,
    storageUrl: String,
    
    // File hash for immutability verification
    fileHash: String,
    hashAlgorithm: { type: String, default: 'sha256' }
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  
  // eSign Details
  eSign: {
    required: { type: Boolean, default: false },
    signed: { type: Boolean, default: false },
    
    provider: String, // 'nsdl', 'digio', 'leegality', etc.
    providerReferenceId: String,
    
    signers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      role: String,
      
      signed: { type: Boolean, default: false },
      signedAt: Date,
      
      ipAddress: String,
      userAgent: String,
      geolocation: {
        latitude: Number,
        longitude: Number
      },
      
      signature: String, // Digital signature
      certificate: String // eSign certificate
    }],
    
    signedDocument: String, // Final signed document URL
    signedDocumentHash: String,
    
    initiatedAt: Date,
    completedAt: Date,
    expiresAt: Date
  },
  
  // Document Status
  status: {
    type: String,
    enum: [
      'draft',
      'generated',
      'pending_signature',
      'partially_signed',
      'fully_signed',
      'verified',
      'rejected',
      'expired',
      'archived'
    ],
    default: 'draft'
  },
  
  // Verification
  verification: {
    verified: { type: Boolean, default: false },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String
  },
  
  // Template Information (for generated documents)
  template: {
    isGenerated: { type: Boolean, default: false },
    templateName: String,
    templateVersion: String,
    generationData: mongoose.Schema.Types.Mixed
  },
  
  // Access Control
  accessControl: {
    isPublic: { type: Boolean, default: false },
    
    accessibleTo: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      accessLevel: {
        type: String,
        enum: ['view', 'download', 'edit'],
        default: 'view'
      },
      grantedAt: Date,
      expiresAt: Date
    }],
    
    accessibleByRoles: [{
      type: String,
      enum: ['investor', 'asset_manager', 'compliance_officer', 'legal_officer', 'admin', 'auditor']
    }]
  },
  
  // Encryption
  isEncrypted: {
    type: Boolean,
    default: false
  },
  
  encryptionKey: {
    type: String,
    select: false
  },
  
  // Retention & Compliance
  retention: {
    retentionPeriod: Number, // in years
    retentionEndDate: Date,
    canDelete: { type: Boolean, default: false },
    legalHold: { type: Boolean, default: false }
  },
  
  // Metadata
  description: String,
  tags: [String],
  category: String,
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Audit Trail
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: { type: Date, default: Date.now },
    details: String,
    ipAddress: String
  }]
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ 'file.fileHash': 1 });

// Mark previous version as not latest when new version is created
documentSchema.pre('save', async function(next) {
  if (this.previousVersion) {
    await mongoose.model('Document').findByIdAndUpdate(
      this.previousVersion,
      { isLatestVersion: false }
    );
  }
  next();
});

// Check if document is fully signed
documentSchema.methods.isFullySigned = function() {
  if (!this.eSign.required) return true;
  return this.eSign.signers.every(signer => signer.signed);
};

// Add audit log entry
documentSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    performedAt: new Date()
  });
  return this.save();
};

documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;

