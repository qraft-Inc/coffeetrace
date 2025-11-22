/**
 * Onafriq Payments API Client
 * Handles checkout session creation and webhook verification
 */

import crypto from 'crypto';

// Environment configuration
const ONAFRIQ_CONFIG = {
  apiKey: process.env.ONAFRIQ_API_KEY || '',
  clientId: process.env.ONAFRIQ_CLIENT_ID || '',
  clientSecret: process.env.ONAFRIQ_CLIENT_SECRET || '',
  baseUrl: process.env.ONAFRIQ_BASE_URL || 'https://api.onafriq.com',
  webhookSecret: process.env.ONAFRIQ_WEBHOOK_SECRET || '',
};

interface CheckoutParams {
  amount: number;
  currency: string;
  farmerId: string;
  lotId?: string;
  buyerMetadata?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  returnUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResponse {
  success: boolean;
  checkout_url?: string;
  session_id?: string;
  reference?: string;
  error?: string;
}

interface WebhookPayload {
  event: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Create a payment checkout session
 */
export async function createCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
  try {
    const {
      amount,
      currency,
      farmerId,
      lotId,
      buyerMetadata,
      returnUrl,
      cancelUrl,
    } = params;

    // Validate configuration
    if (!ONAFRIQ_CONFIG.apiKey || !ONAFRIQ_CONFIG.clientId) {
      throw new Error('Onafriq API credentials not configured');
    }

    // Build request payload
    const payload = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toUpperCase(),
      customer: {
        name: buyerMetadata?.name,
        email: buyerMetadata?.email,
        phone: buyerMetadata?.phone,
      },
      metadata: {
        farmerId,
        lotId,
        message: buyerMetadata?.message,
        platform: 'CoffeeTrace',
      },
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/tip/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/tip/cancel`,
      webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
    };

    // Make API request
    const response = await fetch(`${ONAFRIQ_CONFIG.baseUrl}/v1/checkout/sessions`, {
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
      console.error('Onafriq checkout error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to create checkout session',
      };
    }

    return {
      success: true,
      checkout_url: data.checkout_url,
      session_id: data.id,
      reference: data.reference,
    };
  } catch (error) {
    console.error('Create checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify webhook signature from Onafriq
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  try {
    if (!ONAFRIQ_CONFIG.webhookSecret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    // Construct the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', ONAFRIQ_CONFIG.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures (constant-time comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Parse and validate webhook payload
 */
export function parseWebhookPayload(body: any): WebhookPayload | null {
  try {
    // Validate required fields
    if (!body.event || !body.reference || !body.amount) {
      return null;
    }

    return {
      event: body.event,
      reference: body.reference,
      amount: Number(body.amount) / 100, // Convert from cents
      currency: body.currency || 'UGX',
      status: body.status,
      payment_method: body.payment_method,
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: body.metadata || {},
    };
  } catch (error) {
    console.error('Parse webhook error:', error);
    return null;
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(reference: string): Promise<any> {
  try {
    const response = await fetch(
      `${ONAFRIQ_CONFIG.baseUrl}/v1/payments/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ONAFRIQ_CONFIG.apiKey}`,
          'X-Client-Id': ONAFRIQ_CONFIG.clientId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(
  reference: string,
  amount?: number,
  reason?: string
): Promise<any> {
  try {
    const payload: any = {
      reference,
      reason: reason || 'Refund requested',
    };

    if (amount) {
      payload.amount = Math.round(amount * 100); // Convert to cents
    }

    const response = await fetch(`${ONAFRIQ_CONFIG.baseUrl}/v1/refunds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONAFRIQ_CONFIG.apiKey}`,
        'X-Client-Id': ONAFRIQ_CONFIG.clientId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to process refund: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Refund payment error:', error);
    throw error;
  }
}

export default {
  createCheckout,
  verifyWebhookSignature,
  parseWebhookPayload,
  getPaymentStatus,
  refundPayment,
};
