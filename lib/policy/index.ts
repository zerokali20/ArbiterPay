/**
 * Deterministic Policy Layer — Score-Based (≥90 = AUTO_PAYOUT).
 *
 * NON-NEGOTIABLE RULE 1: The AI NEVER moves money directly.
 * NON-NEGOTIABLE RULE 4: Payouts are strictly idempotent.
 */

import { ArbiterVerdict } from '../arbiter';
import { createBatchPayout } from '../paypal';
import { recordLedgerEvent } from '../ledger';

export const SCORE_THRESHOLD = 90; // ≥90 → auto payout, <90 → human review
export const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.ARBITER_CONFIDENCE_THRESHOLD || '0.60'
);
export const HIGH_VALUE_THRESHOLD = parseFloat(
  process.env.ARBITER_HIGH_VALUE_THRESHOLD || '500'
);

export interface PolicyEvaluationParams {
  jobId: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: string;
  milestoneStatus: string;
  freelancerPayPalEmail: string;
  verdict: ArbiterVerdict;
}

export interface PolicyDecision {
  action: 'AUTO_PAYOUT_EXECUTED' | 'ROUTE_TO_HUMAN_REVIEW' | 'REJECT_REQUIRE_FIX';
  reason: string;
  payoutBatchId?: string;
  routedToHuman: boolean;
  newMilestoneStatus: 'paid' | 'disputed' | 'failed' | 'partial';
  score?: number;
}

export async function evaluatePolicy(
  params: PolicyEvaluationParams
): Promise<PolicyDecision> {
  const {
    jobId,
    milestoneId,
    milestoneTitle,
    milestoneAmount,
    milestoneStatus,
    freelancerPayPalEmail,
    verdict,
  } = params;

  const numericAmount = parseFloat(milestoneAmount);
  const score = verdict.totalScore ?? (verdict.overallResult === 'pass' ? 95 : verdict.overallResult === 'partial' ? 65 : 30);

  // 1. STRICT IDEMPOTENCY CHECK
  if (milestoneStatus === 'paid') {
    console.warn(`[POLICY IDEMPOTENCY] Milestone ${milestoneId} already PAID. Payout blocked.`);
    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason: 'Milestone already marked PAID. Redundant payout blocked.',
      routedToHuman: true,
      newMilestoneStatus: 'paid',
      score,
    };
  }

  // 2. SCORE < 50 → REJECT (too far from threshold)
  if (score < 50) {
    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'ARBITER_VERDICT_FAILED',
      actorType: 'arbiter',
      details: { score, fixList: verdict.fixList },
    });
    return {
      action: 'REJECT_REQUIRE_FIX',
      reason: `Score ${score}/100 — Below minimum acceptable threshold (50). Fix list issued.`,
      routedToHuman: false,
      newMilestoneStatus: 'failed',
      score,
    };
  }

  // 3. SCORE 50–89 → REQUIRE REVISION
  if (score < SCORE_THRESHOLD) {
    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'ARBITER_VERDICT_PARTIAL',
      actorType: 'arbiter',
      details: { score, threshold: SCORE_THRESHOLD, fixList: verdict.fixList },
    });
    return {
      action: 'REJECT_REQUIRE_FIX',
      reason: `Score ${score}/100 — Needs improvement to reach auto-payout threshold (${SCORE_THRESHOLD}). Fix list issued.`,
      routedToHuman: false,
      newMilestoneStatus: 'partial',
      score,
    };
  }

  // 4. HUMAN REVIEW: Low Confidence despite passing score
  if (verdict.confidence < CONFIDENCE_THRESHOLD) {
    const reason = `Score ${score}/100 qualifies, but confidence (${verdict.confidence.toFixed(2)}) is below safety threshold (${CONFIDENCE_THRESHOLD}). Routed to human reviewer.`;
    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'ROUTED_TO_HUMAN_LOW_CONFIDENCE',
      actorType: 'system',
      details: { score, confidence: verdict.confidence, threshold: CONFIDENCE_THRESHOLD },
    });
    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
      score,
    };
  }

  // 5. HUMAN REVIEW: High Value Milestone
  if (numericAmount >= HIGH_VALUE_THRESHOLD) {
    const reason = `Score ${score}/100 ✓ but milestone ($${numericAmount}) exceeds high-value threshold ($${HIGH_VALUE_THRESHOLD}). Human sign-off required.`;
    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'ROUTED_TO_HUMAN_HIGH_VALUE',
      actorType: 'system',
      details: { score, amount: numericAmount, threshold: HIGH_VALUE_THRESHOLD },
    });
    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
      score,
    };
  }

  // 6. SCORE ≥ 90 → AUTO PAYOUT VIA PAYPAL PAYOUTS API
  console.log(`[POLICY APPROVAL] Score ${score}/100 ≥ ${SCORE_THRESHOLD}. Initiating PayPal Payout for Milestone ${milestoneId}.`);
  const senderBatchId = `batch-${milestoneId.slice(0, 8)}-${Date.now()}`;
  const senderItemId = `item-${milestoneId.slice(0, 8)}-${Date.now()}`;

  try {
    const payoutResult = await createBatchPayout(senderBatchId, [
      {
        receiverEmail: freelancerPayPalEmail,
        amount: numericAmount.toFixed(2),
        currency: 'USD',
        note: `ArbiterPay Code Escrow Release: ${milestoneTitle} scored ${score}/100 by AI`,
        senderItemId,
      },
    ]);

    const batchId = payoutResult.batch_header.payout_batch_id;

    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'PAYPAL_PAYOUT_RELEASED',
      actorType: 'system',
      details: {
        payoutBatchId: batchId,
        score,
        amount: numericAmount.toFixed(2),
        receiver: freelancerPayPalEmail,
        verdictConfidence: verdict.confidence,
      },
    });

    return {
      action: 'AUTO_PAYOUT_EXECUTED',
      reason: `Score ${score}/100 ≥ ${SCORE_THRESHOLD} threshold. PayPal payout automatically released.`,
      payoutBatchId: batchId,
      routedToHuman: false,
      newMilestoneStatus: 'paid',
      score,
    };
  } catch (err: any) {
    console.error('[POLICY PAYOUT ERROR]', err.message);
    await recordLedgerEvent({
      jobId, milestoneId,
      eventType: 'PAYPAL_PAYOUT_FAILED',
      actorType: 'system',
      details: { error: err.message, score },
    });
    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason: `Score ${score}/100 approved but PayPal Payout API failed: ${err.message}. Routed for manual release.`,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
      score,
    };
  }
}
