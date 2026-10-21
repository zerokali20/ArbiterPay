'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CriterionItem {
  id: string;
  description: string;
}

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  criteria: CriterionItem[];
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Production Microservice & Automated CI Pipeline');
  const [description, setDescription] = useState(
    'Deliver a TypeScript microservice with Docker containerization, comprehensive test coverage, and documentation.'
  );
  const [clientEmail, setClientEmail] = useState('sb-bhnlh53339270@business.example.com');
  const [freelancerEmail, setFreelancerEmail] = useState('sb-okeek53339723@personal.example.com');

  // Total escrow budget input
  const [totalBudget, setTotalBudget] = useState('150.00');

  // Split strategy: 'equal' | 'front_loaded' | 'back_loaded' | 'custom'
  const [splitStrategy, setSplitStrategy] = useState<'equal' | 'front_loaded' | 'back_loaded' | 'custom'>('equal');

  // Criterion input drafts per milestone
  const [newCriterionDrafts, setNewCriterionDrafts] = useState<{ [key: number]: string }>({});

  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      title: 'Milestone 1: Core Service & Authentication',
      description: 'Implement JWT authentication, user registration, and bcrypt password hashing with tests.',
      amount: '50.00',
      criteria: [
        { id: 'crit-1-1', description: 'POST /auth/register and /auth/login with bcrypt password hashing.' },
        { id: 'crit-1-2', description: 'JWT middleware protecting routes.' },
        { id: 'crit-1-3', description: 'Automated test suite with >80% code coverage.' },
      ],
    },
    {
      title: 'Milestone 2: Dockerization & Health Checks',
      description: 'Create multi-stage Dockerfile and healthcheck endpoints.',
      amount: '50.00',
      criteria: [
        { id: 'crit-2-1', description: 'Multi-stage Dockerfile with non-root security user.' },
        { id: 'crit-2-2', description: 'GET /health endpoint reporting status, uptime, and memory usage.' },
      ],
    },
    {
      title: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
      description: 'GitHub Actions workflow file and OpenAPI/Swagger documentation.',
      amount: '50.00',
      criteria: [
        { id: 'crit-3-1', description: 'GitHub Actions workflow running lint, typecheck, and test.' },
        { id: 'crit-3-2', description: 'OpenAPI 3.0 specification file documenting all endpoints.' },
      ],
    },
  ]);

  // Calculate sum of milestones
  const allocatedTotal = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  }, [milestones]);

  const targetBudgetNum = parseFloat(totalBudget) || 0;
  const budgetDifference = targetBudgetNum - allocatedTotal;
  const isBudgetBalanced = Math.abs(budgetDifference) < 0.01;

  // ── Split Money Mechanism ──────────────────────────────────────────────────
  const applySplitStrategy = (strategy: 'equal' | 'front_loaded' | 'back_loaded', budgetVal?: string) => {
    const total = parseFloat(budgetVal !== undefined ? budgetVal : totalBudget) || 0;
    const count = milestones.length;
    if (count === 0 || total <= 0) return;

    setSplitStrategy(strategy);

    if (strategy === 'equal') {
      const share = (total / count).toFixed(2);
      const updated = milestones.map((m, i) => {
        // give any rounding penny difference to the last milestone
        if (i === count - 1) {
          const othersSum = parseFloat(share) * (count - 1);
          const remainder = (total - othersSum).toFixed(2);
          return { ...m, amount: remainder };
        }
        return { ...m, amount: share };
      });
      setMilestones(updated);
    } else if (strategy === 'front_loaded') {
      // 50% first, split rest
      let ratios: number[] = [];
      if (count === 2) ratios = [0.6, 0.4];
      else if (count === 3) ratios = [0.5, 0.3, 0.2];
      else if (count === 4) ratios = [0.4, 0.3, 0.2, 0.1];
      else ratios = milestones.map((_, i) => (i === 0 ? 0.4 : 0.6 / (count - 1)));

      let allocatedSoFar = 0;
      const updated = milestones.map((m, i) => {
        if (i === count - 1) {
          return { ...m, amount: Math.max(0, total - allocatedSoFar).toFixed(2) };
        }
        const val = parseFloat((total * ratios[i]).toFixed(2));
        allocatedSoFar += val;
        return { ...m, amount: val.toFixed(2) };
      });
      setMilestones(updated);
    } else if (strategy === 'back_loaded') {
      // 50% last milestone
      let ratios: number[] = [];
      if (count === 2) ratios = [0.4, 0.6];
      else if (count === 3) ratios = [0.2, 0.3, 0.5];
      else if (count === 4) ratios = [0.15, 0.2, 0.25, 0.4];
      else ratios = milestones.map((_, i) => (i === count - 1 ? 0.5 : 0.5 / (count - 1)));

      let allocatedSoFar = 0;
      const updated = milestones.map((m, i) => {
        if (i === count - 1) {
          return { ...m, amount: Math.max(0, total - allocatedSoFar).toFixed(2) };
        }
        const val = parseFloat((total * ratios[i]).toFixed(2));
        allocatedSoFar += val;
        return { ...m, amount: val.toFixed(2) };
      });
      setMilestones(updated);
    }
  };

  // Change total budget and auto-reapply equal split if equal selected
  const handleTotalBudgetChange = (val: string) => {
    setTotalBudget(val);
    if (splitStrategy === 'equal' || splitStrategy === 'front_loaded' || splitStrategy === 'back_loaded') {
      applySplitStrategy(splitStrategy, val);
    }
  };

  // Preset budget buttons
  const handlePresetBudget = (preset: number) => {
    const val = preset.toFixed(2);
    setTotalBudget(val);
    applySplitStrategy(splitStrategy === 'custom' ? 'equal' : splitStrategy, val);
  };

  // Update specific milestone amount manually
  const handleMilestoneAmountChange = (index: number, newAmount: string) => {
    setSplitStrategy('custom');
    const updated = [...milestones];
    updated[index].amount = newAmount;
    setMilestones(updated);
  };

  // Auto-balance remaining budget difference into the last milestone
  const handleAutoBalance = () => {
    if (milestones.length === 0) return;
    const count = milestones.length;
    const currentSumWithoutLast = milestones
      .slice(0, count - 1)
      .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
    const balanceForLast = Math.max(0, targetBudgetNum - currentSumWithoutLast).toFixed(2);

    const updated = [...milestones];
    updated[count - 1].amount = balanceForLast;
    setMilestones(updated);
  };

  // ── Milestone Add / Remove ───────────────────────────────────────────────
  const handleAddMilestone = () => {
    if (milestones.length >= 6) {
      alert('Maximum of 6 milestones reached for this escrow.');
      return;
    }
    const newIdx = milestones.length + 1;
    const newMilestone: MilestoneInput = {
      title: `Milestone ${newIdx}: Quality Assurance & Verification`,
      description: `Complete verification deliverables and documentation for milestone ${newIdx}.`,
      amount: '0.00',
      criteria: [
        { id: `crit-${newIdx}-1`, description: `Functional acceptance criteria for milestone ${newIdx}.` },
        { id: `crit-${newIdx}-2`, description: 'Unit or integration tests passing with 0 failures.' },
      ],
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);

    // Re-split if using equal strategy
    if (splitStrategy === 'equal') {
      const total = targetBudgetNum;
      const count = updated.length;
      const share = (total / count).toFixed(2);
      const rebalanced = updated.map((m, i) => {
        if (i === count - 1) {
          const othersSum = parseFloat(share) * (count - 1);
          return { ...m, amount: (total - othersSum).toFixed(2) };
        }
        return { ...m, amount: share };
      });
      setMilestones(rebalanced);
    }
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 2) {
      alert('An escrow job requires at least 2 milestones.');
      return;
    }
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);

    // Re-split
    if (splitStrategy === 'equal') {
      const total = targetBudgetNum;
      const count = updated.length;
      const share = (total / count).toFixed(2);
      const rebalanced = updated.map((m, i) => {
        if (i === count - 1) {
          const othersSum = parseFloat(share) * (count - 1);
          return { ...m, amount: (total - othersSum).toFixed(2) };
        }
        return { ...m, amount: share };
      });
      setMilestones(rebalanced);
    }
  };

  // ── Criteria Management ──────────────────────────────────────────────────
  const handleAddCriterion = (milestoneIdx: number) => {
    const text = (newCriterionDrafts[milestoneIdx] || '').trim();
    if (!text) return;

    const updated = [...milestones];
    const newCritId = `crit-${milestoneIdx + 1}-${Date.now().toString().slice(-4)}`;
    updated[milestoneIdx].criteria.push({ id: newCritId, description: text });
    setMilestones(updated);

    setNewCriterionDrafts((prev) => ({ ...prev, [milestoneIdx]: '' }));
  };

  const handleRemoveCriterion = (milestoneIdx: number, critIdx: number) => {
    const updated = [...milestones];
    if (updated[milestoneIdx].criteria.length <= 1) {
      alert('Each milestone must contain at least 1 verifiable criterion.');
      return;
    }
    updated[milestoneIdx].criteria.splice(critIdx, 1);
    setMilestones(updated);
  };

  const handleCriterionPreset = (milestoneIdx: number, presetText: string) => {
    const updated = [...milestones];
    const newCritId = `crit-${milestoneIdx + 1}-${Date.now().toString().slice(-4)}`;
    updated[milestoneIdx].criteria.push({ id: newCritId, description: presetText });
    setMilestones(updated);
  };

  // ── Submit Job ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate milestones
      if (milestones.length < 2) {
        throw new Error('Please include at least 2 milestones.');
      }

      // Check if amounts are valid numbers
      for (const m of milestones) {
        if (!m.amount || parseFloat(m.amount) <= 0) {
          throw new Error(`Milestone "${m.title}" must have an amount greater than 0.`);
        }
      }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          clientEmail,
          freelancerEmail,
          freelancerPayPalEmail: freelancerEmail,
          milestones: milestones.map((m) => ({
            title: m.title,
            description: m.description,
            amount: m.amount,
            criteria: m.criteria.map((c) => c.description),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create job');

      // Persist created job ID for Navbar Live Demo tab
      try {
        localStorage.setItem('lastCreatedJobId', data.job.id);
      } catch {}

      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      alert(`Error creating job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      <div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
          Milestone Escrow Setup
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] mt-1 font-heading">
          Create Escrow Job
        </h1>
        <p className="text-xs font-mono text-slate-600 dark:text-[#81848b] mt-0.5">
          Define verifiable milestones with strict acceptance criteria and allocate money with intelligent split mechanisms.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] transition-colors">
        
        {/* Job Title & Scope */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-[#ececed]">
              Job Title
            </label>
            <input
              type="text"
              required
              className="w-full rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-[#ececed]">
              Brief / Scope Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Client & Freelancer Accounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-[#ececed]">
              Client Email (PayPal Sandbox Payer)
            </label>
            <input
              type="email"
              required
              className="w-full rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] transition-colors"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-[#ececed]">
              Freelancer PayPal Email (Sandbox Receiver)
            </label>
            <input
              type="email"
              required
              className="w-full rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] transition-colors"
              value={freelancerEmail}
              onChange={(e) => setFreelancerEmail(e.target.value)}
            />
          </div>
        </div>

        {/* ── MONEY ALLOCATION & SPLIT MECHANISM BOX ────────────────────────────── */}
        <div className="p-5 rounded-lg bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#212225] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-[#ececed] uppercase tracking-wider">
                  Escrow Budget & Money Split Mechanism
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-[#1f2038] dark:text-[#9fa6fc] dark:border-[#373a6e]">
                  Auto-Calculator
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] mt-0.5">
                Set total job budget and distribute funds across {milestones.length} milestones.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">Presets:</span>
              {[100, 150, 300, 600].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetBudget(preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                    parseFloat(totalBudget) === preset
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:border-slate-400'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Total Budget Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-slate-600 dark:text-[#81848b]">
                Total Escrow Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={totalBudget}
                  onChange={(e) => handleTotalBudgetChange(e.target.value)}
                  className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                />
              </div>
            </div>

            {/* Split Strategy Selector */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-mono text-slate-600 dark:text-[#81848b]">
                Money Split Strategy
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applySplitStrategy('equal')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors ${
                    splitStrategy === 'equal'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  ⚖️ Split Equally
                </button>
                <button
                  type="button"
                  onClick={() => applySplitStrategy('front_loaded')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors ${
                    splitStrategy === 'front_loaded'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  🚀 Front-Loaded
                </button>
                <button
                  type="button"
                  onClick={() => applySplitStrategy('back_loaded')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors ${
                    splitStrategy === 'back_loaded'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  🎯 Milestone Weighted
                </button>
              </div>
            </div>
          </div>

          {/* Allocation summary pill & Auto-Balance */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-[#212225] text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 dark:text-[#81848b]">
                Allocated:{' '}
                <strong className="text-slate-900 dark:text-[#ececed]">
                  ${allocatedTotal.toFixed(2)}
                </strong>{' '}
                / ${targetBudgetNum.toFixed(2)}
              </span>
              {isBudgetBalanced ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#1a2e23] dark:text-[#4cb782] dark:border-[#254634]">
                  ✓ 100% Balanced
                </span>
              ) : (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    budgetDifference > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#2a2417] dark:text-[#d9a441] dark:border-[#3f3521]'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#311518] dark:text-[#e5484d] dark:border-[#4c1e22]'
                  }`}
                >
                  {budgetDifference > 0
                    ? `⚠️ $${budgetDifference.toFixed(2)} unallocated`
                    : `⚠️ Overallocated by $${Math.abs(budgetDifference).toFixed(2)}`}
                </span>
              )}
            </div>

            {!isBudgetBalanced && (
              <button
                type="button"
                onClick={handleAutoBalance}
                className="text-[11px] px-2 py-1 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white font-bold transition-colors"
              >
                Auto-Balance Difference
              </button>
            )}
          </div>
        </div>

        {/* ── MILESTONES BUILDER ─────────────────────────────────────────────────── */}
        <div className="border-t border-slate-200 dark:border-[#212225] pt-6 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-[#ececed] font-heading text-sm">
                Escrow Milestones ({milestones.length})
              </span>
              <span className="text-slate-500 dark:text-[#81848b] text-[11px]">
                (Min: 2 • Max: 6)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] border border-slate-200 dark:border-[#2d2f33] text-xs font-mono text-slate-800 dark:text-[#ececed] transition-colors flex items-center gap-1"
            >
              <span>+ Add Milestone</span>
            </button>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => {
              const milestoneAmountNum = parseFloat(m.amount) || 0;
              const percentageOfTotal =
                targetBudgetNum > 0
                  ? ((milestoneAmountNum / targetBudgetNum) * 100).toFixed(1)
                  : '0.0';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-lg bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] space-y-4 font-mono text-xs transition-colors"
                >
                  {/* Milestone Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-[#212225] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-[#81848b]">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#212225] text-slate-700 dark:text-[#ececed]">
                        Milestone {idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Milestone Amount Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-[#81848b] text-[11px]">Amount:</span>
                        <div className="relative w-24">
                          <span className="absolute left-2 top-1 text-xs text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            value={m.amount}
                            onChange={(e) => handleMilestoneAmountChange(idx, e.target.value)}
                            className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] pl-5 pr-1.5 py-1 text-xs font-bold text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                          />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-slate-600 dark:text-[#81848b]">
                          {percentageOfTotal}%
                        </span>
                      </div>

                      {/* Delete button (minimum 2 milestones) */}
                      {milestones.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          title="Remove this milestone"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-[#e5484d] transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-500 dark:text-[#81848b]">
                        Milestone Title
                      </label>
                      <input
                        type="text"
                        required
                        value={m.title}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].title = e.target.value;
                          setMilestones(updated);
                        }}
                        className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] px-3 py-1.5 text-xs text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] text-slate-500 dark:text-[#81848b]">
                        Scope / Deliverable Description
                      </label>
                      <input
                        type="text"
                        required
                        value={m.description}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].description = e.target.value;
                          setMilestones(updated);
                        }}
                        className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] px-3 py-1.5 text-xs text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                      />
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#212225]">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 dark:text-[#81848b] uppercase">
                        Acceptance Criteria ({m.criteria.length})
                      </span>
                      {/* Criteria Quick Suggestions */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Add suggestion:</span>
                        <button
                          type="button"
                          onClick={() => handleCriterionPreset(idx, 'Automated unit tests with >80% coverage.')}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-600 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white"
                        >
                          + Unit Tests
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCriterionPreset(idx, 'Dockerfile passing healthcheck verification.')}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-600 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white"
                        >
                          + Docker
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCriterionPreset(idx, 'OpenAPI 3.0 specification documentation file.')}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-600 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white"
                        >
                          + OpenAPI
                        </button>
                      </div>
                    </div>

                    {/* Criteria items list */}
                    <div className="space-y-1.5">
                      {m.criteria.map((c, cIdx) => (
                        <div
                          key={c.id || cIdx}
                          className="flex items-center justify-between gap-2 p-2 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#9b9da3] text-[11px]"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-slate-400 dark:text-[#81848b] font-bold">•</span>
                            <span>{c.description}</span>
                          </div>
                          {m.criteria.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(idx, cIdx)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-[#e5484d] p-0.5 text-xs"
                              title="Delete criterion"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add new custom criterion input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add new verifiable acceptance criterion..."
                        value={newCriterionDrafts[idx] || ''}
                        onChange={(e) =>
                          setNewCriterionDrafts((prev) => ({ ...prev, [idx]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCriterion(idx);
                          }
                        }}
                        className="flex-1 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] px-2.5 py-1 text-[11px] text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(idx)}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 dark:bg-[#1a1b1e] dark:text-[#ececed] hover:bg-slate-300 dark:hover:bg-[#212225] text-[11px] font-bold transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading
              ? 'Creating Escrow Job...'
              : `Create Job & Fund via PayPal Sandbox ($${allocatedTotal.toFixed(2)} USD)`}
          </button>
          <p className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] text-center mt-2">
            Deterministic Policy Layer: Escrow funds held in PayPal sandbox until AI Arbiter verifies acceptance criteria.
          </p>
        </div>
      </form>
    </div>
  );
}
