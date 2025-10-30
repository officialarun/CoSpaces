const mongoose = require('mongoose');

const spvSchema = new mongoose.Schema({
  // Basic Information
  spvName: {
    type: String,
    required: [true, 'SPV name is required'],
    unique: true,
    trim: true
  },
  spvCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Entity Details
  entityType: {
    type: String,
    enum: ['private_limited', 'llp', 'trust', 'aif', 'other'],
    required: [true, 'Entity type is required'],
    default: 'private_limited'
  },
  
  // Registration Details
  registrationDetails: {
    cin: String, // Corporate Identification Number
    llpin: String, // LLP Identification Number
    pan: String,
    tan: String,
    gstin: String,
    
    registrationDate: Date,
    registrationState: String,
    rocJurisdiction: String, // Registrar of Companies
    
    registeredOfficeAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  
  // Incorporation Documents
  incorporationDocs: {
    moaDocument: String, // Memorandum of Association
    aoaDocument: String, // Articles of Association
    incorporationCertificate: String,
    panCard: String,
    bankAccountProof: String,
    boardResolution: String
  },
  
  // Bank Account
  bankAccount: {
    accountName: String,
    accountNumber: { type: String, select: false }, // Encrypted
    ifscCode: String,
    bankName: String,
    branchName: String,
    accountType: { type: String, enum: ['current', 'escrow'], default: 'current' },
    openedDate: Date,
    accountProof: String
  },
  
  // Escrow Account
  escrowAccount: {
    accountNumber: { type: String, select: false }, // Encrypted
    ifscCode: String,
    bankName: String,
    custodianName: String,
    escrowAgreement: String,
    openedDate: Date
  },
  
  // Share Structure
  shareStructure: {
    authorizedCapital: {
      type: Number,
      required: true
    },
    
    paidUpCapital: {
      type: Number,
      default: 0
    },
    
    faceValuePerShare: {
      type: Number,
      default: 10
    },
    
    shareClasses: [{
      className: { type: String, default: 'Equity' },
      type: { type: String, enum: ['equity', 'preference'], default: 'equity' },
      votingRights: { type: Boolean, default: true },
      dividendRights: { type: Boolean, default: true },
      redemption: {
        redeemable: { type: Boolean, default: false },
        redemptionDate: Date
      },
      totalShares: Number,
      issuedShares: { type: Number, default: 0 },
      faceValue: Number
    }]
  },
  
  // Directors / Designated Partners
  directors: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    din: String, // Director Identification Number
    dpin: String, // Designated Partner Identification Number
    name: String,
    designation: { type: String, enum: ['director', 'designated_partner', 'managing_partner'] },
    appointmentDate: Date,
    resignationDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  
  // Authorized Signatories
  authorizedSignatories: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    designation: String,
    authorizationDocument: String,
    authorizationDate: Date,
    isActive: { type: Boolean, default: true }
  }],
  
  // Related Project (one-to-one)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  },
  
  // Fundraising Details
  fundraising: {
    targetAmount: {
      type: Number,
      required: true
    },
    
    minimumRaiseAmount: Number,
    
    raisedAmount: {
      type: Number,
      default: 0
    },
    
    committedAmount: {
      type: Number,
      default: 0
    },
    
    minimumInvestment: {
      type: Number,
      required: true
    },
    
    maximumInvestment: Number,
    
    investorCount: {
      type: Number,
      default: 0
    },
    
    maxInvestors: {
      type: Number,
      default: parseInt(process.env.MAX_INVESTORS_PER_SPV) || 200
    },
    
    fundraisingStartDate: Date,
    fundraisingEndDate: Date,
    
    isOversubscribed: { type: Boolean, default: false }
  },
  
  // Private Placement Compliance
  privatePlacement: {
    isPPMPublished: { type: Boolean, default: false },
    ppmDocument: String,
    ppmPublishedDate: Date,
    
    subscriptionAgreementTemplate: String,
    shareholderAgreementTemplate: String,
    
    offerLettersSent: { type: Number, default: 0 },
    
    // Six-month rule tracking
    publicOfferingRestrictionDate: Date, // Date until which cannot convert to public offering
    
    restrictedToTargetInvestors: { type: Boolean, default: true },
    targetInvestorList: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // SPV Lifecycle Status
  status: {
    type: String,
    enum: [
      'formation',
      'incorporation_pending',
      'incorporated',
      'fundraising_open',
      'fundraising_closed',
      'funds_in_escrow',
      'acquiring_asset',
      'asset_acquired',
      'operational',
      'exit_process',
      'liquidation',
      'closed'
    ],
    default: 'formation'
  },
  
  // Asset Holding
  assetHolding: {
    acquisitionDate: Date,
    acquisitionCost: Number,
    registrationCost: Number,
    stampDuty: Number,
    otherCosts: Number,
    totalAcquisitionCost: Number,
    
    currentValuation: Number,
    lastValuationDate: Date,
    
    titleDeedDocument: String,
    registeredOwner: String
  },
  
  // Exit Details
  exitDetails: {
    exitStrategy: String,
    listedForSaleDate: Date,
    saleAgreementDate: Date,
    expectedSaleDate: Date,
    actualSaleDate: Date,
    
    salePrice: Number,
    sellingCosts: Number,
    netProceeds: Number,
    
    buyerDetails: {
      name: String,
      type: String,
      panNumber: String
    },
    
    saleDeedDocument: String
  },
  
  // Platform Fees Collected
  feesCollected: {
    acquisitionFee: { type: Number, default: 0 },
    maintenanceFees: { type: Number, default: 0 },
    carriedInterest: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 }
  },
  
  // Compliance Flags
  compliance: {
    maxInvestorsBreached: { type: Boolean, default: false },
    privatePlacementViolation: { type: Boolean, default: false },
    reraComplianceRequired: { type: Boolean, default: false },
    reraCompliant: { type: Boolean, default: false },
    femaApprovalRequired: { type: Boolean, default: false },
    femaApprovalObtained: { type: Boolean, default: false }
  },
  
  // Trustee / Custodian
  trustee: {
    appointed: { type: Boolean, default: false },
    name: String,
    registrationNumber: String,
    appointmentDate: Date,
    agreementDocument: String
  },
  
  // Auditor
  auditor: {
    appointed: { type: Boolean, default: false },
    firmName: String,
    auditorName: String,
    membershipNumber: String,
    appointmentDate: Date
  },
  
  // Important Dates
  importantDates: {
    formationDate: Date,
    incorporationDate: Date,
    firstSubscriptionDate: Date,
    closingDate: Date,
    assetAcquisitionDate: Date,
    firstDistributionDate: Date,
    liquidationDate: Date
  },
  
  // Legal Documents
  legalDocuments: [{
    documentType: String,
    documentName: String,
    documentUrl: String,
    version: { type: Number, default: 1 },
    uploadedAt: Date,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Notes & Comments
  notes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: true }
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
// Note: spvCode has unique: true in field definition
spvSchema.index({ status: 1 });
spvSchema.index({ project: 1 });
spvSchema.index({ 'registrationDetails.cin': 1 });

// Virtual for fundraising percentage
spvSchema.virtual('fundraisingPercentage').get(function() {
  if (this.fundraising.targetAmount === 0) return 0;
  return (this.fundraising.raisedAmount / this.fundraising.targetAmount) * 100;
});

// Check if SPV can accept more investors
spvSchema.methods.canAcceptMoreInvestors = function() {
  return this.fundraising.investorCount < this.fundraising.maxInvestors;
};

// Check if minimum raise achieved
spvSchema.methods.isMinimumRaiseAchieved = function() {
  if (!this.fundraising.minimumRaiseAmount) return true;
  return this.fundraising.raisedAmount >= this.fundraising.minimumRaiseAmount;
};

spvSchema.set('toJSON', { virtuals: true });
spvSchema.set('toObject', { virtuals: true });

const SPV = mongoose.model('SPV', spvSchema);

module.exports = SPV;

