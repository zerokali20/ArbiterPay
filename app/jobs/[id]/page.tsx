'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  amount: string;
  position: number;
  status: string;
  acceptanceCriteria: any[];
}

interface JobData {
  id: string;
  title: string;
  description: string;
  status: string;
  totalAmount: string;
  currency: string;
  freelancerPayPalEmail: string;
  clientEmail?: string;
  createdAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = (params?.id as string) || 'sample-demo-job';

  // ── Data loading state ───────────────────────────────────────────────────
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // ── Escrow / submission state ────────────────────────────────────────────
  const [funding, setFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [captureId, setCaptureId] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  const [jobStatus, setJobStatus] = useState<'draft' | 'funded' | 'in_progress'>('draft');
  const [milestonesList, setMilestonesList] = useState<MilestoneData[]>([]);
  const [submittingMilestone, setSubmittingMilestone] = useState<number | null>(null);
  const [submissionScenario, setSubmissionScenario] = useState<'pass' | 'fail' | 'ambiguous'>('pass');
  const [verdictResult, setVerdictResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  // ── Fetch job on mount ───────────────────────────────────────────────────
  useEffect(() => {
    setLoadingJob(true);
    setLoadError(null);

    fetch(`/api/jobs/${jobId}`)
      .then(async (res) => {
        const text = await res.text();
        let json: any = {};
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(`Failed to load job (HTTP ${res.status}): ${text.slice(0, 100)}`);
        }
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        return json;
      })
      .then(({ job, milestones }) => {
        setJobData(job);
        if (job.status === 'funded' || job.status === 'in_progress') {
          setJobStatus(job.status === 'funded' ? 'funded' : 'in_progress');
        }
        setMilestonesList(
          milestones.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            amount: m.amount,
            position: m.position,
            status: m.status || 'pending',
            acceptanceCriteria: Array.isArray(m.acceptanceCriteria)
              ? m.acceptanceCriteria
              : [],
          }))
        );
      })
      .catch((err) => {
        setLoadError(err.message);
      })
      .finally(() => setLoadingJob(false));
  }, [jobId]);

  // Handle returning from PayPal approval redirect
  useEffect(() => {
    const isApproved = searchParams?.get('approved');
    const orderToken = searchParams?.get('token') || searchParams?.get('orderId');

    if (isApproved === 'true' && orderToken && jobStatus === 'draft') {
      completeCapture(orderToken);
    }
  }, [searchParams, jobStatus]);

  // ── Fund Escrow via PayPal Sandbox ───────────────────────────────────────
  const completeCapture = async (orderId: string) => {
    setFunding(true);
    setFundingError(null);

    try {
      const captureRes = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture', orderId }),
      });
      const text = await captureRes.text();
      let captureData: any = {};
      try {
        captureData = JSON.parse(text);
      } catch {
        throw new Error(`Server returned error (${captureRes.status}): ${text.slice(0, 100)}`);
      }
      if (!captureRes.ok) throw new Error(captureData.error || 'Failed to capture funds');

      setCaptureId(captureData.captureId || 'CAPTURED');
      setJobStatus('funded');
      setMilestonesList((prev) =>
        prev.map((m, i) => (i === 0 ? { ...m, status: 'in_progress' } : m))
      );
    } catch (err: any) {
      setFundingError(err.message);
    } finally {
      setFunding(false);
    }
  };

  const handleFundEscrow = async () => {
    if (!jobData) return;
    setFunding(true);
    setFundingError(null);

    try {
      // One-click atomic fund and capture in sandbox
      const res = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fund_and_capture',
          amount: jobData.totalAmount,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server response (${res.status}): ${text.slice(0, 100)}`);
      }

      if (!res.ok) throw new Error(data.error || 'Failed to fund escrow');

      setCaptureId(data.captureId || 'CAPTURED');
      if (data.approvalUrl) {
        setApprovalUrl(data.approvalUrl);
      }
      setJobStatus('funded');
      setMilestonesList((prev) =>
        prev.map((m, i) => (i === 0 ? { ...m, status: 'in_progress' } : m))
      );
    } catch (err: any) {
      setFundingError(err.message);
    } finally {
      setFunding(false);
    }
  };

  // ── Submit Deliverable → AI Arbiter ─────────────────────────────────────
  const handleSubmitDeliverable = async (milestoneIdx: number) => {
    setEvaluating(true);
    const m = milestonesList[milestoneIdx];

    let filesInspected: any[] = [];
    let content = '';

    if (submissionScenario === 'pass') {
      content =
        'Finished auth service with bcrypt password hashing, JWT expiration check, and Jest unit tests with 92% coverage.';
      filesInspected = [
        {
          path: 'src/auth.ts',
          content: 'bcrypt.hash(pw, 10); jwt.verify(token, process.env.JWT_SECRET);',
        },
        {
          path: 'test/auth.test.ts',
          content:
            'describe("Auth", () => { test("passes", () => { expect(true).toBe(true); }); }); // Statements: 92%',
        },
      ];
    } else if (submissionScenario === 'fail') {
      content =
        'Initial draft. Stored password as plain text for quick testing. Tests are not included yet.';
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
          freelancerPayPalEmail:
            jobData?.freelancerPayPalEmail || 'sb-okeek53339723@personal.example.com',
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Submission server error (${res.status}): ${text.slice(0, 100)}`);
      }

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

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loadingJob) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
        <div className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] animate-pulse">
          <div className="h-3 w-24 bg-slate-200 dark:bg-[#212225] rounded mb-3" />
          <div className="h-5 w-96 bg-slate-200 dark:bg-[#212225] rounded mb-2" />
          <div className="h-3 w-64 bg-slate-200 dark:bg-[#212225] rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] animate-pulse"
          >
            <div className="h-4 w-48 bg-slate-200 dark:bg-[#212225] rounded mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-[#212225] rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (loadError || !jobData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 font-sans">
        <div className="p-8 rounded-lg bg-white dark:bg-[#0e0f10] border border-rose-200 dark:border-[#4c1e22] text-center">
          <div className="text-rose-600 dark:text-[#e5484d] font-mono text-sm font-semibold mb-2">
            Job Not Found
          </div>
          <p className="text-xs text-slate-500 dark:text-[#81848b] font-mono mb-4">
            {loadError || `No job with ID "${jobId}" exists.`}
          </p>
          <Link
            href="/jobs/new"
            className="inline-block px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Create a New Job →
          </Link>
        </div>
      </div>
    );
  }

  const isSampleJob = jobId === 'sample-demo-job';
  const freelancerEmail =
    jobData.freelancerPayPalEmail || 'sb-okeek53339723@personal.example.com';

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">

      {/* Sample-job notice */}
      {isSampleJob && (
        <div className="px-4 py-2.5 rounded bg-amber-50 dark:bg-[#1a1711] border border-amber-200 dark:border-[#3f3521] text-xs font-mono text-amber-700 dark:text-[#d9a441] flex items-center gap-2">
          <span>⚡</span>
          <span>
            This is the <strong>pre-seeded demo job</strong>. To create your own job with custom
            milestones, use{' '}
            <Link href="/jobs/new" className="underline hover:no-underline">
              Create Job
            </Link>
            .
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">
              JOB ID: {jobId}
            </span>
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#ececed] mt-1.5 font-heading">
            {jobData.title}
          </h1>
          <p className="text-xs font-mono text-slate-600 dark:text-[#81848b] mt-1">
            Total Escrow: ${jobData.totalAmount} {jobData.currency} •{' '}
            {milestonesList.length} Milestone{milestonesList.length !== 1 ? 's' : ''} •
            Receiver: {freelancerEmail}
          </p>
          {jobData.description && (
            <p className="text-xs text-slate-500 dark:text-[#9b9da3] mt-1.5 leading-relaxed max-w-xl">
              {jobData.description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          {jobStatus === 'draft' ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleFundEscrow}
                disabled={funding}
                className="px-4 py-2.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {funding ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin"></span>
                    <span>Funding PayPal Sandbox Escrow...</span>
                  </>
                ) : (
                  <span>Fund ${jobData.totalAmount} via PayPal Sandbox</span>
                )}
              </button>

              {approvalUrl && (
                <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] text-right">
                  Or{' '}
                  <a
                    href={approvalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-indigo-600 dark:text-[#4cb782] font-semibold"
                  >
                    Open PayPal Sandbox Login
                  </a>{' '}
                  to approve manually
                </div>
              )}
            </div>
          ) : (
            <div className="px-3.5 py-2 rounded bg-emerald-50 dark:bg-[#141517] border border-emerald-200 dark:border-[#254634] text-xs font-mono text-emerald-700 dark:text-[#4cb782] flex flex-col gap-0.5">
              <span className="font-bold">✓ Escrow Funded (Orders v2 Captured)</span>
              {captureId && (
                <span className="text-[10px] text-slate-500 dark:text-[#81848b]">
                  Capture ID: {captureId}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Funding Error Banner */}
      {fundingError && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-[#1c1214] border border-rose-200 dark:border-[#4c1e22] text-xs font-mono text-rose-700 dark:text-[#e5484d] flex justify-between items-center">
          <div>
            <strong>Notice:</strong> {fundingError}
          </div>
          <button
            onClick={handleFundEscrow}
            className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors ml-3 whitespace-nowrap"
          >
            Retry Funding
          </button>
        </div>
      )}

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
              Policy Action:{' '}
              <strong className="text-slate-900 dark:text-white">
                {verdictResult.policyDecision.action}
              </strong>
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
                Target account credited: {freelancerEmail}
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

      {/* Milestones Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#ececed] font-heading">
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
                  <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ececed]">
                      {m.title}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">
                      Amount: ${m.amount} USD
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded uppercase border ${
                      m.status === 'paid' || m.status === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]'
                        : m.status === 'failed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#311518] dark:text-[#e5484d] dark:border-[#4c1e22]'
                        : m.status === 'disputed' || m.status === 'partial'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#141517] dark:text-[#81848b] dark:border-[#212225]'
                    }`}
                  >
                    {m.status}
                  </span>

                  {jobStatus === 'funded' &&
                    m.status !== 'paid' &&
                    m.status !== 'passed' && (
                      <button
                        onClick={() => setSubmittingMilestone(idx)}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] border border-slate-200 dark:border-[#2d2f33] text-xs font-mono text-slate-800 dark:text-[#ececed] transition-colors cursor-pointer"
                      >
                        Submit deliverable →
                      </button>
                    )}
                </div>
              </div>

              {/* Criteria */}
              {m.acceptanceCriteria && m.acceptanceCriteria.length > 0 && (
                <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-[#1a1b1e]">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase">
                    Criteria:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-[#9b9da3]">
                    {m.acceptanceCriteria.map((c: any, cIdx: number) => {
                      const text = typeof c === 'string' ? c : c?.description || JSON.stringify(c);
                      return (
                        <li key={cIdx} className="flex items-start gap-2">
                          <span className="text-slate-400 dark:text-[#81848b]">•</span>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

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
                      <span className="text-emerald-600 dark:text-[#4cb782]">
                        Pass (bcrypt + tests)
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={submissionScenario === 'fail'}
                        onChange={() => setSubmissionScenario('fail')}
                      />
                      <span className="text-rose-600 dark:text-[#e5484d]">
                        Fail (plaintext, no tests)
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="scenario"
                        checked={submissionScenario === 'ambiguous'}
                        onChange={() => setSubmissionScenario('ambiguous')}
                      />
                      <span className="text-amber-600 dark:text-[#d9a441]">
                        Ambiguous (Human review)
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSubmitDeliverable(idx)}
                      disabled={evaluating}
                      className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {evaluating ? 'Running Arbiter...' : 'Run Arbitration'}
                    </button>
                    <button
                      onClick={() => setSubmittingMilestone(null)}
                      className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-[#1a1b1e] dark:text-[#81848b] dark:hover:text-white cursor-pointer"
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

      {/* Flow nav */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-500 dark:text-[#81848b]">
        <Link href="/jobs/new" className="hover:text-slate-900 dark:hover:text-[#ececed] transition-colors">
          ← Create Another Job
        </Link>
        <Link href="/ledger" className="hover:text-slate-900 dark:hover:text-[#ececed] transition-colors">
          View Audit Ledger →
        </Link>
      </div>
    </div>
  );
}
