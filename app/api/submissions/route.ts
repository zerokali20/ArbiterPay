import { NextResponse } from 'next/server';
import { db } from '@/db';
import { milestones, jobs } from '@/db/schema';
import { evaluateDeliverable } from '@/lib/arbiter';
import { evaluatePolicy } from '@/lib/policy';
import { recordLedgerEvent } from '@/lib/ledger';
import { getInMemoryJob } from '@/lib/jobsStore';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      milestoneId,
      jobId,
      submissionType = 'file_upload',
      codeContent,       // uploaded or pasted code text
      fileName,          // e.g. "script.py"
      content,           // legacy fallback
      githubRepoUrl,
      filesInspected,
      freelancerPayPalEmail,
      taskPrompt,        // original task description from client
    } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'milestoneId is required' },
        { status: 400 }
      );
    }

    // 1. Fetch milestone details (DB first, then in-memory)
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

    // Fall back to in-memory store
    if (!milestoneRow && jobId) {
      const memJob = getInMemoryJob(jobId);
      if (memJob) {
        milestoneRow = memJob.milestones.find((m) => m.id === milestoneId) || memJob.milestones[0];
      }
    }

    const title = milestoneRow?.title || 'Coding Task Milestone';
    const description = milestoneRow?.description || 'Evaluate submitted code against task requirements';
    const amount = milestoneRow?.amount || '50.00';

    // Build criteria — convert from various formats
    let rawCriteria = milestoneRow?.acceptanceCriteria || milestoneRow?.criteria || [];
    if (!Array.isArray(rawCriteria)) rawCriteria = [];

    const criteria = rawCriteria.length > 0
      ? rawCriteria.map((c: any, i: number) =>
          typeof c === 'string'
            ? { id: `crit-${i + 1}`, description: c }
            : c?.description
            ? { id: c.id || `crit-${i + 1}`, description: c.description }
            : { id: `crit-${i + 1}`, description: String(c) }
        )
      : [
          { id: 'crit-1', description: 'Script accepts a URL as input and processes it correctly.' },
          { id: 'crit-2', description: 'Script extracts all H1 tags from the page HTML.' },
          { id: 'crit-3', description: 'Script outputs a valid CSV file with the extracted data.' },
          { id: 'crit-4', description: 'Script handles errors gracefully (invalid URLs, network failures).' },
        ];

    // The code content — use codeContent (new), fall back to content (legacy)
    const resolvedCode = codeContent || content || '';

    // 2. Run AI Code Evaluation
    console.log(`[SUBMISSION] AI evaluating code for milestone: ${milestoneId}`);
    const verdict = await evaluateDeliverable(
      {
        id: milestoneId,
        title,
        description,
        amount,
        criteria,
        taskPrompt: taskPrompt || description,
      },
      {
        submissionType,
        content: resolvedCode,
        fileName,
        githubRepoUrl,
        filesInspected,
      }
    );

    // 3. Policy layer decides payout
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

    // 4. Update DB milestone status
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

    // 5. Record to ledger
    await recordLedgerEvent({
      jobId: jobId || milestoneRow?.jobId || 'job-default',
      milestoneId,
      eventType: 'CODE_SUBMISSION_EVALUATED',
      actorType: 'arbiter',
      details: {
        score: verdict.totalScore,
        overallResult: verdict.overallResult,
        policyAction: policyDecision.action,
        fileName: fileName || 'submission',
        modelUsed: verdict.modelUsed,
      },
    });

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
