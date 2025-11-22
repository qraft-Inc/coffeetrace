import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import TrainingContent from '@/models/TrainingContent';
import TrainingProgress from '@/models/TrainingProgress';
import QualityAssessment from '@/models/QualityAssessment';

/**
 * GET /api/training/recommendations
 * Get personalized training recommendations
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const language = searchParams.get('language') || 'en';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Recommendation algorithm
    const recommendations = [];

    // 1. Based on quality issues (highest priority)
    if (session.user.role === 'farmer') {
      const recentAssessments = await QualityAssessment.find({
        farmerId: session.user.id,
      })
        .sort({ assessmentDate: -1 })
        .limit(10)
        .lean();

      const issueFrequency = {};
      recentAssessments.forEach(assessment => {
        if (assessment.defects) {
          assessment.defects.forEach(defect => {
            issueFrequency[defect.defectType] = (issueFrequency[defect.defectType] || 0) + 1;
          });
        }
      });

      // Find content addressing frequent issues
      const topIssues = Object.entries(issueFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([issue]) => issue);

      if (topIssues.length > 0) {
        const issueBasedContent = await TrainingContent.find({
          addressesIssues: { $in: topIssues },
          isPublished: true,
        })
          .limit(5)
          .lean();

        recommendations.push(
          ...issueBasedContent.map(content => ({
            ...content,
            reason: 'addresses_quality_issue',
            priority: 1,
            issueAddressed: topIssues.find(issue => content.addressesIssues.includes(issue)),
          }))
        );
      }
    }

    // 2. Continue incomplete courses
    const inProgressContent = await TrainingProgress.find({
      userId: session.user.id,
      status: 'in_progress',
    })
      .populate('contentId')
      .sort({ lastAccessedAt: -1 })
      .limit(3)
      .lean();

    recommendations.push(
      ...inProgressContent.map(progress => ({
        ...progress.contentId,
        reason: 'continue_learning',
        priority: 2,
        progress: progress.progress,
      }))
    );

    // 3. Prerequisites for advanced content
    const completedContent = await TrainingProgress.find({
      userId: session.user.id,
      status: 'completed',
    })
      .select('contentId')
      .lean();

    const completedIds = completedContent.map(p => p.contentId.toString());

    const advancedContent = await TrainingContent.find({
      isPublished: true,
      difficulty: { $in: ['intermediate', 'advanced'] },
      prerequisites: { $in: completedIds },
      _id: { $nin: completedIds },
    })
      .limit(3)
      .lean();

    recommendations.push(
      ...advancedContent.map(content => ({
        ...content,
        reason: 'next_level',
        priority: 3,
      }))
    );

    // 4. Popular content not yet viewed
    const popularContent = await TrainingContent.find({
      isPublished: true,
      _id: { $nin: completedIds },
      views: { $gte: 100 },
    })
      .sort({ avgRating: -1, views: -1 })
      .limit(5)
      .lean();

    recommendations.push(
      ...popularContent.map(content => ({
        ...content,
        reason: 'popular',
        priority: 4,
      }))
    );

    // 5. Seasonal content (based on current month)
    const currentMonth = new Date().getMonth() + 1;
    let seasonalKeywords = [];
    
    if (currentMonth >= 3 && currentMonth <= 5) {
      seasonalKeywords = ['flowering', 'pruning', 'fertilization'];
    } else if (currentMonth >= 6 && currentMonth <= 9) {
      seasonalKeywords = ['harvesting', 'cherry_picking', 'quality_assessment'];
    } else if (currentMonth >= 10 && currentMonth <= 12) {
      seasonalKeywords = ['processing', 'drying', 'storage'];
    } else {
      seasonalKeywords = ['soil_preparation', 'planting', 'nursery'];
    }

    const seasonalContent = await TrainingContent.find({
      isPublished: true,
      _id: { $nin: completedIds },
      keywords: { $in: seasonalKeywords },
    })
      .limit(3)
      .lean();

    recommendations.push(
      ...seasonalContent.map(content => ({
        ...content,
        reason: 'seasonal',
        priority: 5,
      }))
    );

    // Remove duplicates and sort by priority
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item._id.toString(), item])).values()
    )
      .sort((a, b) => a.priority - b.priority)
      .slice(0, limit);

    // Format for language
    const formattedRecommendations = uniqueRecommendations.map(item => ({
      ...item,
      title: item.title?.get?.(language) || item.title?.get?.('en') || item.title,
      content: item.content?.get?.(language) || item.content?.get?.('en'),
      media: item.media?.filter(m => !m.language || m.language === language) || [],
    }));

    return NextResponse.json({ recommendations: formattedRecommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
