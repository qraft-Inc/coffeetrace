import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import ProcessingSOP from '@/models/ProcessingSOP';

/**
 * GET /api/processing-sops
 * Fetch processing SOPs with filters
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
    const processingMethod = searchParams.get('method');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language') || 'en';

    let query = { isActive: true };
    
    if (category) query.category = category;
    if (processingMethod) query.processingMethod = { $in: [processingMethod, 'all'] };
    if (difficulty) query.difficulty = difficulty;

    const sops = await ProcessingSOP.find(query)
      .sort({ category: 1, difficulty: 1 })
      .lean();

    // Filter content by language
    const filteredSOPs = sops.map(sop => {
      const langContent = sop.content.find(c => c.language === language);
      const fallbackContent = sop.content.find(c => c.language === 'en');
      
      return {
        ...sop,
        content: langContent || fallbackContent || sop.content[0],
        media: sop.media.filter(m => !m.language || m.language === language),
      };
    });

    return NextResponse.json({ sops: filteredSOPs });
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOPs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/processing-sops
 * Create a new SOP (admin only)
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
    
    const sop = await ProcessingSOP.create({
      ...data,
      createdBy: session.user.id,
    });

    return NextResponse.json({ sop }, { status: 201 });
  } catch (error) {
    console.error('Error creating SOP:', error);
    return NextResponse.json(
      { error: 'Failed to create SOP' },
      { status: 500 }
    );
  }
}
