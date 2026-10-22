'use client';

import React, { useState, useEffect, useRef } from 'react';
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

function JobDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = (params?.id as string) || 'sample-demo-job';

  // ── Data loading state ──────────────────────────────────────────────────
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // ── Escrow / funding state ──────────────────────────────────────────────
  const [funding, setFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [captureId, setCaptureId] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'draft' | 'funded' | 'in_progress'>('draft');
  const [milestonesList, setMilestonesList] = useState<MilestoneData[]>([]);

  // ── Freelancer submission state ─────────────────────────────────────────
  const [submittingMilestone, setSubmittingMilestone] = useState<number | null>(null);
  const [uploadedCode, setUploadedCode] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [pastedCode, setPastedCode] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [verdictResult, setVerdictResult] = useState<any>(null);

  // ── Load job ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingJob(true);
    setLoadError(null);
    fetch(`/api/jobs/${jobId}`)
      .then(async (res) => {
        const text = await res.text();
        let json: any;
        try { json = JSON.parse(text); } catch {
          throw new Error(`Failed to load job (HTTP ${res.status}): ${text.slice(0, 80)}`);
        }
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        return json;
      })
      .then(({ job, milestones }) => {
        setJobData(job);
        if (job.status === 'funded' || job.status === 'in_progress') {
          setJobStatus(job.status === 'funded' ? 'funded' : 'in_progress');
        }
        setMilestonesList(milestones.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          amount: m.amount,
          position: m.position,
          status: m.status || 'pending',
          acceptanceCriteria: Array.isArray(m.acceptanceCriteria) ? m.acceptanceCriteria : [],
        })));
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingJob(false));
  }, [jobId]);

  // Handle returning from PayPal redirect
  useEffect(() => {
    const isApproved = searchParams?.get('approved');
    const orderToken = searchParams?.get('token') || searchParams?.get('orderId');
    if (isApproved === 'true' && orderToken && jobStatus === 'draft') {
      completeCapture(orderToken);
    }
  }, [searchParams, jobStatus]);

  // ── Fund Escrow ─────────────────────────────────────────────────────────
  const completeCapture = async (orderId: string) => {
    setFunding(true);
    setFundingError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'capture', orderId }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error(`Server error (${res.status}): ${text.slice(0, 80)}`);
      }
      if (!res.ok) throw new Error(data.error || 'Capture failed');
      setCaptureId(data.captureId || 'CAPTURED');
      setJobStatus('funded');
      setMilestonesList((prev) => prev.map((m, i) => i === 0 ? { ...m, status: 'in_progress' } : m));
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
      const res = await fetch(`/api/jobs/${jobId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fund_and_capture', amount: jobData.totalAmount }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error(`Server response (${res.status}): ${text.slice(0, 80)}`);
      }
      if (!res.ok) throw new Error(data.error || 'Fund failed');
      setCaptureId(data.captureId || 'CAPTURED');
      if (data.approvalUrl) setApprovalUrl(data.approvalUrl);
      setJobStatus('funded');
      setMilestonesList((prev) => prev.map((m, i) => i === 0 ? { ...m, status: 'in_progress' } : m));
    } catch (err: any) {
      setFundingError(err.message);
    } finally {
      setFunding(false);
    }
  };

  // ── File Upload ─────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedCode(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  const handleDropZone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedCode(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  // ── Submit Code for AI Evaluation ───────────────────────────────────────
  const handleSubmitCode = async (milestoneIdx: number) => {
    const m = milestonesList[milestoneIdx];
    const codeToEvaluate = activeInputTab === 'upload' ? uploadedCode : pastedCode;

    if (!codeToEvaluate.trim()) {
      alert('Please upload or paste your code before submitting for evaluation.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: m.id,
          jobId,
          submissionType: activeInputTab === 'upload' ? 'file_upload' : 'text',
          codeContent: codeToEvaluate,
          fileName: uploadedFileName || 'submission.py',
          taskPrompt: m.description || jobData?.description,
          freelancerPayPalEmail:
            jobData?.freelancerPayPalEmail || 'sb-okeek53339723@personal.example.com',
        }),
      });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch {
        throw new Error(`Evaluation error (${res.status}): ${text.slice(0, 100)}`);
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
      alert(`Evaluation error: ${err.message}`);
    } finally {
      setEvaluating(false);
      setSubmittingMilestone(null);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loadingJob) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] animate-pulse">
            <div className="h-4 w-48 bg-slate-200 dark:bg-[#212225] rounded mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-[#212225] rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (loadError || !jobData) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 font-sans">
        <div className="p-8 rounded-lg bg-white dark:bg-[#0e0f10] border border-rose-200 dark:border-[#4c1e22] text-center">
          <div className="text-rose-600 dark:text-[#e5484d] font-mono text-sm font-semibold mb-2">Job Not Found</div>
          <p className="text-xs text-slate-500 dark:text-[#81848b] font-mono mb-4">{loadError || `No job with ID "${jobId}"`}</p>
          <Link href="/jobs/new" className="inline-block px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold">
            Create a New Job →
          </Link>
        </div>
      </div>
    );
  }

  const isSampleJob = jobId === 'sample-demo-job';
  const freelancerEmail = jobData.freelancerPayPalEmail || 'sb-okeek53339723@personal.example.com';

  const scoreColor = (score: number) =>
    score >= 90 ? 'text-emerald-700 dark:text-[#4cb782]' :
    score >= 50 ? 'text-amber-700 dark:text-[#d9a441]' :
    'text-rose-700 dark:text-[#e5484d]';

  const scoreBg = (score: number) =>
    score >= 90 ? 'bg-emerald-50 dark:bg-[#0f1713] border-emerald-300 dark:border-[#254634]' :
    score >= 50 ? 'bg-amber-50 dark:bg-[#1a1711] border-amber-300 dark:border-[#3f3521]' :
    'bg-rose-50 dark:bg-[#1c1214] border-rose-300 dark:border-[#4c1e22]';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">

      {isSampleJob && (
        <div className="px-4 py-2.5 rounded bg-amber-50 dark:bg-[#1a1711] border border-amber-200 dark:border-[#3f3521] text-xs font-mono text-amber-700 dark:text-[#d9a441] flex items-center gap-2">
          <span>⚡</span>
          <span>
            Pre-seeded demo job. <Link href="/jobs/new" className="underline">Create your own coding task →</Link>
          </span>
        </div>
      )}

      {/* ── Job Header ─────────────────────────────────────────────────── */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">JOB ID: {jobId.slice(0, 16)}…</span>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
              jobStatus === 'funded'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
            }`}>{jobStatus}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#ececed] font-heading">{jobData.title}</h1>
          <p className="text-xs font-mono text-slate-600 dark:text-[#81848b] mt-1">
            Escrow: ${jobData.totalAmount} {jobData.currency} • {milestonesList.length} milestone{milestonesList.length !== 1 ? 's' : ''} • Receiver: {freelancerEmail}
          </p>
          {jobData.description && (
            <p className="text-xs text-slate-500 dark:text-[#9b9da3] mt-1.5 leading-relaxed">{jobData.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {jobStatus === 'draft' ? (
            <>
              <button
                onClick={handleFundEscrow}
                disabled={funding}
                className="px-4 py-2.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors"
              >
                {funding ? (
                  <><span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" /><span>Funding Escrow…</span></>
                ) : (
                  <span>Fund ${jobData.totalAmount} via PayPal Sandbox</span>
                )}
              </button>
              {approvalUrl && (
                <a href={approvalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono underline text-indigo-600 dark:text-[#4cb782]">
                  Open PayPal login to approve
                </a>
              )}
            </>
          ) : (
            <div className="px-3.5 py-2 rounded bg-emerald-50 dark:bg-[#141517] border border-emerald-200 dark:border-[#254634] text-xs font-mono text-emerald-700 dark:text-[#4cb782]">
              <div className="font-bold">✓ Escrow Funded (Orders v2 Captured)</div>
              {captureId && <div className="text-[10px] text-slate-500 dark:text-[#81848b]">Capture ID: {captureId}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Funding error */}
      {fundingError && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-[#1c1214] border border-rose-200 dark:border-[#4c1e22] text-xs font-mono text-rose-700 dark:text-[#e5484d] flex justify-between items-center">
          <span><strong>Notice:</strong> {fundingError}</span>
          <button onClick={handleFundEscrow} className="ml-3 px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors">Retry</button>
        </div>
      )}

      {/* ── AI Verdict Banner ───────────────────────────────────────────── */}
      {verdictResult && (() => {
        const score = verdictResult.verdict.totalScore ?? 0;
        const action = verdictResult.policyDecision.action;
        return (
          <div className={`p-6 rounded-lg border font-mono transition-colors ${scoreBg(score)}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-[#212225]">
              <div className="flex items-center gap-3">
                {/* Score gauge */}
                <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 ${
                  score >= 90 ? 'border-emerald-400 bg-emerald-50 dark:bg-[#1a2e23]' :
                  score >= 50 ? 'border-amber-400 bg-amber-50 dark:bg-[#2a2417]' :
                  'border-rose-400 bg-rose-50 dark:bg-[#311518]'
                }`}>
                  <span className={`text-lg font-extrabold leading-none ${scoreColor(score)}`}>{score}</span>
                  <span className="text-[9px] text-slate-500 dark:text-[#81848b]">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                      score >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-[#1a2e23] dark:text-[#4cb782]' :
                      score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-[#2a2417] dark:text-[#d9a441]' :
                      'bg-rose-100 text-rose-700 dark:bg-[#311518] dark:text-[#e5484d]'
                    }`}>
                      {score >= 90 ? 'APPROVED' : score >= 50 ? 'REVISE' : 'REJECTED'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#81848b]">
                      Confidence: {(verdictResult.verdict.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-[#ececed] mt-1">{verdictResult.verdict.summary}</p>
                </div>
              </div>
              <div className="text-xs text-slate-900 dark:text-[#ececed]">
                Policy: <strong>{action.replace(/_/g, ' ')}</strong>
              </div>
            </div>

            {/* Per-criterion breakdown */}
            {verdictResult.verdict.criteriaResults?.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#81848b]">Criterion Scores:</div>
                {verdictResult.verdict.criteriaResults.map((cr: any, i: number) => (
                  <div key={i} className="p-2.5 rounded bg-white/70 dark:bg-[#08090a]/60 border border-slate-200 dark:border-[#212225]">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-700 dark:text-[#ececed] font-medium">{cr.criterionDescription}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-bold ${scoreColor(cr.score ?? 0)}`}>{cr.score ?? '?'}/100</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          cr.status === 'pass'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-[#1a2e23] dark:text-[#4cb782]'
                            : 'bg-rose-50 text-rose-700 dark:bg-[#311518] dark:text-[#e5484d]'
                        }`}>{cr.status}</span>
                      </div>
                    </div>
                    {cr.quotedEvidence && (
                      <div className="mt-1 text-[10px] font-mono text-slate-500 dark:text-[#81848b] bg-slate-50 dark:bg-[#141517] px-2 py-1 rounded truncate">
                        Evidence: {cr.quotedEvidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payout confirmation */}
            {verdictResult.policyDecision.payoutBatchId && (
              <div className="p-3 rounded bg-white dark:bg-[#08090a] border border-emerald-300 dark:border-[#254634] text-xs text-emerald-700 dark:text-[#4cb782] mb-3">
                ✓ PayPal Payout Released — Batch ID: <strong>{verdictResult.policyDecision.payoutBatchId}</strong>
                <br />
                <span className="text-slate-500 dark:text-[#81848b] text-[11px]">Credited to: {freelancerEmail}</span>
              </div>
            )}

            {/* Fix list */}
            {verdictResult.verdict.fixList?.length > 0 && (
              <div className="p-3 rounded bg-white dark:bg-[#08090a] border border-rose-200 dark:border-[#4c1e22] text-xs text-rose-700 dark:text-[#e5484d]">
                <span className="font-bold block mb-1.5">Fix List to reach ≥90:</span>
                <ul className="list-disc list-inside space-y-1">
                  {verdictResult.verdict.fixList.map((fix: string, i: number) => <li key={i}>{fix}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Milestones ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#ececed] font-heading">
            Escrow Milestones ({milestonesList.length})
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">
            Auto-payout threshold: score ≥ 90/100
          </span>
        </div>

        <div className="space-y-3">
          {milestonesList.map((m, idx) => (
            <div key={m.id} className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">0{idx + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-[#ececed]">{m.title}</h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-[#81848b]">Amount: ${m.amount} USD</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded uppercase border ${
                    m.status === 'paid' || m.status === 'passed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]'
                      : m.status === 'failed'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#311518] dark:text-[#e5484d] dark:border-[#4c1e22]'
                      : m.status === 'disputed' || m.status === 'partial'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#141517] dark:text-[#81848b] dark:border-[#212225]'
                  }`}>{m.status}</span>
                  {jobStatus === 'funded' && m.status !== 'paid' && m.status !== 'passed' && (
                    <button
                      onClick={() => { setSubmittingMilestone(idx); setVerdictResult(null); }}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] border border-slate-200 dark:border-[#2d2f33] text-xs font-mono text-slate-800 dark:text-[#ececed] transition-colors cursor-pointer"
                    >
                      Submit code →
                    </button>
                  )}
                </div>
              </div>

              {/* Acceptance Criteria */}
              {m.acceptanceCriteria.length > 0 && (
                <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-[#1a1b1e]">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase">Acceptance Criteria:</span>
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

              {/* ── Code Submission Panel ─────────────────────────────── */}
              {submittingMilestone === idx && (
                <div className="p-5 rounded-lg bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#2d2f33] space-y-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-[#ececed] font-mono">Submit Code for AI Evaluation</div>
                      <div className="text-[11px] text-slate-500 dark:text-[#81848b] font-mono mt-0.5">Score ≥ 90/100 → automatic PayPal payout</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setActiveInputTab('upload')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${activeInputTab === 'upload' ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold' : 'bg-white dark:bg-[#0e0f10] text-slate-600 dark:text-[#81848b] border-slate-200 dark:border-[#212225]'}`}
                      >
                        📁 Upload File
                      </button>
                      <button
                        onClick={() => setActiveInputTab('paste')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${activeInputTab === 'paste' ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold' : 'bg-white dark:bg-[#0e0f10] text-slate-600 dark:text-[#81848b] border-slate-200 dark:border-[#212225]'}`}
                      >
                        📋 Paste Code
                      </button>
                    </div>
                  </div>

                  {activeInputTab === 'upload' ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropZone}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                        uploadedCode
                          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-[#0f1713]'
                          : 'border-slate-300 dark:border-[#2d2f33] bg-white dark:bg-[#0e0f10] hover:border-slate-400 dark:hover:border-[#3d3f44]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".py,.js,.ts,.jsx,.tsx,.go,.rb,.java,.cpp,.cs,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {uploadedCode ? (
                        <>
                          <div className="text-2xl">✓</div>
                          <div className="text-xs font-mono text-emerald-700 dark:text-[#4cb782] font-bold">{uploadedFileName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-[#81848b]">{uploadedCode.split('\n').length} lines · Click to replace</div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl">📂</div>
                          <div className="text-xs font-mono text-slate-700 dark:text-[#ececed] font-bold">Drop code file here or click to browse</div>
                          <div className="text-[11px] text-slate-500 dark:text-[#81848b]">.py .js .ts .go .rb .java .cpp .cs .txt</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-slate-600 dark:text-[#81848b]">Paste your code below:</div>
                      <textarea
                        value={pastedCode}
                        onChange={(e) => setPastedCode(e.target.value)}
                        rows={10}
                        placeholder="# Your Python script here
import requests
from bs4 import BeautifulSoup
import csv

def extract_h1_to_csv(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    h1_tags = soup.find_all('h1')
    # Write to CSV..."
                        className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] px-3 py-2.5 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] resize-y transition-colors"
                      />
                      {pastedCode && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">
                          {pastedCode.split('\n').length} lines · {pastedCode.length} chars
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview snippet */}
                  {(activeInputTab === 'upload' && uploadedCode) && (
                    <div className="rounded bg-slate-900 dark:bg-[#08090a] border border-slate-700 dark:border-[#212225] p-3 font-mono text-[11px] text-green-400 overflow-auto max-h-32">
                      {uploadedCode.split('\n').slice(0, 6).map((line, i) => (
                        <div key={i}><span className="text-slate-600 mr-3 select-none">{i + 1}</span>{line}</div>
                      ))}
                      {uploadedCode.split('\n').length > 6 && (
                        <div className="text-slate-600 mt-1">… {uploadedCode.split('\n').length - 6} more lines</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSubmitCode(idx)}
                      disabled={evaluating || !(activeInputTab === 'upload' ? uploadedCode : pastedCode).trim()}
                      className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {evaluating ? (
                        <><span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-white animate-spin" /><span>AI Evaluating Code…</span></>
                      ) : (
                        <span>Run AI Arbiter →</span>
                      )}
                    </button>
                    <button
                      onClick={() => { setSubmittingMilestone(null); setUploadedCode(''); setUploadedFileName(''); setPastedCode(''); }}
                      className="px-3 py-2 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-[#1a1b1e] dark:text-[#81848b] dark:hover:text-white text-xs font-mono cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">Score ≥ 90 → auto PayPal payout</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Flow nav */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-500 dark:text-[#81848b]">
        <Link href="/jobs/new" className="hover:text-slate-900 dark:hover:text-[#ececed] transition-colors">← Create Another Job</Link>
        <Link href="/ledger" className="hover:text-slate-900 dark:hover:text-[#ececed] transition-colors">View Audit Ledger →</Link>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
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
      }
    >
      <JobDetailContent />
    </React.Suspense>
  );
}
