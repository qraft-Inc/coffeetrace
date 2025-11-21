import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import TrainingProgress from '@/models/TrainingProgress';
import TrainingContent from '@/models/TrainingContent';

/**
 * GET /api/training/progress
 * Fetch user's training progress
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');
    const status = searchParams.get('status');

    let query = { userId: session.user.id };
    if (contentId) query.contentId = contentId;
    if (status) query.status = status;

    const progress = await TrainingProgress.find(query)
      .populate('contentId', 'title category difficulty estimatedDuration')
      .sort({ lastAccessedAt: -1 })
      .lean();

    // Calculate completion rate
    const completionRate = await TrainingProgress.getUserCompletionRate(session.user.id);

    return NextResponse.json({
      progress,
      completionRate,
      stats: {
        total: progress.length,
        completed: progress.filter(p => p.status === 'completed').length,
        inProgress: progress.filter(p => p.status === 'in_progress').length,
        totalTime: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching training progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training progress' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training/progress
 * Update training progress
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { contentId, progress: progressValue, status, timeSpent, rating, feedback, quizResult } = await req.json();

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    // Find or create progress record
    let progress = await TrainingProgress.findOne({
      userId: session.user.id,
      contentId,
    });

    if (!progress) {
      progress = new TrainingProgress({
        userId: session.user.id,
        contentId,
        startedAt: new Date(),
      });
    }

    // Update fields
    if (progressValue !== undefined) progress.progress = progressValue;
    if (status) progress.status = status;
    if (timeSpent) progress.timeSpent += timeSpent;
    if (rating) progress.rating = rating;
    if (feedback) progress.feedback = feedback;

    // Handle quiz submission
    if (quizResult) {
      const passed = quizResult.score >= (quizResult.passingScore || 70);
      progress.quizAttempts.push({
        ...quizResult,
        passed,
        attemptedAt: new Date(),
      });

      if (!progress.bestScore || quizResult.score > progress.bestScore) {
        progress.bestScore = quizResult.score;
      }

      // Update content stats
      const content = await TrainingContent.findById(contentId);
      if (content && rating) {
        content.totalRatings += 1;
        content.avgRating = ((content.avgRating * (content.totalRatings - 1)) + rating) / content.totalRatings;
        await content.save();
      }
    }

    // Mark as completed if progress is 100%
    if (progressValue === 100 && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();

      // Update content completion count
      await TrainingContent.findByIdAndUpdate(contentId, {
        $inc: { completions: 1 },
      });
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    // Increment view count
    await TrainingContent.findByIdAndUpdate(contentId, {
      $inc: { views: 1 },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating training progress:', error);
    return NextResponse.json(
      { error: 'Failed to update training progress' },
      { status: 500 }
    );
  }
}
