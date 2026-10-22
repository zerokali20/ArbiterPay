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
      jobTitle: 'Python Web Scraper: URL → CSV of H1 Tags',
      milestoneId: 'ms-01',
      milestoneTitle: 'Milestone 1: Core Scraper — URL Input & H1 Extraction',
      amount: '75.00',
      reasonRouted:
        'Score 73/100 — Low AI Confidence (0.51 < 0.60 threshold). BeautifulSoup import detected but CSV output path ambiguous.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Freelancer submitted scraper.py. Script fetches URL and parses HTML, but CSV writing is incomplete — file is opened but DictWriter headers not defined.',
      aiAnalysis: {
        totalScore: 73,
        confidence: 0.51,
        criteriaResults: [
          { name: 'URL input via sys.argv', score: 95, status: 'pass', evidence: 'sys.argv[1] usage detected' },
          { name: 'Fetch HTML with requests', score: 90, status: 'pass', evidence: 'requests.get(url) present' },
          { name: 'Extract H1 tags with BeautifulSoup', score: 85, status: 'pass', evidence: 'soup.find_all("h1") found' },
          { name: 'Write CSV with DictWriter', score: 40, status: 'fail', evidence: 'csv.writer opened but fieldnames missing' },
          { name: 'Error handling for invalid URLs', score: 55, status: 'fail', evidence: 'try/except present but bare except clause' },
        ],
      },
      status: 'pending_review',
    },
    {
      id: 'dispute-02',
      jobId: 'job-4120',
      jobTitle: 'Node.js REST API with JWT Auth',
      milestoneId: 'ms-02',
      milestoneTitle: 'Milestone 2: Endpoint Security & Rate Limiting',
      amount: '650.00',
      reasonRouted:
        'Score 94/100 ✓ but milestone ($650) exceeds $500 high-value threshold. Requires human sign-off before PayPal release.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Complete Express.js implementation with JWT middleware, express-rate-limit, and full test suite passing. All acceptance criteria verified by AI.',
      aiAnalysis: {
        totalScore: 94,
        confidence: 0.96,
        criteriaResults: [
          { name: 'JWT middleware on protected routes', score: 97, status: 'pass', evidence: 'app.use(authenticateToken) applied to /api/*' },
          { name: 'Rate limiting (100 req/15min)', score: 95, status: 'pass', evidence: 'rateLimit({ windowMs: 15*60*1000, max: 100 })' },
          { name: 'Test suite coverage > 80%', score: 90, status: 'pass', evidence: 'jest --coverage reports 87.4% coverage' },
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
          submissionType: 'text',
          codeContent: 'Manually reviewed and approved by human administrator. AI evidence confirmed.',
          freelancerPayPalEmail: caseItem.freelancerPayPalEmail,
          taskPrompt: caseItem.deliverableSummary,
        }),
      });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = {}; }
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
            Deliverables routed by policy: AI confidence &lt; 0.60 or milestone ≥ $500
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
        {disputedCases.map((item) => {
          const score = item.aiAnalysis.totalScore;
          const scoreColor =
            score >= 90 ? 'text-emerald-600 dark:text-[#4cb782]' :
            score >= 50 ? 'text-amber-600 dark:text-[#d9a441]' :
            'text-rose-600 dark:text-[#e5484d]';
          const scoreBg =
            score >= 90 ? 'border-emerald-300 bg-emerald-50 dark:bg-[#0f1713] dark:border-[#254634]' :
            score >= 50 ? 'border-amber-300 bg-amber-50 dark:bg-[#1a1711] dark:border-[#3f3521]' :
            'border-rose-300 bg-rose-50 dark:bg-[#1c1214] dark:border-[#4c1e22]';

          return (
            <div
              key={item.id}
              className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-5 transition-colors"
            >
              {/* Case header */}
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

                <div className="flex flex-col items-end gap-1">
                  {/* Score gauge */}
                  <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${scoreBg}`}>
                    <span className={`text-lg font-extrabold leading-none font-mono ${scoreColor}`}>{score}</span>
                    <span className="text-[9px] text-slate-500 dark:text-[#81848b]">/100</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-[#ececed]">${item.amount}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">Escrow Amount</span>
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
                    <span>Claude Arbiter — Per-Criterion Scores</span>
                    <span>Confidence: {item.aiAnalysis.confidence}</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {item.aiAnalysis.criteriaResults.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px] gap-2">
                        <span className="text-slate-800 dark:text-[#ececed] flex-1">{c.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`font-bold font-mono ${
                            c.score >= 90 ? 'text-emerald-600 dark:text-[#4cb782]' :
                            c.score >= 50 ? 'text-amber-600 dark:text-[#d9a441]' :
                            'text-rose-600 dark:text-[#e5484d]'
                          }`}>{c.score}/100</span>
                          <span className={`px-1.5 py-0.5 rounded uppercase text-[10px] font-semibold ${
                            c.status === 'pass'
                              ? 'text-emerald-700 bg-emerald-100 dark:text-[#4cb782] dark:bg-[#1a2e23]'
                              : 'text-rose-700 bg-rose-100 dark:text-[#e5484d] dark:bg-[#311518]'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs font-mono">
                <div>
                  {item.status === 'approved_paid' ? (
                    <span className="text-emerald-600 dark:text-[#4cb782]">✓ Approved &amp; Released via PayPal Payouts</span>
                  ) : item.status === 'rejected_revision' ? (
                    <span className="text-rose-600 dark:text-[#e5484d]">✕ Rejected: Fix-list issued to freelancer</span>
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
                      Reject &amp; Require Fix
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
          );
        })}
      </div>
    </div>
  );
}
