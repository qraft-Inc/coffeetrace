import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tip from '@/models/Tip';
import Wallet from '@/models/Wallet';
import WalletTransaction from '@/models/WalletTransaction';
import { verifyWebhookSignature, parseWebhookPayload } from '@/lib/onafriq/payments';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/webhook
 * Handle Onafriq payment webhooks
 */
export async function POST(request) {
  try {
    // Get webhook signature headers
    const signature = request.headers.get('x-onafriq-signature') || '';
    const timestamp = request.headers.get('x-onafriq-timestamp') || '';

    // Get raw body
    const rawBody = await request.text();
    
    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature, timestamp);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const body = JSON.parse(rawBody);
    const webhookData = parseWebhookPayload(body);
    
    if (!webhookData) {
      console.error('Invalid webhook payload');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    console.log('Processing webhook:', {
      event: webhookData.event,
      reference: webhookData.reference,
      status: webhookData.status,
    });

    await dbConnect();

    // Find the tip by PSP reference
    const tip = await Tip.findOne({ psp_reference: webhookData.reference });
    if (!tip) {
      console.error('Tip not found for reference:', webhookData.reference);
      return NextResponse.json(
        { error: 'Tip not found' },
        { status: 404 }
      );
    }

    // Handle different webhook events
    switch (webhookData.event) {
      case 'payment.success':
      case 'payment.completed':
        await handlePaymentSuccess(tip, webhookData);
        break;

      case 'payment.failed':
        await handlePaymentFailed(tip, webhookData);
        break;

      case 'payment.cancelled':
        tip.status = 'failed';
        tip.metadata = tip.metadata || new Map();
        tip.metadata.set('cancelled_at', new Date().toISOString());
        await tip.save();
        break;

      default:
        console.log('Unhandled webhook event:', webhookData.event);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(tip, webhookData) {
  try {
    // Prevent duplicate processing
    if (tip.status === 'confirmed') {
      console.log('Tip already confirmed:', tip.tipId);
      return;
    }

    console.log('Processing successful payment for tip:', tip.tipId);

    // Update tip status
    tip.status = 'confirmed';
    tip.payment_confirmed_at = new Date();
    tip.payment_method = webhookData.payment_method;
    await tip.save();

    // Find or create farmer's wallet
    let wallet = await Wallet.findOne({ farmerId: tip.farmerId });
    
    if (!wallet) {
      console.log('Creating new wallet for farmer:', tip.farmerId);
      wallet = await Wallet.create({
        farmerId: tip.farmerId,
        balance: 0,
        currency: tip.currency,
      });
    }

    // Record balance before update
    const balanceBefore = wallet.balance || 0;

    // Add net amount to wallet balance
    wallet.balance = balanceBefore + tip.net_amount;
    wallet.lastUpdated = new Date();
    await wallet.save();

    console.log('Updated wallet balance:', {
      farmerId: tip.farmerId,
      before: balanceBefore,
      after: wallet.balance,
      added: tip.net_amount,
    });

    // Create wallet transaction record
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: wallet.farmerId,
      type: 'deposit',
      amount: tip.net_amount,
      currency: tip.currency,
      balanceBefore: balanceBefore,
      balanceAfter: wallet.balance,
      status: 'completed',
      description: `Tip received${tip.lotId ? ' for coffee lot' : ''}`,
      reference: tip.tipId,
      relatedTip: tip._id,
      metadata: {
        tip_gross: tip.gross_amount,
        platform_fee: tip.platform_fee,
        buyer_name: tip.buyer_metadata?.name,
        buyer_message: tip.buyer_metadata?.message,
      },
    });

    console.log('Created wallet transaction for tip:', tip.tipId);

    // Update farmer statistics (if needed)
    // This could increment total tips received, etc.

  } catch (error) {
    console.error('Handle payment success error:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(tip, webhookData) {
  try {
    tip.status = 'failed';
    tip.metadata = tip.metadata || new Map();
    tip.metadata.set('failure_reason', webhookData.status);
    tip.metadata.set('failed_at', new Date().toISOString());
    await tip.save();

    console.log('Payment failed for tip:', tip.tipId);
  } catch (error) {
    console.error('Handle payment failed error:', error);
    throw error;
  }
}

/**
 * GET /api/payments/webhook
 * Webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
  });
}
