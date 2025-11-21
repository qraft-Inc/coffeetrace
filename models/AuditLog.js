import mongoose from 'mongoose';

/**
 * Audit Log Schema
 * Immutable record of all system actions for compliance and traceability
 */
const AuditLogSchema = new mongoose.Schema({
  // Who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String, // Snapshot in case user is deleted
  userRole: String,
  // What action was performed
  action: {
    type: String,
    required: true,
    enum: [
      // Farmer actions
      'farmer_registered',
      'farmer_profile_updated',
      'kyc_submitted',
      'kyc_verified',
      'kyc_rejected',
      'farm_mapped',
      // Lot actions
      'lot_created',
      'lot_updated',
      'lot_status_changed',
      'quality_assessed',
      'qr_generated',
      // Processing actions
      'wet_mill_started',
      'wet_mill_completed',
      'fermentation_logged',
      'drying_started',
      'drying_completed',
      'dry_mill_started',
      'dry_mill_completed',
      // Inventory actions
      'inventory_stock_in',
      'inventory_stock_out',
      'lot_merged',
      'lot_split',
      'warehouse_transfer',
      // Export actions
      'export_batch_created',
      'export_documents_uploaded',
      'container_loaded',
      'shipment_departed',
      'shipment_arrived',
      // Compliance actions
      'eudr_assessment_created',
      'eudr_verification_completed',
      'deforestation_risk_flagged',
      'compliance_status_changed',
      // Financial actions
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'wallet_credited',
      'wallet_debited',
      // Marketplace actions
      'product_listed',
      'order_placed',
      'order_fulfilled',
      'order_cancelled',
      // Training actions
      'training_started',
      'training_completed',
      'quiz_attempted',
      'certificate_issued',
      // Document actions
      'document_uploaded',
      'document_verified',
      'document_rejected',
      'document_deleted',
      // System actions
      'user_login',
      'user_logout',
      'password_changed',
      'role_changed',
      'permissions_modified',
      'system_config_changed',
      // Other
      'other',
    ],
  },
  actionCategory: {
    type: String,
    enum: ['farmer', 'lot', 'processing', 'inventory', 'export', 'compliance', 'financial', 'marketplace', 'training', 'document', 'system', 'other'],
  },
  // What was affected
  resourceType: {
    type: String,
    enum: ['Farmer', 'Lot', 'User', 'Payment', 'Order', 'Product', 'Document', 'EUDRCompliance', 'WetMillProcessing', 'DryMillProcessing', 'DryingRecord', 'InventoryMovement', 'ExportBatch', 'QualityAssessment', 'TrainingProgress', 'other'],
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  resourceIdentifier: String, // Human-readable (lot number, farmer name, etc.)
  // Before and after state (for updates)
  changes: {
    before: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    after: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  // Request metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    sessionId: String,
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    device: {
      type: {
        type: String,
        enum: ['web', 'mobile_android', 'mobile_ios', 'api', 'system'],
      },
      model: String,
      os: String,
    },
  },
  // Compliance flags
  compliance: {
    eudrRelevant: Boolean,
    financialTransaction: Boolean,
    dataModification: Boolean,
    securityEvent: Boolean,
  },
  // Result
  result: {
    type: String,
    enum: ['success', 'failure', 'partial', 'pending'],
    default: 'success',
  },
  errorMessage: String,
  // Additional context
  description: String,
  tags: [String],
  // Timestamp (immutable)
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true,
    required: true,
  },
}, {
  timestamps: false, // We use timestamp field instead
  strict: true,
});

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ actionCategory: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ 'compliance.eudrRelevant': 1, timestamp: -1 });
AuditLogSchema.index({ 'compliance.financialTransaction': 1, timestamp: -1 });
AuditLogSchema.index({ result: 1, timestamp: -1 });

// Prevent modifications and deletions
AuditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Audit logs cannot be modified'));
  }
  next();
});

AuditLogSchema.pre('remove', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

AuditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Audit logs cannot be updated'));
});

AuditLogSchema.pre('findOneAndDelete', function(next) {
  next(new Error('Audit logs cannot be deleted'));
});

// Helper method to create audit log
AuditLogSchema.statics.log = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging should never break the main flow
    return null;
  }
};

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
