import mongoose from 'mongoose';

/**
 * Investment Schema
 * Represents investor investments in cooperatives
 */
const InvestmentSchema = new mongoose.Schema(
  {
    investorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investor user ID is required'],
      index: true,
    },
    cooperativeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cooperative',
      required: [true, 'Cooperative ID is required'],
      index: true,
    },
    cooperativeName: String,
    region: String,
    
    // Investment Details
    investmentAmount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [0, 'Investment amount must be positive'],
    },
    currency: {
      type: String,
      default: 'UGX',
      enum: ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'ETB'],
    },
    expectedReturnPercentage: {
      type: Number,
      default: 10,
      min: 0,
    },
    investmentDate: {
      type: Date,
      default: Date.now,
    },
    expectedMaturityDate: Date,
    
    // Current Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'active', 'completed', 'withdrawn', 'defaulted'],
      default: 'pending',
      index: true,
    },
    
    // Returns Tracking
    currentValue: {
      type: Number,
      default: 0,
    },
    totalReturns: {
      type: Number,
      default: 0,
    },
    returnPercentage: {
      type: Number,
      default: 0,
    },
    
    // Cooperative Details (snapshot at time of investment)
    cooperativeFarmerCount: Number,
    cooperativeCertifications: [String],
    coffeeType: String,
    
    // Risk Assessment
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    
    // Terms
    investmentTerm: String, // e.g., "Seasonal", "1-year", "2-year"
    expectedHarvestDate: Date,
    
    // Notes
    investmentGoals: String,
    notes: String,
    
    // Compliance
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: Date,
    
    // Audit Trail
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
InvestmentSchema.index({ investorUserId: 1, status: 1 });
InvestmentSchema.index({ cooperativeId: 1 });
InvestmentSchema.index({ investmentDate: -1 });

export default mongoose.models.Investment || mongoose.model('Investment', InvestmentSchema);
