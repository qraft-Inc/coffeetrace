import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { TrainingModule } from '@/models/Training';

/**
 * GET /api/training/modules
 * Fetch training modules
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
    const level = searchParams.get('level');
    const language = searchParams.get('language');

    let query = { isPublished: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;

    // Admins can see unpublished modules
    if (session.user.role === 'admin' || session.user.role === 'coopAdmin') {
      delete query.isPublished;
    }

    const modules = await TrainingModule.find(query)
      .select('-content -quiz') // Exclude full content in list
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Error fetching training modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training modules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training/modules
 * Create training module (admin only)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    
    const module = await TrainingModule.create({
      ...data,
      createdBy: session.user.id,
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error('Error creating training module:', error);
    return NextResponse.json(
      { error: 'Failed to create training module' },
      { status: 500 }
    );
  }
}
