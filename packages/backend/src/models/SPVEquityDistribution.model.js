const mongoose = require('mongoose');

const spvEquityDistributionSchema = new mongoose.Schema({
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
  
  // Investor/Shareholder
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Investment Details
  investmentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Equity Calculation
  equityPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Share Details
  numberOfShares: {
    type: Number,
    required: true,
    min: 0
  },
  
  faceValuePerShare: {
    type: Number,
    default: 10 // Default face value
  },
  
  premiumPerShare: Number,
  
  // Total Investment Pool (for reference)
  totalInvestmentPool: {
    type: Number,
    required: true
  },
  
  // Distribution Metadata
  distributionDate: {
    type: Date,
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['distributed', 'shares_allocated', 'agreement_signed', 'completed'],
    default: 'distributed'
  },
  
  // Payment References
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  
  // Subscription Reference (if applicable)
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  // Notes
  notes: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
spvEquityDistributionSchema.index({ spv: 1, investor: 1 });
spvEquityDistributionSchema.index({ project: 1, investor: 1 });
spvEquityDistributionSchema.index({ investor: 1, status: 1 });

// Virtual for total share value
spvEquityDistributionSchema.virtual('totalShareValue').get(function() {
  return (this.faceValuePerShare + (this.premiumPerShare || 0)) * this.numberOfShares;
});

spvEquityDistributionSchema.set('toJSON', { virtuals: true });
spvEquityDistributionSchema.set('toObject', { virtuals: true });

const SPVEquityDistribution = mongoose.model('SPVEquityDistribution', spvEquityDistributionSchema);

module.exports = SPVEquityDistribution;

