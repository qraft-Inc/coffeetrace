import mongoose from 'mongoose';

/**
 * Pickup Request Schema
 * Manages coffee collection from farmers to collection centers/buyers
 */
const PickupRequestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
  },
  requestType: {
    type: String,
    enum: ['collection', 'delivery', 'emergency'],
    default: 'collection',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Pickup Details
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      district: String,
      sector: String,
      cell: String,
      village: String,
      description: String,
    },
  },
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
    address: {
      district: String,
      sector: String,
      facility: String,
      description: String,
    },
  },
  // Coffee Details
  estimatedWeight: {
    type: Number,
    required: true,
    min: 0,
  },
  actualWeight: Number,
  coffeeType: {
    type: String,
    enum: ['arabica', 'robusta', 'mixed'],
  },
  qualityGrade: String,
  packagingType: {
    type: String,
    enum: ['bags', 'bulk', 'containers'],
    default: 'bags',
  },
  numberOfPackages: Number,
  // Scheduling
  requestedDate: {
    type: Date,
    required: true,
  },
  preferredTimeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'flexible'],
    default: 'flexible',
  },
  scheduledDate: Date,
  completedDate: Date,
  // Assignment
  assignedTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['agent', 'driver', 'cooperative_staff'],
    },
    vehicleType: String,
    vehicleRegistration: String,
    phoneNumber: String,
    assignedAt: Date,
  },
  // Route Optimization
  routeDetails: {
    distance: Number, // km
    estimatedDuration: Number, // minutes
    optimizationScore: Number, // 0-100
    routeOrder: Number, // for multi-stop routes
  },
  // Tracking
  trackingUpdates: [{
    status: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  // Confirmation
  pickupConfirmation: {
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    signature: String, // Base64 signature image
    photos: [String], // URLs to photos
    timestamp: Date,
    notes: String,
  },
  deliveryConfirmation: {
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    signature: String,
    photos: [String],
    timestamp: Date,
    notes: String,
    qualityCheckPassed: Boolean,
  },
  // Payment
  transportCost: {
    amount: Number,
    currency: {
      type: String,
      default: 'RWF',
    },
    paidBy: {
      type: String,
      enum: ['farmer', 'buyer', 'cooperative', 'platform'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
    },
  },
  // Additional Info
  specialInstructions: String,
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  cancellationReason: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Geospatial index for location-based queries
PickupRequestSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
PickupRequestSchema.index({ 'deliveryLocation.coordinates': '2dsphere' });

// Compound indexes for common queries
PickupRequestSchema.index({ farmerId: 1, status: 1 });
PickupRequestSchema.index({ 'assignedTo.userId': 1, status: 1 });
PickupRequestSchema.index({ status: 1, requestedDate: 1 });
PickupRequestSchema.index({ status: 1, urgency: -1, requestedDate: 1 });

// Method to calculate distance between two points (Haversine formula)
PickupRequestSchema.statics.calculateDistance = function(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const lat1 = coord1[1] * Math.PI / 180;
  const lat2 = coord2[1] * Math.PI / 180;
  const deltaLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const deltaLon = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default mongoose.models.PickupRequest || mongoose.model('PickupRequest', PickupRequestSchema);
