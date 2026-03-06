import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stats
 * Get network statistics (user counts by role)
 */
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        investors: 0,
        farmers: 500,
        cooperatives: 0,
        buyers: 0,
      });
    }

    await dbConnect();

    // Get counts for each role
    const [investorCount, farmerCount, cooperativeCount, buyerCount] = await Promise.all([
      User.countDocuments({ role: 'investor' }),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'coopAdmin' }),
      User.countDocuments({ role: 'buyer' }),
    ]);

    return NextResponse.json({
      investors: investorCount,
      farmers: farmerCount,
      cooperatives: cooperativeCount,
      buyers: buyerCount,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    // Return defaults on error
    return NextResponse.json({
      investors: 0,
      farmers: 500,
      cooperatives: 0,
      buyers: 0,
    });
  }
}
