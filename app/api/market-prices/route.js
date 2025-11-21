import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import MarketPrice from '../../../models/MarketPrice';

export const dynamic = 'force-dynamic';

/**
 * GET /api/market-prices
 * Get coffee market prices and trends
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const coffeeType = searchParams.get('coffeeType');
    const market = searchParams.get('market');
    const days = parseInt(searchParams.get('days') || '30');

    const query = {};
    if (coffeeType) query.coffeeType = coffeeType;
    if (market) query.market = market;

    // Get prices from last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.date = { $gte: startDate };

    const prices = await MarketPrice.find(query)
      .sort({ date: -1 })
      .lean();

    // Get latest price for each type
    const latestPrices = await MarketPrice.aggregate([
      { $sort: { date: -1 } },
      {
        $group: {
          _id: { coffeeType: '$coffeeType', market: '$market' },
          latestPrice: { $first: '$pricePerKg' },
          latestDate: { $first: '$date' },
          priceChange: { $first: '$priceChange' },
          currency: { $first: '$currency' },
        },
      },
    ]);

    // Calculate average prices
    const avgPrices = await MarketPrice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$coffeeType',
          avgPrice: { $avg: '$pricePerKg' },
          minPrice: { $min: '$pricePerKg' },
          maxPrice: { $max: '$pricePerKg' },
        },
      },
    ]);

    return NextResponse.json({
      prices,
      latestPrices,
      avgPrices,
      period: `Last ${days} days`,
    });
  } catch (error) {
    console.error('GET /api/market-prices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market prices', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/market-prices
 * Add market price data (Admin only)
 */
export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    await dbConnect();

    const { coffeeType, pricePerKg, market, country, source } = body;

    if (!coffeeType || !pricePerKg || !market || !country || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate price change from previous day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const previousPrice = await MarketPrice.findOne({
      coffeeType,
      market,
      date: { $gte: yesterday },
    }).sort({ date: -1 });

    let priceChange = 0;
    if (previousPrice) {
      priceChange = ((pricePerKg - previousPrice.pricePerKg) / previousPrice.pricePerKg) * 100;
    }

    const marketPrice = new MarketPrice({
      ...body,
      priceChange,
    });

    await marketPrice.save();

    return NextResponse.json(
      { message: 'Market price added successfully', marketPrice },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/market-prices error:', error);
    return NextResponse.json(
      { error: 'Failed to add market price', details: error.message },
      { status: 500 }
    );
  }
}
