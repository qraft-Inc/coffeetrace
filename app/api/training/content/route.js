import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import TrainingContent from '@/models/TrainingContent';
import QualityAssessment from '@/models/QualityAssessment';

/**
 * GET /api/training/content
 * Fetch training content with filters
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const contentType = searchParams.get('type');
    const language = searchParams.get('language') || 'en';
    const search = searchParams.get('search');
    const recommended = searchParams.get('recommended') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    let query = { isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (contentType) query.contentType = contentType;
    if (search) {
      query.$or = [
        { keywords: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { [`title.${language}`]: { $regex: search, $options: 'i' } },
      ];
    }

    // Recommendation based on quality issues
    if (recommended && session.user.role === 'farmer') {
      const recentAssessments = await QualityAssessment.find({
        farmerId: session.user.id,
      })
        .sort({ assessmentDate: -1 })
        .limit(5)
        .lean();

      const detectedIssues = new Set();
      recentAssessments.forEach(assessment => {
        if (assessment.defects) {
          assessment.defects.forEach(defect => {
            detectedIssues.add(defect.defectType);
          });
        }
      });

      if (detectedIssues.size > 0) {
        query.addressesIssues = { $in: Array.from(detectedIssues) };
      }
    }

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      TrainingContent.find(query)
        .sort({ views: -1, avgRating: -1 })
        .skip(skip)
        .limit(limit)
        .select('-quiz') // Don't send quiz answers
        .lean(),
      TrainingContent.countDocuments(query),
    ]);

    // Format for language
    const formattedContent = content.map(item => ({
      ...item,
      title: item.title.get(language) || item.title.get('en') || item.title.values().next().value,
      content: item.content?.get(language) || item.content?.get('en'),
      media: item.media?.filter(m => !m.language || m.language === language) || [],
    }));

    return NextResponse.json({
      content: formattedContent,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching training content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training/content
 * Create new training content (admin only)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();

    const content = await TrainingContent.create({
      ...data,
      author: session.user.id,
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Error creating training content:', error);
    return NextResponse.json(
      { error: 'Failed to create training content' },
      { status: 500 }
    );
  }
}
