import mongoose from 'mongoose';

/**
 * MarketPrice Schema
 * Tracks coffee prices, market trends, and insights
 */
const MarketPriceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  coffeeType: {
    type: String,
    enum: ['arabica', 'robusta', 'specialty', 'commercial'],
    required: true,
  },
  grade: {
    type: String, // e.g., AA, A, B, C
  },
  pricePerKg: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'UGX',
  },
  market: {
    type: String,
    required: true, // e.g., "Kampala", "Nairobi", "ICE Futures"
  },
  country: {
    type: String,
    required: true,
  },
  priceChange: {
    type: Number, // Percentage change from previous day
  },
  volume: {
    type: Number, // Trading volume in kg
  },
  source: {
    type: String,
    required: true, // e.g., "UCDA", "ICO", "Manual Entry"
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

MarketPriceSchema.index({ date: -1 });
MarketPriceSchema.index({ coffeeType: 1, date: -1 });
MarketPriceSchema.index({ market: 1, date: -1 });
MarketPriceSchema.index({ country: 1, date: -1 });

export default mongoose.models.MarketPrice || mongoose.model('MarketPrice', MarketPriceSchema);
