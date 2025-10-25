const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // For Individuals
  individualKYC: {
    // Aadhaar
    aadhaarNumber: { type: String, select: false }, // Encrypted
    aadhaarVerified: { type: Boolean, default: false },
    aadhaarVerificationDate: Date,
    aadhaarDocument: String,
    
    // PAN
    panNumber: { type: String, select: false }, // Encrypted
    panVerified: { type: Boolean, default: false },
    panVerificationDate: Date,
    panDocument: String,
    panName: String,
    
    // Address Proof
    addressProofType: {
      type: String,
      enum: ['aadhaar', 'passport', 'driving_license', 'voter_id', 'utility_bill', 'bank_statement']
    },
    addressProofDocument: String,
    addressProofVerified: { type: Boolean, default: false },
    
    // Selfie & Liveness
    selfieDocument: String,
    livenessCheckPassed: { type: Boolean, default: false },
    livenessCheckDate: Date,
    
    // Additional Documents
    passportNumber: String,
    passportDocument: String,
    drivingLicenseNumber: String,
    drivingLicenseDocument: String
  },
  
  // For Entities
  entityKYC: {
    // Incorporation Documents
    incorporationCertificate: String,
    incorporationCertificateVerified: { type: Boolean, default: false },
    
    moa: String, // Memorandum of Association
    aoa: String, // Articles of Association
    
    // Registration Numbers
    cin: String,
    gstin: String,
    pan: { type: String, select: false }, // Encrypted
    panDocument: String,
    panVerified: { type: Boolean, default: false },
    
    // Directors KYC
    directors: [{
      name: String,
      din: String, // Director Identification Number
      panNumber: { type: String, select: false },
      panDocument: String,
      aadhaarNumber: { type: String, select: false },
      aadhaarDocument: String,
      addressProofDocument: String,
      appointmentLetter: String,
      kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      }
    }],
    
    // Beneficial Owners (>25% ownership)
    beneficialOwners: [{
      name: String,
      ownershipPercentage: Number,
      panNumber: { type: String, select: false },
      panDocument: String,
      aadhaarNumber: { type: String, select: false },
      aadhaarDocument: String,
      addressProofDocument: String,
      kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      }
    }],
    
    // Board Resolution
    boardResolution: String,
    boardResolutionDate: Date,
    authorizedSignatory: {
      name: String,
      designation: String,
      panNumber: String,
      panDocument: String,
      authorizationLetter: String
    },
    
    // Business Proof
    businessProof: String,
    bankStatement: String,
    gstCertificate: String
  },
  
  // Source of Funds
  sourceOfFunds: {
    primarySource: {
      type: String,
      enum: ['salary', 'business_income', 'investment_returns', 'inheritance', 'loan', 'gift', 'other']
    },
    description: String,
    documents: [String], // Bank statements, salary slips, etc.
    verified: { type: Boolean, default: false }
  },
  
  // AML/Sanctions Screening
  amlScreening: {
    screenedAt: Date,
    screeningProvider: String,
    screeningReference: String,
    
    sanctionsMatch: { type: Boolean, default: false },
    sanctionsList: [String],
    
    pepMatch: { type: Boolean, default: false },
    pepDetails: String,
    
    adverseMediaMatch: { type: Boolean, default: false },
    adverseMediaDetails: String,
    
    riskScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  
  // Video KYC
  videoKYC: {
    completed: { type: Boolean, default: false },
    completedAt: Date,
    videoRecording: String,
    agentId: String,
    agentName: String,
    verificationNotes: String
  },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'expired'],
    default: 'pending'
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiryDate: Date,
  
  // Rejection Details
  rejectionReason: String,
  rejectionDetails: String,
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Re-verification
  reVerificationRequired: { type: Boolean, default: false },
  reVerificationReason: String,
  reVerificationRequestedAt: Date,
  
  // Compliance Notes
  complianceNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // FEMA/FDI for Foreign Investors
  femaCompliance: {
    required: { type: Boolean, default: false },
    nationality: String,
    countryOfResidence: String,
    taxIdentificationNumber: String,
    femaApprovalDocument: String,
    fdiSectorApprovalDocument: String,
    approvalDate: Date,
    approvalAuthority: String
  },
  
  // Metadata
  submittedAt: Date,
  lastUpdatedAt: Date,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
kycSchema.index({ user: 1 });
kycSchema.index({ verificationStatus: 1 });
kycSchema.index({ 'amlScreening.riskLevel': 1 });

// Virtual for overall KYC completion percentage
kycSchema.virtual('completionPercentage').get(function() {
  // Calculate based on required fields filled
  // This is a simplified calculation
  return 0; // Implement logic based on your requirements
});

kycSchema.set('toJSON', { virtuals: true });
kycSchema.set('toObject', { virtuals: true });

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;

