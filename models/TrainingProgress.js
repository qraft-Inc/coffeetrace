import mongoose from 'mongoose';

/**
 * Training Progress Schema
 * Tracks user progress through training content
 */
const TrainingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingContent',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  // Time Tracking
  timeSpent: {
    type: Number, // seconds
    default: 0,
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  // Quiz Results
  quizAttempts: [{
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    answers: [Number],
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    passed: Boolean,
  }],
  bestScore: Number,
  // Engagement
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  feedback: String,
  bookmarked: {
    type: Boolean,
    default: false,
  },
  notes: String,
  // Certificates
  certificateIssued: Boolean,
  certificateUrl: String,
  certificateIssuedAt: Date,
}, {
  timestamps: true,
});

// Compound indexes
TrainingProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });
TrainingProgressSchema.index({ userId: 1, status: 1 });
TrainingProgressSchema.index({ contentId: 1 });

// Method to calculate completion rate for a user
TrainingProgressSchema.statics.getUserCompletionRate = async function(userId) {
  const progress = await this.find({ userId });
  if (progress.length === 0) return 0;
  
  const completed = progress.filter(p => p.status === 'completed').length;
  return Math.round((completed / progress.length) * 100);
};

export default mongoose.models.TrainingProgress || mongoose.model('TrainingProgress', TrainingProgressSchema);
