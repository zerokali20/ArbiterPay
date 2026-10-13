/**
 * Deterministic Policy Layer.
 * 
 * NON-NEGOTIABLE RULE 1: The AI NEVER moves money directly.
 * It returns a structured verdict. This deterministic code evaluates that verdict
 * against rigorous business rules to approve payouts, require revisions, or route to human review.
 * 
 * NON-NEGOTIABLE RULE 4: Payouts are strictly idempotent. A milestone can NEVER be paid twice.
 */

import { ArbiterVerdict } from '../arbiter';
import { createBatchPayout } from '../paypal';
import { recordLedgerEvent } from '../ledger';

export const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.ARBITER_CONFIDENCE_THRESHOLD || '0.75'
);

export const HIGH_VALUE_THRESHOLD = parseFloat(
  process.env.ARBITER_HIGH_VALUE_THRESHOLD || '500'
);

export interface PolicyEvaluationParams {
  jobId: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: string; // e.g., '150.00'
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
}

/**
 * Execute policy evaluation on an Arbiter verdict.
 */
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

  // 1. STRICT IDEMPOTENCY CHECK
  if (milestoneStatus === 'paid') {
    console.warn(`[POLICY IDEMPOTENCY] Milestone ${milestoneId} is already marked PAID. Payout blocked.`);
    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason: 'Milestone is already marked PAID. Redundant payout blocked for idempotency safety.',
      routedToHuman: true,
      newMilestoneStatus: 'paid',
    };
  }

  // 2. CHECK VERDICT RESULT
  if (verdict.overallResult === 'fail') {
    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'ARBITER_VERDICT_FAILED',
      actorType: 'arbiter',
      details: {
        verdict: verdict.overallResult,
        confidence: verdict.confidence,
        fixList: verdict.fixList,
      },
    });

    return {
      action: 'REJECT_REQUIRE_FIX',
      reason: 'Deliverable failed milestone criteria. Fix-list issued to freelancer.',
      routedToHuman: false,
      newMilestoneStatus: 'failed',
    };
  }

  if (verdict.overallResult === 'partial') {
    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'ARBITER_VERDICT_PARTIAL',
      actorType: 'arbiter',
      details: {
        verdict: verdict.overallResult,
        confidence: verdict.confidence,
        fixList: verdict.fixList,
      },
    });

    return {
      action: 'REJECT_REQUIRE_FIX',
      reason: 'Deliverable partially met criteria. Specific revision required before payout.',
      routedToHuman: false,
      newMilestoneStatus: 'partial',
    };
  }

  // 3. HUMAN REVIEW ROUTING: Low Confidence
  if (verdict.confidence < CONFIDENCE_THRESHOLD) {
    const reason = `Confidence score (${verdict.confidence.toFixed(2)}) is below safety threshold (${CONFIDENCE_THRESHOLD}). Routed to human reviewer.`;
    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'ROUTED_TO_HUMAN_LOW_CONFIDENCE',
      actorType: 'system',
      details: { confidence: verdict.confidence, threshold: CONFIDENCE_THRESHOLD },
    });

    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
    };
  }

  // 4. HUMAN REVIEW ROUTING: High Value Milestone
  if (numericAmount >= HIGH_VALUE_THRESHOLD) {
    const reason = `Milestone amount ($${numericAmount.toFixed(2)}) meets or exceeds high-value threshold ($${HIGH_VALUE_THRESHOLD}). Requires human sign-off.`;
    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'ROUTED_TO_HUMAN_HIGH_VALUE',
      actorType: 'system',
      details: { amount: numericAmount, threshold: HIGH_VALUE_THRESHOLD },
    });

    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
    };
  }

  // 5. DETERMINISTIC APPROVAL: Auto-release PayPal Payout
  console.log(`[POLICY APPROVAL] Milestone ${milestoneId} approved! Initiating PayPal Payout.`);
  const senderBatchId = `batch-${milestoneId.slice(0, 8)}-${Date.now()}`;
  const senderItemId = `item-${milestoneId.slice(0, 8)}-${Date.now()}`;

  try {
    const payoutResult = await createBatchPayout(senderBatchId, [
      {
        receiverEmail: freelancerPayPalEmail,
        amount: numericAmount.toFixed(2),
        currency: 'USD',
        note: `ArbiterPay Escrow Release: ${milestoneTitle} verified by AI`,
        senderItemId,
      },
    ]);

    const batchId = payoutResult.batch_header.payout_batch_id;

    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'PAYPAL_PAYOUT_RELEASED',
      actorType: 'system',
      details: {
        payoutBatchId: batchId,
        amount: numericAmount.toFixed(2),
        receiver: freelancerPayPalEmail,
        verdictConfidence: verdict.confidence,
      },
    });

    return {
      action: 'AUTO_PAYOUT_EXECUTED',
      reason: `Milestone verified with high confidence (${verdict.confidence.toFixed(2)}). PayPal payout released.`,
      payoutBatchId: batchId,
      routedToHuman: false,
      newMilestoneStatus: 'paid',
    };
  } catch (err: any) {
    console.error(`[POLICY PAYOUT ERROR] Payout call failed:`, err.message);

    await recordLedgerEvent({
      jobId,
      milestoneId,
      eventType: 'PAYPAL_PAYOUT_FAILED',
      actorType: 'system',
      details: { error: err.message },
    });

    return {
      action: 'ROUTE_TO_HUMAN_REVIEW',
      reason: `Arbiter approved, but PayPal Payout API call failed: ${err.message}. Routed for manual review.`,
      routedToHuman: true,
      newMilestoneStatus: 'disputed',
    };
  }
}
