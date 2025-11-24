import mongoose from 'mongoose';

/**
 * Yield Record Sub-Schema
 * Tracks historical yield data for a farmer
 */
const YieldRecordSchema = new mongoose.Schema({
  season: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  quantityKg: {
    type: Number,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Farmer Schema
 * Extended profile for users with farmer role
 */
const FarmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  dateOfBirth: Date,
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  // KYC & Identity Verification
  nationalId: {
    type: String,
    trim: true,
  },
  photoIdUrl: String, // Scanned ID document
  profilePhotoUrl: String,
  kycDocuments: [{
    type: {
      type: String,
      enum: ['national_id', 'passport', 'drivers_license', 'land_title', 'tax_id', 'cooperative_membership', 'other'],
    },
    documentNumber: String,
    url: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    expiryDate: Date,
    notes: String,
  }],
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending',
  },
  kycVerifiedAt: Date,
  kycVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // GeoJSON Point for farm location (optional)
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
    country: String,
    region: String,
    district: String,
  },
  // Optional: Farm boundary as GeoJSON Polygon
  farmBoundary: {
    type: {
      type: String,
      enum: ['Polygon'],
    },
    coordinates: {
      type: [[[Number]]], // Array of linear rings
    },
  },
  farmSize: {
    type: Number, // in hectares
    min: 0,
  },
  farmSizeUnit: {
    type: String,
    enum: ['hectares', 'acres'],
    default: 'acres',
  },
  altitude: {
    type: Number, // in meters above sea level
    min: 0,
  },
  soilType: {
    type: String,
    enum: ['volcanic', 'clay', 'loam', 'sandy', 'laterite', 'mixed', 'other'],
  },
  climateZone: {
    type: String,
    enum: ['tropical', 'subtropical', 'temperate', 'highland', 'lowland'],
  },
  rainfall: {
    annual: Number, // mm per year
    pattern: {
      type: String,
      enum: ['bimodal', 'unimodal', 'year-round'],
    },
  },
  shade: {
    type: String,
    enum: ['full_sun', 'partial_shade', 'full_shade', 'mixed'],
  },
  primaryVariety: {
    type: String, // e.g., "Arabica", "Robusta"
    trim: true,
  },
  varieties: [{
    name: String,
    percentage: Number, // % of farm
    plantingYear: Number,
  }],
  numberOfTrees: Number,
  plantingDensity: Number, // trees per hectare
  certifications: [
    mongoose.Schema.Types.Mixed // Can be string or object with {name, issuedBy, issuedDate, expiryDate}
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  totalLots: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalYieldKg: {
    type: Number,
    default: 0,
    min: 0,
  },
  yields: [YieldRecordSchema],
  carbonProfile: {
    score: {
      type: Number, // 0-100 score
      min: 0,
      max: 100,
    },
    totalCO2Kg: {
      type: Number,
      default: 0,
    },
    lastUpdated: Date,
  },
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Tipping & Wallet Integration
  qrCodeUrl: {
    type: String,
    // QR code linking to tip page: /tip/{farmerId}
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  },
  phoneNumber: {
    type: String,
    // Mobile number for mobile money payouts
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Geospatial index for location-based queries
FarmerSchema.index({ location: '2dsphere' });
FarmerSchema.index({ cooperativeId: 1 });
FarmerSchema.index({ userId: 1 });

export default mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);
