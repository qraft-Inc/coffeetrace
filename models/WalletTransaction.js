import mongoose from 'mongoose';

/**
 * WalletTransaction Schema
 * Records all wallet-specific transactions (deposits, withdrawals, loans)
 */
const WalletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'deposit',
      'withdrawal',
      'loan_disbursement',
      'loan_repayment',
      'purchase_payment',
      'sale_payment',
      'transfer_in',
      'transfer_out',
      'fee',
      'refund',
    ],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'UGX',
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending',
  },
  description: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    unique: true,
    required: true,
  },
  relatedLoanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
  },
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'mobile_money', 'bank_transfer', 'cash', 'card'],
  },
  paymentProvider: {
    type: String,
  },
  externalReference: {
    type: String,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ type: 1 });
WalletTransactionSchema.index({ status: 1 });
WalletTransactionSchema.index({ reference: 1 });

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', WalletTransactionSchema);
