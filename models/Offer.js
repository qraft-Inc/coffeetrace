import mongoose from 'mongoose';

/**
 * Offer Schema
 * Represents a buyer's offer on a marketplace listing
 */
const OfferSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing ID is required'],
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required'],
  },
  amountKg: {
    type: Number,
    required: [true, 'Amount in kg is required'],
    min: [0, 'Amount must be positive'],
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required'],
    min: [0, 'Price must be positive'],
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'UGX', 'KES', 'RWF'],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'countered', 'withdrawn', 'expired'],
    default: 'pending',
  },
  // Seller response
  sellerResponse: {
    message: String,
    respondedAt: Date,
  },
  // Counter offer from seller
  counterOffer: {
    pricePerKg: Number,
    amountKg: Number,
    message: String,
  },
  // Expiry
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Calculate total amount before saving
OfferSchema.pre('save', function(next) {
  this.totalAmount = this.amountKg * this.pricePerKg;
  next();
});

// Indexes
OfferSchema.index({ listingId: 1 });
OfferSchema.index({ buyerId: 1 });
OfferSchema.index({ status: 1 });
OfferSchema.index({ createdAt: -1 });

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
