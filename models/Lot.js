import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Trace Event Sub-Schema
 * Captures each step in the coffee journey from farm to buyer
 */
const TraceEventSchema = new mongoose.Schema({
  step: {
    type: String,
    required: true,
    enum: ['harvested', 'weighed', 'processed', 'dried', 'hulled', 'graded', 'bagged', 'stored', 'shipped', 'exported', 'received', 'roasted', 'packaged'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gps: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  photoUrl: String,
  note: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
});

/**
 * Lot Schema
 * Represents a batch/lot of coffee with full traceability
 */
const LotSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required'],
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
  },
  traceId: {
    type: String,
    unique: true,
    default: () => uuidv4(),
    required: true,
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required'],
  },
  variety: {
    type: String,
    required: [true, 'Coffee variety is required'],
    // e.g., Arabica, Robusta, SL28, Geisha, etc.
  },
  quantityKg: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive'],
  },
  moisture: {
    type: Number, // Percentage
    min: 0,
    max: 100,
  },
  qualityScore: {
    type: Number, // 0-100 cupping score
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['harvested', 'processed', 'stored', 'listed', 'under_offer', 'sold', 'exported', 'delivered'],
    default: 'harvested',
  },
  // Traceability events
  events: [TraceEventSchema],
  // QR code data URL (legacy)
  qrCodeUrl: {
    type: String,
  },
  // Enhanced QR code fields
  qrCode: {
    type: String, // Traceability URL
  },
  qrCodeImage: {
    type: String, // Base64 data URL of QR code image
  },
  // Processing details
  processingMethod: {
    type: String,
    enum: ['washed', 'natural', 'honey', 'wet-hulled', 'other'],
  },
  // Environmental data
  carbonFootprint: {
    totalKgCO2: Number,
    perKgCO2: Number,
    calculatedAt: Date,
  },
  // Additional metadata
  notes: String,
  tags: [String],
  // Tipping Integration
  qrCodeUrl: {
    type: String,
    // QR code linking to lot traceability & tip page: /lot/{lotId}
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
LotSchema.index({ farmerId: 1 });
LotSchema.index({ cooperativeId: 1 });
LotSchema.index({ status: 1 });
LotSchema.index({ harvestDate: -1 });

// Pre-save hook to ensure traceId
LotSchema.pre('save', function(next) {
  if (!this.traceId) {
    this.traceId = uuidv4();
  }
  next();
});

export default mongoose.models.Lot || mongoose.model('Lot', LotSchema);
