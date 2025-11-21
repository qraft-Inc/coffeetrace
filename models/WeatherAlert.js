import mongoose from 'mongoose';

/**
 * WeatherAlert Schema
 * Weather forecasts and climate warnings for farmers
 */
const WeatherAlertSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
  },
  district: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  alertType: {
    type: String,
    enum: ['rainfall', 'drought', 'frost', 'heatwave', 'storm', 'pest_outbreak', 'disease_warning'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  recommendations: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  source: {
    type: String, // e.g., "UNMA", "Weather API", "Local Extension"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

WeatherAlertSchema.index({ region: 1, isActive: 1 });
WeatherAlertSchema.index({ alertType: 1, isActive: 1 });
WeatherAlertSchema.index({ startDate: 1 });
WeatherAlertSchema.index({ location: '2dsphere' });

export default mongoose.models.WeatherAlert || mongoose.model('WeatherAlert', WeatherAlertSchema);
