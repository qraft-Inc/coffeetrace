import mongoose from 'mongoose';

/**
 * Group Order Schema
 * Farmers pool orders together for bulk discounts
 */
const GroupOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetQuantity: {
    type: Number,
    required: true,
  },
  currentQuantity: {
    type: Number,
    default: 0,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    quantity: Number,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  }],
  status: {
    type: String,
    enum: ['open', 'target_reached', 'closed', 'cancelled'],
    default: 'open',
  },
  deadline: {
    type: Date,
    required: true,
  },
  deliveryLocation: {
    district: String,
    address: String,
    gps: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

GroupOrderSchema.index({ productId: 1, status: 1 });
GroupOrderSchema.index({ organizer: 1 });
GroupOrderSchema.index({ deadline: 1 });

export default mongoose.models.GroupOrder || mongoose.model('GroupOrder', GroupOrderSchema);
