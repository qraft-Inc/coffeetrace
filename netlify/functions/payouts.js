import { schedule } from '@netlify/functions';
import dbConnect from '../../lib/dbConnect';
import Wallet from '../../models/Wallet';
import Farmer from '../../models/Farmer';
import Payout from '../../models/Payout';
import WalletTransaction from '../../models/WalletTransaction';
import { sendMobileMoneyPayout } from '../../lib/onafriq/payouts';

const MIN_PAYOUT_THRESHOLD = parseFloat(process.env.MIN_PAYOUT_THRESHOLD || '50000');

/**
 * Process automated payouts for farmers
 * Runs daily at 20:00 EAT (17:00 UTC)
 */
const handler = async (event, context) => {
  console.log('Starting scheduled payout processing...');
  const results = [];
  let processed = 0;
  let successful = 0;
  let failed = 0;

  try {
    await dbConnect();

    // Find wallets with balance >= threshold
    const eligibleWallets = await Wallet.find({
      balance: { $gte: MIN_PAYOUT_THRESHOLD },
    })
      .populate('farmerId')
      .lean();

    console.log(`Found ${eligibleWallets.length} wallets eligible for payout`);

    // Process each wallet
    for (const wallet of eligibleWallets) {
      processed++;
      const farmer = wallet.farmerId;

      if (!farmer) {
        console.error(`Farmer not found for wallet ${wallet._id}`);
        results.push({
          farmerId: 'unknown',
          farmerName: 'Unknown',
          amount: wallet.balance,
          status: 'failed',
          error: 'Farmer not found',
        });
        failed++;
        continue;
      }

      if (!farmer.phoneNumber) {
        console.error(`Phone number not found for farmer ${farmer._id}`);
        results.push({
          farmerId: farmer._id.toString(),
          farmerName: farmer.name,
          amount: wallet.balance,
          status: 'failed',
          error: 'Phone number not configured',
        });
        failed++;
        continue;
      }

      try {
        // Create payout record
        const payout = await Payout.create({
          farmerId: farmer._id,
          walletId: wallet._id,
          amount: wallet.balance,
          currency: wallet.currency || 'UGX',
          destination: {
            type: 'mobile_money',
            msisdn: farmer.phoneNumber,
          },
          status: 'pending',
        });

        console.log(`Created payout ${payout.payoutId} for farmer ${farmer.name}`);

        // Send payout via Onafriq
        const payoutResult = await sendMobileMoneyPayout({
          farmerId: farmer._id.toString(),
          amount: wallet.balance,
          currency: wallet.currency || 'UGX',
          msisdn: farmer.phoneNumber,
          reference: payout.payoutId,
          description: `Automated payout for ${farmer.name}`,
          metadata: {
            farmer_name: farmer.name,
            wallet_id: wallet._id.toString(),
            scheduled: true,
          },
        });

        if (payoutResult.success) {
          // Update payout record
          payout.status = 'processing';
          payout.psp_reference = payoutResult.psp_reference;
          payout.executed_at = new Date();
          await payout.save();

          // Record transaction
          const balanceBefore = wallet.balance;
          wallet.balance = 0;
          wallet.lastUpdated = new Date();
          await Wallet.findByIdAndUpdate(wallet._id, {
            balance: 0,
            lastUpdated: new Date(),
          });

          await WalletTransaction.create({
            walletId: wallet._id,
            userId: farmer.userId,
            type: 'withdrawal',
            amount: balanceBefore,
            currency: wallet.currency || 'UGX',
            balanceBefore,
            balanceAfter: 0,
            status: 'completed',
            description: `Automated payout - ${payout.payoutId}`,
            reference: payout.payoutId,
            category: 'payout',
          });

          console.log(
            `Successfully processed payout for ${farmer.name}: ${balanceBefore} ${wallet.currency}`
          );

          results.push({
            farmerId: farmer._id.toString(),
            farmerName: farmer.name,
            amount: balanceBefore,
            status: 'success',
            payoutId: payout.payoutId,
          });
          successful++;
        } else {
          // Mark payout as failed
          payout.status = 'failed';
          payout.failure_reason = payoutResult.error || 'Unknown error';
          payout.retry_count = 0;
          payout.next_retry_at = new Date(Date.now() + 60 * 60 * 1000); // Retry in 1 hour
          await payout.save();

          console.error(`Failed to process payout for ${farmer.name}:`, payoutResult.error);

          results.push({
            farmerId: farmer._id.toString(),
            farmerName: farmer.name,
            amount: wallet.balance,
            status: 'failed',
            error: payoutResult.error || 'Payout API error',
          });
          failed++;
        }

        // Add delay between payouts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing payout for farmer ${farmer._id}:`, error);
        results.push({
          farmerId: farmer._id.toString(),
          farmerName: farmer.name,
          amount: wallet.balance,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    // Process pending retries
    const pendingRetries = await Payout.getPendingRetries();
    console.log(`Found ${pendingRetries.length} payouts ready for retry`);

    for (const payout of pendingRetries) {
      if (!payout.canRetry()) {
        console.log(`Payout ${payout.payoutId} exceeded max retries`);
        continue;
      }

      const farmer = await Farmer.findById(payout.farmerId);
      if (!farmer) {
        console.error(`Farmer not found for retry payout ${payout.payoutId}`);
        continue;
      }

      try {
        console.log(`Retrying payout ${payout.payoutId} (attempt ${payout.retry_count + 1})`);

        const payoutResult = await sendMobileMoneyPayout({
          farmerId: farmer._id.toString(),
          amount: payout.amount,
          currency: payout.currency,
          msisdn: payout.destination.msisdn,
          reference: payout.payoutId,
          description: `Retry payout for ${farmer.name}`,
        });

        if (payoutResult.success) {
          payout.status = 'processing';
          payout.psp_reference = payoutResult.psp_reference;
          payout.executed_at = new Date();
          await payout.save();

          console.log(`Successfully retried payout ${payout.payoutId}`);
          successful++;
        } else {
          await payout.incrementRetry();
          console.error(`Failed retry for payout ${payout.payoutId}:`, payoutResult.error);
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error retrying payout ${payout.payoutId}:`, error);
        await payout.incrementRetry();
        failed++;
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      processed,
      successful,
      failed,
      results,
      retries_processed: pendingRetries.length,
    };

    console.log('Payout processing completed:', summary);

    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    };

  } catch (error) {
    console.error('Scheduled payout function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process payouts',
        details: error instanceof Error ? error.message : 'Unknown error',
        processed,
        successful,
        failed,
      }),
    };
  }
};

// Schedule to run daily at 20:00 EAT (17:00 UTC)
// Cron expression: every day at 17:00 UTC (20:00 EAT)
export default schedule('0 17 * * *', handler);
