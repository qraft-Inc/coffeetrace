import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import WeatherAlert from '@/models/WeatherAlert';

/**
 * GET /api/weather/alerts
 * Fetch weather alerts for a location
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lon = parseFloat(searchParams.get('lon'));
    const district = searchParams.get('district');
    const radius = parseInt(searchParams.get('radius') || '50'); // km
    const active = searchParams.get('active') !== 'false';

    let query = {};

    if (active) {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    }

    if (district) {
      query.affectedAreas = district;
    }

    let alerts;

    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
      // Find alerts within radius using geospatial query
      alerts = await WeatherAlert.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        },
      })
        .sort({ severity: -1, createdAt: -1 })
        .limit(20)
        .lean();
    } else {
      // Fallback to non-geospatial query
      alerts = await WeatherAlert.find(query)
        .sort({ severity: -1, createdAt: -1 })
        .limit(20)
        .lean();
    }

    return NextResponse.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weather/alerts
 * Create a new weather alert (admin only)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'coopAdmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const data = await req.json();
    const {
      alertType,
      severity,
      title,
      description,
      affectedAreas,
      location,
      validUntil,
      recommendations,
      source,
    } = data;

    const alert = await WeatherAlert.create({
      alertType,
      severity,
      title,
      description,
      affectedAreas,
      location,
      validUntil: validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      recommendations: recommendations || [],
      source: source || 'manual',
      isActive: true,
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating weather alert:', error);
    return NextResponse.json(
      { error: 'Failed to create weather alert' },
      { status: 500 }
    );
  }
}
