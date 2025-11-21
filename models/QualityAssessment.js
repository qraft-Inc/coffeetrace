import mongoose from 'mongoose';

/**
 * QualityAssessment Schema
 * Track quality at different processing stages
 */
const QualityAssessmentSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  assessmentType: {
    type: String,
    enum: ['cherry_picking', 'fermentation', 'drying', 'milling', 'grading', 'cupping'],
    required: true,
  },
  stage: {
    type: String,
    enum: ['pre_harvest', 'harvest', 'wet_processing', 'drying', 'dry_milling', 'final_grading'],
    required: true,
  },
  // Photo/Video Evidence
  media: [{
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Quality Metrics
  moistureLevel: {
    type: Number, // Percentage
    min: 0,
    max: 100,
  },
  temperature: {
    type: Number, // Celsius
  },
  // Defect Detection
  defects: [{
    type: {
      type: String,
      enum: ['mould', 'insect_damage', 'unripe', 'overripe', 'fermented', 'foreign_matter', 'broken', 'black', 'sour'],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    percentage: Number,
    detectedBy: {
      type: String,
      enum: ['manual', 'ai', 'expert'],
      default: 'manual',
    },
    confidence: Number, // For AI detection (0-100)
  }],
  // Fermentation Data
  fermentation: {
    duration: Number, // Hours
    method: {
      type: String,
      enum: ['dry', 'wet', 'honey', 'natural', 'washed'],
    },
    ph: Number,
    temperature: Number,
  },
  // Drying Data
  drying: {
    method: {
      type: String,
      enum: ['sun', 'mechanical', 'raised_beds', 'patio', 'greenhouse'],
    },
    durationHours: Number,
    turningFrequency: Number, // Times per day
    startMoisture: Number,
    endMoisture: Number,
    weatherConditions: String,
  },
  // Overall Quality Score
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    enum: ['AA', 'A', 'B', 'C', 'PB', 'reject'],
  },
  // Assessor Information
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessorRole: {
    type: String,
    enum: ['farmer', 'field_agent', 'quality_manager', 'cupper', 'admin'],
  },
  // Alerts & Recommendations
  alerts: [{
    type: {
      type: String,
      enum: ['moisture_high', 'moisture_low', 'mould_detected', 'defect_high', 'temperature_warning'],
    },
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  recommendations: [{
    type: String,
  }],
  notes: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
QualityAssessmentSchema.index({ lotId: 1, createdAt: -1 });
QualityAssessmentSchema.index({ farmerId: 1, createdAt: -1 });
QualityAssessmentSchema.index({ assessmentType: 1 });
QualityAssessmentSchema.index({ qualityScore: -1 });

export default mongoose.models.QualityAssessment || mongoose.model('QualityAssessment', QualityAssessmentSchema);
