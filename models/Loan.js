import mongoose from 'mongoose';

/**
 * Loan Schema
 * Pre-harvest financing for farmers
 */
const LoanSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  loanNumber: {
    type: String,
    unique: true,
    required: true,
  },
  principalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  interestAmount: {
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
  purpose: {
    type: String,
    enum: [
      'seeds_purchase',
      'fertilizer_purchase',
      'labor_costs',
      'equipment',
      'land_preparation',
      'pest_control',
      'irrigation',
      'general_farming',
      'other',
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaying', 'completed', 'defaulted'],
    default: 'pending',
  },
  disbursementDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  repaymentSchedule: [{
    installmentNumber: Number,
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paidDate: Date,
  }],
  amountPaid: {
    type: Number,
    default: 0,
  },
  amountOutstanding: {
    type: Number,
  },
  collateral: {
    type: String, // Description of collateral (e.g., "Expected harvest from 2.5 hectares")
  },
  guarantorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  notes: {
    type: String,
  },
  saccoPartnerId: {
    type: String, // External SACCO/finance partner ID
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

// Calculate total amount before saving
LoanSchema.pre('save', function(next) {
  if (this.isModified('principalAmount') || this.isModified('interestRate')) {
    this.interestAmount = (this.principalAmount * this.interestRate) / 100;
    this.totalAmount = this.principalAmount + this.interestAmount;
    this.amountOutstanding = this.totalAmount - this.amountPaid;
  }
  next();
});

// Indexes
LoanSchema.index({ farmerId: 1 });
LoanSchema.index({ userId: 1 });
LoanSchema.index({ status: 1 });
LoanSchema.index({ dueDate: 1 });
LoanSchema.index({ loanNumber: 1 });

export default mongoose.models.Loan || mongoose.model('Loan', LoanSchema);
