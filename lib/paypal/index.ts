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
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

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

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: params.referenceId || 'default',
        description: params.description || 'ArbiterPay Escrow Job Funding',
        amount: {
          currency_code: currency,
          value: params.amount,
        },
      },
    ],
    application_context: {
      brand_name: 'ArbiterPay',
      landing_page: 'NO_PREFERENCE',
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
        value: item.amount,
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
