import mongoose from 'mongoose';

/**
 * Product Schema
 * Agro-input marketplace products (seeds, fertilizers, tools, pesticides)
 */
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'coffee_green',
      'coffee_roasted',
      'coffee_specialty',
      'coffee_cascara',
      'coffee_other',
      'tea',
      'bananas',
      'vanilla',
      'livestock',
      'seeds',
      'seedlings',
      'fertilizers',
      'pesticides',
      'tools',
      'equipment',
      'irrigation',
      'packaging',
      'other',
    ],
    required: true,
  },
  subcategory: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    alt: String,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'UGX',
  },
  unit: {
    type: String,
    required: true, // e.g., "kg", "liter", "piece", "bag"
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
  },
  maxOrderQuantity: {
    type: Number,
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  isCertified: {
    type: Boolean,
    default: false,
  },
  certifications: [{
    name: String,
    certificateUrl: String,
  }],
  qrCodeUrl: {
    type: String, // For product authenticity verification
  },
  specifications: {
    type: Map,
    of: String,
  },
  usageInstructions: {
    type: String,
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Enhanced Marketplace Features
  bulkDiscounts: [{
    minQuantity: Number,
    discountPercentage: Number,
  }],
  seasonalAvailability: [{
    month: {
      type: Number,
      min: 1,
      max: 12,
    },
    available: Boolean,
    priceAdjustment: Number, // Percentage increase/decrease
  }],
  supplierVerified: {
    type: Boolean,
    default: false,
  },
  verificationDate: Date,
  verificationNotes: String,
  groupBuyingEnabled: {
    type: Boolean,
    default: false,
  },
  groupBuyingMinQty: Number,
  groupBuyingDiscount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ supplierId: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ 'ratings.average': -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
