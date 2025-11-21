import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

/**
 * GET /api/marketplace/seasonal-products
 * Get seasonal product recommendations
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const currentMonth = new Date().getMonth() + 1;

    // Seasonal recommendations based on coffee farming cycle
    let categories = [];
    let keywords = [];

    if (currentMonth >= 1 && currentMonth <= 3) {
      // January-March: Pruning, fertilization
      categories = ['fertilizers', 'tools'];
      keywords = ['pruning', 'NPK', 'foliar'];
    } else if (currentMonth >= 4 && currentMonth <= 6) {
      // April-June: Weeding, pest control
      categories = ['pesticides', 'tools'];
      keywords = ['herbicide', 'fungicide', 'weeding'];
    } else if (currentMonth >= 7 && currentMonth <= 9) {
      // July-September: Pre-harvest, quality prep
      categories = ['tools', 'equipment', 'packaging'];
      keywords = ['harvesting', 'picking', 'baskets'];
    } else {
      // October-December: Harvest season
      categories = ['equipment', 'packaging', 'tools'];
      keywords = ['processing', 'drying', 'storage'];
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { category: { $in: categories } },
        { 'seasonalAvailability': { 
          $elemMatch: { 
            month: currentMonth, 
            available: true 
          } 
        }},
      ],
    })
      .sort({ 'ratings.average': -1, totalSales: -1 })
      .limit(20)
      .lean();

    // Calculate seasonal pricing
    const productsWithSeasonalPricing = products.map(product => {
      const seasonalData = product.seasonalAvailability?.find(
        s => s.month === currentMonth
      );
      
      let adjustedPrice = product.price;
      if (seasonalData && seasonalData.priceAdjustment) {
        adjustedPrice = product.price * (1 + seasonalData.priceAdjustment / 100);
      }

      return {
        ...product,
        originalPrice: product.price,
        currentPrice: adjustedPrice,
        priceAdjustment: seasonalData?.priceAdjustment || 0,
        seasonal: !!seasonalData,
      };
    });

    return NextResponse.json({
      products: productsWithSeasonalPricing,
      season: getSeason(currentMonth),
      recommendations: keywords,
    });
  } catch (error) {
    console.error('Error fetching seasonal products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal products' },
      { status: 500 }
    );
  }
}

function getSeason(month) {
  if (month >= 1 && month <= 3) return 'Pruning & Fertilization';
  if (month >= 4 && month <= 6) return 'Weeding & Pest Control';
  if (month >= 7 && month <= 9) return 'Pre-Harvest Preparation';
  return 'Harvest Season';
}
