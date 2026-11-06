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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; content: string; size: number }>>([]);
  const [pastedCode, setPastedCode] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [verdictResult, setVerdictResult] = useState<any>(null);
  const [zipExtracting, setZipExtracting] = useState(false);

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

  // ── File Upload (Multi-File + ZIP Support) ──────────────────────────────
  const TEXT_EXTENSIONS = new Set([
    '.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rb', '.java', '.cpp', '.cs',
    '.txt', '.md', '.json', '.yaml', '.yml', '.toml', '.cfg', '.ini', '.env',
    '.html', '.css', '.scss', '.sql', '.sh', '.bash', '.rs', '.c', '.h',
    '.xml', '.csv', '.dockerfile', '.makefile', '.gitignore', '.lock',
  ]);

  const isTextFile = (name: string): boolean => {
    const lower = name.toLowerCase();
    if (lower === 'dockerfile' || lower === 'makefile' || lower === 'readme' || lower === 'license') return true;
    const ext = '.' + lower.split('.').pop();
    return TEXT_EXTENSIONS.has(ext);
  };

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string || '');
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file);
    });

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsArrayBuffer(file);
    });

  const extractZip = async (file: File) => {
    setZipExtracting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const buf = await readFileAsArrayBuffer(file);
      const zip = await JSZip.loadAsync(buf);
      const extracted: Array<{ name: string; content: string; size: number }> = [];

      const entries = Object.entries(zip.files);
      for (const [path, zipEntry] of entries) {
        if (zipEntry.dir) continue;
        // Skip hidden files and common non-code dirs
        const segments = path.split('/');
        if (segments.some(s => s.startsWith('.') || s === 'node_modules' || s === '__pycache__' || s === '.git')) continue;
        if (!isTextFile(path)) continue;

        try {
          const text = await zipEntry.async('text');
          if (text.length > 0 && text.length < 200_000) {
            extracted.push({ name: path, content: text, size: text.length });
          }
        } catch {
          // skip binary/unreadable files
        }
      }
      return extracted;
    } finally {
      setZipExtracting(false);
    }
  };

  const processFiles = async (fileList: FileList) => {
    const newFiles: Array<{ name: string; content: string; size: number }> = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (file.name.toLowerCase().endsWith('.zip')) {
        const extracted = await extractZip(file);
        newFiles.push(...extracted);
      } else if (isTextFile(file.name) || file.type.startsWith('text/')) {
        const content = await readFileAsText(file);
        newFiles.push({ name: file.name, content, size: content.length });
      }
    }

    // De-duplicate by name, keep latest
    setUploadedFiles(prev => {
      const combined = [...prev];
      for (const f of newFiles) {
        const existIdx = combined.findIndex(x => x.name === f.name);
        if (existIdx >= 0) combined[existIdx] = f;
        else combined.push(f);
      }
      return combined;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDropZone = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    await processFiles(files);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const totalUploadedLines = uploadedFiles.reduce((sum, f) => sum + f.content.split('\n').length, 0);

  // ── Submit Code for AI Evaluation ───────────────────────────────────────
  const handleSubmitCode = async (milestoneIdx: number) => {
    const m = milestonesList[milestoneIdx];

    if (activeInputTab === 'upload') {
      if (uploadedFiles.length === 0) {
        alert('Please upload at least one file before submitting for evaluation.');
        return;
      }
    } else {
      if (!pastedCode.trim()) {
        alert('Please paste your code before submitting for evaluation.');
        return;
      }
    }

    setEvaluating(true);
    try {
      // Build the submission payload
      const isMultiFile = activeInputTab === 'upload' && uploadedFiles.length > 0;
      const primaryFile = isMultiFile ? uploadedFiles[0] : null;
      const codeContent = isMultiFile
        ? primaryFile!.content
        : pastedCode;
      const filesInspected = isMultiFile
        ? uploadedFiles.map(f => ({ path: f.name, content: f.content }))
        : undefined;

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: m.id,
          jobId,
          submissionType: isMultiFile ? 'file_upload' : 'text',
          codeContent,
          fileName: primaryFile?.name || 'submission.py',
          filesInspected,
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
                        📁 Upload Files
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
                    <div className="space-y-3">
                      {/* Drop zone */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropZone}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                          uploadedFiles.length > 0
                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-[#0f1713]'
                            : 'border-slate-300 dark:border-[#2d2f33] bg-white dark:bg-[#0e0f10] hover:border-slate-400 dark:hover:border-[#3d3f44]'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept=".py,.js,.ts,.jsx,.tsx,.go,.rb,.java,.cpp,.cs,.txt,.md,.json,.yaml,.yml,.toml,.html,.css,.sql,.sh,.rs,.c,.h,.zip"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {zipExtracting ? (
                          <>
                            <span className="w-5 h-5 rounded-full border-2 border-slate-400 border-t-emerald-500 animate-spin" />
                            <div className="text-xs font-mono text-slate-700 dark:text-[#ececed] font-bold">Extracting ZIP archive…</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl">{uploadedFiles.length > 0 ? '➕' : '📂'}</div>
                            <div className="text-xs font-mono text-slate-700 dark:text-[#ececed] font-bold">
                              {uploadedFiles.length > 0
                                ? 'Click or drop to add more files'
                                : 'Drop files here or click to browse'}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-[#81848b]">
                              Multiple files supported · .py .js .ts .go .java .zip + more
                            </div>
                          </>
                        )}
                      </div>

                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-[#ececed] uppercase tracking-wider">
                              Uploaded Files ({uploadedFiles.length})
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500 dark:text-[#81848b]">
                                {totalUploadedLines} lines total
                              </span>
                              <button
                                type="button"
                                onClick={clearAllFiles}
                                className="text-[10px] font-mono text-rose-600 hover:text-rose-700 dark:text-[#e5484d] dark:hover:text-rose-400 cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                            {uploadedFiles.map((f, fIdx) => (
                              <div
                                key={`${f.name}-${fIdx}`}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] group transition-colors"
                              >
                                <span className="text-[11px] font-mono text-slate-400 dark:text-[#81848b] w-5 text-right shrink-0 select-none">
                                  {fIdx + 1}.
                                </span>
                                <span className="text-xs font-mono text-emerald-700 dark:text-[#4cb782] truncate flex-1 min-w-0" title={f.name}>
                                  {f.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-[#81848b] shrink-0">
                                  {f.content.split('\n').length} ln · {f.size > 1024 ? `${(f.size / 1024).toFixed(1)}KB` : `${f.size}B`}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeUploadedFile(fIdx); }}
                                  className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-[#e5484d] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer px-1 shrink-0"
                                  title={`Remove ${f.name}`}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview of first file */}
                      {uploadedFiles.length > 0 && (
                        <div className="rounded bg-slate-900 dark:bg-[#08090a] border border-slate-700 dark:border-[#212225] p-3 font-mono text-[11px] text-green-400 overflow-auto max-h-32">
                          <div className="text-slate-500 text-[10px] mb-1.5 select-none">
                            Preview: {uploadedFiles[0].name}
                            {uploadedFiles.length > 1 && ` (+${uploadedFiles.length - 1} more file${uploadedFiles.length > 2 ? 's' : ''})`}
                          </div>
                          {uploadedFiles[0].content.split('\n').slice(0, 6).map((line, i) => (
                            <div key={i}><span className="text-slate-600 mr-3 select-none">{i + 1}</span>{line}</div>
                          ))}
                          {uploadedFiles[0].content.split('\n').length > 6 && (
                            <div className="text-slate-600 mt-1">… {uploadedFiles[0].content.split('\n').length - 6} more lines</div>
                          )}
                        </div>
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

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSubmitCode(idx)}
                      disabled={evaluating || (activeInputTab === 'upload' ? uploadedFiles.length === 0 : !pastedCode.trim())}
                      className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {evaluating ? (
                        <><span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-white animate-spin" /><span>AI Evaluating Code…</span></>
                      ) : (
                        <span>Run AI Arbiter →</span>
                      )}
                    </button>
                    <button
                      onClick={() => { setSubmittingMilestone(null); setUploadedFiles([]); setPastedCode(''); }}
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
