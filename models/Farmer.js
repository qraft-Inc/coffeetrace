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
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
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
  altitude: {
    type: Number, // in meters above sea level
    min: 0,
  },
  primaryVariety: {
    type: String, // e.g., "Arabica", "Robusta"
    trim: true,
  },
  certifications: [{
    type: String, // Simple string array for certification names
  }],
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
