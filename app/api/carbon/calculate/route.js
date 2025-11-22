import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Lot from '@/models/Lot';

/**
 * POST /api/carbon/calculate
 * Calculate carbon footprint for a coffee lot
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { lotId, data } = await req.json();

    if (!lotId) {
      return NextResponse.json({ error: 'Lot ID required' }, { status: 400 });
    }

    const lot = await Lot.findById(lotId);
    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Carbon calculation methodology (simplified)
    // Based on ICO/SCA carbon footprint standards for coffee production
    
    const {
      farmSize = 1, // hectares
      fertilizers = 0, // kg
      pesticides = 0, // kg
      fuelUsed = 0, // liters (processing)
      electricityUsed = 0, // kWh (processing)
      waterUsed = 0, // liters
      transportDistance = 0, // km to collection point
      processingMethod = 'washed', // washed, natural, honey
    } = data || {};

    // Emission factors (kg CO2e per unit)
    const emissionFactors = {
      fertilizer: 5.5, // per kg
      pesticide: 10.0, // per kg
      diesel: 2.68, // per liter
      electricity: 0.5, // per kWh
      water: 0.0003, // per liter
      transport: 0.15, // per km (truck)
    };

    // Processing method multipliers
    const processingMultipliers = {
      natural: 0.8, // Less water/energy
      honey: 0.9,
      washed: 1.0,
      'wet-hulled': 1.1,
    };

    // Calculate component emissions
    const emissions = {
      farming: {
        fertilizers: fertilizers * emissionFactors.fertilizer,
        pesticides: pesticides * emissionFactors.pesticide,
        landUse: farmSize * 100, // Base land use emission
      },
      processing: {
        fuel: fuelUsed * emissionFactors.diesel,
        electricity: electricityUsed * emissionFactors.electricity,
        water: waterUsed * emissionFactors.water,
      },
      transport: transportDistance * emissionFactors.transport,
    };

    // Calculate totals
    const totalFarming = Object.values(emissions.farming).reduce((a, b) => a + b, 0);
    const totalProcessing = Object.values(emissions.processing).reduce((a, b) => a + b, 0);
    const totalTransport = emissions.transport;

    const processingMultiplier = processingMultipliers[processingMethod] || 1.0;
    
    const totalEmissions = (totalFarming + (totalProcessing * processingMultiplier) + totalTransport);
    const perKgEmissions = lot.quantityKg > 0 ? totalEmissions / lot.quantityKg : 0;

    // Carbon sequestration credit (shade trees, etc.)
    const sequestration = farmSize * 50; // Approximate annual sequestration per hectare
    const netEmissions = Math.max(0, totalEmissions - sequestration);
    const netPerKg = lot.quantityKg > 0 ? netEmissions / lot.quantityKg : 0;

    // Update lot with carbon data
    lot.carbonFootprint = {
      totalKgCO2: parseFloat(netEmissions.toFixed(2)),
      perKgCO2: parseFloat(netPerKg.toFixed(4)),
      calculatedAt: new Date(),
    };
    await lot.save();

    return NextResponse.json({
      lotId,
      carbonFootprint: {
        breakdown: {
          farming: parseFloat(totalFarming.toFixed(2)),
          processing: parseFloat((totalProcessing * processingMultiplier).toFixed(2)),
          transport: parseFloat(totalTransport.toFixed(2)),
          sequestration: parseFloat((-sequestration).toFixed(2)),
        },
        total: parseFloat(totalEmissions.toFixed(2)),
        net: parseFloat(netEmissions.toFixed(2)),
        perKg: parseFloat(perKgEmissions.toFixed(4)),
        netPerKg: parseFloat(netPerKg.toFixed(4)),
      },
      comparison: {
        industryAverage: 1.2, // kg CO2e per kg green coffee (ICO estimate)
        vsAverage: netPerKg < 1.2 ? 'below' : 'above',
        percentageDiff: parseFloat((((netPerKg - 1.2) / 1.2) * 100).toFixed(1)),
      },
      rating: netPerKg < 0.8 ? 'excellent' : netPerKg < 1.2 ? 'good' : netPerKg < 1.5 ? 'average' : 'needs_improvement',
      recommendations: generateRecommendations(netPerKg, emissions, processingMethod),
    });
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return NextResponse.json(
      { error: 'Failed to calculate carbon footprint' },
      { status: 500 }
    );
  }
}

function generateRecommendations(perKg, emissions, processingMethod) {
  const recommendations = [];

  if (emissions.farming.fertilizers > 500) {
    recommendations.push({
      category: 'farming',
      priority: 'high',
      action: 'Reduce synthetic fertilizer use by 20-30%',
      impact: 'Could reduce emissions by 100-200 kg CO2e per season',
    });
  }

  if (processingMethod === 'washed' && emissions.processing.water > 1000) {
    recommendations.push({
      category: 'processing',
      priority: 'medium',
      action: 'Implement water recycling system',
      impact: 'Reduce water-related emissions by 50%',
    });
  }

  if (emissions.transport > 100) {
    recommendations.push({
      category: 'logistics',
      priority: 'medium',
      action: 'Optimize collection routes or establish local processing',
      impact: 'Reduce transport emissions by 30-40%',
    });
  }

  if (perKg > 1.5) {
    recommendations.push({
      category: 'overall',
      priority: 'high',
      action: 'Consider switching to natural processing method',
      impact: 'Can reduce overall emissions by 20%',
    });
  }

  return recommendations;
}
