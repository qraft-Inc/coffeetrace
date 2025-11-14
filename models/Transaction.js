import mongoose from 'mongoose';

/**
 * Transaction Schema
 * Represents a completed payment/purchase transaction
 */
const TransactionSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amountKg: {
    type: Number,
    required: true,
  },
  pricePerKg: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'UGX', 'KES', 'RWF'],
  },
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'bank_transfer', 'card', 'flutterwave', 'escrow', 'other'],
  },
  paymentRef: {
    type: String, // External payment reference (e.g., Flutterwave transaction ID)
  },
  paymentProvider: {
    type: String, // e.g., "Flutterwave", "MTN MoMo", "Airtel Money"
  },
  // Platform fee
  platformFeePercent: {
    type: Number,
    default: 2.5, // 2.5% platform fee
  },
  platformFeeAmount: {
    type: Number,
  },
  // Net amounts
  sellerNetAmount: {
    type: Number,
  },
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  // Delivery tracking
  deliveryStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered', 'disputed'],
    default: 'pending',
  },
  deliveryDate: Date,
  trackingNumber: String,
  // Notes
  notes: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Calculate fees before saving
TransactionSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('platformFeePercent')) {
    this.platformFeeAmount = (this.totalAmount * this.platformFeePercent) / 100;
    this.sellerNetAmount = this.totalAmount - this.platformFeeAmount;
  }
  next();
});

// Indexes
TransactionSchema.index({ buyerId: 1 });
TransactionSchema.index({ sellerId: 1 });
TransactionSchema.index({ paymentStatus: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ paymentRef: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
