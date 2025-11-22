/**
 * Onafriq Payouts API Client
 * Handles mobile money disbursements to farmers
 */

// Environment configuration
const ONAFRIQ_CONFIG = {
  apiKey: process.env.ONAFRIQ_API_KEY || '',
  clientId: process.env.ONAFRIQ_CLIENT_ID || '',
  clientSecret: process.env.ONAFRIQ_CLIENT_SECRET || '',
  baseUrl: process.env.ONAFRIQ_BASE_URL || 'https://api.onafriq.com',
};

interface PayoutParams {
  farmerId: string;
  amount: number;
  currency: string;
  msisdn: string; // Mobile number
  country?: string;
  reference?: string;
  description?: string;
}

interface PayoutResponse {
  success: boolean;
  psp_reference?: string;
  status?: string;
  error?: string;
  estimated_arrival?: string;
}

interface PayoutStatusResponse {
  reference: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  amount: number;
  currency: string;
  recipient: {
    msisdn: string;
    name?: string;
  };
  created_at: string;
  completed_at?: string;
  failure_reason?: string;
}

/**
 * Send mobile money payout to farmer
 */
export async function sendMobileMoneyPayout(params: PayoutParams): Promise<PayoutResponse> {
  try {
    const {
      farmerId,
      amount,
      currency,
      msisdn,
      country = 'UG',
      reference,
      description,
    } = params;

    // Validate configuration
    if (!ONAFRIQ_CONFIG.apiKey || !ONAFRIQ_CONFIG.clientId) {
      throw new Error('Onafriq API credentials not configured');
    }

    // Validate minimum amount
    const MIN_PAYOUT_AMOUNT = currency === 'UGX' ? 1000 : 1; // UGX 1,000 or $1
    if (amount < MIN_PAYOUT_AMOUNT) {
      return {
        success: false,
        error: `Amount below minimum payout threshold (${MIN_PAYOUT_AMOUNT} ${currency})`,
      };
    }

    // Clean and validate phone number
    const cleanMsisdn = msisdn.replace(/[^\d+]/g, '');
    if (!cleanMsisdn || cleanMsisdn.length < 10) {
      return {
        success: false,
        error: 'Invalid mobile number format',
      };
    }

    // Build payout payload
    const payload = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toUpperCase(),
      recipient: {
        type: 'mobile_money',
        msisdn: cleanMsisdn,
        country: country.toUpperCase(),
      },
      reference: reference || `FARMER-${farmerId}-${Date.now()}`,
      description: description || 'Coffee tip payout',
      metadata: {
        farmerId,
        platform: 'CoffeeTrace',
        type: 'tip_payout',
      },
      notification: {
        webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payouts/webhook`,
      },
    };

    console.log('Sending payout request:', {
      amount: payload.amount,
      currency: payload.currency,
      msisdn: cleanMsisdn,
      reference: payload.reference,
    });

    // Make API request
    const response = await fetch(`${ONAFRIQ_CONFIG.baseUrl}/v1/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONAFRIQ_CONFIG.apiKey}`,
        'X-Client-Id': ONAFRIQ_CONFIG.clientId,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Onafriq payout error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to initiate payout',
      };
    }

    console.log('Payout initiated successfully:', data.reference);

    return {
      success: true,
      psp_reference: data.reference,
      status: data.status,
      estimated_arrival: data.estimated_arrival,
    };
  } catch (error) {
    console.error('Send payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check payout status
 */
export async function checkPayoutStatus(reference: string): Promise<PayoutStatusResponse | null> {
  try {
    if (!ONAFRIQ_CONFIG.apiKey) {
      throw new Error('Onafriq API key not configured');
    }

    const response = await fetch(
      `${ONAFRIQ_CONFIG.baseUrl}/v1/payouts/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ONAFRIQ_CONFIG.apiKey}`,
          'X-Client-Id': ONAFRIQ_CONFIG.clientId,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to check payout status:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      reference: data.reference,
      status: data.status,
      amount: data.amount / 100, // Convert from cents
      currency: data.currency,
      recipient: data.recipient,
      created_at: data.created_at,
      completed_at: data.completed_at,
      failure_reason: data.failure_reason,
    };
  } catch (error) {
    console.error('Check payout status error:', error);
    return null;
  }
}

/**
 * Get payout balance/limits
 */
export async function getPayoutBalance(): Promise<any> {
  try {
    const response = await fetch(`${ONAFRIQ_CONFIG.baseUrl}/v1/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONAFRIQ_CONFIG.apiKey}`,
        'X-Client-Id': ONAFRIQ_CONFIG.clientId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout balance');
    }

    return await response.json();
  } catch (error) {
    console.error('Get payout balance error:', error);
    return null;
  }
}

/**
 * Batch payouts (for multiple farmers at once)
 */
export async function sendBatchPayouts(
  payouts: PayoutParams[]
): Promise<{ success: boolean; results: PayoutResponse[]; batch_id?: string }> {
  try {
    const results: PayoutResponse[] = [];
    const batch_id = `BATCH-${Date.now()}`;

    // Process payouts sequentially with delay to avoid rate limits
    for (const payout of payouts) {
      const result = await sendMobileMoneyPayout({
        ...payout,
        reference: `${batch_id}-${payout.farmerId}`,
      });
      results.push(result);

      // Wait 500ms between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Batch ${batch_id}: ${successCount}/${payouts.length} successful`);

    return {
      success: successCount > 0,
      results,
      batch_id,
    };
  } catch (error) {
    console.error('Batch payouts error:', error);
    return {
      success: false,
      results: [],
    };
  }
}

/**
 * Validate phone number for mobile money
 */
export function validateMobileNumber(msisdn: string, country: string = 'UG'): boolean {
  // Remove all non-digit characters except +
  const cleaned = msisdn.replace(/[^\d+]/g, '');

  // Country-specific validation
  const patterns: Record<string, RegExp> = {
    UG: /^\+?256\d{9}$|^0\d{9}$/, // Uganda: +256XXXXXXXXX or 0XXXXXXXXX
    KE: /^\+?254\d{9}$|^0\d{9}$/, // Kenya
    RW: /^\+?250\d{9}$|^0\d{9}$/, // Rwanda
    TZ: /^\+?255\d{9}$|^0\d{9}$/, // Tanzania
  };

  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(cleaned) : cleaned.length >= 10;
}

/**
 * Format phone number for API
 */
export function formatMobileNumber(msisdn: string, country: string = 'UG'): string {
  const cleaned = msisdn.replace(/[^\d+]/g, '');

  // Add country code if missing
  const countryCodes: Record<string, string> = {
    UG: '256',
    KE: '254',
    RW: '250',
    TZ: '255',
  };

  const code = countryCodes[country.toUpperCase()] || '256';

  if (cleaned.startsWith('+')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return `+${code}${cleaned.substring(1)}`;
  } else if (cleaned.startsWith(code)) {
    return `+${cleaned}`;
  } else {
    return `+${code}${cleaned}`;
  }
}

export default {
  sendMobileMoneyPayout,
  checkPayoutStatus,
  getPayoutBalance,
  sendBatchPayouts,
  validateMobileNumber,
  formatMobileNumber,
};
