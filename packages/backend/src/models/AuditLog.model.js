const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Event Information
  eventType: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'user_login', 'user_logout', 'user_signup', 'user_password_change',
      'mfa_enabled', 'mfa_disabled', 'failed_login_attempt',
      
      // User Management
      'user_created', 'user_updated', 'user_deactivated', 'user_role_changed',
      
      // KYC/AML
      'kyc_submitted', 'kyc_approved', 'kyc_rejected', 'aml_screening_completed',
      'aml_flag_raised', 'aml_flag_resolved',
      
      // Projects
      'project_created', 'project_updated', 'project_approved', 'project_listed',
      'project_status_changed',
      
      // SPV
      'spv_created', 'spv_incorporated', 'spv_status_changed',
      
      // Subscriptions
      'subscription_created', 'subscription_submitted', 'subscription_approved',
      'subscription_rejected', 'subscription_cancelled', 'payment_received',
      'shares_allocated',
      
      // Payments
      'payment_order_created', 'payment_confirmed',
      
      // Escrow
      'escrow_deposit', 'escrow_release', 'escrow_refund',
      
      // Documents
      'document_uploaded', 'document_signed', 'document_verified', 'document_downloaded',
      
      // Equity Distribution & SHA
      'equity_distributed', 'sha_generated', 'sha_esign_initiated', 'sha_signed', 'sha_esign_failed',
      
      // Cap Table
      'shares_issued', 'shares_transferred', 'captable_updated',
      
      // Distributions
      'distribution_calculated', 'distribution_approved', 'distribution_paid',
      
      // Compliance
      'compliance_check_performed', 'compliance_flag_raised', 'compliance_approval',
      
      // Asset Management
      'asset_acquired', 'asset_sold', 'valuation_updated',
      
      // System
      'system_configuration_changed', 'backup_completed', 'security_alert',
      
      // Other
      'other'
    ]
  },
  
  eventCategory: {
    type: String,
    enum: [
      'authentication', 'authorization', 'user_management', 'kyc_aml',
      'project', 'spv', 'subscription', 'payment', 'escrow',
      'document', 'compliance', 'distribution', 'asset',
      'system', 'security', 'other'
    ],
    required: true
  },
  
  // Severity Level
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  
  // User who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  performedByEmail: String,
  performedByRole: String,
  
  // Target Entity
  targetEntity: {
    entityType: {
      type: String,
      enum: ['user', 'kyc', 'project', 'spv', 'subscription', 'document', 'captable', 'distribution', 'shareholder_agreement', 'trust', 'equity_distribution', 'other']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String
  },
  
  // Action Details
  action: {
    type: String,
    required: true
  },
  
  description: String,
  
  // Before/After States (for tracking changes)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // Request Details
  request: {
    method: String, // GET, POST, PUT, DELETE
    url: String,
    endpoint: String,
    
    ipAddress: String,
    userAgent: String,
    
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed, // Sanitized (no passwords/secrets)
    query: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed
  },
  
  // Response Details
  response: {
    statusCode: Number,
    success: Boolean,
    errorMessage: String
  },
  
  // Geolocation
  geolocation: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  
  // Device Information
  device: {
    type: String, // mobile, desktop, tablet
    os: String,
    browser: String
  },
  
  // Session Information
  sessionId: String,
  
  // Compliance & Risk Indicators
  riskIndicators: [{
    type: String,
    severity: String,
    description: String
  }],
  
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  reviewNotes: String,
  
  // Additional Metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Timestamp (indexed)
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for fast querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ eventCategory: 1, timestamp: -1 });
auditLogSchema.index({ 'targetEntity.entityType': 1, 'targetEntity.entityId': 1, timestamp: -1 });
auditLogSchema.index({ 'request.ipAddress': 1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ flaggedForReview: 1 });

// TTL index for automatic deletion after retention period (e.g., 7 years)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

// Static method to log an event
auditLogSchema.statics.logEvent = async function(eventData) {
  try {
    const log = new this(eventData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

// Static method to query logs with filters
auditLogSchema.statics.queryLogs = async function(filters, options = {}) {
  const {
    userId,
    eventType,
    eventCategory,
    severity,
    startDate,
    endDate,
    entityType,
    entityId,
    limit = 100,
    skip = 0
  } = filters;
  
  const query = {};
  
  if (userId) query.performedBy = userId;
  if (eventType) query.eventType = eventType;
  if (eventCategory) query.eventCategory = eventCategory;
  if (severity) query.severity = severity;
  if (entityType) query['targetEntity.entityType'] = entityType;
  if (entityId) query['targetEntity.entityId'] = entityId;
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('performedBy', 'email firstName lastName role')
    .populate('reviewedBy', 'email firstName lastName');
};

auditLogSchema.set('toJSON', { virtuals: true });
auditLogSchema.set('toObject', { virtuals: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

