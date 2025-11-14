import mongoose from 'mongoose';

/**
 * User Schema
 * Represents all platform users (farmers, buyers, coop admins, investors, system admins)
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['farmer', 'coopAdmin', 'buyer', 'investor', 'admin'],
    required: [true, 'Role is required'],
    default: 'farmer',
  },
  phone: {
    type: String,
    trim: true,
  },
  // Reference to role-specific profile
  farmerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
  },
  buyerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
