import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Farmer from '@/models/Farmer';
import Lot from '@/models/Lot';
import Tip from '@/models/Tip';
import { createCheckout } from '@/lib/onafriq/payments';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/checkout
 * Create a payment checkout session for tipping a farmer
 */
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      farmerId,
      lotId,
      amount,
      currency = 'UGX',
      buyer_metadata,
    } = body;

    // Validation
    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid tip amount is required' },
        { status: 400 }
      );
    }

    // Verify farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return NextResponse.json(
        { error: 'Farmer not found' },
        { status: 404 }
      );
    }

    // Verify lot if provided
    let lot = null;
    if (lotId) {
      lot = await Lot.findById(lotId);
      if (!lot || lot.farmerId.toString() !== farmerId) {
        return NextResponse.json(
          { error: 'Lot not found or does not belong to this farmer' },
          { status: 404 }
        );
      }
    }

    // Calculate fees
    const gross_amount = parseFloat(amount);
    const platform_fee = Math.round(gross_amount * 0.03 * 100) / 100;
    const net_amount = Math.round((gross_amount - platform_fee) * 100) / 100;

    // Create pending tip record
    const tip = await Tip.create({
      farmerId,
      lotId: lotId || undefined,
      gross_amount,
      platform_fee,
      net_amount,
      currency,
      buyer_metadata: buyer_metadata || {},
      status: 'pending',
    });

    console.log('Created pending tip:', tip.tipId);

    // Create Onafriq checkout session
    const checkoutResult = await createCheckout({
      amount: gross_amount,
      currency,
      farmerId,
      lotId,
      buyerMetadata: buyer_metadata,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tip/success?tip=${tip.tipId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tip/cancel?tip=${tip.tipId}`,
    });

    if (!checkoutResult.success) {
      // Update tip status to failed
      tip.status = 'failed';
      await tip.save();

      return NextResponse.json(
        { error: checkoutResult.error || 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Update tip with checkout details
    tip.checkout_url = checkoutResult.checkout_url;
    tip.checkout_session_id = checkoutResult.session_id;
    tip.psp_reference = checkoutResult.reference;
    tip.status = 'processing';
    await tip.save();

    return NextResponse.json({
      success: true,
      tip: {
        tipId: tip.tipId,
        gross_amount: tip.gross_amount,
        platform_fee: tip.platform_fee,
        net_amount: tip.net_amount,
        currency: tip.currency,
      },
      checkout: {
        url: checkoutResult.checkout_url,
        session_id: checkoutResult.session_id,
        reference: checkoutResult.reference,
      },
      farmer: {
        name: farmer.name,
        district: farmer.address?.district,
      },
      lot: lot ? {
        name: `${lot.variety} - ${lot.quantityKg}kg`,
        variety: lot.variety,
      } : null,
    });

  } catch (error) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create payment checkout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/checkout
 * Get checkout status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipId = searchParams.get('tipId');

    if (!tipId) {
      return NextResponse.json(
        { error: 'Tip ID required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const tip = await Tip.findOne({ tipId })
      .populate('farmerId', 'name phoneNumber address')
      .populate('lotId', 'variety quantityKg');

    if (!tip) {
      return NextResponse.json(
        { error: 'Tip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tip: {
        tipId: tip.tipId,
        status: tip.status,
        gross_amount: tip.gross_amount,
        currency: tip.currency,
        checkout_url: tip.checkout_url,
        created_at: tip.createdAt,
      },
      farmer: tip.farmerId,
      lot: tip.lotId,
    });

  } catch (error) {
    console.error('Get checkout status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checkout status' },
      { status: 500 }
    );
  }
}
