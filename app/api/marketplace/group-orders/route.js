import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import GroupOrder from '@/models/GroupOrder';
import Product from '@/models/Product';
import Order from '@/models/Order';

/**
 * GET /api/marketplace/group-orders
 * Fetch active group buying opportunities
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'open';
    const productId = searchParams.get('productId');

    let query = { status };
    if (productId) query.productId = productId;

    const groupOrders = await GroupOrder.find(query)
      .populate('productId', 'name images price unit')
      .populate('organizer', 'name farmName')
      .sort({ deadline: 1 })
      .lean();

    return NextResponse.json({ groupOrders });
  } catch (error) {
    console.error('Error fetching group orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/group-orders
 * Create a new group buying order
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { productId, targetQuantity, deadline, deliveryLocation, notes } = await req.json();

    if (!productId || !targetQuantity || !deadline) {
      return NextResponse.json(
        { error: 'Product, target quantity, and deadline required' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.groupBuyingEnabled) {
      return NextResponse.json(
        { error: 'Group buying not enabled for this product' },
        { status: 400 }
      );
    }

    const groupOrder = await GroupOrder.create({
      productId,
      organizer: session.user.id,
      targetQuantity,
      pricePerUnit: product.price,
      discountPercentage: product.groupBuyingDiscount || 0,
      deadline: new Date(deadline),
      deliveryLocation,
      notes,
    });

    await groupOrder.populate('productId', 'name images price unit');

    return NextResponse.json({ groupOrder }, { status: 201 });
  } catch (error) {
    console.error('Error creating group order:', error);
    return NextResponse.json(
      { error: 'Failed to create group order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketplace/group-orders
 * Join a group buying order
 */
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { groupOrderId, quantity } = await req.json();

    if (!groupOrderId || !quantity) {
      return NextResponse.json(
        { error: 'Group order ID and quantity required' },
        { status: 400 }
      );
    }

    const groupOrder = await GroupOrder.findById(groupOrderId);
    if (!groupOrder) {
      return NextResponse.json({ error: 'Group order not found' }, { status: 404 });
    }

    if (groupOrder.status !== 'open') {
      return NextResponse.json(
        { error: 'Group order is no longer accepting participants' },
        { status: 400 }
      );
    }

    if (new Date() > groupOrder.deadline) {
      groupOrder.status = 'closed';
      await groupOrder.save();
      return NextResponse.json({ error: 'Group order deadline passed' }, { status: 400 });
    }

    // Check if user already joined
    const existingParticipant = groupOrder.participants.find(
      p => p.userId.toString() === session.user.id
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You have already joined this group order' },
        { status: 400 }
      );
    }

    // Add participant
    groupOrder.participants.push({
      userId: session.user.id,
      quantity,
    });

    groupOrder.currentQuantity += quantity;

    // Check if target reached
    if (groupOrder.currentQuantity >= groupOrder.targetQuantity) {
      groupOrder.status = 'target_reached';
    }

    await groupOrder.save();

    return NextResponse.json({ 
      message: 'Successfully joined group order', 
      groupOrder 
    });
  } catch (error) {
    console.error('Error joining group order:', error);
    return NextResponse.json(
      { error: 'Failed to join group order' },
      { status: 500 }
    );
  }
}
