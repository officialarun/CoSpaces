const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Information
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  projectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  shortDescription: String,
  
  // Land Details
  landDetails: {
    location: {
      address: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    totalArea: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['sqft', 'sqmt', 'acres', 'hectares'], default: 'sqft' }
    },
    
    landType: {
      type: String,
      enum: ['agricultural', 'residential', 'commercial', 'industrial', 'mixed_use'],
      required: true
    },
    
    zoning: String,
    
    // Title & Legal
    surveyNumber: String,
    plotNumber: String,
    titleDeedNumber: String,
    registrationDetails: {
      registrationNumber: String,
      registrationDate: Date,
      subRegistrarOffice: String
    }
  },
  
  // Financial Details
  financials: {
    landValue: {
      type: Number,
      required: [true, 'Land value is required']
    },
    
    acquisitionCost: Number, // Including stamp duty, registration, etc.
    
    targetRaise: {
      type: Number,
      required: [true, 'Target raise amount is required']
    },
    
    minimumInvestment: {
      type: Number,
      required: [true, 'Minimum investment amount is required'],
      default: 100000
    },
    
    maximumInvestment: Number,
    
    expectedIRR: {
      low: Number,
      high: Number,
      target: Number
    },
    
    holdingPeriod: {
      type: Number, // in months
      required: true
    },
    
    exitStrategy: {
      type: String,
      enum: ['resale', 'development', 'rental', 'lease', 'mixed'],
      required: true
    },
    
    projectedExitValue: Number
  },
  
  // Platform Fees
  fees: {
    acquisitionFee: {
      type: Number,
      default: parseInt(process.env.PLATFORM_ACQUISITION_FEE) || 200 // basis points
    },
    maintenanceFeeAnnual: {
      type: Number,
      default: parseInt(process.env.PLATFORM_MAINTENANCE_FEE) || 100 // basis points
    },
    carriedInterest: {
      type: Number,
      default: parseInt(process.env.PLATFORM_CARRIED_INTEREST) || 2000 // basis points (20%)
    }
  },
  
  // Due Diligence Documents
  dueDiligence: {
    titleChain: [{
      document: String,
      uploadedAt: Date,
      verified: { type: Boolean, default: false }
    }],
    
    encumbranceCertificate: {
      document: String,
      issueDate: Date,
      verified: { type: Boolean, default: false }
    },
    
    surveyDocuments: [{
      document: String,
      surveyDate: Date,
      verified: { type: Boolean, default: false }
    }],
    
    valuationReport: {
      document: String,
      valuationDate: Date,
      valuedBy: String,
      valuedAmount: Number,
      verified: { type: Boolean, default: false }
    },
    
    nocs: [{ // No Objection Certificates
      type: String,
      authority: String,
      document: String,
      issueDate: Date,
      verified: { type: Boolean, default: false }
    }],
    
    soilTestReport: String,
    environmentalClearance: String,
    
    legalOpinion: {
      document: String,
      lawyerName: String,
      lawFirm: String,
      opinionDate: Date
    }
  },
  
  // RERA Compliance
  reraCompliance: {
    applicable: { type: Boolean, required: true },
    determinationDate: Date,
    determinationReason: String,
    
    reraRegistrationNumber: String,
    reraRegistrationDate: Date,
    reraRegistrationDocument: String,
    reraState: String,
    
    reraProjectType: {
      type: String,
      enum: ['residential', 'commercial', 'plotted_development', 'not_applicable']
    }
  },
  
  // Due Diligence Checklist
  checklist: [{
    item: String,
    category: {
      type: String,
      enum: ['legal', 'technical', 'financial', 'environmental', 'regulatory']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'not_applicable'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    notes: String,
    documents: [String]
  }],
  
  // Project Status & Lifecycle
  status: {
    type: String,
    enum: [
      'draft',
      'due_diligence',
      'legal_review',
      'compliance_review',
      'approved',
      'listed',
      'fundraising',
      'funded',
      'under_acquisition',
      'acquired',
      'held',
      'listed_for_sale',
      'under_sale',
      'sold',
      'closed'
    ],
    default: 'draft'
  },
  
  // Approvals
  approvals: {
    legalApproval: {
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
    
    assetManagerApproval: {
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
  
  // Timeline
  timeline: {
    draftCreatedAt: Date,
    listedAt: Date,
    fundraisingStartDate: Date,
    fundraisingEndDate: Date,
    expectedAcquisitionDate: Date,
    actualAcquisitionDate: Date,
    expectedExitDate: Date,
    actualExitDate: Date
  },
  
  // Images & Media
  media: {
    coverImage: String,
    images: [String],
    videos: [String],
    documents: [String],
    virtualTour: String
  },
  
  // Risk Factors
  riskFactors: [{
    category: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] }
  }],
  
  // Tags & Categories
  tags: [String],
  category: String,
  
  // Team
  assetManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  team: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String
  }],
  
  // Related SPV (one-to-one relationship)
  spv: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SPV'
  },
  
  // Visibility
  isPublic: { type: Boolean, default: false },
  visibleTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
// Note: projectCode has unique: true in field definition
projectSchema.index({ status: 1 });
projectSchema.index({ 'landDetails.location.city': 1 });
projectSchema.index({ 'landDetails.location.state': 1 });
projectSchema.index({ assetManager: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for fundraising progress
projectSchema.virtual('fundraisingProgress').get(function() {
  // This will be calculated from subscriptions
  return 0;
});

// Check if all approvals are granted
projectSchema.methods.areAllApprovalsGranted = function() {
  return (
    this.approvals.legalApproval.approved &&
    this.approvals.complianceApproval.approved &&
    this.approvals.assetManagerApproval.approved &&
    this.approvals.adminApproval.approved
  );
};

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

