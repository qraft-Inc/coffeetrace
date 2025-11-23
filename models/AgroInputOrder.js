import mongoose from 'mongoose';

/**
 * AgroInputOrder Schema
 * Orders placed by farmers for agro-inputs
 */
const AgroInputOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true,
  },
  items: [{
    agroInputId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AgroInput',
      required: true,
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
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
  pricing: {
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
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
  },
  deliveryDetails: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true,
    },
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
    },
    scheduledDate: Date,
    deliveredDate: Date,
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['cash', 'mobile_money', 'credit', 'installment'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentReference: String,
    paidAt: Date,
  },
  // For credit/installment orders
  installmentPlan: {
    downPayment: Number,
    monthlyPayment: Number,
    totalMonths: Number,
    paidInstallments: {
      type: Number,
      default: 0,
    },
    nextDueDate: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  notes: String,
  farmerNotes: String,
  cooperativeNotes: String,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  }],
  cancelReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rating: {
    score: Number,
    review: String,
    createdAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes
AgroInputOrderSchema.index({ farmerId: 1, status: 1 });
AgroInputOrderSchema.index({ cooperativeId: 1, status: 1 });
AgroInputOrderSchema.index({ orderNumber: 1 }, { unique: true });
AgroInputOrderSchema.index({ 'paymentDetails.status': 1 });

// Generate unique order number
AgroInputOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `AI-${year}${month}-${random}`;
  }
  next();
});

const AgroInputOrder = mongoose.models.AgroInputOrder || mongoose.model('AgroInputOrder', AgroInputOrderSchema);

export default AgroInputOrder;
