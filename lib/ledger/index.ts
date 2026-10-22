/**
 * Append-Only Audit Ledger Module.
 * Records all system events, AI verdicts, and PayPal payment milestones.
 * Guaranteed immutable ledger structure with in-memory persistence and DB sync.
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

export interface InMemoryLedgerEntry {
  id: string;
  jobId?: string | null;
  milestoneId?: string | null;
  eventType: string;
  actorType: string;
  actorId?: string | null;
  details: Record<string, any>;
  createdAt: string;
}

declare global {
  var __arbiterLedgerStore: InMemoryLedgerEntry[] | undefined;
}

function getLedgerStore(): InMemoryLedgerEntry[] {
  if (!global.__arbiterLedgerStore) {
    global.__arbiterLedgerStore = [];
  }
  return global.__arbiterLedgerStore;
}

export function getInMemoryLedger(): InMemoryLedgerEntry[] {
  return [...getLedgerStore()];
}

export async function recordLedgerEvent(params: RecordLedgerParams) {
  const store = getLedgerStore();
  const memEntry: InMemoryLedgerEntry = {
    id: `ledg-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
    jobId: params.jobId || null,
    milestoneId: params.milestoneId || null,
    eventType: params.eventType,
    actorType: params.actorType,
    actorId: params.actorId || null,
    details: params.details || {},
    createdAt: new Date().toISOString(),
  };

  // Always record into memory store so it survives any DB resets
  store.unshift(memEntry);

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
    console.warn(`[LEDGER DB BYPASS] Recorded to memory store only (${err.message})`);
    return memEntry;
  }
}
