import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';
import Order from '@/models/Order';
import PaymentTransaction from '@/models/PaymentTransaction';
import QualityAssessment from '@/models/QualityAssessment';
import User from '@/models/User';

/**
 * GET /api/admin/analytics/export
 * Export analytics data as CSV/PDF
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv'; // csv or json
    const reportType = searchParams.get('type') || 'summary'; // summary, quality, finance, logistics
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')) 
      : new Date();

    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    let data = [];
    let headers = [];

    switch (reportType) {
      case 'quality':
        // Quality assessments export
        const assessments = await QualityAssessment.find(dateFilter)
          .populate('farmerId', 'name farmName')
          .populate('lotId', 'lotNumber')
          .lean();

        headers = [
          'Date',
          'Farmer',
          'Lot Number',
          'Overall Score',
          'Grade',
          'Moisture',
          'Defects',
          'Assessor',
        ];

        data = assessments.map(a => [
          new Date(a.assessmentDate).toLocaleDateString(),
          a.farmerId?.name || a.farmerId?.farmName || 'Unknown',
          a.lotId?.lotNumber || 'N/A',
          a.overallScore || 0,
          a.grade || 'N/A',
          a.moistureContent || 0,
          a.defects?.length || 0,
          a.assessor || 'N/A',
        ]);
        break;

      case 'finance':
        // Financial transactions export
        const transactions = await PaymentTransaction.find(dateFilter)
          .populate('farmerId', 'name farmName')
          .lean();

        headers = [
          'Date',
          'Transaction ID',
          'Farmer',
          'Amount',
          'Type',
          'Status',
          'Method',
        ];

        data = transactions.map(t => [
          new Date(t.createdAt).toLocaleDateString(),
          t.transactionId,
          t.farmerId?.name || t.farmerId?.farmName || 'Unknown',
          t.amount,
          t.paymentType,
          t.status,
          t.paymentMethod,
        ]);
        break;

      case 'logistics':
        // Logistics/pickup requests export
        const PickupRequest = (await import('@/models/PickupRequest')).default;
        const pickups = await PickupRequest.find(dateFilter)
          .populate('farmerId', 'name farmName')
          .populate('assignedAgent', 'name')
          .lean();

        headers = [
          'Date',
          'Farmer',
          'Weight (kg)',
          'District',
          'Status',
          'Assigned Agent',
          'Pickup Date',
          'Completed Date',
        ];

        data = pickups.map(p => [
          new Date(p.createdAt).toLocaleDateString(),
          p.farmerId?.name || p.farmerId?.farmName || 'Unknown',
          p.estimatedWeight || 0,
          p.location?.district || 'N/A',
          p.status,
          p.assignedAgent?.name || 'Unassigned',
          p.pickupDate ? new Date(p.pickupDate).toLocaleDateString() : 'Not scheduled',
          p.completedAt ? new Date(p.completedAt).toLocaleDateString() : 'Not completed',
        ]);
        break;

      case 'farmers':
        // Farmer performance export
        const farmers = await User.find({ role: 'farmer' }).lean();
        const farmerStats = await Promise.all(
          farmers.map(async (farmer) => {
            const [lots, payments, avgQuality] = await Promise.all([
              Lot.countDocuments({ farmerId: farmer._id, ...dateFilter }),
              PaymentTransaction.aggregate([
                { $match: { farmerId: farmer._id, ...dateFilter, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
              ]),
              QualityAssessment.aggregate([
                { $match: { farmerId: farmer._id, ...dateFilter } },
                { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
              ]),
            ]);

            return {
              name: farmer.name || farmer.farmName,
              phone: farmer.phone,
              district: farmer.location?.district || 'N/A',
              lots,
              totalPayments: payments[0]?.total || 0,
              avgQuality: avgQuality[0]?.avgScore || 0,
              joinDate: new Date(farmer.createdAt).toLocaleDateString(),
            };
          })
        );

        headers = [
          'Name',
          'Phone',
          'District',
          'Total Lots',
          'Total Payments',
          'Avg Quality Score',
          'Join Date',
        ];

        data = farmerStats.map(f => [
          f.name,
          f.phone,
          f.district,
          f.lots,
          f.totalPayments,
          f.avgQuality.toFixed(2),
          f.joinDate,
        ]);
        break;

      default:
        // Summary export
        const [totalLots, totalRevenue, avgQuality, activeFarmers] = await Promise.all([
          Lot.countDocuments(dateFilter),
          PaymentTransaction.aggregate([
            { $match: { ...dateFilter, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          QualityAssessment.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
          ]),
          User.countDocuments({ role: 'farmer', isActive: true }),
        ]);

        headers = ['Metric', 'Value'];
        data = [
          ['Total Lots', totalLots],
          ['Total Revenue (UGX)', totalRevenue[0]?.total || 0],
          ['Average Quality Score', (avgQuality[0]?.avgScore || 0).toFixed(2)],
          ['Active Farmers', activeFarmers],
          ['Report Period', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
        ];
    }

    if (format === 'csv') {
      // Generate CSV
      const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="coffeetrace-${reportType}-${Date.now()}.csv"`,
        },
      });
    } else {
      // Return JSON
      return NextResponse.json({
        headers,
        data,
        metadata: {
          reportType,
          startDate,
          endDate,
          generatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
