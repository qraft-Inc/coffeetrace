import mongoose from 'mongoose';

/**
 * AuditTrail Schema
 * Maintains a complete audit log of all actions in the system
 */
const AuditTrailSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Farmer', 'Buyer', 'Lot', 'Listing', 'Offer', 'Transaction', 'Cooperative'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created', 'updated', 'deleted',
      'status_changed', 'offer_made', 'offer_accepted', 'offer_rejected',
      'payment_initiated', 'payment_completed', 'payment_failed',
      'listing_created', 'listing_expired', 'listing_cancelled',
      'trace_event_added', 'login', 'logout',
      'verification_requested', 'verification_completed',
      'other'
    ],
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // IP and location data
  ipAddress: String,
  userAgent: String,
  // Changes made
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
  },
  // Additional context
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  description: String,
}, {
  timestamps: true,
});

// Indexes for efficient querying
AuditTrailSchema.index({ entityType: 1, entityId: 1 });
AuditTrailSchema.index({ actorId: 1 });
AuditTrailSchema.index({ timestamp: -1 });
AuditTrailSchema.index({ action: 1 });

// TTL index to auto-delete old audit logs after 2 years (optional)
AuditTrailSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

/**
 * Helper method to create audit log entry
 */
AuditTrailSchema.statics.log = async function(data) {
  try {
    const entry = new this(data);
    await entry.save();
    return entry;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

export default mongoose.models.AuditTrail || mongoose.model('AuditTrail', AuditTrailSchema);
