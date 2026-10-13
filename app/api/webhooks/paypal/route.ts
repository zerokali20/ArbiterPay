import { NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentEvents } from '@/db/schema';
import { recordLedgerEvent } from '@/lib/ledger';

/**
 * PayPal Webhook Listener.
 * Receives asynchronous notifications from PayPal Sandbox for:
 * - PAYMENT.CAPTURE.COMPLETED
 * - PAYMENT.PAYOUTS-ITEM.SUCCESS
 * - PAYMENT.PAYOUTS-ITEM.FAILED
 * - CUSTOMER.DISPUTE.CREATED
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    const eventId = event.id || `evt-${Date.now()}`;
    const eventType = event.event_type || 'UNKNOWN';
    const resource = event.resource || {};

    console.log(`[PAYPAL WEBHOOK RECEIVED] Event: ${eventType} (ID: ${eventId})`);

    // Record raw payment event
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

    // Append to Ledger
    await recordLedgerEvent({
      eventType: `WEBHOOK_${eventType.replace(/\./g, '_')}`,
      actorType: 'system',
      details: {
        paypalEventId: eventId,
        summary: event.summary,
        resourceId: resource.id,
        status: resource.status,
      },
    });

    return NextResponse.json({ received: true, eventId });
  } catch (err: any) {
    console.error('Webhook processing failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
