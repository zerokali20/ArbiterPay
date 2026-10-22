'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CriterionResult {
  name: string;
  score: number;
  status: 'pass' | 'fail';
  evidence: string;
}

interface ReviewCase {
  id: string;
  jobId: string;
  jobTitle: string;
  templateCategory: 'python_scraper' | 'single_task' | 'microservice' | 'custom';
  milestoneId: string;
  milestoneTitle: string;
  amount: string;
  reasonRouted: string;
  freelancerPayPalEmail: string;
  deliverableSummary: string;
  submittedCodeSnippet?: string;
  aiAnalysis: {
    totalScore: number;
    confidence: number;
    criteriaResults: CriterionResult[];
  };
  status: 'pending_review' | 'approved_paid' | 'rejected_revision';
  decisionNotes?: string;
  payoutBatchId?: string;
  decidedAt?: string;
}

export default function HumanReviewPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('dispute-01');
  const [processing, setProcessing] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Review Cases containing Ongoing, Previous Action Taken (Approved & Rejected), and Template topics
  const [cases, setCases] = useState<ReviewCase[]>([
    {
      id: 'dispute-01',
      jobId: 'job-9842',
      jobTitle: 'Python Web Scraper: URL → CSV of H1 Tags',
      templateCategory: 'python_scraper',
      milestoneId: 'ms-01',
      milestoneTitle: 'Milestone 1: Core Scraper — URL Input & H1 Extraction',
      amount: '75.00',
      reasonRouted:
        'Score 73/100 — Low AI Confidence (0.51 < 0.60 threshold). BeautifulSoup parser present but CSV output path ambiguous.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Freelancer submitted scraper.py. The script fetches HTML using requests and parses H1 tags, but CSV file opening is ambiguous and lacks fieldnames.',
      submittedCodeSnippet: `import sys, csv, requests
from bs4 import BeautifulSoup

def scrape_h1(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        h1_tags = [h.get_text(strip=True) for h in soup.find_all('h1')]
        
        # Incomplete CSV output logic flagged by Arbiter:
        with open('output.csv', 'w') as f:
            writer = csv.writer(f)
            for tag in h1_tags:
                writer.writerow([tag])
        return len(h1_tags)
    except Exception as e:
        print(f"Error: {e}")
        return 0

if __name__ == '__main__':
    if len(sys.argv) > 1:
        scrape_h1(sys.argv[1])`,
      aiAnalysis: {
        totalScore: 73,
        confidence: 0.51,
        criteriaResults: [
          { name: 'URL input via sys.argv or argparse', score: 95, status: 'pass', evidence: 'len(sys.argv) > 1 checked and sys.argv[1] passed' },
          { name: 'HTML fetch using requests with timeout', score: 92, status: 'pass', evidence: 'requests.get(url, timeout=10) verified' },
          { name: 'Extract H1 tags with BeautifulSoup', score: 88, status: 'pass', evidence: 'soup.find_all("h1") and text extraction verified' },
          { name: 'CSV output with clean header columns', score: 42, status: 'fail', evidence: 'Missing CSV header row ("h1_text"); plain row writer used' },
          { name: 'Graceful error handling & non-zero exit codes', score: 48, status: 'fail', evidence: 'Catches bare Exception and returns 0 instead of non-zero exit' },
        ],
      },
      status: 'pending_review',
    },
    {
      id: 'dispute-02',
      jobId: 'job-4120',
      jobTitle: 'Enterprise Node.js API with JWT Auth',
      templateCategory: 'microservice',
      milestoneId: 'ms-02',
      milestoneTitle: 'Milestone 2: Security Middleware & Rate Limiting',
      amount: '650.00',
      reasonRouted:
        'Score 94/100 ✓ but milestone amount ($650.00) exceeds $500 safety threshold. Policy requires human administrator sign-off.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Express.js production service with JWT auth middleware, express-rate-limit, and comprehensive automated test suite with 89% code coverage.',
      submittedCodeSnippet: `import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const app = express();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}`,
      aiAnalysis: {
        totalScore: 94,
        confidence: 0.96,
        criteriaResults: [
          { name: 'JWT middleware protecting protected endpoints', score: 97, status: 'pass', evidence: 'Bearer token verification with 401/403 status codes' },
          { name: 'Rate limiting applied (100 req/15min)', score: 95, status: 'pass', evidence: 'express-rate-limit windowMs configured on /api/' },
          { name: 'Automated test suite with >80% coverage', score: 90, status: 'pass', evidence: 'Jest test run logs confirm 89.2% line coverage' },
        ],
      },
      status: 'pending_review',
    },
    {
      id: 'dispute-03',
      jobId: 'job-7819',
      jobTitle: 'Python URL-to-CSV H1 Scraper Script',
      templateCategory: 'single_task',
      milestoneId: 'ms-01',
      milestoneTitle: 'Milestone 1: Complete Script Implementation & Verification',
      amount: '100.00',
      reasonRouted:
        'Score 96/100 — Deliverable met all criteria. Human reviewer confirmed code execution and approved release.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Clean single-file Python script meeting URL fetch, H1 CSV export with headers, and test coverage. Payout released automatically.',
      submittedCodeSnippet: `# Completed script with CSV DictWriter and error handling
import sys, csv, requests
from bs4 import BeautifulSoup

def extract_h1(url):
    res = requests.get(url, timeout=5)
    res.raise_for_status()
    soup = BeautifulSoup(res.text, 'html.parser')
    tags = [h.text.strip() for h in soup.find_all('h1')]
    with open('h1_tags.csv', 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['index', 'h1_text'])
        for i, t in enumerate(tags, 1):
            w.writerow([i, t])`,
      aiAnalysis: {
        totalScore: 96,
        confidence: 0.98,
        criteriaResults: [
          { name: 'Command-line URL parsing', score: 98, status: 'pass', evidence: 'sys.argv parsing and validation' },
          { name: 'BeautifulSoup H1 extraction', score: 95, status: 'pass', evidence: 'soup.find_all("h1") verified' },
          { name: 'CSV DictWriter format', score: 95, status: 'pass', evidence: 'Header index,h1_text present' },
        ],
      },
      status: 'approved_paid',
      decisionNotes: 'Administrator verified deliverable. Released via PayPal Payouts batch header.',
      payoutBatchId: 'PAYPAL-BATCH-8921-APPROVED',
      decidedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: 'dispute-04',
      jobId: 'job-3312',
      jobTitle: 'Production Microservice & Automated CI Pipeline',
      templateCategory: 'microservice',
      milestoneId: 'ms-03',
      milestoneTitle: 'Milestone 3: Dockerization & CI/CD Spec',
      amount: '50.00',
      reasonRouted:
        'Score 38/100 — Insufficient submission. Dockerfile missing non-root user and GitHub Actions workflow empty.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary:
        'Freelancer submitted skeleton repository. CI workflow file had syntax errors and Docker build failed on test image.',
      submittedCodeSnippet: `# Dockerfile (Incomplete)
FROM node:18
WORKDIR /app
COPY . .
# Missing non-root user!
CMD ["npm", "start"]`,
      aiAnalysis: {
        totalScore: 38,
        confidence: 0.92,
        criteriaResults: [
          { name: 'Multi-stage Docker build with non-root user', score: 25, status: 'fail', evidence: 'Runs as root user; multi-stage not implemented' },
          { name: 'GitHub Actions automated test pipeline', score: 30, status: 'fail', evidence: 'ci.yml exists but steps block fails yaml syntax' },
          { name: 'Health check endpoint reporting uptime', score: 60, status: 'fail', evidence: '/health endpoint returns static 200 without uptime' },
        ],
      },
      status: 'rejected_revision',
      decisionNotes: 'Action taken: Rejected by administrator. Strict 3-item fix list issued to freelancer.',
      decidedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ]);

  // Read any created job from localStorage or check dynamic cases
  useEffect(() => {
    try {
      const lastJobId = localStorage.getItem('lastCreatedJobId');
      if (lastJobId && !cases.some((c) => c.jobId === lastJobId)) {
        // Can optionally surface dynamically created jobs
      }
    } catch {}
  }, []);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // ── Action: Approve & Release Payout ──────────────────────────────────────
  const handleApproveCase = async (item: ReviewCase) => {
    setProcessing(item.id);
    setActionSuccessMsg(null);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: item.milestoneId,
          jobId: item.jobId,
          submissionType: 'text',
          codeContent: item.submittedCodeSnippet || 'Administrator human review override: verified and approved.',
          taskPrompt: item.deliverableSummary,
          freelancerPayPalEmail: item.freelancerPayPalEmail,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      const generatedBatchId =
        data?.policyDecision?.payoutBatchId || `SANDBOX-BATCH-${Date.now().toString().slice(-6)}`;

      setCases((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                status: 'approved_paid',
                decisionNotes: 'Manually reviewed and approved by administrator. PayPal Payout released.',
                payoutBatchId: generatedBatchId,
                decidedAt: new Date().toISOString(),
              }
            : c
        )
      );

      setActionSuccessMsg(`✓ Approved Milestone payout for $${item.amount} USD! PayPal Batch ID: ${generatedBatchId}`);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // ── Action: Reject & Request Fix ──────────────────────────────────────────
  const handleRejectCase = (item: ReviewCase) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? {
              ...c,
              status: 'rejected_revision',
              decisionNotes: 'Administrator rejected deliverable. Actionable fix list issued to freelancer.',
              decidedAt: new Date().toISOString(),
            }
          : c
      )
    );
    setActionSuccessMsg(`✕ Rejected Milestone deliverable. Fix-list issued to ${item.freelancerPayPalEmail}`);
  };

  // ── Interactive Demo Simulation Triggers (Success & Failure) ─────────────
  const triggerPassingLiveDemo = async () => {
    const demoPassingItem: ReviewCase = {
      id: `live-success-${Date.now().toString().slice(-4)}`,
      jobId: 'job-live-pass',
      jobTitle: 'Python Web Scraper: URL → CSV of H1 Tags',
      templateCategory: 'python_scraper',
      milestoneId: 'ms-pass-01',
      milestoneTitle: 'Milestone 1: Core Scraper Implementation',
      amount: '75.00',
      reasonRouted: 'Live Scenario Demo: Human Review approval simulation with PayPal sandbox payout release.',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary: 'High-quality implementation of URL scraping with verified H1 tag CSV generation.',
      submittedCodeSnippet: `import requests, csv
from bs4 import BeautifulSoup

def run(url):
    r = requests.get(url, timeout=5)
    soup = BeautifulSoup(r.text, 'html.parser')
    with open('h1_tags.csv', 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['h1_text'])
        for h in soup.find_all('h1'):
            w.writerow([h.text.strip()])`,
      aiAnalysis: {
        totalScore: 95,
        confidence: 0.97,
        criteriaResults: [
          { name: 'URL fetching & error handling', score: 95, status: 'pass', evidence: 'requests.get with timeout' },
          { name: 'H1 tags extraction with bs4', score: 96, status: 'pass', evidence: 'soup.find_all("h1") parsed' },
          { name: 'CSV output creation', score: 94, status: 'pass', evidence: 'h1_tags.csv writer with header' },
        ],
      },
      status: 'pending_review',
    };

    setCases((prev) => [demoPassingItem, ...prev]);
    setSelectedCaseId(demoPassingItem.id);
    setActiveTab('pending');
    await handleApproveCase(demoPassingItem);
  };

  const triggerFailingLiveDemo = () => {
    const demoFailingItem: ReviewCase = {
      id: `live-fail-${Date.now().toString().slice(-4)}`,
      jobId: 'job-live-fail',
      jobTitle: 'Production Microservice & Automated CI Pipeline',
      templateCategory: 'microservice',
      milestoneId: 'ms-fail-02',
      milestoneTitle: 'Milestone 2: Multi-stage Docker Container',
      amount: '50.00',
      reasonRouted: 'Live Scenario Demo: Failure simulation. Code fails security check (score 41/100).',
      freelancerPayPalEmail: 'sb-okeek53339723@personal.example.com',
      deliverableSummary: 'Container build runs as root user and ignores memory limit constraints.',
      submittedCodeSnippet: `FROM node:18\nWORKDIR /app\nCOPY . .\nCMD ["node", "server.js"]`,
      aiAnalysis: {
        totalScore: 41,
        confidence: 0.89,
        criteriaResults: [
          { name: 'Multi-stage Dockerfile', score: 30, status: 'fail', evidence: 'Single stage build detected' },
          { name: 'Non-root security user', score: 10, status: 'fail', evidence: 'Runs as root' },
          { name: 'Health check response', score: 85, status: 'pass', evidence: 'Basic endpoint detected' },
        ],
      },
      status: 'pending_review',
    };

    setCases((prev) => [demoFailingItem, ...prev]);
    setSelectedCaseId(demoFailingItem.id);
    setActiveTab('pending');
    handleRejectCase(demoFailingItem);
  };

  // Filter cases based on active tab
  const filteredCases = cases.filter((c) => {
    if (activeTab === 'pending') return c.status === 'pending_review';
    if (activeTab === 'approved') return c.status === 'approved_paid';
    if (activeTab === 'rejected') return c.status === 'rejected_revision';
    return true;
  });

  const pendingCount = cases.filter((c) => c.status === 'pending_review').length;
  const approvedCount = cases.filter((c) => c.status === 'approved_paid').length;
  const rejectedCount = cases.filter((c) => c.status === 'rejected_revision').length;

  const getTemplateBadge = (tmpl: ReviewCase['templateCategory']) => {
    if (tmpl === 'python_scraper') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-[#152338] dark:text-[#70b0ff] border border-blue-200 dark:border-[#243f66]">
          🐍 Python Scraper
        </span>
      );
    }
    if (tmpl === 'single_task') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 dark:bg-[#282115] dark:text-[#f5c563] border border-amber-200 dark:border-[#4d3c20]">
          ⚡ Single Coding Task
        </span>
      );
    }
    if (tmpl === 'microservice') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-purple-700 dark:bg-[#281b38] dark:text-[#cb9aff] border border-purple-200 dark:border-[#4b2f6b]">
          📦 Microservice CI/CD
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 dark:bg-[#1a1b1e] dark:text-[#81848b]">
        Custom Contract
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
      
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-[#212225] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-600 dark:text-[#81848b] mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Policy Safety Layer • Human Oversight</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] font-heading">
            Human-in-the-Loop Review Console
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#81848b] font-mono mt-0.5">
            Visualize current ongoing projects, inspect deliverables under their contract templates, and review previous resolution history.
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
            className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Audit Ledger →
          </Link>
        </div>
      </div>

      {/* ── LIVE DEMO INTERACTIVE SIMULATION BANNER ────────────────────────── */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-[#0e0f10] dark:via-[#131626] dark:to-[#0e0f10] border border-indigo-200 dark:border-[#282f54] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="font-bold text-slate-900 dark:text-[#ececed]">
              Interactive Judge Demos (Success &amp; Failure Simulations)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-[#1f2547] dark:text-[#9fa6fc]">
              1-Click Triggers
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-[#81848b]">
            Demonstrate real policy evaluation: simulate an immediate approved release via PayPal sandbox, or trigger a rejected deliverable with fix-list.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerPassingLiveDemo}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>✓</span>
            <span>Simulate Success (Approved)</span>
          </button>
          <button
            type="button"
            onClick={triggerFailingLiveDemo}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>✕</span>
            <span>Simulate Failure (Rejected)</span>
          </button>
        </div>
      </div>

      {/* Action notification toast */}
      {actionSuccessMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-[#0f1713] border border-emerald-300 dark:border-[#254634] text-xs font-mono text-emerald-700 dark:text-[#4cb782] flex justify-between items-center animate-fade-in">
          <span>{actionSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── FILTER TABS ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#212225] pb-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-bold'
              : 'text-slate-600 dark:text-[#81848b] hover:bg-slate-100 dark:hover:bg-[#141517]'
          }`}
        >
          All Cases ({cases.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-amber-700 dark:text-[#d9a441] hover:bg-amber-50 dark:hover:bg-[#251f14]'
          }`}
        >
          <span>⚠️ Ongoing / Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-[#3d321d] dark:text-[#f0bf5a]">
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-emerald-700 dark:text-[#4cb782] hover:bg-emerald-50 dark:hover:bg-[#101e16]'
          }`}
        >
          <span>✓ Decision History: Approved</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-[#1b3d2b] dark:text-[#6ee7a3]">
            {approvedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-rose-700 dark:text-[#e5484d] hover:bg-rose-50 dark:hover:bg-[#241315]'
          }`}
        >
          <span>✕ Decision History: Rejected</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 dark:bg-[#3d1a1e] dark:text-[#f87171]">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* ── MASTER-DETAIL TWO-COLUMN LAYOUT ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono text-xs">
        
        {/* Left Column (5 Cols): Cases List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] text-slate-500 dark:text-[#81848b] uppercase tracking-wider font-bold">
            Select Project to Review ({filteredCases.length})
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredCases.map((item) => {
              const isSelected = item.id === selectedCase.id;
              const score = item.aiAnalysis.totalScore;
              const isPaid = item.status === 'approved_paid';
              const isRejected = item.status === 'rejected_revision';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-[#151929] dark:border-[#4f5b99] shadow-sm'
                      : 'border-slate-200 dark:border-[#212225] bg-white dark:bg-[#0e0f10] hover:border-slate-300 dark:hover:border-[#323438]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getTemplateBadge(item.templateCategory)}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-[#152e20] dark:text-[#4cb782]'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 dark:bg-[#2e171a] dark:text-[#e5484d]'
                          : 'bg-amber-100 text-amber-800 dark:bg-[#2e2617] dark:text-[#d9a441]'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-[#ececed] text-xs leading-snug line-clamp-1">
                    {item.jobTitle}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-[#81848b] mt-0.5 line-clamp-1">
                    {item.milestoneTitle}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-[#1a1b1e] text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-[#ececed]">
                      ${item.amount} USD
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 dark:text-[#81848b]">AI Score:</span>
                      <span
                        className={`font-bold ${
                          score >= 90
                            ? 'text-emerald-600 dark:text-[#4cb782]'
                            : score >= 50
                            ? 'text-amber-600 dark:text-[#d9a441]'
                            : 'text-rose-600 dark:text-[#e5484d]'
                        }`}
                      >
                        {score}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-8 rounded-lg border border-dashed border-slate-300 dark:border-[#212225] text-center text-slate-500 dark:text-[#81848b]">
                No cases matching current tab filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Detailed Selected Project Inspection View */}
        <div className="lg:col-span-7 p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-6 transition-colors shadow-sm">
          
          {/* Header of selected case */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-[#212225] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {getTemplateBadge(selectedCase.templateCategory)}
                <span className="text-[11px] text-slate-500 dark:text-[#81848b]">
                  Job ID: {selectedCase.jobId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    selectedCase.status === 'approved_paid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-[#152e20] dark:text-[#4cb782]'
                      : selectedCase.status === 'rejected_revision'
                      ? 'bg-rose-100 text-rose-800 dark:bg-[#2e171a] dark:text-[#e5484d]'
                      : 'bg-amber-100 text-amber-800 dark:bg-[#2e2617] dark:text-[#d9a441]'
                  }`}
                >
                  {selectedCase.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#ececed]">
                {selectedCase.milestoneTitle}
              </h2>
              <div className="text-xs text-slate-600 dark:text-[#81848b] mt-0.5">
                Contract: <strong>{selectedCase.jobTitle}</strong>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-slate-900 dark:text-[#ececed]">
                ${selectedCase.amount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#81848b] block">
                Escrow Value
              </span>
            </div>
          </div>

          {/* Policy Trigger Callout */}
          <div className="p-3.5 rounded bg-amber-50 dark:bg-[#1f1910] border border-amber-200 dark:border-[#3d321d] text-xs text-amber-800 dark:text-[#d9a441] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Policy Routing Reason:</span>
            </div>
            <p className="text-[11px] leading-relaxed pl-5 font-mono">
              {selectedCase.reasonRouted}
            </p>
          </div>

          {/* AI Arbiter Score & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${
                  selectedCase.aiAnalysis.totalScore >= 90
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-[#102418] text-emerald-700 dark:text-[#4cb782]'
                    : selectedCase.aiAnalysis.totalScore >= 50
                    ? 'border-amber-500 bg-amber-50 dark:bg-[#241e12] text-amber-700 dark:text-[#d9a441]'
                    : 'border-rose-500 bg-rose-50 dark:bg-[#241215] text-rose-700 dark:text-[#e5484d]'
                }`}
              >
                <span className="font-extrabold text-sm leading-none">
                  {selectedCase.aiAnalysis.totalScore}
                </span>
                <span className="text-[8px] opacity-75">/100</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">
                  AI Total Score
                </span>
                <span className="font-bold text-xs text-slate-900 dark:text-[#ececed]">
                  {selectedCase.aiAnalysis.totalScore >= 90 ? 'Passing' : 'Requires Review'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225]">
              <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">
                Model Confidence
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-[#ececed] mt-0.5">
                {(selectedCase.aiAnalysis.confidence * 100).toFixed(0)}%
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#81848b]">
                Threshold: 60%
              </span>
            </div>

            <div className="p-3.5 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225]">
              <span className="text-[10px] text-slate-500 dark:text-[#81848b] uppercase block">
                Freelancer Receiver
              </span>
              <div className="text-[11px] font-bold text-slate-900 dark:text-[#ececed] mt-0.5 truncate" title={selectedCase.freelancerPayPalEmail}>
                {selectedCase.freelancerPayPalEmail}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#81848b]">
                PayPal Sandbox
              </span>
            </div>
          </div>

          {/* Criteria Evaluation Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-500 dark:text-[#81848b] uppercase tracking-wider font-bold">
              Acceptance Criteria Evaluation ({selectedCase.aiAnalysis.criteriaResults.length})
            </span>
            <div className="space-y-2">
              {selectedCase.aiAnalysis.criteriaResults.map((crit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-[#ececed] text-xs">
                      {crit.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`font-bold ${
                          crit.score >= 90
                            ? 'text-emerald-600 dark:text-[#4cb782]'
                            : crit.score >= 50
                            ? 'text-amber-600 dark:text-[#d9a441]'
                            : 'text-rose-600 dark:text-[#e5484d]'
                        }`}
                      >
                        {crit.score}/100
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          crit.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-[#183323] dark:text-[#4cb782]'
                            : 'bg-rose-100 text-rose-800 dark:bg-[#33181b] dark:text-[#e5484d]'
                        }`}
                      >
                        {crit.status}
                      </span>
                    </div>
                  </div>
                  {crit.evidence && (
                    <div className="text-[11px] text-slate-600 dark:text-[#81848b] bg-white dark:bg-[#0e0f10] p-2 rounded border border-slate-200 dark:border-[#212225]">
                      <span className="text-slate-400 font-semibold mr-1">Evidence:</span>
                      {crit.evidence}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submitted Code / Deliverable Evidence Inspector */}
          {selectedCase.submittedCodeSnippet && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-[#81848b] uppercase tracking-wider font-bold">
                Submitted Deliverable Code Excerpt
              </span>
              <pre className="p-3 rounded-lg bg-slate-900 dark:bg-[#08090a] border border-slate-700 dark:border-[#212225] text-green-400 text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                {selectedCase.submittedCodeSnippet}
              </pre>
            </div>
          )}

          {/* Resolution Details for Previous Jobs (Approved / Rejected) */}
          {selectedCase.decidedAt && (
            <div
              className={`p-4 rounded-lg border space-y-1.5 ${
                selectedCase.status === 'approved_paid'
                  ? 'bg-emerald-50 dark:bg-[#0d1f14] border-emerald-300 dark:border-[#254634] text-emerald-800 dark:text-[#4cb782]'
                  : 'bg-rose-50 dark:bg-[#1f0d0f] border-rose-300 dark:border-[#462529] text-rose-800 dark:text-[#e5484d]'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>
                  {selectedCase.status === 'approved_paid'
                    ? '✓ Previous Action: Payment Approved & Released'
                    : '✕ Previous Action: Milestone Deliverable Rejected'}
                </span>
                <span className="text-[10px] opacity-75">
                  {new Date(selectedCase.decidedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {selectedCase.decisionNotes}
              </p>
              {selectedCase.payoutBatchId && (
                <div className="text-[10px] font-bold pt-1">
                  PayPal Batch ID: {selectedCase.payoutBatchId}
                </div>
              )}
            </div>
          )}

          {/* Human Review Actions (Visible when Pending) */}
          {selectedCase.status === 'pending_review' && (
            <div className="pt-2 border-t border-slate-200 dark:border-[#212225] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-slate-500 dark:text-[#81848b] text-[11px]">
                Awaiting administrator action
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRejectCase(selectedCase)}
                  disabled={processing === selectedCase.id}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-[#1c1214] dark:hover:bg-[#29161a] dark:text-[#e5484d] dark:border-[#4c1e22] text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ Reject &amp; Issue Fix List
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveCase(selectedCase)}
                  disabled={processing === selectedCase.id}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {processing === selectedCase.id ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                      <span>Releasing Payout...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Approve &amp; Release ${selectedCase.amount}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
