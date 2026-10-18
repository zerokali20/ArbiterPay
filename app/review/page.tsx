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
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Human-in-the-Loop Review
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] mt-1">
            Flagged Review Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#81848b] font-mono mt-0.5">
            Deliverables routed by policy when AI confidence &lt; 0.75 or milestone amount &ge; $500
          </p>
        </div>

        <div className="flex gap-2 text-xs font-mono">
          <Link
            href="/jobs/sample-demo-job"
            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-slate-800 dark:text-[#ececed] hover:bg-slate-200 dark:hover:bg-[#1a1b1e] transition-colors"
          >
            ← Live Demo
          </Link>
          <Link
            href="/ledger"
            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-slate-800 dark:text-[#ececed] hover:bg-slate-200 dark:hover:bg-[#1a1b1e] transition-colors"
          >
            Audit Ledger →
          </Link>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {disputedCases.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-5 transition-colors"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-[#212225] pb-4 gap-2">
              <div>
                <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 dark:text-[#d9a441] dark:bg-[#2a2417] px-2 py-0.5 rounded dark:border-[#3f3521]">
                  Policy Trigger: {item.reasonRouted}
                </span>
                <h3 className="text-base font-semibold text-slate-900 dark:text-[#ececed] mt-2">{item.milestoneTitle}</h3>
                <p className="text-xs font-mono text-slate-600 dark:text-[#81848b]">
                  Job: {item.jobTitle} ({item.jobId})
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-[#ececed]">${item.amount}</span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] block">Escrow Amount</span>
              </div>
            </div>

            {/* Evidence details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded bg-slate-50 dark:bg-[#08090a] border border-slate-200 dark:border-[#1a1b1e] space-y-2 transition-colors">
                <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase tracking-wider block">
                  Deliverable Notes
                </span>
                <p className="text-slate-800 dark:text-[#ececed] font-sans text-xs">{item.deliverableSummary}</p>
                <div className="text-[11px] text-slate-500 dark:text-[#81848b] pt-2 border-t border-slate-200 dark:border-[#1a1b1e]">
                  Freelancer: <span className="text-slate-900 dark:text-[#ececed]">{item.freelancerPayPalEmail}</span>
                </div>
              </div>

              <div className="p-4 rounded bg-slate-50 dark:bg-[#08090a] border border-slate-200 dark:border-[#1a1b1e] space-y-2 transition-colors">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
                  <span>Claude Arbiter Evaluation</span>
                  <span>Confidence: {item.aiAnalysis.confidence}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {item.aiAnalysis.criteria.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-800 dark:text-[#ececed]">{c.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded uppercase text-[10px] font-semibold ${
                          c.status === 'pass'
                            ? 'text-emerald-700 bg-emerald-100 dark:text-[#4cb782] dark:bg-[#1a2e23]'
                            : 'text-amber-700 bg-amber-100 dark:text-[#d9a441] dark:bg-[#2a2417]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs font-mono">
              <div>
                {item.status === 'approved_paid' ? (
                  <span className="text-emerald-600 dark:text-[#4cb782]">✓ Approved & Released via PayPal Payouts</span>
                ) : item.status === 'rejected_revision' ? (
                  <span className="text-rose-600 dark:text-[#e5484d]">✕ Rejected: Fix-list issued</span>
                ) : (
                  <span className="text-slate-500 dark:text-[#81848b]">Awaiting administrator action</span>
                )}
              </div>

              {item.status === 'pending_review' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(item)}
                    disabled={processing === item.id}
                    className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-[#1a1b1e] dark:text-[#e5484d] dark:border-[#2d2f33] dark:hover:bg-[#212225] transition-colors"
                  >
                    Reject & Require Fix
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={processing === item.id}
                    className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-bold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    {processing === item.id ? 'Processing...' : 'Approve & Release Payout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
