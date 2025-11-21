import mongoose from 'mongoose';

/**
 * ProcessingSOP Schema
 * Standard Operating Procedures for coffee processing
 */
const ProcessingSOPSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    enum: ['harvesting', 'sorting', 'washing', 'fermentation', 'drying', 'hulling', 'grading', 'storage', 'quality_control'],
    required: true,
  },
  processingMethod: {
    type: String,
    enum: ['washed', 'natural', 'honey', 'wet_hulled', 'all'],
    default: 'all',
  },
  // Multi-language support
  content: [{
    language: {
      type: String,
      required: true,
      default: 'en',
    },
    description: String,
    steps: [{
      stepNumber: Number,
      title: String,
      description: String,
      duration: String,
      tips: [String],
    }],
  }],
  // Media Resources
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'pdf'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: String,
    language: String,
    duration: Number, // For audio/video (seconds)
  }],
  // Key Parameters
  idealConditions: {
    moistureRange: {
      min: Number,
      max: Number,
    },
    temperatureRange: {
      min: Number,
      max: Number,
    },
    duration: String,
    equipment: [String],
  },
  // Quality Indicators
  qualityChecks: [{
    checkpoint: String,
    expectedOutcome: String,
    commonIssues: [String],
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  estimatedTime: String,
  tools: [String],
  // Offline Support
  isOfflineAvailable: {
    type: Boolean,
    default: false,
  },
  downloadSize: Number, // MB
  // Engagement Metrics
  views: {
    type: Number,
    default: 0,
  },
  completions: {
    type: Number,
    default: 0,
  },
  avgRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

ProcessingSOPSchema.index({ category: 1 });
ProcessingSOPSchema.index({ processingMethod: 1 });
ProcessingSOPSchema.index({ slug: 1 });
ProcessingSOPSchema.index({ isActive: 1 });

export default mongoose.models.ProcessingSOP || mongoose.model('ProcessingSOP', ProcessingSOPSchema);
