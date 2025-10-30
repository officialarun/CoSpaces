const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  // SPV Reference
  spv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPV',
    required: true
  },
  
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Distribution Identification
  distributionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Distribution Type
  distributionType: {
    type: String,
    enum: [
      'final_sale_proceeds',
      'interim_dividend',
      'rental_income',
      'return_of_capital',
      'liquidation',
      'other'
    ],
    required: true
  },
  
  // Financial Details
  grossProceeds: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Deductions
  deductions: {
    acquisitionCosts: { type: Number, default: 0 },
    maintenanceCosts: { type: Number, default: 0 },
    sellingCosts: { type: Number, default: 0 },
    legalCosts: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    registrationFees: { type: Number, default: 0 },
    otherCosts: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 }
  },
  
  // Platform Fees
  platformFees: {
    acquisitionFee: { type: Number, default: 0 },
    maintenanceFee: { type: Number, default: 0 },
    carriedInterest: { type: Number, default: 0 },
    totalPlatformFees: { type: Number, default: 0 }
  },
  
  // Tax Withholding (TDS)
  taxWithholding: {
    tdsRate: { type: Number, default: 0 },
    tdsAmount: { type: Number, default: 0 },
    tdsDeductionDate: Date,
    challanNumber: String,
    challanDocument: String
  },
  
  // Net Distributable Amount
  netDistributableAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Per Share Distribution
  distributionPerShare: Number,
  
  // Status
  status: {
    type: String,
    enum: [
      'draft',
      'calculated',
      'under_review',
      'approved',
      'processing',
      'completed',
      'failed',
      'cancelled'
    ],
    default: 'draft'
  },
  
  // Approval Workflow
  approvals: {
    assetManagerApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      comments: String
    },
    
    complianceApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      comments: String
    },
    
    adminApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      comments: String
    }
  },
  
  // Individual Investor Distributions
  investorDistributions: [{
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    numberOfShares: {
      type: Number,
      required: true
    },
    
    ownershipPercentage: Number,
    
    grossAmount: {
      type: Number,
      required: true
    },
    
    tdsAmount: {
      type: Number,
      default: 0
    },
    
    netAmount: {
      type: Number,
      required: true
    },
    
    // Payment Details
    paymentStatus: {
      type: String,
      enum: ['pending', 'initiated', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    
    paymentMethod: {
      type: String,
      enum: ['neft', 'rtgs', 'imps', 'upi']
    },
    
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String
    },
    
    transactionId: String,
    utr: String,
    paymentDate: Date,
    paymentFailureReason: String,
    
    // Tax Certificate
    form16Document: String,
    form16IssueDate: Date,
    
    // Confirmation
    confirmationSent: { type: Boolean, default: false },
    confirmationSentAt: Date,
    
    capitalAccountUpdated: { type: Boolean, default: false }
  }],
  
  // Batch Payment Details
  batchPayment: {
    batchId: String,
    batchFile: String,
    uploadedToBankAt: Date,
    totalTransactions: Number,
    successfulTransactions: Number,
    failedTransactions: Number
  },
  
  // Schedule
  recordDate: Date, // Date to determine eligible shareholders
  paymentDate: Date, // Scheduled payment date
  actualPaymentDate: Date,
  
  // Documents
  documents: {
    distributionSchedule: String,
    boardResolution: String,
    taxCertificates: [String],
    bankConfirmation: String,
    investorStatement: String
  },
  
  // Notes
  notes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  calculatedAt: Date,
  calculatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: Date,
  
  completedAt: Date,
  
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
distributionSchema.index({ spv: 1, createdAt: -1 });
// Note: distributionNumber has unique: true in field definition
distributionSchema.index({ status: 1 });
distributionSchema.index({ 'investorDistributions.investor': 1 });
distributionSchema.index({ paymentDate: 1 });

// Calculate net distributable amount
distributionSchema.methods.calculateNetAmount = function() {
  const totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + (val || 0), 0);
  const totalPlatformFees = Object.values(this.platformFees).reduce((sum, val) => sum + (val || 0), 0);
  
  this.deductions.totalDeductions = totalDeductions;
  this.platformFees.totalPlatformFees = totalPlatformFees;
  
  this.netDistributableAmount = this.grossProceeds - totalDeductions - totalPlatformFees - (this.taxWithholding.tdsAmount || 0);
  
  return this.netDistributableAmount;
};

// Check if all approvals are granted
distributionSchema.methods.areAllApprovalsGranted = function() {
  return (
    this.approvals.assetManagerApproval.approved &&
    this.approvals.complianceApproval.approved &&
    this.approvals.adminApproval.approved
  );
};

// Get distribution statistics
distributionSchema.methods.getStats = function() {
  const total = this.investorDistributions.length;
  const completed = this.investorDistributions.filter(d => d.paymentStatus === 'completed').length;
  const pending = this.investorDistributions.filter(d => d.paymentStatus === 'pending').length;
  const failed = this.investorDistributions.filter(d => d.paymentStatus === 'failed').length;
  
  return { total, completed, pending, failed };
};

distributionSchema.set('toJSON', { virtuals: true });
distributionSchema.set('toObject', { virtuals: true });

const Distribution = mongoose.model('Distribution', distributionSchema);

module.exports = Distribution;

