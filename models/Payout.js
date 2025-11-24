import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Payout Schema
 * Records disbursements to farmers via mobile money
 */
const PayoutSchema = new mongoose.Schema({
  payoutId: {
    type: String,
    unique: true,
    default: () => `PAYOUT-${uuidv4()}`,
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'UGX',
    enum: ['UGX', 'USD', 'EUR', 'KES', 'RWF'],
  },
  // Payout destination
  destination: {
    type: {
      type: String,
      enum: ['mobile_money', 'bank_account'],
      default: 'mobile_money',
    },
    msisdn: String, // Mobile number for mobile money
    bank_account: String,
    bank_code: String,
    account_name: String,
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  failure_reason: String,
  retry_count: {
    type: Number,
    default: 0,
  },
  max_retries: {
    type: Number,
    default: 3,
  },
  // PSP details
  psp_reference: String,
  psp_provider: {
    type: String,
    default: 'Onafriq',
  },
  psp_status: String,
  psp_response: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  // Timestamps
  initiated_at: {
    type: Date,
    default: Date.now,
  },
  executed_at: Date,
  completed_at: Date,
  next_retry_at: Date,
  // Batch information
  batch_id: String,
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
PayoutSchema.index({ farmerId: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, next_retry_at: 1 });
PayoutSchema.index({ batch_id: 1 });
PayoutSchema.index({ psp_reference: 1 }); // Simple index for lookups

// Method to check if payout can be retried
PayoutSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retry_count < this.max_retries;
};

// Method to increment retry
PayoutSchema.methods.incrementRetry = function() {
  this.retry_count += 1;
  // Exponential backoff: 1hr, 3hrs, 9hrs
  const hoursDelay = Math.pow(3, this.retry_count - 1);
  this.next_retry_at = new Date(Date.now() + hoursDelay * 60 * 60 * 1000);
  this.status = 'pending';
};

// Static method to get pending payouts for retry
PayoutSchema.statics.getPendingRetries = async function() {
  return this.find({
    status: 'pending',
    retry_count: { $gt: 0, $lt: 3 },
    next_retry_at: { $lte: new Date() },
  });
};

// Static method to get farmer payout history
PayoutSchema.statics.getFarmerPayouts = async function(farmerId, limit = 10) {
  return this.find({ farmerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema);
