import mongoose from 'mongoose';

/**
 * Finance Partner Schema
 * Represents financing institutions (SACCOs, VSLAs, Banks, Microfinance)
 * that farmers can access through cooperatives
 */
const FinancePartnerSchema = new mongoose.Schema({
  cooperativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cooperative',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Partner name is required'],
    trim: true,
  },
  partnerType: {
    type: String,
    enum: ['sacco', 'vsla', 'bank', 'mfi', 'ngo', 'other'],
    required: true,
  },
  description: String,
  email: String,
  phone: String,
  website: String,
  location: {
    district: String,
    region: String,
    country: String,
  },
  
  // Financing details
  loanProducts: [{
    name: String,
    description: String,
    minAmount: Number,
    maxAmount: Number,
    interestRate: Number, // Annual percentage
    repaymentPeriodMonths: Number,
    currency: {
      type: String,
      default: 'UGX',
    },
  }],
  
  // Partnership terms
  eligibilityCriteria: [String], // e.g., "Must be member for 6 months", "Min 2 acres"
  maxLoanAmount: {
    type: Number,
    default: 0,
  },
  minimumInterestRate: {
    type: Number,
    default: 0,
  },
  maximumInterestRate: {
    type: Number,
    default: 50,
  },
  processingFee: {
    type: Number,
    default: 0, // Percentage
  },
  
  // Partnership status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active',
  },
  verificationStatus: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'unverified',
  },
  
  // Contact person
  contactPerson: {
    name: String,
    phone: String,
    email: String,
    role: String,
  },
  
  // Loan statistics
  stats: {
    totalLoansDisbursed: {
      type: Number,
      default: 0,
    },
    totalAmountDisbursed: {
      type: Number,
      default: 0,
    },
    activeLoans: {
      type: Number,
      default: 0,
    },
    repaymentRate: {
      type: Number,
      default: 0, // Percentage
    },
  },
  
  logo: String,
  documents: [{
    name: String,
    url: String,
    type: String, // 'license', 'partnership_agreement', 'terms', etc.
  }],
  
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [{
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
FinancePartnerSchema.index({ cooperativeId: 1, status: 1 });
FinancePartnerSchema.index({ partnerType: 1 });
FinancePartnerSchema.index({ 'ratings.averageRating': -1 });

export default mongoose.models.FinancePartner || mongoose.model('FinancePartner', FinancePartnerSchema);
