import mongoose from 'mongoose';

/**
 * Payment Transaction Schema
 * Tracks quality-based premium payments to farmers
 */
const PaymentTransactionSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['sale', 'quality_bonus', 'advance_payment', 'final_payment', 'penalty'],
    required: true,
  },
  // Base Payment
  basePrice: {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    pricePerKg: Number,
  },
  // Quality Premium Calculation
  qualityPremium: {
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['AA', 'A', 'B', 'C', 'PB', 'reject'],
    },
    premiumMultiplier: {
      type: Number,
      default: 1.0,
    },
    premiumAmount: {
      type: Number,
      default: 0,
    },
    breakdown: [{
      factor: String,
      value: Number,
      impact: Number, // percentage
    }],
  },
  // Certification Bonuses
  certificationBonuses: [{
    certificationType: {
      type: String,
      enum: ['organic', 'fair_trade', 'rainforest_alliance', 'UTZ', '4C', 'C.A.F.E_practices'],
    },
    bonusAmount: Number,
    bonusPercentage: Number,
  }],
  // Deductions
  deductions: [{
    type: {
      type: String,
      enum: ['transport', 'processing', 'quality_penalty', 'loan_repayment', 'advance_deduction', 'cooperative_fee', 'platform_fee'],
    },
    amount: Number,
    description: String,
  }],
  // Final Amount
  totalAmount: {
    type: Number,
    required: true,
  },
  netAmount: {
    type: Number, // After deductions
    required: true,
  },
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['wallet', 'mobile_money', 'bank_transfer', 'cash', 'check'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  // Mobile Money Details
  mobileMoneyDetails: {
    provider: {
      type: String,
      enum: ['MTN', 'Airtel', 'Tigo'],
    },
    phoneNumber: String,
    transactionId: String,
  },
  // Bank Transfer Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    referenceNumber: String,
  },
  // Wallet Integration
  walletTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
  },
  // Quality Assessment Reference
  qualityAssessmentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityAssessment',
  }],
  // Processing Timeline
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  // Approval Workflow
  approvalRequired: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  rejectionReason: String,
  // Additional Info
  notes: String,
  receiptUrl: String,
  invoiceNumber: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
PaymentTransactionSchema.index({ farmerId: 1, paymentStatus: 1 });
PaymentTransactionSchema.index({ buyerId: 1, paymentStatus: 1 });
PaymentTransactionSchema.index({ lotId: 1 });
PaymentTransactionSchema.index({ transactionType: 1, paymentStatus: 1 });
PaymentTransactionSchema.index({ paymentStatus: 1, initiatedAt: -1 });

// Method to calculate quality premium
PaymentTransactionSchema.statics.calculateQualityPremium = function(basePrice, qualityScore, grade, certifications = []) {
  let premiumMultiplier = 1.0;
  const breakdown = [];

  // Grade-based multipliers
  const gradeMultipliers = {
    'AA': 1.30,   // +30%
    'A': 1.20,    // +20%
    'B': 1.10,    // +10%
    'C': 1.05,    // +5%
    'PB': 1.15,   // +15% (Peaberry premium)
    'reject': 0.70, // -30% penalty
  };

  if (grade && gradeMultipliers[grade]) {
    premiumMultiplier = gradeMultipliers[grade];
    breakdown.push({
      factor: `Grade ${grade}`,
      value: gradeMultipliers[grade],
      impact: (gradeMultipliers[grade] - 1) * 100,
    });
  }

  // Additional quality score bonus
  if (qualityScore >= 90) {
    const scoreBonus = 1.10;
    premiumMultiplier *= scoreBonus;
    breakdown.push({
      factor: 'Exceptional Quality (90+)',
      value: scoreBonus,
      impact: (scoreBonus - 1) * 100,
    });
  } else if (qualityScore >= 85) {
    const scoreBonus = 1.05;
    premiumMultiplier *= scoreBonus;
    breakdown.push({
      factor: 'High Quality (85+)',
      value: scoreBonus,
      impact: (scoreBonus - 1) * 100,
    });
  }

  const premiumAmount = basePrice * (premiumMultiplier - 1);

  // Certification bonuses
  const certificationBonuses = [];
  const certBonus = {
    'organic': 0.15,           // +15%
    'fair_trade': 0.10,        // +10%
    'rainforest_alliance': 0.08, // +8%
    'UTZ': 0.07,              // +7%
    '4C': 0.05,               // +5%
    'C.A.F.E_practices': 0.12, // +12%
  };

  certifications.forEach(cert => {
    if (certBonus[cert]) {
      const bonusAmount = basePrice * certBonus[cert];
      certificationBonuses.push({
        certificationType: cert,
        bonusAmount,
        bonusPercentage: certBonus[cert] * 100,
      });
    }
  });

  const totalCertBonus = certificationBonuses.reduce((sum, b) => sum + b.bonusAmount, 0);

  return {
    premiumMultiplier,
    premiumAmount,
    breakdown,
    certificationBonuses,
    totalAmount: basePrice + premiumAmount + totalCertBonus,
  };
};

export default mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', PaymentTransactionSchema);
