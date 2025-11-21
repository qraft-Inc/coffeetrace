import mongoose from 'mongoose';

/**
 * Training Content Schema
 * Educational materials for farmers (videos, articles, audio)
 */
const TrainingContentSchema = new mongoose.Schema({
  title: {
    type: Map,
    of: String, // { en: 'Title', sw: 'Kichwa', rw: 'Umutwe' }
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'agronomy',
      'pest_management',
      'soil_health',
      'harvesting',
      'post_harvest',
      'quality_control',
      'climate_adaptation',
      'business_skills',
      'certification',
      'sustainability',
    ],
    required: true,
  },
  subcategory: String,
  contentType: {
    type: String,
    enum: ['video', 'audio', 'article', 'infographic', 'quiz', 'interactive'],
    required: true,
  },
  // Multi-language content
  content: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    // { en: { text: '...', url: '...' }, sw: {...}, rw: {...} }
  },
  // Media URLs
  media: [{
    language: String,
    type: {
      type: String,
      enum: ['video', 'audio', 'image', 'pdf', 'document'],
    },
    url: String,
    duration: Number, // seconds for video/audio
    size: Number, // bytes
    thumbnail: String,
    transcript: String,
    subtitles: String, // VTT file URL
  }],
  // Difficulty & Duration
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  estimatedDuration: {
    type: Number, // minutes
    required: true,
  },
  // Related Content
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingContent',
  }],
  relatedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingContent',
  }],
  // Keywords & Tags
  keywords: [String],
  tags: [String],
  // Quality Issues (for recommendations)
  addressesIssues: [{
    type: String,
    enum: [
      'mould',
      'insect_damage',
      'unripe',
      'overripe',
      'fermented',
      'foreign_matter',
      'broken',
      'black',
      'sour',
      'low_yield',
      'poor_quality',
      'moisture_issues',
    ],
  }],
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
  totalRatings: {
    type: Number,
    default: 0,
  },
  // Offline Support
  isOfflineAvailable: {
    type: Boolean,
    default: false,
  },
  downloadSize: Number, // MB
  // Quiz/Assessment
  quiz: {
    questions: [{
      question: {
        type: Map,
        of: String,
      },
      options: [{
        type: Map,
        of: String,
      }],
      correctAnswer: Number,
      explanation: {
        type: Map,
        of: String,
      },
    }],
    passingScore: {
      type: Number,
      default: 70,
    },
  },
  // Status
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  author: {
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

// Indexes
TrainingContentSchema.index({ category: 1, difficulty: 1 });
TrainingContentSchema.index({ slug: 1 });
TrainingContentSchema.index({ isPublished: 1 });
TrainingContentSchema.index({ keywords: 1 });
TrainingContentSchema.index({ addressesIssues: 1 });

export default mongoose.models.TrainingContent || mongoose.model('TrainingContent', TrainingContentSchema);
