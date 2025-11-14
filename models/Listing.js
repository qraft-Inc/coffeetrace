import mongoose from 'mongoose';

/**
 * Listing Schema
 * Represents a coffee lot available for sale in the marketplace
 */
const ListingSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: [true, 'Lot ID is required'],
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  minQuantityKg: {
    type: Number,
    default: 1,
    min: 0,
  },
  availableQuantityKg: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  // Listing metadata
  postedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['open', 'under_offer', 'sold', 'expired', 'cancelled'],
    default: 'open',
  },
  // Featured/promoted listing
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Offers received
  offers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  }],
  // View count
  viewCount: {
    type: Number,
    default: 0,
  },
  // Tags for search
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
ListingSchema.index({ status: 1 });
ListingSchema.index({ postedAt: -1 });
ListingSchema.index({ pricePerKg: 1 });
ListingSchema.index({ lotId: 1 });
ListingSchema.index({ sellerId: 1 });

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
