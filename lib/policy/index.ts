/**
 * Deterministic policy layer.
 * Takes an AI verdict and decides what action to take (payout, reject, route to human).
 *
 * Design rules:
 * - Low confidence routes to human review (threshold from config)
 * - High-value milestones route to human review (threshold from config)
 * - A milestone can never be paid twice (idempotency check)
 * - The AI never directly triggers a payout
 */

export const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.ARBITER_CONFIDENCE_THRESHOLD || '0.75'
);

export const HIGH_VALUE_THRESHOLD = parseFloat(
  process.env.ARBITER_HIGH_VALUE_THRESHOLD || '500'
);

// Policy evaluation logic will be implemented in Phase 2
