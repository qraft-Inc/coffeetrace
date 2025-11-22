import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tip Schema
 * Records tips from buyers to farmers with platform fee calculations
 */
const TipSchema = new mongoose.Schema({
  tipId: {
    type: String,
    unique: true,
    default: () => `TIP-${uuidv4()}`,
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
    index: true,
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    index: true,
  },
  // Financial details
  gross_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  platform_fee: {
    type: Number,
    required: true,
    default: function() {
      return this.gross_amount * 0.03; // 3% platform fee
    },
  },
  net_amount: {
    type: Number,
    required: true,
    default: function() {
      return this.gross_amount - this.platform_fee;
    },
  },
  currency: {
    type: String,
    default: 'UGX',
    enum: ['UGX', 'USD', 'EUR', 'KES', 'RWF'],
  },
  // Buyer information
  buyer_metadata: {
    name: String,
    email: String,
    phone: String,
    message: String,
    country: String,
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  // PSP (Payment Service Provider) details
  psp_reference: {
    type: String,
    unique: true,
    sparse: true,
  },
  psp_provider: {
    type: String,
    default: 'Onafriq',
  },
  checkout_url: String,
  checkout_session_id: String,
  // Payment method used
  payment_method: {
    type: String,
    enum: ['mobile_money', 'card', 'bank_transfer', 'wallet'],
  },
  // Timestamps
  payment_initiated_at: {
    type: Date,
    default: Date.now,
  },
  payment_confirmed_at: Date,
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
TipSchema.index({ farmerId: 1, createdAt: -1 });
TipSchema.index({ status: 1, createdAt: -1 });
TipSchema.index({ psp_reference: 1 });
TipSchema.index({ tipId: 1 });

// Virtual for formatted amount
TipSchema.virtual('formatted_amount').get(function() {
  return `${this.currency} ${this.gross_amount.toLocaleString()}`;
});

// Pre-save hook to calculate fees
TipSchema.pre('save', function(next) {
  if (this.isModified('gross_amount')) {
    this.platform_fee = Math.round(this.gross_amount * 0.03 * 100) / 100;
    this.net_amount = Math.round((this.gross_amount - this.platform_fee) * 100) / 100;
  }
  next();
});

// Static method to get farmer total tips
TipSchema.statics.getFarmerTotalTips = async function(farmerId) {
  const result = await this.aggregate([
    {
      $match: {
        farmerId: mongoose.Types.ObjectId(farmerId),
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: '$farmerId',
        total_gross: { $sum: '$gross_amount' },
        total_net: { $sum: '$net_amount' },
        total_fees: { $sum: '$platform_fee' },
        count: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { total_gross: 0, total_net: 0, total_fees: 0, count: 0 };
};

export default mongoose.models.Tip || mongoose.model('Tip', TipSchema);
