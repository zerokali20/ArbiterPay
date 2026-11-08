import { NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentEvents } from '@/db/schema';
import { recordLedgerEvent } from '@/lib/ledger';
import { verifyWebhookSignature } from '@/lib/paypal';

/**
 * PayPal Webhook Listener with Cryptographic Signature Verification.
 * Receives asynchronous notifications from PayPal Sandbox for:
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.CAPTURE.DENIED
 * - PAYMENT.PAYOUTSBATCH.SUCCESS
 * - PAYMENT.PAYOUTSBATCH.DENIED
 * - PAYMENT.PAYOUTS-ITEM.SUCCEEDED
 * - PAYMENT.PAYOUTS-ITEM.FAILED
 * - CHECKOUT.ORDER.APPROVED
 * - CUSTOMER.DISPUTE.CREATED
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    const eventId = event.id || `evt-${Date.now()}`;
    const eventType = event.event_type || 'UNKNOWN';
    const resource = event.resource || {};

    // 1. Signature Verification
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const authAlgo = request.headers.get('paypal-auth-algo') || '';
    const certUrl = request.headers.get('paypal-cert-url') || '';
    const transmissionId = request.headers.get('paypal-transmission-id') || '';
    const transmissionSig = request.headers.get('paypal-transmission-sig') || '';
    const transmissionTime = request.headers.get('paypal-transmission-time') || '';

    let isVerified = false;
    if (webhookId && authAlgo && certUrl && transmissionId && transmissionSig && transmissionTime) {
      isVerified = await verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: event,
      });
      console.log(`[PAYPAL WEBHOOK SIGNATURE] Event: ${eventType} - Verified: ${isVerified}`);
    } else {
      console.log(`[PAYPAL WEBHOOK] Processing event ${eventType} (ID: ${eventId})`);
    }

    // 2. Record raw payment event in DB
    try {
      await db.insert(paymentEvents).values({
        eventType,
        paypalEventId: eventId,
        paypalResourceId: resource.id || null,
        status: resource.status || 'RECEIVED',
        amount: resource.amount?.value || resource.payout_item?.amount?.value || null,
        currency: resource.amount?.currency_code || 'USD',
        rawPayload: event,
        processed: true,
      });
    } catch (dbErr: any) {
      console.warn('DB write for webhook skipped:', dbErr.message);
    }

    // 3. Append to immutable AG Grid Ledger
    await recordLedgerEvent({
      eventType: `WEBHOOK_${eventType.replace(/\./g, '_')}`,
      actorType: 'paypal_webhook',
      details: {
        paypalEventId: eventId,
        summary: event.summary || `PayPal Sandbox Event: ${eventType}`,
        resourceId: resource.id,
        status: resource.status || 'RECEIVED',
        amount: resource.amount?.value || resource.payout_item?.amount?.value || '0.00',
        signatureVerified: isVerified,
        webhookId: webhookId || 'SANDBOX_REGISTERED',
      },
    });

    return NextResponse.json({ received: true, eventId, verified: isVerified });
  } catch (err: any) {
    console.error('Webhook processing failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
