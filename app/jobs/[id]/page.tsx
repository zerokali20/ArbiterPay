'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = (params?.id as string) || 'job-sample';

  const [funding, setFunding] = useState(false);
  const [jobStatus, setJobStatus] = useState<'draft' | 'funded' | 'in_progress'>('draft');
  const [submittingMilestone, setSubmittingMilestone] = useState<number | null>(null);
  const [submissionScenario, setSubmissionScenario] = useState<'pass' | 'fail' | 'ambiguous'>('pass');
  const [verdictResult, setVerdictResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Mock milestones matching the flow for instant demo & live test
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

  // PayPal Funding Trigger (Orders v2)
  const handleFundEscrow = async () => {
    setFunding(true);
    try {
      // 1. Create PayPal Order
      const res = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: '150.00' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order');

      // 2. Capture Order for Escrow
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
      alert(`🎉 PayPal Sandbox Escrow Funded!\nCaptured Order: ${data.orderId}\nFunds held securely in platform escrow account.`);
    } catch (err: any) {
      alert(`Funding error: ${err.message}`);
    } finally {
      setFunding(false);
    }
  };

  // Submit Deliverable & Trigger AI Arbiter + Deterministic Policy
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

      // Update milestone status in UI
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Escrow Job ID: {jobId}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Production Microservice & Automated CI Pipeline
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Total Escrow: <strong>$150.00 USD</strong> (3 Milestones)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                jobStatus === 'funded'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {jobStatus.toUpperCase()}
            </span>

            {jobStatus === 'draft' && (
              <button
                onClick={handleFundEscrow}
                disabled={funding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {funding ? 'Funding...' : '💳 Fund $150 via PayPal Sandbox'}
              </button>
            )}
          </div>
        </div>

        {/* Verdict Results Banner */}
        {verdictResult && (
          <div
            className={`p-6 rounded-xl border ${
              verdictResult.verdict.overallResult === 'pass'
                ? 'bg-emerald-50 border-emerald-200'
                : verdictResult.verdict.overallResult === 'fail'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-slate-900">
                🤖 AI Arbiter Verdict:{' '}
                <span className="uppercase">
                  {verdictResult.verdict.overallResult}
                </span>{' '}
                (Confidence: {verdictResult.verdict.confidence})
              </h3>
              <span className="text-xs px-2.5 py-1 rounded bg-white font-mono text-slate-700 border">
                Policy Action: {verdictResult.policyDecision.action}
              </span>
            </div>
            <p className="text-sm text-slate-700 mb-4">
              {verdictResult.verdict.summary}
            </p>

            {verdictResult.policyDecision.payoutBatchId && (
              <div className="mb-4 p-3 bg-white rounded border border-emerald-300 text-xs font-mono text-emerald-800">
                ✅ PayPal Payout Batch Released:{' '}
                <strong>{verdictResult.policyDecision.payoutBatchId}</strong>
                <br />
                Sent to: sb-okeek53339723@personal.example.com ($50.00 USD)
              </div>
            )}

            {verdictResult.verdict.fixList?.length > 0 && (
              <div className="p-3 bg-white rounded border border-rose-300">
                <span className="text-xs font-bold text-rose-800 block mb-1">
                  Required Fixes Before Payout Approval:
                </span>
                <ul className="text-xs text-rose-700 list-disc list-inside space-y-1">
                  {verdictResult.verdict.fixList.map((fix: string, idx: number) => (
                    <li key={idx}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Milestones List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Escrow Milestones</h2>
          {milestonesList.map((m, idx) => (
            <div
              key={m.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{m.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        m.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : m.status === 'disputed'
                          ? 'bg-amber-100 text-amber-800'
                          : m.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    Amount: ${m.amount} USD
                  </span>
                </div>

                {jobStatus === 'funded' && m.status !== 'paid' && (
                  <button
                    onClick={() => setSubmittingMilestone(idx)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800"
                  >
                    📤 Submit Deliverable
                  </button>
                )}
              </div>

              {/* Acceptance Criteria */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Acceptance Criteria
                </span>
                <ul className="mt-1 space-y-1">
                  {m.criteria.map((c, cIdx) => (
                    <li key={cIdx} className="text-xs text-slate-600 flex items-start">
                      <span className="mr-1.5 text-blue-500">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Submission Modal / Box */}
              {submittingMilestone === idx && (
                <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 rounded-lg space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Submit Deliverable for Arbiter AI Evaluation
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Select Demo Test Scenario:
                    </label>
                    <div className="flex gap-4">
                      <label className="text-xs flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="scenario"
                          checked={submissionScenario === 'pass'}
                          onChange={() => setSubmissionScenario('pass')}
                        />
                        Pass (Valid bcrypt + tests)
                      </label>
                      <label className="text-xs flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="scenario"
                          checked={submissionScenario === 'fail'}
                          onChange={() => setSubmissionScenario('fail')}
                        />
                        Fail (Plaintext passwords, no tests)
                      </label>
                      <label className="text-xs flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="scenario"
                          checked={submissionScenario === 'ambiguous'}
                          onChange={() => setSubmissionScenario('ambiguous')}
                        />
                        Ambiguous (Routes to Human)
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSubmitDeliverable(idx)}
                      disabled={evaluating}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {evaluating
                        ? 'Arbitrating with AI...'
                        : '🤖 Run AI Arbitration & Trigger Policy'}
                    </button>
                    <button
                      onClick={() => setSubmittingMilestone(null)}
                      className="px-3 py-2 bg-white text-slate-700 border rounded text-xs font-medium"
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
