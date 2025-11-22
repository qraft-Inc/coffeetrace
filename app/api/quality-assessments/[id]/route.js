import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import QualityAssessment from '@/models/QualityAssessment';

/**
 * GET /api/quality-assessments/[id]
 * Fetch a single quality assessment
 */
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const assessment = await QualityAssessment.findById(params.id)
      .populate('lotId', 'lotNumber weight coffeeType')
      .populate('farmerId', 'fullName location')
      .populate('assessor.userId', 'fullName email role')
      .lean();

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Farmers can only view their own assessments
    if (session.user.role === 'farmer' && assessment.farmerId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error fetching quality assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality assessment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/quality-assessments/[id]
 * Update a quality assessment
 */
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const assessment = await QualityAssessment.findById(params.id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Only the creator or admin can update
    if (
      session.user.role !== 'admin' &&
      assessment.assessor.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    
    // Update allowed fields
    const allowedUpdates = [
      'media',
      'moistureLevel',
      'temperature',
      'defects',
      'fermentation',
      'drying',
      'cupping',
      'notes',
      'location',
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        assessment[field] = updates[field];
      }
    });

    // Recalculate quality score if relevant fields changed
    if (updates.defects || updates.moistureLevel || updates.cupping) {
      let qualityScore = 100;
      
      if (assessment.defects && assessment.defects.length > 0) {
        assessment.defects.forEach(defect => {
          const deduction = {
            low: 2,
            medium: 5,
            high: 10,
            critical: 20,
          }[defect.severity] || 0;
          qualityScore -= deduction;
        });
      }

      if (assessment.moistureLevel) {
        if (assessment.moistureLevel < 10 || assessment.moistureLevel > 13) {
          qualityScore -= 10;
        } else if (assessment.moistureLevel < 11 || assessment.moistureLevel > 12) {
          qualityScore -= 5;
        }
      }

      if (assessment.cupping && assessment.cupping.totalScore) {
        qualityScore = assessment.cupping.totalScore;
      }

      assessment.qualityScore = Math.max(0, Math.min(100, qualityScore));

      // Update grade
      if (qualityScore >= 85) assessment.grade = 'AA';
      else if (qualityScore >= 80) assessment.grade = 'A';
      else if (qualityScore >= 75) assessment.grade = 'B';
      else if (qualityScore >= 70) assessment.grade = 'C';
      else if (qualityScore >= 65) assessment.grade = 'PB';
      else assessment.grade = 'reject';
    }

    await assessment.save();

    await assessment.populate([
      { path: 'lotId', select: 'lotNumber weight coffeeType' },
      { path: 'farmerId', select: 'fullName location' },
      { path: 'assessor.userId', select: 'fullName email' },
    ]);

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error updating quality assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update quality assessment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quality-assessments/[id]
 * Delete a quality assessment
 */
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete assessments
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const assessment = await QualityAssessment.findByIdAndDelete(params.id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality assessment:', error);
    return NextResponse.json(
      { error: 'Failed to delete quality assessment' },
      { status: 500 }
    );
  }
}
