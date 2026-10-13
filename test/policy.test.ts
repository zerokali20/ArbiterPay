/**
 * Unit Tests for Policy Layer & Idempotency Guarantees.
 * Run with: npx tsx test/policy.test.ts
 */

import { evaluatePolicy } from '../lib/policy';
import { ArbiterVerdict } from '../lib/arbiter';

async function runPolicyTests() {
  console.log('🧪 Running ArbiterPay Policy Layer & Idempotency Tests\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Strict Idempotency: Milestone already marked 'paid' must NEVER pay again
  const paidVerdict: ArbiterVerdict = {
    overallResult: 'pass',
    confidence: 0.99,
    summary: 'Everything perfect',
    criteriaResults: [],
    fixList: [],
    modelUsed: 'claude-3-5-sonnet-latest',
    promptVersion: 'v1.0.0',
  };

  const idempotencyDecision = await evaluatePolicy({
    jobId: 'job-test',
    milestoneId: 'ms-paid-01',
    milestoneTitle: 'Paid Milestone',
    milestoneAmount: '50.00',
    milestoneStatus: 'paid', // ALREADY PAID
    freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
    verdict: paidVerdict,
  });

  assert(
    idempotencyDecision.action === 'ROUTE_TO_HUMAN_REVIEW' &&
      idempotencyDecision.reason.includes('already marked PAID'),
    'Idempotency: Blocks duplicate payout when milestoneStatus === "paid"'
  );

  // 2. High-Value Route: Milestone >= $500 must route to human review
  const highValueDecision = await evaluatePolicy({
    jobId: 'job-test',
    milestoneId: 'ms-high-val',
    milestoneTitle: 'High Value Milestone',
    milestoneAmount: '550.00', // Exceeds $500 threshold
    milestoneStatus: 'submitted',
    freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
    verdict: paidVerdict,
  });

  assert(
    highValueDecision.action === 'ROUTE_TO_HUMAN_REVIEW' &&
      highValueDecision.routedToHuman === true,
    'Policy Safety: Routes milestone >= $500 to human review'
  );

  // 3. Low-Confidence Route: Confidence < 0.75 must route to human review
  const lowConfidenceVerdict: ArbiterVerdict = {
    ...paidVerdict,
    confidence: 0.58, // Below 0.75
  };

  const lowConfidenceDecision = await evaluatePolicy({
    jobId: 'job-test',
    milestoneId: 'ms-low-conf',
    milestoneTitle: 'Ambiguous Milestone',
    milestoneAmount: '50.00',
    milestoneStatus: 'submitted',
    freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
    verdict: lowConfidenceVerdict,
  });

  assert(
    lowConfidenceDecision.action === 'ROUTE_TO_HUMAN_REVIEW' &&
      lowConfidenceDecision.routedToHuman === true,
    'Policy Safety: Routes low confidence verdict (< 0.75) to human review'
  );

  // 4. Failed Verdict: Must reject and issue fix-list without paying
  const failedVerdict: ArbiterVerdict = {
    overallResult: 'fail',
    confidence: 0.95,
    summary: 'Requirements unmet',
    criteriaResults: [],
    fixList: ['Add unit tests', 'Hash passwords with bcrypt'],
    modelUsed: 'claude-3-5-sonnet-latest',
    promptVersion: 'v1.0.0',
  };

  const failDecision = await evaluatePolicy({
    jobId: 'job-test',
    milestoneId: 'ms-fail',
    milestoneTitle: 'Failing Milestone',
    milestoneAmount: '50.00',
    milestoneStatus: 'submitted',
    freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
    verdict: failedVerdict,
  });

  assert(
    failDecision.action === 'REJECT_REQUIRE_FIX' &&
      failDecision.newMilestoneStatus === 'failed',
    'Policy Logic: Rejects failed milestone and updates status to failed'
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runPolicyTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
