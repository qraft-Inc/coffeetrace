import mongoose from 'mongoose';

/**
 * Training Module Schema
 * Tracks courses and progress
 */
const TrainingModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: [
      'agronomy',
      'pest_control',
      'soil_management',
      'harvesting',
      'post_harvest',
      'quality_control',
      'sustainability',
      'business_management',
      'climate_adaptation',
      'processing',
      'certification',
      'other',
    ],
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  language: {
    type: String,
    default: 'en',
  },
  duration: Number, // minutes
  content: {
    type: String, // Markdown or HTML content
  },
  videoUrl: String,
  thumbnailUrl: String,
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'image', 'audio'],
    },
    url: String,
    size: Number,
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
  }],
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [String],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule',
  }],
  enrollmentCount: {
    type: Number,
    default: 0,
  },
  completionCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

/**
 * Training Progress Schema
 * Tracks individual farmer progress
 */
const TrainingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: Date,
  timeSpent: {
    type: Number,
    default: 0, // minutes
  },
  quizAttempts: [{
    attemptNumber: Number,
    score: Number,
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean,
    }],
    completedAt: Date,
  }],
  bestScore: {
    type: Number,
    default: 0,
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  certificateUrl: String,
  certificateIssuedAt: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
  notes: String,
}, {
  timestamps: true,
});

// Indexes
TrainingModuleSchema.index({ category: 1, isPublished: 1 });
TrainingModuleSchema.index({ level: 1 });
TrainingModuleSchema.index({ tags: 1 });
TrainingModuleSchema.index({ createdAt: -1 });

TrainingProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
TrainingProgressSchema.index({ userId: 1, status: 1 });
TrainingProgressSchema.index({ moduleId: 1 });

export const TrainingModule = mongoose.models.TrainingModule || mongoose.model('TrainingModule', TrainingModuleSchema);
export const TrainingProgress = mongoose.models.TrainingProgress || mongoose.model('TrainingProgress', TrainingProgressSchema);
