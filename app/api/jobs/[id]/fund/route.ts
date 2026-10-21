import { NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, milestones } from '@/db/schema';
import { createOrder, captureOrder } from '@/lib/paypal';
import { recordLedgerEvent } from '@/lib/ledger';
import { updateInMemoryJobStatus } from '@/lib/jobsStore';
import { eq } from 'drizzle-orm';

// CREATE Order for funding
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    const body = await request.json();
    const { action, orderId, amount } = body;

    if (action === 'capture' && orderId) {
      // Step 2: Capture payment after client approval
      const captureData = await captureOrder(orderId);
      const captureId =
        captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      // Update in-memory job status
      updateInMemoryJobStatus(jobId, 'funded');

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
    const fundingAmount = amount || '150.00';
    const orderData = await createOrder({
      amount: fundingAmount,
      currency: 'USD',
      description: `ArbiterPay Escrow Job Funding #${jobId}`,
      customId: jobId,
    });

    await recordLedgerEvent({
      jobId,
      eventType: 'ESCROW_FUND_INITIATED',
      actorType: 'client',
      details: {
        orderId: orderData.id,
        amount: fundingAmount,
        status: orderData.status,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      approvalUrl: orderData.links?.find((l: any) => l.rel === 'approve')?.href,
    });
  } catch (error: any) {
    console.error('Funding error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
