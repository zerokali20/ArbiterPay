/**
 * PayPal REST API Client for ArbiterPay (Sandbox).
 * Handles Orders v2 (create/capture), Payouts v1, Webhook signature verification, and Disputes.
 */

export const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal OAuth2 access token using client credentials.
 */
export async function getAccessToken(): Promise<string> {
  const clientId =
    process.env.PAYPAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    'AbLdNUMQfgTG2_NODnDa9E4rwobWuveP90LWcgdVPNow-vtq9td3iEwIQs2C8jhq15S6ktXpofU11cyw';
  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET ||
    'EBg0fm_Piib-_Wg0bc6SZQQZq1trbb1JbPIZm9AuTnsGLb-yUtIKRhVeeia7IDoDTLs70rDtgklyqVpL';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials not configured in environment');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal auth failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export interface CreateOrderParams {
  amount: string;
  currency?: string;
  referenceId?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export interface CaptureOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
}

/**
 * Create an Order (v2) for funding a job milestone or total escrow.
 */
export async function createOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
  const accessToken = await getAccessToken();
  const currency = params.currency || 'USD';
  const cleanAmount = parseFloat(
    String(params.amount || '150').replace(/[^0-9.]/g, '') || '150'
  ).toFixed(2);
  const cleanRef = (params.referenceId || 'escrow-job').slice(0, 120);

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: cleanRef,
        description: (params.description || 'ArbiterPay Escrow Job Funding').slice(0, 127),
        amount: {
          currency_code: currency,
          value: cleanAmount,
        },
      },
    ],
    application_context: {
      brand_name: 'ArbiterPay Escrow',
      landing_page: 'LOGIN',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: params.returnUrl || 'https://arbiterpay.onrender.com/jobs/funding/return',
      cancel_url: params.cancelUrl || 'https://arbiterpay.onrender.com/jobs/funding/cancel',
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Create Order failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as PayPalOrderResponse;
}

/**
 * Capture an approved Order.
 */
export async function captureOrder(orderId: string): Promise<CaptureOrderResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Capture Order failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as CaptureOrderResponse;
}

export interface PayoutItemParams {
  receiverEmail: string;
  amount: string;
  currency?: string;
  note?: string;
  senderItemId: string; // Idempotency key per milestone
}

export interface PayoutBatchResponse {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

/**
 * Release milestone funds to freelancer via PayPal Payouts.
 * Idempotency guaranteed via sender_batch_id and sender_item_id.
 */
export async function createBatchPayout(
  senderBatchId: string,
  items: PayoutItemParams[]
): Promise<PayoutBatchResponse> {
  const accessToken = await getAccessToken();

  const payload = {
    sender_batch_header: {
      sender_batch_id: senderBatchId,
      email_subject: 'ArbiterPay: Milestone Payout Approved',
      email_message:
        'Your milestone deliverable has passed AI arbitration and funds have been released!',
    },
    items: items.map((item) => ({
      recipient_type: 'EMAIL',
      amount: {
        value: parseFloat(String(item.amount).replace(/[^0-9.]/g, '') || '0').toFixed(2),
        currency: item.currency || 'USD',
      },
      note: item.note || 'Milestone verified by ArbiterPay AI',
      sender_item_id: item.senderItemId,
      receiver: item.receiverEmail,
    })),
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Payout failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as PayoutBatchResponse;
}

/**
 * Fetch details of a Payout Batch.
 */
export async function getPayoutBatch(batchId: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts/${batchId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Get Payout failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Verify PayPal Webhook Signature using PayPal REST API.
 */
export async function verifyWebhookSignature(params: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: any;
}): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: params.webhookId,
        webhook_event: params.webhookEvent,
      }),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { verification_status: string };
    return data.verification_status === 'SUCCESS';
  } catch (err: any) {
    console.warn('Webhook signature check error:', err.message);
    return false;
  }
}
