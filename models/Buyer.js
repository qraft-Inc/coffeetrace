import mongoose from 'mongoose';

/**
 * Buyer Schema
 * Extended profile for users with buyer role (roasters, exporters, traders)
 */
const BuyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  businessType: {
    type: String,
    enum: ['roaster', 'exporter', 'trader', 'retailer', 'cafe', 'other'],
    required: true,
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  address: {
    street: String,
    city: String,
    region: String,
    country: String,
    postalCode: String,
  },
  phone: String,
  email: String,
  website: String,
  description: String,
  logo: String,
  // Purchase preferences
  preferences: {
    varieties: [String],
    certifications: [String],
    minQualityScore: Number,
    maxCarbonFootprint: Number,
  },
  // Verification status
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: Date,
  // Stats
  totalPurchasesKg: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

BuyerSchema.index({ userId: 1 });
BuyerSchema.index({ businessType: 1 });
// Only create geospatial index if location.coordinates exists
BuyerSchema.index({ location: '2dsphere' }, { sparse: true });

export default mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);
