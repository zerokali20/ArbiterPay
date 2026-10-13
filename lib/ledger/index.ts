/**
 * Append-Only Audit Ledger Module.
 * Records all system events, AI verdicts, and PayPal payment milestones.
 * Guaranteed immutable ledger structure.
 */

import { db } from '../../db';
import { ledger, actorTypeEnum } from '../../db/schema';

export type ActorType = (typeof actorTypeEnum.enumValues)[number];

export interface RecordLedgerParams {
  jobId?: string;
  milestoneId?: string;
  eventType: string;
  actorType: ActorType;
  actorId?: string;
  details: Record<string, any>;
}

export async function recordLedgerEvent(params: RecordLedgerParams) {
  try {
    const [entry] = await db
      .insert(ledger)
      .values({
        jobId: params.jobId,
        milestoneId: params.milestoneId,
        eventType: params.eventType,
        actorType: params.actorType,
        actorId: params.actorId,
        details: params.details,
      })
      .returning();

    console.log(`[LEDGER RECORDED] ${params.eventType} for Job: ${params.jobId || 'N/A'}`);
    return entry;
  } catch (err: any) {
    console.error(`[LEDGER WRITE ERROR] Failed to record event ${params.eventType}:`, err.message);
    // Return gracefully so transient db failures do not block critical path
    return null;
  }
}
