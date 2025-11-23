import mongoose from 'mongoose';

/**
 * AgroInput Schema
 * Products/inputs sold to farmers (seeds, fertilizers, tools, etc.)
 * Managed by cooperatives
 */
const AgroInputSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true,
  },
  category: {
    type: String,
    enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'equipment', 'irrigation', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: String,
  images: [{
    url: String,
    caption: String,
  }],
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    unit: {
      type: String, // e.g., 'per kg', 'per bag', 'per piece'
      required: true,
    },
  },
  stock: {
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
  },
  specifications: {
    brand: String,
    manufacturer: String,
    weight: String,
    volume: String,
    composition: String, // For fertilizers/pesticides
    origin: String,
  },
  certification: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
  }],
  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'discontinued', 'pending_approval'],
    default: 'pending_approval',
  },
  deliveryOptions: [{
    type: String,
    enum: ['pickup', 'delivery', 'both'],
  }],
  deliveryFee: {
    type: Number,
    default: 0,
  },
  paymentOptions: [{
    type: String,
    enum: ['cash', 'mobile_money', 'credit', 'installment'],
  }],
  // Credit/Installment terms
  creditTerms: {
    available: {
      type: Boolean,
      default: false,
    },
    downPaymentPercent: Number,
    installmentMonths: Number,
    interestRate: Number,
  },
  minimumOrderQuantity: {
    type: Number,
    default: 1,
  },
  maximumOrderQuantity: Number,
  // Seasonal availability
  seasonal: {
    isseasonal: {
      type: Boolean,
      default: false,
    },
    availableMonths: [Number], // 1-12
  },
  tags: [String],
  // Analytics
  views: {
    type: Number,
    default: 0,
  },
  orders: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
}, {
  timestamps: true,
});

// Indexes
AgroInputSchema.index({ cooperativeId: 1, status: 1 });
AgroInputSchema.index({ category: 1, status: 1 });
AgroInputSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for checking if stock is low
AgroInputSchema.virtual('isLowStock').get(function() {
  return this.stock.quantity <= this.stock.lowStockThreshold;
});

const AgroInput = mongoose.models.AgroInput || mongoose.model('AgroInput', AgroInputSchema);

export default AgroInput;
