import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Document from '../../../models/Document';
import Farmer from '../../../models/Farmer';
import Buyer from '../../../models/Buyer';
import AuditTrail from '../../../models/AuditTrail';
import { authOptions } from '../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents
 * List documents with filtering
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = searchParams.get('userId');
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType');
    const documentType = searchParams.get('documentType');
    const verificationStatus = searchParams.get('verificationStatus');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Non-admins can only see their own documents
    if (session.user.role !== 'admin') {
      query.userId = session.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (entityId) query.entityId = entityId;
    if (entityType) query.entityType = entityType;
    if (documentType) query.documentType = documentType;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    // Execute query
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('userId', 'name email role')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(query),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Upload a new document
 */
export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await dbConnect();

    // Validate required fields
    const { entityType, entityId, documentType, fileName, fileUrl } = body;
    if (!entityType || !entityId || !documentType || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, documentType, fileName, fileUrl' },
        { status: 400 }
      );
    }

    // Verify entity exists
    let entity;
    if (entityType === 'farmer') {
      entity = await Farmer.findById(entityId);
    } else if (entityType === 'buyer') {
      entity = await Buyer.findById(entityId);
    }

    if (!entity) {
      return NextResponse.json(
        { error: `${entityType} not found` },
        { status: 404 }
      );
    }

    // Create document record
    const document = new Document({
      userId: session.user.id,
      entityType,
      entityId,
      documentType,
      fileName,
      fileUrl,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      documentNumber: body.documentNumber,
      issuedDate: body.issuedDate,
      expiryDate: body.expiryDate,
      notes: body.notes,
      verificationStatus: 'pending',
    });

    await document.save();

    // Log creation
    await AuditTrail.log({
      entityType: 'Document',
      entityId: document._id,
      action: 'uploaded',
      actorId: session.user.id,
      description: `Document uploaded: ${documentType} for ${entityType}`,
    });

    return NextResponse.json(
      { message: 'Document uploaded successfully', document },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/documents error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error.message },
      { status: 500 }
    );
  }
}
