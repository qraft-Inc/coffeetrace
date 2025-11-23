import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import PaymentTransaction from '@/models/PaymentTransaction';
import Tip from '@/models/Tip';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/financial-overview
 * Get comprehensive financial overview for admin dashboard
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')) 
      : new Date(0); // All time by default
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')) 
      : new Date();

    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // 1. Total Sales Revenue (from PaymentTransactions)
    const salesRevenue = await PaymentTransaction.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$totalAmount' },
          totalNet: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 },
          avgTransactionAmount: { $avg: '$netAmount' },
        },
      },
    ]);

    // 2. Total Tips (from Tip model)
    const tipsRevenue = await Tip.aggregate([
      {
        $match: {
          status: 'confirmed',
          payment_confirmed_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$gross_amount' },
          totalNet: { $sum: '$net_amount' },
          totalFees: { $sum: '$platform_fee' },
          tipCount: { $sum: 1 },
        },
      },
    ]);

    // 3. All Transactions (from Transaction model if exists)
    const allTransactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    // 4. Revenue by Farmer (Top 10)
    const revenueByFarmer = await PaymentTransaction.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$farmerId',
          totalRevenue: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'farmerProfile',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer',
        },
      },
      {
        $project: {
          farmerId: '$_id',
          farmerName: { $arrayElemAt: ['$user.name', 0] },
          farmName: { $arrayElemAt: ['$farmer.farmName', 0] },
          totalRevenue: 1,
          transactionCount: 1,
        },
      },
    ]);

    // 5. Tips by Farmer (Top 10)
    const tipsByFarmer = await Tip.aggregate([
      {
        $match: {
          status: 'confirmed',
          payment_confirmed_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$farmerId',
          totalTips: { $sum: '$net_amount' },
          tipCount: { $sum: 1 },
        },
      },
      { $sort: { totalTips: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'farmerProfile',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer',
        },
      },
      {
        $project: {
          farmerId: '$_id',
          farmerName: { $arrayElemAt: ['$user.name', 0] },
          farmName: { $arrayElemAt: ['$farmer.farmName', 0] },
          totalTips: 1,
          tipCount: 1,
        },
      },
    ]);

    // 6. Revenue Timeline (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueTimeline = await PaymentTransaction.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$netAmount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 7. Platform Fees Collected
    const platformFees = await Tip.aggregate([
      {
        $match: {
          status: 'confirmed',
          payment_confirmed_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalPlatformFees: { $sum: '$platform_fee' },
        },
      },
    ]);

    // 8. Payment Methods Distribution
    const paymentMethods = await PaymentTransaction.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    const sales = salesRevenue[0] || {
      totalGross: 0,
      totalNet: 0,
      transactionCount: 0,
      avgTransactionAmount: 0,
    };

    const tips = tipsRevenue[0] || {
      totalGross: 0,
      totalNet: 0,
      totalFees: 0,
      tipCount: 0,
    };

    return NextResponse.json({
      overview: {
        totalSalesRevenue: sales.totalNet,
        totalTips: tips.totalNet,
        totalTransactions: sales.transactionCount + tips.tipCount,
        totalGrossRevenue: sales.totalGross + tips.totalGross,
        totalPlatformFees: tips.totalFees + (platformFees[0]?.totalPlatformFees || 0),
        avgTransactionAmount: sales.avgTransactionAmount,
      },
      sales: {
        totalGross: sales.totalGross,
        totalNet: sales.totalNet,
        transactionCount: sales.transactionCount,
        avgAmount: sales.avgTransactionAmount,
      },
      tips: {
        totalGross: tips.totalGross,
        totalNet: tips.totalNet,
        totalFees: tips.totalFees,
        tipCount: tips.tipCount,
      },
      topFarmers: {
        byRevenue: revenueByFarmer,
        byTips: tipsByFarmer,
      },
      timeline: revenueTimeline,
      paymentMethods,
      transactionsByStatus: allTransactions,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Failed to fetch financial overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial overview', details: error.message },
      { status: 500 }
    );
  }
}
