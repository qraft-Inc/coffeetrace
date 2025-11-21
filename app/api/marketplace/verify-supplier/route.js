import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

/**
 * POST /api/marketplace/verify-supplier
 * Verify supplier for marketplace (admin only)
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { productId, verified, notes } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        supplierVerified: verified,
        verificationDate: verified ? new Date() : null,
        verificationNotes: notes || '',
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Supplier verification updated', 
      product 
    });
  } catch (error) {
    console.error('Error verifying supplier:', error);
    return NextResponse.json(
      { error: 'Failed to verify supplier' },
      { status: 500 }
    );
  }
}
