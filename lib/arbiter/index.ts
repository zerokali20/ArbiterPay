/**
 * AI Arbiter module.
 * Uses Claude API to evaluate deliverables against milestone criteria.
 *
 * Design rule: The AI never moves money. It returns a structured verdict.
 * A deterministic policy layer decides whether to call Payouts.
 */

export const ARBITER_MODEL = process.env.ARBITER_MODEL || 'claude-sonnet-4-20250514';
export const PROMPT_VERSION = 'v1.0.0';

// Arbiter prompt, schema, and evaluation logic will be implemented in Phase 1
