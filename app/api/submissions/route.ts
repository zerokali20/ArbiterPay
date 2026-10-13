import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, milestones, verdicts, jobs } from '@/db/schema';
import { evaluateDeliverable } from '@/lib/arbiter';
import { evaluatePolicy } from '@/lib/policy';
import { recordLedgerEvent } from '@/lib/ledger';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      milestoneId,
      jobId,
      submissionType,
      content,
      githubRepoUrl,
      fileUrl,
      filesInspected,
      freelancerPayPalEmail,
    } = body;

    if (!milestoneId || !submissionType) {
      return NextResponse.json(
        { error: 'milestoneId and submissionType are required' },
        { status: 400 }
      );
    }

    // 1. Fetch milestone details
    let milestoneRow: any = null;
    let jobRow: any = null;

    try {
      milestoneRow = await db.query.milestones.findFirst({
        where: eq(milestones.id, milestoneId),
      });

      if (milestoneRow) {
        jobRow = await db.query.jobs.findFirst({
          where: eq(jobs.id, milestoneRow.jobId),
        });
      }
    } catch (err: any) {
      console.warn('DB query skipped during submission:', err.message);
    }

    const title = milestoneRow?.title || 'Milestone Deliverable';
    const description = milestoneRow?.description || 'Verify against criteria';
    const amount = milestoneRow?.amount || '50.00';
    const criteria = milestoneRow?.acceptanceCriteria || [
      { id: 'crit-1', description: 'Code implementation meets requirements' },
      { id: 'crit-2', description: 'Automated test assertions included' },
    ];

    // 2. Run Arbiter Evaluation
    console.log(`[SUBMISSION] Running AI Arbiter for Milestone: ${milestoneId}`);
    const verdict = await evaluateDeliverable(
      {
        id: milestoneId,
        title,
        description,
        amount,
        criteria,
      },
      {
        submissionType,
        content,
        githubRepoUrl,
        fileUrl,
        filesInspected,
      }
    );

    // 3. Run Deterministic Policy Layer
    const emailToPay =
      freelancerPayPalEmail ||
      process.env.PAYPAL_PERSONAL_EMAIL ||
      'sb-okeek53339723@personal.example.com';

    const policyDecision = await evaluatePolicy({
      jobId: jobId || milestoneRow?.jobId || 'job-default',
      milestoneId,
      milestoneTitle: title,
      milestoneAmount: amount,
      milestoneStatus: milestoneRow?.status || 'submitted',
      freelancerPayPalEmail: emailToPay,
      verdict,
    });

    // 4. Update Milestone & Verdict records
    try {
      await db
        .update(milestones)
        .set({
          status: policyDecision.newMilestoneStatus,
          payoutBatchId: policyDecision.payoutBatchId || null,
          updatedAt: new Date(),
        })
        .where(eq(milestones.id, milestoneId));
    } catch (dbErr: any) {
      console.warn('DB milestone update failed:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      verdict,
      policyDecision,
    });
  } catch (error: any) {
    console.error('Submission handling error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
