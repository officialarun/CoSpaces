const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Investor & SPV
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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
  
  // Subscription Details
  subscriptionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Amount Details
  committedAmount: {
    type: Number,
    required: [true, 'Committed amount is required'],
    min: [0, 'Committed amount must be positive']
  },
  
  paidAmount: {
    type: Number,
    default: 0
  },
  
  numberOfShares: Number,
  pricePerShare: Number,
  shareClass: { type: String, default: 'Equity' },
  
  // Status
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'approved',
      'payment_pending',
      'payment_initiated',
      'payment_processing',
      'payment_confirmed',
      'shares_allocated',
      'completed',
      'rejected',
      'cancelled',
      'refunded'
    ],
    default: 'draft'
  },
  
  // Payment Details
  payment: {
    method: {
      type: String,
      enum: ['neft', 'rtgs', 'imps', 'upi', 'net_banking', 'payment_link', 'wire_transfer']
    },
    
    transactionId: String,
    utr: String, // Unique Transaction Reference
    
    payerName: String,
    payerAccountNumber: String,
    payerIfscCode: String,
    payerBankName: String,
    
    paymentDate: Date,
    paymentConfirmedDate: Date,
    
    escrowAccountNumber: String,
    escrowTransactionId: String,
    escrowDepositDate: Date,
    
    proofDocument: String, // Upload of payment receipt
    
    reconciliationStatus: {
      type: String,
      enum: ['pending', 'matched', 'mismatched', 'manual_review'],
      default: 'pending'
    },
    
    reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reconciledAt: Date
  },
  
  // Legal Documents
  documents: {
    ppmAccepted: { type: Boolean, default: false },
    ppmDocument: String,
    ppmAcceptedAt: Date,
    ppmVersion: String,
    
    subscriptionAgreement: String,
    subscriptionAgreementSigned: { type: Boolean, default: false },
    subscriptionAgreementSignedAt: Date,
    subscriptionAgreementSignature: String,
    
    shareholderAgreement: String,
    shareholderAgreementSigned: { type: Boolean, default: false },
    shareholderAgreementSignedAt: Date,
    
    riskDisclosure: String,
    riskDisclosureAccepted: { type: Boolean, default: false },
    riskDisclosureAcceptedAt: Date,
    
    investorQuestionnaire: String,
    investorQuestionnaireCompleted: { type: Boolean, default: false },
    
    shareCertificate: String,
    shareCertificateIssued: { type: Boolean, default: false },
    shareCertificateIssuedAt: Date,
    shareCertificateNumber: String
  },
  
  // Investor Verification
  investorVerification: {
    kycVerified: { type: Boolean, default: false },
    amlCleared: { type: Boolean, default: false },
    accreditationVerified: { type: Boolean, default: false },
    
    femaApprovalRequired: { type: Boolean, default: false },
    femaApprovalObtained: { type: Boolean, default: false },
    femaApprovalDocument: String
  },
  
  // Compliance Checks
  complianceChecks: {
    investorLimitCheck: { type: Boolean, default: false },
    minimumInvestmentCheck: { type: Boolean, default: false },
    maximumInvestmentCheck: { type: Boolean, default: false },
    privatePlacementEligibility: { type: Boolean, default: false },
    
    checksCompletedAt: Date,
    checksCompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Approval Workflow
  approvals: {
    complianceApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      comments: String
    },
    
    operationsApproval: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      comments: String
    }
  },
  
  // Rejection Details
  rejection: {
    rejectedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    details: String
  },
  
  // Cancellation Details
  cancellation: {
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'initiated', 'completed'],
      default: 'not_applicable'
    },
    refundAmount: Number,
    refundDate: Date,
    refundTransactionId: String
  },
  
  // Important Dates
  submittedAt: Date,
  approvedAt: Date,
  paymentCompletedAt: Date,
  sharesAllocatedAt: Date,
  
  // eSign Metadata
  eSignMetadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: Date,
    esignProvider: String,
    esignReferenceId: String
  },
  
  // Notes
  notes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: true }
  }],
  
  // Source tracking
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin'],
    default: 'web'
  },
  
  referralCode: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes
subscriptionSchema.index({ investor: 1, spv: 1 });
subscriptionSchema.index({ spv: 1, status: 1 });
subscriptionSchema.index({ subscriptionNumber: 1 });
subscriptionSchema.index({ 'payment.transactionId': 1 });
subscriptionSchema.index({ 'payment.utr': 1 });
subscriptionSchema.index({ createdAt: -1 });

// Check if subscription is fully signed
subscriptionSchema.methods.isFullySigned = function() {
  return (
    this.documents.ppmAccepted &&
    this.documents.subscriptionAgreementSigned &&
    this.documents.riskDisclosureAccepted
  );
};

// Check if all approvals are granted
subscriptionSchema.methods.areAllApprovalsGranted = function() {
  return (
    this.approvals.complianceApproval.approved &&
    this.approvals.operationsApproval.approved
  );
};

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

