const mongoose = require('mongoose');

const capTableSchema = new mongoose.Schema({
  // SPV Reference
  spv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPV',
    required: true
  },
  
  // Investor/Shareholder
  shareholder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Share Details
  shareClass: {
    type: String,
    default: 'Equity'
  },
  
  numberOfShares: {
    type: Number,
    required: true,
    min: 0
  },
  
  faceValuePerShare: {
    type: Number,
    required: true
  },
  
  investmentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  premiumPerShare: Number,
  
  // Ownership
  ownershipPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  votingPercentage: Number,
  
  // Certificate Details
  certificateNumber: String,
  certificateIssueDate: Date,
  certificateDocument: String,
  
  // Subscription Reference
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Entry Type
  entryType: {
    type: String,
    enum: ['initial_subscription', 'transfer_in', 'transfer_out', 'bonus', 'split', 'consolidation'],
    default: 'initial_subscription'
  },
  
  // Transfer Details (if applicable)
  transferDetails: {
    transferType: {
      type: String,
      enum: ['sale', 'gift', 'inheritance', 'other']
    },
    
    transferFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    transferTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    transferDate: Date,
    transferPrice: Number,
    
    transferAgreement: String,
    transferApprovalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    stampDutyPaid: Number,
    stampDutyReceipt: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'transferred', 'redeemed', 'cancelled'],
    default: 'active'
  },
  
  // Lock-in Period
  lockinPeriod: {
    hasLockin: { type: Boolean, default: false },
    lockinEndDate: Date,
    lockinReason: String
  },
  
  // Distributions Received
  totalDistributionsReceived: {
    type: Number,
    default: 0
  },
  
  // Important Dates
  acquisitionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  disposalDate: Date,
  
  // Capital Account
  capitalAccount: {
    contributed: { type: Number, default: 0 },
    distributionsReceived: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 }
  },
  
  // Tax Information
  taxInfo: {
    costBasis: Number,
    adjustedCostBasis: Number,
    holdingPeriod: String, // 'short_term' or 'long_term'
  },
  
  // Pledged/Encumbered
  isPledged: { type: Boolean, default: false },
  pledgeDetails: {
    pledgeeTo: String,
    pledgeDate: Date,
    pledgeReleaseDate: Date,
    pledgeDocument: String
  },
  
  // Notes
  notes: String,
  
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
capTableSchema.index({ spv: 1, shareholder: 1 });
capTableSchema.index({ spv: 1, status: 1 });
capTableSchema.index({ shareholder: 1, status: 1 });
capTableSchema.index({ certificateNumber: 1 });

// Check if shares are locked
capTableSchema.methods.isLocked = function() {
  if (!this.lockinPeriod.hasLockin) return false;
  return this.lockinPeriod.lockinEndDate > new Date();
};

// Calculate current value
capTableSchema.methods.calculateCurrentValue = function(currentSharePrice) {
  return this.numberOfShares * currentSharePrice;
};

capTableSchema.set('toJSON', { virtuals: true });
capTableSchema.set('toObject', { virtuals: true });

const CapTable = mongoose.model('CapTable', capTableSchema);

module.exports = CapTable;

