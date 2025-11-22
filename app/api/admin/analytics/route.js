import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Lot from '@/models/Lot';
import Order from '@/models/Order';
import PaymentTransaction from '@/models/PaymentTransaction';
import QualityAssessment from '@/models/QualityAssessment';
import PickupRequest from '@/models/PickupRequest';
import Product from '@/models/Product';
import TrainingProgress from '@/models/TrainingProgress';

/**
 * GET /api/admin/analytics
 * Comprehensive platform analytics
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
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')) 
      : new Date();

    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // 1. Supply Chain Metrics
    const [totalLots, pendingLots, qualityAssessments, avgQualityScore] = await Promise.all([
      Lot.countDocuments(dateFilter),
      Lot.countDocuments({ ...dateFilter, status: { $in: ['pending', 'in_transit'] } }),
      QualityAssessment.countDocuments(dateFilter),
      QualityAssessment.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
      ]),
    ]);

    // Lot distribution by status
    const lotsByStatus = await Lot.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Total weight processed
    const totalWeight = await Lot.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, totalKg: { $sum: '$weight' } } },
    ]);

    // 2. Quality Metrics
    const [gradeDistribution, defectAnalysis] = await Promise.all([
      QualityAssessment.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$grade', count: { $sum: 1 } } },
      ]),
      QualityAssessment.aggregate([
        { $match: dateFilter },
        { $unwind: '$defects' },
        { $group: { _id: '$defects.defectType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // 3. Financial Metrics
    const [totalTransactions, pendingPayments, completedPayments] = await Promise.all([
      PaymentTransaction.aggregate([
        { $match: dateFilter },
        { $group: { 
          _id: null, 
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        }},
      ]),
      PaymentTransaction.aggregate([
        { $match: { ...dateFilter, status: 'pending' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
      PaymentTransaction.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    // Revenue by payment type
    const revenueByType = await PaymentTransaction.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$paymentType', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // 4. Logistics Metrics
    const [totalPickups, pickupsByStatus, avgDeliveryTime] = await Promise.all([
      PickupRequest.countDocuments(dateFilter),
      PickupRequest.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      PickupRequest.aggregate([
        { $match: { ...dateFilter, status: 'completed', pickupDate: { $exists: true }, completedAt: { $exists: true } } },
        { $project: {
          deliveryTime: { 
            $divide: [
              { $subtract: ['$completedAt', '$pickupDate'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }},
        { $group: { _id: null, avgTime: { $avg: '$deliveryTime' } } },
      ]),
    ]);

    // 5. Farmer Activity Metrics
    const [activeFarmers, newFarmers, farmerEngagement] = await Promise.all([
      User.countDocuments({ role: 'farmer', isActive: true }),
      User.countDocuments({ role: 'farmer', ...dateFilter }),
      User.aggregate([
        { $match: { role: 'farmer' } },
        {
          $lookup: {
            from: 'lots',
            localField: '_id',
            foreignField: 'farmerId',
            as: 'lots',
          },
        },
        {
          $project: {
            name: 1,
            lotCount: { $size: '$lots' },
            lastLot: { $max: '$lots.createdAt' },
          },
        },
        { $sort: { lotCount: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // 6. Buyer Activity Metrics
    const [activeBuyers, totalOrders, ordersByStatus] = await Promise.all([
      User.countDocuments({ role: 'buyer', isActive: true }),
      Order.countDocuments(dateFilter),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$orderStatus', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
      ]),
    ]);

    // Top buyers by volume
    const topBuyers = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$buyerId', totalAmount: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      { $project: { name: '$buyer.name', companyName: '$buyer.companyName', totalAmount: 1, orders: 1 } },
    ]);

    // 7. Marketplace Metrics
    const [totalProducts, activeProducts, marketplaceOrders, topProducts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ ...dateFilter, orderStatus: { $ne: 'cancelled' } }),
      Product.aggregate([
        { $sort: { totalSales: -1 } },
        { $limit: 10 },
        { $project: { name: 1, totalSales: 1, 'ratings.average': 1, price: 1 } },
      ]),
    ]);

    // 8. Training & Engagement Metrics
    const [totalTrainingUsers, avgCompletionRate, popularContent] = await Promise.all([
      TrainingProgress.distinct('userId').then(ids => ids.length),
      TrainingProgress.aggregate([
        { $group: { _id: '$userId', completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, total: { $sum: 1 } } },
        { $project: { completionRate: { $multiply: [{ $divide: ['$completed', '$total'] }, 100] } } },
        { $group: { _id: null, avgRate: { $avg: '$completionRate' } } },
      ]),
      TrainingProgress.aggregate([
        { $group: { _id: '$contentId', completions: { $sum: 1 } } },
        { $sort: { completions: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'trainingcontents',
            localField: '_id',
            foreignField: '_id',
            as: 'content',
          },
        },
        { $unwind: '$content' },
        { $project: { title: '$content.title', completions: 1 } },
      ]),
    ]);

    // Compile analytics
    const analytics = {
      dateRange: { startDate, endDate },
      supplyChain: {
        totalLots,
        pendingLots,
        totalWeight: totalWeight[0]?.totalKg || 0,
        qualityAssessments,
        avgQualityScore: avgQualityScore[0]?.avgScore || 0,
        lotsByStatus,
      },
      quality: {
        gradeDistribution,
        defectAnalysis,
        avgQualityScore: avgQualityScore[0]?.avgScore || 0,
      },
      finance: {
        totalRevenue: totalTransactions[0]?.totalAmount || 0,
        totalTransactions: totalTransactions[0]?.count || 0,
        pendingPayments: pendingPayments[0]?.totalAmount || 0,
        completedPayments: completedPayments[0]?.totalAmount || 0,
        revenueByType,
      },
      logistics: {
        totalPickups,
        pickupsByStatus,
        avgDeliveryTime: avgDeliveryTime[0]?.avgTime || 0,
      },
      farmers: {
        activeFarmers,
        newFarmers,
        topFarmers: farmerEngagement,
      },
      buyers: {
        activeBuyers,
        totalOrders,
        ordersByStatus,
        topBuyers,
      },
      marketplace: {
        totalProducts,
        activeProducts,
        marketplaceOrders,
        topProducts,
      },
      training: {
        totalTrainingUsers,
        avgCompletionRate: avgCompletionRate[0]?.avgRate || 0,
        popularContent,
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
