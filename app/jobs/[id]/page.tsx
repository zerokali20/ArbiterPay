'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = (params?.id as string) || 'job-sample';

  const [funding, setFunding] = useState(false);
  const [jobStatus, setJobStatus] = useState<'draft' | 'funded' | 'in_progress'>('draft');
  const [submittingMilestone, setSubmittingMilestone] = useState<number | null>(null);
  const [submissionScenario, setSubmissionScenario] = useState<'pass' | 'fail' | 'ambiguous'>('pass');
  const [verdictResult, setVerdictResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const [milestonesList, setMilestonesList] = useState([
    {
      id: 'ms-01',
      title: 'Milestone 1: Core Service & Authentication',
      amount: '50.00',
      status: 'pending',
      criteria: [
        'POST /auth/register and /auth/login with bcrypt password hashing',
        'JWT middleware protecting routes',
        'Automated test suite with >80% code coverage',
      ],
    },
    {
      id: 'ms-02',
      title: 'Milestone 2: Dockerization & Health Checks',
      amount: '50.00',
      status: 'pending',
      criteria: [
        'Multi-stage Dockerfile with non-root security user',
        'GET /health endpoint reporting status and uptime',
      ],
    },
    {
      id: 'ms-03',
      title: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
      amount: '50.00',
      status: 'pending',
      criteria: [
        'GitHub Actions workflow running lint and tests',
        'OpenAPI 3.0 specification file',
      ],
    },
  ]);

  const handleFundEscrow = async () => {
    setFunding(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '150.00' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');

      const captureRes = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture', orderId: data.orderId }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || 'Failed to capture funds');

      setJobStatus('funded');
      setMilestonesList((prev) =>
        prev.map((m, i) => (i === 0 ? { ...m, status: 'in_progress' } : m))
      );
    } catch (err: any) {
      alert(`Funding error: ${err.message}`);
    } finally {
      setFunding(false);
    }
  };

  const handleSubmitDeliverable = async (milestoneIdx: number) => {
    setEvaluating(true);
    const m = milestonesList[milestoneIdx];

    let filesInspected: any[] = [];
    let content = '';

    if (submissionScenario === 'pass') {
      content = 'Finished auth service with bcrypt password hashing, JWT expiration check, and Jest unit tests with 92% coverage.';
      filesInspected = [
        {
          path: 'src/auth.ts',
          content: 'bcrypt.hash(pw, 10); jwt.verify(token, process.env.JWT_SECRET);',
        },
        {
          path: 'test/auth.test.ts',
          content: 'describe("Auth", () => { test("passes", () => { expect(true).toBe(true); }); }); // Statements: 92%',
        },
      ];
    } else if (submissionScenario === 'fail') {
      content = 'Initial draft. Stored password as plain text for quick testing. Tests are not included yet.';
      filesInspected = [
        {
          path: 'src/auth.ts',
          content: 'users.find(u => u.password === req.body.password);',
        },
      ];
    } else {
      content = 'Auth middleware header check. Tests stubbed.';
      filesInspected = [
        {
          path: 'src/middleware.ts',
          content: 'if (req.headers.authorization) next();',
        },
      ];
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: m.id,
          jobId,
          submissionType: 'github_repo',
          githubRepoUrl: 'https://github.com/freelancer/auth-service',
          content,
          filesInspected,
          freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setVerdictResult(data);
      setMilestonesList((prev) =>
        prev.map((item, i) =>
          i === milestoneIdx
            ? { ...item, status: data.policyDecision.newMilestoneStatus }
            : item
        )
      );
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setEvaluating(false);
      setSubmittingMilestone(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* Top Header Card */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">JOB ID: {jobId}</span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                jobStatus === 'funded'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
              }`}
            >
              {jobStatus}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#ececed] mt-1.5">
            Production Microservice & Automated CI Pipeline
          </h1>
          <p className="text-xs font-mono text-slate-600 dark:text-[#81848b] mt-1">
            Total Escrow: $150.00 USD • 3 Milestones • Receiver: sb-okeek53339723@personal.example.com
          </p>
        </div>

        <div>
          {jobStatus === 'draft' ? (
            <button
              onClick={handleFundEscrow}
              disabled={funding}
              className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50"
            >
              {funding ? 'Funding via PayPal...' : 'Fund $150.00 via PayPal Sandbox'}
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded bg-emerald-50 dark:bg-[#141517] border border-emerald-200 dark:border-[#212225] text-xs font-mono text-emerald-700 dark:text-[#4cb782]">
              ✓ Escrow Funded (Orders v2 Captured)
            </div>
          )}
        </div>
      </div>

      {/* AI Verdict Inspection Banner */}
      {verdictResult && (
        <div
          className={`p-6 rounded-lg border font-mono transition-colors ${
            verdictResult.verdict.overallResult === 'pass'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-[#0f1713] dark:border-[#254634]'
              : verdictResult.verdict.overallResult === 'fail'
              ? 'bg-rose-50/70 border-rose-300 dark:bg-[#1c1214] dark:border-[#4c1e22]'
              : 'bg-amber-50/70 border-amber-300 dark:bg-[#1a1711] dark:border-[#3f3521]'
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-[#212225] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-[#81848b]">VERDICT:</span>
              <span
                className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                  verdictResult.verdict.overallResult === 'pass'
                    ? 'text-emerald-700 bg-emerald-100 dark:text-[#4cb782] dark:bg-[#1a2e23]'
                    : verdictResult.verdict.overallResult === 'fail'
                    ? 'text-rose-700 bg-rose-100 dark:text-[#e5484d] dark:bg-[#311518]'
                    : 'text-amber-700 bg-amber-100 dark:text-[#d9a441] dark:bg-[#2a2417]'
                }`}
              >
                {verdictResult.verdict.overallResult}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#81848b]">
                (Confidence: {verdictResult.verdict.confidence})
              </span>
            </div>

            <div className="text-xs text-slate-900 dark:text-[#ececed]">
              Policy Action: <strong className="text-slate-900 dark:text-white">{verdictResult.policyDecision.action}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-700 dark:text-[#ececed] mb-4 font-sans leading-relaxed">
            {verdictResult.verdict.summary}
          </p>

          {verdictResult.policyDecision.payoutBatchId && (
            <div className="p-3 rounded bg-white dark:bg-[#08090a] border border-emerald-300 dark:border-[#254634] text-xs text-emerald-700 dark:text-[#4cb782] mb-3">
              ✓ PayPal Payout Released: Batch ID{' '}
              <span className="font-bold">{verdictResult.policyDecision.payoutBatchId}</span>
              <br />
              <span className="text-slate-500 dark:text-[#81848b] text-[11px]">
                Target account credited: sb-okeek53339723@personal.example.com ($50.00 USD)
              </span>
            </div>
          )}

          {verdictResult.verdict.fixList?.length > 0 && (
            <div className="p-3 rounded bg-white dark:bg-[#08090a] border border-rose-300 dark:border-[#4c1e22] text-xs text-rose-700 dark:text-[#e5484d]">
              <span className="font-bold block mb-1">Generated Fix-List:</span>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {verdictResult.verdict.fixList.map((fix: string, idx: number) => (
                  <li key={idx}>{fix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Milestones Flow Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#ececed]">
            Escrow Milestones ({milestonesList.length})
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">
            Evaluation Mode: Strict Acceptance Checklist
          </span>
        </div>

        <div className="space-y-3">
          {milestonesList.map((m, idx) => (
            <div
              key={m.id}
              className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-4 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">0{idx + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ececed]">{m.title}</h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">Amount: ${m.amount} USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded uppercase border ${
                      m.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]'
                        : m.status === 'failed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#311518] dark:text-[#e5484d] dark:border-[#4c1e22]'
                        : m.status === 'disputed'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#141517] dark:text-[#81848b] dark:border-[#212225]'
                    }`}
                  >
                    {m.status}
                  </span>

                  {jobStatus === 'funded' && m.status !== 'paid' && (
                    <button
                      onClick={() => setSubmittingMilestone(idx)}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] border border-slate-200 dark:border-[#2d2f33] text-xs font-mono text-slate-800 dark:text-[#ececed] transition-colors"
                    >
                      Submit deliverable →
                    </button>
                  )}
                </div>
              </div>

              {/* Criteria */}
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-[#1a1b1e]">
                <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase">Criteria:</span>
                <ul className="space-y-1 text-slate-600 dark:text-[#9b9da3]">
                  {m.criteria.map((c, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 dark:text-[#81848b]">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submission drawer */}
              {submittingMilestone === idx && (
                <div className="p-4 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#2d2f33] space-y-3 font-mono text-xs transition-colors">
                  <div className="font-semibold text-slate-900 dark:text-[#ececed]">
                    Test Scenario Selection for AI Arbiter:
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-[#9b9da3]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={submissionScenario === 'pass'}
                        onChange={() => setSubmissionScenario('pass')}
                      />
                      <span className="text-emerald-600 dark:text-[#4cb782]">Pass (bcrypt + tests)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={submissionScenario === 'fail'}
                        onChange={() => setSubmissionScenario('fail')}
                      />
                      <span className="text-rose-600 dark:text-[#e5484d]">Fail (plaintext, no tests)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={submissionScenario === 'ambiguous'}
                        onChange={() => setSubmissionScenario('ambiguous')}
                      />
                      <span className="text-amber-600 dark:text-[#d9a441]">Ambiguous (Human review)</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSubmitDeliverable(idx)}
                      disabled={evaluating}
                      className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50"
                    >
                      {evaluating ? 'Running Arbiter...' : 'Run Arbitration'}
                    </button>
                    <button
                      onClick={() => setSubmittingMilestone(null)}
                      className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-[#1a1b1e] dark:text-[#81848b] dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
