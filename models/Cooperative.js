import mongoose from 'mongoose';

/**
 * Cooperative Schema
 * Represents farmer cooperatives/organizations
 */
const CooperativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cooperative name is required'],
    trim: true,
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
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
  },
  phone: String,
  email: String,
  description: String,
  memberCount: {
    type: Number,
    default: 0,
  },
  establishedYear: Number,
  certifications: [{
    name: String,
    issuedDate: Date,
    certificateUrl: String,
  }],
  logo: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

CooperativeSchema.index({ location: '2dsphere' });

export default mongoose.models.Cooperative || mongoose.model('Cooperative', CooperativeSchema);
