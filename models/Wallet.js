import mongoose from 'mongoose';

/**
 * Wallet Schema
 * Manages farmer financial accounts, balances, and transaction history
 */
const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  lockedBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'UGX',
    enum: ['UGX', 'KES', 'TZS', 'RWF', 'USD'],
  },
  // Credit score for loan eligibility
  creditScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  totalLoansReceived: {
    type: Number,
    default: 0,
  },
  totalLoansRepaid: {
    type: Number,
    default: 0,
  },
  outstandingLoanBalance: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastTransactionAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
WalletSchema.index({ userId: 1 });
WalletSchema.index({ balance: -1 });
WalletSchema.index({ creditScore: -1 });

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
