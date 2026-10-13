/**
 * Phase 1 Foundation Proof: Test PayPal Sandbox Flow.
 * 
 * Verifies:
 * 1. OAuth client credentials token generation
 * 2. Orders v2 creation (for escrow funding)
 * 3. Batch Payouts execution (for milestone release to freelancer)
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {
  getAccessToken,
  createOrder,
  createBatchPayout,
  getPayoutBatch,
} from '../lib/paypal';

async function main() {
  console.log('🏛️  ArbiterPay PayPal Sandbox Foundation Proof\n');
  console.log('----------------------------------------------------');

  try {
    // 1. OAuth
    console.log('[1/3] Testing OAuth2 token retrieval...');
    const token = await getAccessToken();
    console.log(`✅ OAuth Success! Token acquired (length: ${token.length})\n`);

    // 2. Orders v2 Create
    console.log('[2/3] Testing Orders v2 creation (Job Escrow Funding)...');
    const testAmount = '150.00';
    const order = await createOrder({
      amount: testAmount,
      currency: 'USD',
      description: 'Test Job Escrow: 3 Milestones ($150 total)',
      referenceId: 'test-job-' + Date.now(),
    });

    console.log(`✅ Order Created!`);
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Status:   ${order.status}`);
    const approveLink = order.links.find((l) => l.rel === 'approve')?.href;
    console.log(`   Checkout Approval URL: ${approveLink || 'N/A'}\n`);

    // 3. Payouts Test
    console.log('[3/3] Testing Payouts v1 (Milestone Release to Freelancer)...');
    const receiverEmail =
      process.env.PAYPAL_PERSONAL_EMAIL || 'sb-okeek53339723@personal.example.com';
    const batchId = `payout-batch-${Date.now()}`;
    const itemId = `milestone-item-${Date.now()}`;

    const payout = await createBatchPayout(batchId, [
      {
        receiverEmail: receiverEmail,
        amount: '50.00',
        currency: 'USD',
        note: 'ArbiterPay AI Arbitration: Milestone 1 passed verification',
        senderItemId: itemId,
      },
    ]);

    console.log(`✅ Payout Submitted!`);
    console.log(`   Payout Batch ID: ${payout.batch_header.payout_batch_id}`);
    console.log(`   Batch Status:    ${payout.batch_header.batch_status}`);

    // Wait 2 seconds and fetch status
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const batchDetails = await getPayoutBatch(payout.batch_header.payout_batch_id);
    console.log(
      `   Status Update:   ${batchDetails.batch_header?.batch_status || 'PENDING'}`
    );

    console.log('\n----------------------------------------------------');
    console.log('🎉 PayPal Foundation Proof Completed Successfully!');
  } catch (error: any) {
    console.error('❌ PayPal Test Error:', error.message);
    process.exit(1);
  }
}

main();
