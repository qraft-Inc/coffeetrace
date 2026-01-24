import mongoose from 'mongoose';

/**
 * Agronomist Service Schema
 * Represents agronomist/expert services available to farmers
 * Managed by cooperatives to provide expert advice
 */
const AgronomistServiceSchema = new mongoose.Schema({
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true,
    index: true,
  },
  agronomistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  qualifications: [String], // e.g., ["BSc Agriculture", "Certified Extension Officer"]
  specializations: [String], // e.g., ["Coffee cultivation", "Pest management", "Soil health"]
  biography: String,
  profileImage: String,
  
  // Service offerings
  serviceType: {
    type: String,
    enum: ['consultation', 'farm_visit', 'training', 'monitoring', 'group_training'],
    required: true,
  },
  
  description: String,
  
  // Pricing
  pricePerSession: Number,
  currency: {
    type: String,
    default: 'UGX',
  },
  priceModel: {
    type: String,
    enum: ['fixed', 'hourly', 'per_acre', 'free'],
    default: 'fixed',
  },
  
  // Availability
  availability: {
    daysPerWeek: Number,
    hoursPerDay: Number,
    availableRegions: [String],
  },
  
  // Performance metrics
  stats: {
    totalFarmersServed: {
      type: Number,
      default: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    responseTimeHours: {
      type: Number,
      default: 24,
    },
  },
  
  // Reviews and ratings
  reviews: [{
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String,
    serviceDate: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
  },
  
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified', 'pending'],
    default: 'unverified',
  },
  
  documents: [{
    name: String,
    url: String,
    type: String, // 'certificate', 'degree', 'license', etc.
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  }],
  
  // Topics/expertise areas
  topicsOfExpertise: [String], // e.g., ["Coffee diseases", "Fertilizer application", "Water management"]
  
  // Languages
  languages: [String], // e.g., ["English", "Luganda", "Swahili"]
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
AgronomistServiceSchema.index({ cooperativeId: 1, status: 1 });
AgronomistServiceSchema.index({ serviceType: 1 });
AgronomistServiceSchema.index({ 'stats.averageRating': -1 });
AgronomistServiceSchema.index({ specializations: 1 });

export default mongoose.models.AgronomistService || mongoose.model('AgronomistService', AgronomistServiceSchema);
