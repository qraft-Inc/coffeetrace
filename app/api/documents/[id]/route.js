import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../../lib/dbConnect';
import Document from '../../../../models/Document';
import Farmer from '../../../../models/Farmer';
import Buyer from '../../../../models/Buyer';
import AuditTrail from '../../../../models/AuditTrail';
import { authOptions } from '../../../../lib/authOptions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/[id]
 * Get a specific document
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await Document.findById(id)
      .populate('userId', 'name email role')
      .populate('verifiedBy', 'name email')
      .lean();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = document.userId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('GET /api/documents/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id]
 * Update document verification status (Admin only)
 */
export async function PATCH(request, { params }) {
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

    // Only admins can verify documents
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = params;
    const body = await request.json();

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update verification status
    const { verificationStatus, rejectionReason, notes } = body;

    document.verificationStatus = verificationStatus || document.verificationStatus;
    document.verifiedBy = session.user.id;
    document.verifiedAt = new Date();
    document.rejectionReason = rejectionReason || document.rejectionReason;
    document.notes = notes || document.notes;

    await document.save();

    // If approved, check if farmer/buyer should be verified
    if (verificationStatus === 'approved') {
      await autoVerifyEntity(document);
    }

    // Log action
    await AuditTrail.log({
      entityType: 'Document',
      entityId: document._id,
      action: verificationStatus === 'approved' ? 'verified' : 'rejected',
      actorId: session.user.id,
      description: `Document ${verificationStatus}: ${document.documentType}`,
    });

    return NextResponse.json({
      message: `Document ${verificationStatus} successfully`,
      document,
    });
  } catch (error) {
    console.error('PATCH /api/documents/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document
 */
export async function DELETE(request, { params }) {
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

    await dbConnect();
    const { id } = params;

    const document = await Document.findById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = document.userId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    await document.deleteOne();

    // Log deletion
    await AuditTrail.log({
      entityType: 'Document',
      entityId: document._id,
      action: 'deleted',
      actorId: session.user.id,
      description: `Document deleted: ${document.documentType}`,
    });

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/documents/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper: Auto-verify entity if required documents are approved
 */
async function autoVerifyEntity(document) {
  try {
    // Count approved documents for this entity
    const approvedCount = await Document.countDocuments({
      entityId: document.entityId,
      entityType: document.entityType,
      verificationStatus: 'approved',
    });

    // Minimum documents required (can be configurable)
    const MIN_DOCUMENTS = {
      farmer: 2, // e.g., ID + Land document
      buyer: 2,  // e.g., Business registration + ID
      cooperative: 2,
    };

    const required = MIN_DOCUMENTS[document.entityType] || 2;

    if (approvedCount >= required) {
      // Auto-verify the entity
      if (document.entityType === 'farmer') {
        await Farmer.findByIdAndUpdate(document.entityId, {
          isVerified: true,
          verifiedAt: new Date(),
        });
      } else if (document.entityType === 'buyer') {
        await Buyer.findByIdAndUpdate(document.entityId, {
          isVerified: true,
          verifiedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('Auto-verify entity error:', error);
  }
}
