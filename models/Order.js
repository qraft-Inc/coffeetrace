import mongoose from 'mongoose';

/**
 * Order Schema
 * Marketplace orders for agro-inputs
 */
const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: String,
    pricePerUnit: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'UGX',
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'mobile_money', 'bank_transfer', 'cash_on_delivery', 'pay_at_harvest'],
    required: true,
  },
  payAtHarvest: {
    enabled: Boolean,
    harvestSeason: String,
    expectedPaymentDate: Date,
    collateralInfo: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: Date,
  },
  bulkDiscountApplied: {
    type: Number,
    default: 0,
  },
  groupBuyingDiscount: {
    type: Number,
    default: 0,
  },
  isGroupOrder: {
    type: Boolean,
    default: false,
  },
  groupOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupOrder',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    name: String,
    phone: String,
    address: String,
    district: String,
    region: String,
    gps: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
  },
  deliveryDate: {
    type: Date,
  },
  trackingNumber: {
    type: String,
  },
  notes: {
    type: String,
  },
  cancelReason: {
    type: String,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

OrderSchema.index({ buyerId: 1, createdAt: -1 });
OrderSchema.index({ supplierId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
