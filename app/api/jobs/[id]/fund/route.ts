import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones } from '@/db/schema';
import { createOrder, captureOrder } from '@/lib/paypal';
import { recordLedgerEvent } from '@/lib/ledger';
import { eq } from 'drizzle-orm';

// CREATE Order for funding
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { action, orderId } = body;

    if (action === 'capture' && orderId) {
      // Step 2: Capture payment after client approval
      const captureData = await captureOrder(orderId);
      const captureId =
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      // Update Job status to funded in DB
      try {
        await db
          .update(jobs)
          .set({
            status: 'funded',
            paypalOrderId: orderId,
            paypalCaptureId: captureId,
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, jobId));

        // Update first milestone to in_progress
        await db
          .update(milestones)
          .set({ status: 'in_progress', updatedAt: new Date() })
          .where(eq(milestones.jobId, jobId));
      } catch (err: any) {
        console.warn('DB update skipped:', err.message);
      }

      await recordLedgerEvent({
        jobId,
        eventType: 'JOB_FUNDED_CAPTURED',
        actorType: 'client',
        details: {
          paypalOrderId: orderId,
          paypalCaptureId: captureId,
          status: captureData.status,
        },
      });

      return NextResponse.json({
        success: true,
        status: 'funded',
        captureId,
      });
    }

    // Step 1: Create PayPal Order
    const amount = body.amount || '150.00';
    const order = await createOrder({
      amount: parseFloat(amount).toFixed(2),
      currency: 'USD',
      description: `Escrow Funding for Job ${jobId}`,
      referenceId: jobId,
    });

    await recordLedgerEvent({
      jobId,
      eventType: 'PAYPAL_ORDER_CREATED',
      actorType: 'client',
      details: {
        orderId: order.id,
        amount,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      links: order.links,
    });
  } catch (error: any) {
    console.error('Job funding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
