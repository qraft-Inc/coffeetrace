import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import PaymentTransaction from '@/models/PaymentTransaction';
import Wallet from '@/models/Wallet';
import WalletTransaction from '@/models/WalletTransaction';

/**
 * POST /api/payments/[id]/process
 * Process/execute a payment transaction
 */
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const payment = await PaymentTransaction.findById(params.id)
      .populate('farmerId', 'fullName phoneNumber')
      .populate('buyerId', 'fullName');

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check if already processed
    if (payment.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: `Payment already ${payment.paymentStatus}` },
        { status: 400 }
      );
    }

    // Check approval requirement
    if (payment.approvalRequired && !payment.approvedBy) {
      return NextResponse.json(
        { error: 'Payment requires approval first' },
        { status: 400 }
      );
    }

    payment.paymentStatus = 'processing';
    payment.processedAt = new Date();
    await payment.save();

    try {
      // Process payment based on method
      if (payment.paymentMethod === 'wallet') {
        // Find or create farmer wallet
        let farmerWallet = await Wallet.findOne({ userId: payment.farmerId._id });
        if (!farmerWallet) {
          farmerWallet = await Wallet.create({
            userId: payment.farmerId._id,
            balance: 0,
            availableBalance: 0,
          });
        }

        // Create wallet transaction
        const walletTx = await WalletTransaction.create({
          walletId: farmerWallet._id,
          userId: payment.farmerId._id,
          transactionType: 'sale_payment',
          amount: payment.netAmount,
          status: 'completed',
          description: `Payment for Lot ${payment.lotId.lotNumber} with quality premium`,
          reference: payment._id.toString(),
        });

        // Update wallet balance
        farmerWallet.balance += payment.netAmount;
        farmerWallet.availableBalance += payment.netAmount;
        await farmerWallet.save();

        payment.walletTransactionId = walletTx._id;
      } else if (payment.paymentMethod === 'mobile_money') {
        // In production, integrate with mobile money API (MTN MoMo, Airtel Money)
        // For now, simulate success
        payment.mobileMoneyDetails = {
          ...payment.mobileMoneyDetails,
          transactionId: `MM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        };
      } else if (payment.paymentMethod === 'bank_transfer') {
        // In production, integrate with banking API
        payment.bankDetails = {
          ...payment.bankDetails,
          referenceNumber: `BT${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        };
      }

      // Mark as completed
      payment.paymentStatus = 'completed';
      payment.completedAt = new Date();
      await payment.save();

      return NextResponse.json({
        message: 'Payment processed successfully',
        payment,
      });
    } catch (processError) {
      // Mark as failed
      payment.paymentStatus = 'failed';
      payment.failedAt = new Date();
      payment.notes = `${payment.notes || ''}\nError: ${processError.message}`;
      await payment.save();

      throw processError;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
