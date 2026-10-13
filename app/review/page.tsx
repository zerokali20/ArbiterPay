'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HumanReviewPage() {
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const [disputedCases, setDisputedCases] = useState([
    {
      id: 'dispute-01',
      jobId: 'job-9842',
      jobTitle: 'Production Microservice & Automated CI Pipeline',
      milestoneId: 'ms-03',
      milestoneTitle: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
      amount: '50.00',
      reasonRouted: 'Low AI Confidence Score (0.52 < 0.75 threshold). Ambiguous test execution logs.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Freelancer submitted GitHub actions file and OpenAPI spec, but local build output was truncated.',
      aiAnalysis: {
        verdict: 'partial',
        confidence: 0.52,
        criteria: [
          { name: 'GitHub Actions workflow', status: 'pass', evidence: '.github/workflows/ci.yml present' },
          { name: 'OpenAPI 3.0 specification file', status: 'partial', evidence: 'openapi.yaml exists but schemas incomplete' },
        ],
      },
      status: 'pending_review',
    },
    {
      id: 'dispute-02',
      jobId: 'job-4120',
      jobTitle: 'Enterprise PostgreSQL Cluster Migration',
      milestoneId: 'ms-01',
      milestoneTitle: 'Milestone 1: Zero-Downtime Replication Setup',
      amount: '650.00',
      reasonRouted: 'High-Value Milestone ($650.00 exceeds $500 safety threshold). Requires human sign-off.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Logical replication stream verified with WAL logs and automated failover script.',
      aiAnalysis: {
        verdict: 'pass',
        confidence: 0.94,
        criteria: [
          { name: 'WAL replication slot active', status: 'pass', evidence: 'pg_replication_slots query verified' },
          { name: 'Failover script test suite', status: 'pass', evidence: 'tests/failover.test.sh passed' },
        ],
      },
      status: 'pending_review',
    },
  ]);

  const handleApprove = async (caseItem: any) => {
    setProcessing(caseItem.id);

    try {
      // Release payout manually through backend Payouts API
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: caseItem.milestoneId,
          jobId: caseItem.jobId,
          submissionType: 'github_repo',
          content: 'Manually reviewed and approved by human administrator with AI evidence override.',
          freelancerPayPalEmail: caseItem.freelancerPayPalEmail,
        }),
      });

      const data = await res.json();
      setDecisions((prev) => ({ ...prev, [caseItem.id]: 'APPROVED' }));
      setDisputedCases((prev) =>
        prev.map((c) => (c.id === caseItem.id ? { ...c, status: 'approved_paid' } : c))
      );
      alert(`✅ Payout Approved & Released via PayPal Payouts to ${caseItem.freelancerPayPalEmail}!`);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (caseItem: any) => {
    setDecisions((prev) => ({ ...prev, [caseItem.id]: 'REJECTED' }));
    setDisputedCases((prev) =>
      prev.map((c) => (c.id === caseItem.id ? { ...c, status: 'rejected_revision' } : c))
    );
    alert('❌ Deliverable rejected. Fix-list returned to freelancer.');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              🛡️ Human Review & Dispute Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Human-in-the-loop review for deliverables flagged by the Arbiter AI policy (low confidence, disputed criteria, or high escrow value ≥ $500).
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/ledger"
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              📊 View AG Grid Ledger
            </Link>
          </div>
        </div>

        {/* Disputes Queue */}
        <div className="space-y-6">
          {disputedCases.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200">
                    Routing Trigger: {item.reasonRouted}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{item.milestoneTitle}</h3>
                  <p className="text-xs text-slate-500">
                    Job: {item.jobTitle} (ID: {item.jobId})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">${item.amount}</span>
                  <span className="text-xs text-slate-500 block">Escrow Amount</span>
                </div>
              </div>

              {/* AI Arbiter Evidence & Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Freelancer Deliverable Submission
                  </h4>
                  <p className="text-xs text-slate-700">{item.deliverableSummary}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Freelancer Payout Email:{' '}
                    <strong className="font-mono text-slate-800">{item.freelancerPayPalEmail}</strong>
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    🤖 Claude AI Arbiter Inspection
                  </h4>
                  <div className="space-y-1.5">
                    {item.aiAnalysis.criteria.map((c, idx) => (
                      <div key={idx} className="text-xs flex items-start justify-between">
                        <span className="text-slate-700">{c.name}:</span>
                        <span
                          className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                            c.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Confidence: <strong>{item.aiAnalysis.confidence}</strong>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  {item.status === 'approved_paid' ? (
                    <span className="text-emerald-600 font-bold">
                      ✅ Approved & Released via PayPal Payouts
                    </span>
                  ) : item.status === 'rejected_revision' ? (
                    <span className="text-rose-600 font-bold">
                      ❌ Rejected: Fix-list issued to freelancer
                    </span>
                  ) : (
                    'Action required: Approve manual PayPal Payout release or reject with revision note.'
                  )}
                </span>

                {item.status === 'pending_review' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(item)}
                      disabled={processing === item.id}
                      className="px-4 py-2 border border-rose-300 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-50"
                    >
                      Reject & Require Fix
                    </button>
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={processing === item.id}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                    >
                      {processing === item.id ? 'Processing Payout...' : 'Approve & Release PayPal Payout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
