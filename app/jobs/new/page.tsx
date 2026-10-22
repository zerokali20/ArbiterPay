'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CriterionItem {
  id: string;
  description: string;
}

interface MilestoneInput {
  id: string;
  title: string;
  description: string;
  amount: string;
  criteria: CriterionItem[];
}

interface CustomTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  totalBudget: string;
  splitStrategy: 'equal' | 'front_loaded' | 'back_loaded' | 'custom';
  milestones: MilestoneInput[];
  createdAt: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Job metadata — default to the coding task MVP
  const [title, setTitle] = useState('Python Web Scraper: URL → CSV of H1 Tags');
  const [description, setDescription] = useState(
    'Write a Python script that takes a URL as input, extracts all H1 tags found on the page, and outputs them into a CSV file (h1_tags.csv). Must include error handling for invalid URLs.'
  );
  const [clientEmail, setClientEmail] = useState('sb-bhnlh53339270@business.example.com');
  const [freelancerEmail, setFreelancerEmail] = useState('sb-okeek53339723@personal.example.com');

  // Total escrow budget input
  const [totalBudget, setTotalBudget] = useState('150.00');

  // Split strategy: 'equal' | 'front_loaded' | 'back_loaded' | 'custom'
  const [splitStrategy, setSplitStrategy] = useState<'equal' | 'front_loaded' | 'back_loaded' | 'custom'>('equal');

  // Criterion input drafts keyed by milestone stable ID
  const [criterionDrafts, setCriterionDrafts] = useState<{ [milestoneId: string]: string }>({});

  // Active template indicator
  const [activeTemplateId, setActiveTemplateId] = useState<string>('python_scraper');

  // Custom Saved Templates state (persisted in localStorage)
  const [savedTemplates, setSavedTemplates] = useState<CustomTemplate[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load saved templates from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arbiterpay_saved_templates');
      if (stored) {
        setSavedTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load saved templates from localStorage:', e);
    }
  }, []);

  // Milestones state with stable unique IDs
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      id: 'ms-seed-1',
      title: 'Milestone 1: Core Scraper — URL Input & H1 Extraction',
      description: 'Accepts a URL argument, fetches page with requests, parses HTML, and extracts all H1 tags.',
      amount: '75.00',
      criteria: [
        { id: 'crit-1-1', description: 'Script accepts a URL as a command-line argument (sys.argv or argparse).' },
        { id: 'crit-1-2', description: 'Fetches HTML using requests or urllib and parses with BeautifulSoup (bs4).' },
        { id: 'crit-1-3', description: 'Extracts all H1 tags accurately without crashing on missing tags.' },
      ],
    },
    {
      id: 'ms-seed-2',
      title: 'Milestone 2: CSV Output & Graceful Error Handling',
      description: 'Writes results into a clean CSV file and handles invalid URLs, timeouts, and HTTP errors.',
      amount: '75.00',
      criteria: [
        { id: 'crit-2-1', description: 'Outputs a valid CSV file (h1_tags.csv) with header columns.' },
        { id: 'crit-2-2', description: 'Handles invalid URLs, network timeouts, and non-200 HTTP responses gracefully.' },
        { id: 'crit-2-3', description: 'Includes requirements.txt or inline dependency instructions.' },
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

  // ── Preset Template Switcher ──────────────────────────────────────────────
  const applyTaskPreset = (presetType: 'python_scraper' | 'single_task' | 'microservice') => {
    setActiveTemplateId(presetType);
    if (presetType === 'python_scraper') {
      setTitle('Python Web Scraper: URL → CSV of H1 Tags');
      setDescription(
        'Write a Python script that takes a URL as input, extracts all H1 tags found on the page, and outputs them into a CSV file (h1_tags.csv). Must include error handling for invalid URLs.'
      );
      setTotalBudget('150.00');
      setSplitStrategy('equal');
      setMilestones([
        {
          id: `ms-${Date.now()}-1`,
          title: 'Milestone 1: Core Scraper — URL Input & H1 Extraction',
          description: 'Accepts a URL argument, fetches page with requests, parses HTML, and extracts all H1 tags.',
          amount: '75.00',
          criteria: [
            { id: `c-${Date.now()}-1`, description: 'Script accepts a URL as a command-line argument (sys.argv or argparse).' },
            { id: `c-${Date.now()}-2`, description: 'Fetches HTML using requests or urllib and parses with BeautifulSoup (bs4).' },
            { id: `c-${Date.now()}-3`, description: 'Extracts all H1 tags accurately without crashing on missing tags.' },
          ],
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Milestone 2: CSV Output & Graceful Error Handling',
          description: 'Writes results into a clean CSV file and handles invalid URLs, timeouts, and HTTP errors.',
          amount: '75.00',
          criteria: [
            { id: `c-${Date.now()}-4`, description: 'Outputs a valid CSV file (h1_tags.csv) with header columns.' },
            { id: `c-${Date.now()}-5`, description: 'Handles invalid URLs, network timeouts, and non-200 HTTP responses gracefully.' },
            { id: `c-${Date.now()}-6`, description: 'Includes requirements.txt or inline dependency instructions.' },
          ],
        },
      ]);
    } else if (presetType === 'single_task') {
      setTitle('Python URL-to-CSV H1 Scraper Script');
      setDescription(
        'Deliver a single, complete Python script (script.py) that accepts a target URL, extracts all H1 tags using BeautifulSoup, and saves them to a CSV file.'
      );
      setTotalBudget('100.00');
      setSplitStrategy('equal');
      setMilestones([
        {
          id: `ms-${Date.now()}-1`,
          title: 'Milestone 1: Complete Script Implementation & Verification',
          description: 'Full script.py satisfying URL extraction, CSV formatting, and error handling.',
          amount: '100.00',
          criteria: [
            { id: `c-${Date.now()}-1`, description: 'Script takes URL as input and fetches page HTML.' },
            { id: `c-${Date.now()}-2`, description: 'Extracts all H1 tags using BeautifulSoup or HTML parser.' },
            { id: `c-${Date.now()}-3`, description: 'Writes extracted data into CSV file with proper headers.' },
            { id: `c-${Date.now()}-4`, description: 'Handles invalid URLs and network errors with clear console output.' },
          ],
        },
      ]);
    } else if (presetType === 'microservice') {
      setTitle('Production Microservice & Automated CI Pipeline');
      setDescription(
        'Deliver a TypeScript microservice with Docker containerization, comprehensive test coverage, and CI/CD documentation.'
      );
      setTotalBudget('150.00');
      setSplitStrategy('equal');
      setMilestones([
        {
          id: `ms-${Date.now()}-1`,
          title: 'Milestone 1: Core Service & Authentication',
          description: 'Implement JWT authentication, user registration, and bcrypt password hashing with tests.',
          amount: '50.00',
          criteria: [
            { id: `c-${Date.now()}-1`, description: 'POST /auth/register and /auth/login with bcrypt password hashing.' },
            { id: `c-${Date.now()}-2`, description: 'JWT middleware protecting routes.' },
            { id: `c-${Date.now()}-3`, description: 'Automated test suite with >80% code coverage.' },
          ],
        },
        {
          id: `ms-${Date.now()}-2`,
          title: 'Milestone 2: Dockerization & Health Checks',
          description: 'Create multi-stage Dockerfile and healthcheck endpoints.',
          amount: '50.00',
          criteria: [
            { id: `c-${Date.now()}-4`, description: 'Multi-stage Dockerfile with non-root security user.' },
            { id: `c-${Date.now()}-5`, description: 'GET /health endpoint reporting status, uptime, and memory usage.' },
          ],
        },
        {
          id: `ms-${Date.now()}-3`,
          title: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
          description: 'GitHub Actions workflow file and OpenAPI/Swagger documentation.',
          amount: '50.00',
          criteria: [
            { id: `c-${Date.now()}-6`, description: 'GitHub Actions workflow running lint, typecheck, and test.' },
            { id: `c-${Date.now()}-7`, description: 'OpenAPI 3.0 specification file documenting all endpoints.' },
          ],
        },
      ]);
    }
  };

  // ── Template Save & Load Mechanism ─────────────────────────────────────────
  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = templateNameInput.trim();
    if (!name) return;

    const newTemplate: CustomTemplate = {
      id: `tmpl-${Date.now()}`,
      name,
      title,
      description,
      totalBudget,
      splitStrategy,
      milestones,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTemplate, ...savedTemplates.filter((t) => t.name !== name)];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('arbiterpay_saved_templates', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save template to localStorage:', err);
    }

    setActiveTemplateId(newTemplate.id);
    setTemplateNameInput('');
    setIsSaveModalOpen(false);
    setSaveSuccessMsg(`Template "${name}" saved!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const deleteSavedTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('arbiterpay_saved_templates', JSON.stringify(updated));
    } catch {}
    if (activeTemplateId === id) setActiveTemplateId('');
  };

  const loadCustomTemplate = (t: CustomTemplate) => {
    setActiveTemplateId(t.id);
    setTitle(t.title);
    setDescription(t.description);
    setTotalBudget(t.totalBudget);
    setSplitStrategy(t.splitStrategy || 'equal');
    setMilestones(
      t.milestones.map((m, i) => ({
        ...m,
        id: `ms-${Date.now()}-${i}`,
        criteria: m.criteria.map((c, ci) => ({
          ...c,
          id: `crit-${Date.now()}-${i}-${ci}`,
        })),
      }))
    );
    setSaveSuccessMsg(`Loaded "${t.name}"`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // ── Split Money Mechanism ──────────────────────────────────────────────────
  const applySplitStrategyToMilestones = (
    strategy: 'equal' | 'front_loaded' | 'back_loaded',
    items: MilestoneInput[],
    budgetVal?: string
  ): MilestoneInput[] => {
    const total = parseFloat(budgetVal !== undefined ? budgetVal : totalBudget) || 0;
    const count = items.length;
    if (count === 0 || total <= 0) return items;

    if (strategy === 'equal') {
      const share = (total / count).toFixed(2);
      return items.map((m, i) => {
        if (i === count - 1) {
          const othersSum = parseFloat(share) * (count - 1);
          const remainder = Math.max(0, total - othersSum).toFixed(2);
          return { ...m, amount: remainder };
        }
        return { ...m, amount: share };
      });
    } else if (strategy === 'front_loaded') {
      let ratios: number[] = [];
      if (count === 1) ratios = [1.0];
      else if (count === 2) ratios = [0.6, 0.4];
      else if (count === 3) ratios = [0.5, 0.3, 0.2];
      else if (count === 4) ratios = [0.4, 0.3, 0.2, 0.1];
      else ratios = items.map((_, i) => (i === 0 ? 0.4 : 0.6 / (count - 1)));

      let allocatedSoFar = 0;
      return items.map((m, i) => {
        if (i === count - 1) {
          return { ...m, amount: Math.max(0, total - allocatedSoFar).toFixed(2) };
        }
        const val = parseFloat((total * ratios[i]).toFixed(2));
        allocatedSoFar += val;
        return { ...m, amount: val.toFixed(2) };
      });
    } else if (strategy === 'back_loaded') {
      let ratios: number[] = [];
      if (count === 1) ratios = [1.0];
      else if (count === 2) ratios = [0.4, 0.6];
      else if (count === 3) ratios = [0.2, 0.3, 0.5];
      else if (count === 4) ratios = [0.15, 0.2, 0.25, 0.4];
      else ratios = items.map((_, i) => (i === count - 1 ? 0.5 : 0.5 / (count - 1)));

      let allocatedSoFar = 0;
      return items.map((m, i) => {
        if (i === count - 1) {
          return { ...m, amount: Math.max(0, total - allocatedSoFar).toFixed(2) };
        }
        const val = parseFloat((total * ratios[i]).toFixed(2));
        allocatedSoFar += val;
        return { ...m, amount: val.toFixed(2) };
      });
    }
    return items;
  };

  const handleStrategyChange = (strategy: 'equal' | 'front_loaded' | 'back_loaded') => {
    setSplitStrategy(strategy);
    setMilestones(applySplitStrategyToMilestones(strategy, milestones));
  };

  // Change total budget and auto-reapply
  const handleTotalBudgetChange = (val: string) => {
    setTotalBudget(val);
    if (splitStrategy === 'equal' || splitStrategy === 'front_loaded' || splitStrategy === 'back_loaded') {
      setMilestones(applySplitStrategyToMilestones(splitStrategy, milestones, val));
    }
  };

  // Preset budget buttons
  const handlePresetBudget = (preset: number) => {
    const val = preset.toFixed(2);
    setTotalBudget(val);
    const strat = splitStrategy === 'custom' ? 'equal' : splitStrategy;
    setMilestones(applySplitStrategyToMilestones(strat, milestones, val));
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
      alert('Maximum of 6 milestones reached for this escrow job.');
      return;
    }
    const newIdx = milestones.length + 1;
    const newMilestoneId = `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newMilestone: MilestoneInput = {
      id: newMilestoneId,
      title: `Milestone ${newIdx}: Quality Assurance & Verification`,
      description: `Complete verification deliverables and documentation for milestone ${newIdx}.`,
      amount: '0.00',
      criteria: [
        { id: `crit-${newIdx}-1`, description: `Functional acceptance criteria for milestone ${newIdx}.` },
        { id: `crit-${newIdx}-2`, description: 'Unit or integration tests passing with 0 failures.' },
      ],
    };

    const newMilestonesList = [...milestones, newMilestone];

    // Automatically re-distribute budget so the new milestone has a valid non-zero amount
    if (splitStrategy === 'equal' || splitStrategy === 'front_loaded' || splitStrategy === 'back_loaded') {
      setMilestones(applySplitStrategyToMilestones(splitStrategy, newMilestonesList));
    } else {
      setMilestones(applySplitStrategyToMilestones('equal', newMilestonesList));
      setSplitStrategy('equal');
    }
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      alert('An escrow job requires at least 1 milestone.');
      return;
    }

    const removedId = milestones[index].id;
    const updated = milestones.filter((_, i) => i !== index);

    // Clean up draft text for removed milestone
    setCriterionDrafts((prev) => {
      const copy = { ...prev };
      delete copy[removedId];
      return copy;
    });

    // Re-number milestone titles cleanly if they match "Milestone X: ..."
    const renumbered = updated.map((m, i) => {
      const titleMatch = m.title.match(/^Milestone \d+:(.*)$/);
      if (titleMatch) {
        return { ...m, title: `Milestone ${i + 1}:${titleMatch[1]}` };
      }
      return m;
    });

    // Automatically reallocate budget to remaining milestones so budget remains 100% balanced
    if (splitStrategy === 'equal' || splitStrategy === 'front_loaded' || splitStrategy === 'back_loaded') {
      setMilestones(applySplitStrategyToMilestones(splitStrategy, renumbered));
    } else {
      const count = renumbered.length;
      const sumWithoutLast = renumbered
        .slice(0, count - 1)
        .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
      renumbered[count - 1].amount = Math.max(0, targetBudgetNum - sumWithoutLast).toFixed(2);
      setMilestones(renumbered);
    }
  };

  // ── Criteria Management (Index-Based Operations) ───────────────────────────
  
  // 1. Edit an existing criterion's text directly
  const handleCriterionChange = (milestoneIdx: number, critIdx: number, newText: string) => {
    setMilestones((prev) => {
      const copy = [...prev];
      const targetM = { ...copy[milestoneIdx] };
      const updatedCriteria = [...targetM.criteria];
      updatedCriteria[critIdx] = {
        ...updatedCriteria[critIdx],
        description: newText,
      };
      targetM.criteria = updatedCriteria;
      copy[milestoneIdx] = targetM;
      return copy;
    });
  };

  // 2. Add a criterion (via typed text, suggestion chip, or empty default)
  const handleAddCriterion = (milestoneIdx: number, customText?: string) => {
    const targetM = milestones[milestoneIdx];
    if (!targetM) return;

    const draftText = customText || (criterionDrafts[targetM.id] || '').trim();
    const textToAdd =
      draftText ||
      `Criterion ${targetM.criteria.length + 1}: Implement and verify objective requirement.`;

    const newCritId = `crit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setMilestones((prev) => {
      const copy = [...prev];
      const m = { ...copy[milestoneIdx] };
      m.criteria = [...m.criteria, { id: newCritId, description: textToAdd }];
      copy[milestoneIdx] = m;
      return copy;
    });

    if (criterionDrafts[targetM.id]) {
      setCriterionDrafts((prev) => ({ ...prev, [targetM.id]: '' }));
    }
  };

  // 3. Remove a criterion by exact index
  const handleRemoveCriterion = (milestoneIdx: number, critIdx: number) => {
    setMilestones((prev) => {
      const copy = [...prev];
      const targetM = { ...copy[milestoneIdx] };
      if (targetM.criteria.length <= 1) {
        alert('Each milestone must contain at least 1 acceptance criterion. You can edit this criterion instead of deleting it.');
        return prev;
      }
      targetM.criteria = targetM.criteria.filter((_, i) => i !== critIdx);
      copy[milestoneIdx] = targetM;
      return copy;
    });
  };

  // ── Submit Job ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (milestones.length < 1) {
        throw new Error('Please include at least 1 milestone.');
      }

      for (const m of milestones) {
        if (!m.amount || parseFloat(m.amount) <= 0) {
          throw new Error(`Milestone "${m.title}" must have an amount greater than $0.`);
        }
        if (!m.criteria || m.criteria.length === 0) {
          throw new Error(`Milestone "${m.title}" must have at least 1 acceptance criterion.`);
        }
        for (const c of m.criteria) {
          if (!c.description || !c.description.trim()) {
            throw new Error(`A criterion in "${m.title}" cannot be blank.`);
          }
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

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 100)}`);
      }

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 font-sans">
      
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
          Escrow Contract Builder
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] mt-1 font-heading">
          Create Escrow Job
        </h1>
        <p className="text-xs font-mono text-slate-600 dark:text-[#81848b] mt-0.5">
          Select or save contract templates, define verifiable acceptance criteria, and fund via PayPal sandbox.
        </p>
      </div>

      {/* ── TEMPLATES BAR (SINGLE CLEAN ROW) ──────────────────────────────── */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs transition-colors shadow-sm">
        
        {/* Left: Single horizontal row of template pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 text-slate-500 dark:text-[#81848b] text-[11px] font-bold uppercase tracking-wider pr-1">
            <span>⚡</span>
            <span>Templates:</span>
          </div>

          {/* Preset 1: Python Scraper */}
          <button
            type="button"
            onClick={() => applyTaskPreset('python_scraper')}
            className={`px-3 py-1.5 rounded border text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTemplateId === 'python_scraper'
                ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                : 'bg-slate-50 dark:bg-[#141517] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:border-slate-400 dark:hover:border-[#373a6e]'
            }`}
          >
            <span>🐍</span>
            <span>Python Scraper</span>
            <span className="text-[10px] opacity-70">(2 ms • $150)</span>
          </button>

          {/* Preset 2: Single Task */}
          <button
            type="button"
            onClick={() => applyTaskPreset('single_task')}
            className={`px-3 py-1.5 rounded border text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTemplateId === 'single_task'
                ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                : 'bg-slate-50 dark:bg-[#141517] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:border-slate-400 dark:hover:border-[#373a6e]'
            }`}
          >
            <span>⚡</span>
            <span>Single Task</span>
            <span className="text-[10px] opacity-70">(1 ms • $100)</span>
          </button>

          {/* Preset 3: Microservice */}
          <button
            type="button"
            onClick={() => applyTaskPreset('microservice')}
            className={`px-3 py-1.5 rounded border text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTemplateId === 'microservice'
                ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                : 'bg-slate-50 dark:bg-[#141517] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:border-slate-400 dark:hover:border-[#373a6e]'
            }`}
          >
            <span>📦</span>
            <span>Microservice</span>
            <span className="text-[10px] opacity-70">(3 ms • $150)</span>
          </button>

          {/* Custom Saved Templates */}
          {savedTemplates.map((t) => (
            <div
              key={t.id}
              className={`inline-flex items-center rounded border text-xs whitespace-nowrap transition-colors shrink-0 ${
                activeTemplateId === t.id
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                  : 'bg-indigo-50 dark:bg-[#1a1c2e] text-indigo-700 dark:text-[#9fa6fc] border-indigo-200 dark:border-[#373a6e]'
              }`}
            >
              <button
                type="button"
                onClick={() => loadCustomTemplate(t)}
                className="px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer hover:underline"
                title={`Load "${t.name}"`}
              >
                <span>📁</span>
                <span className="max-w-[120px] truncate">{t.name}</span>
                <span className="text-[10px] opacity-75">({t.milestones.length} ms)</span>
              </button>
              <button
                type="button"
                onClick={(e) => deleteSavedTemplate(t.id, e)}
                title="Delete template"
                className="px-2 py-1.5 opacity-60 hover:opacity-100 hover:text-rose-500 cursor-pointer border-l border-current/20"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Right: Save Template Action & Status */}
        <div className="shrink-0 flex items-center gap-2 justify-end">
          {saveSuccessMsg && (
            <span className="text-[11px] text-emerald-600 dark:text-[#4cb782] font-semibold animate-fade-in">
              ✓ {saveSuccessMsg}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] border border-slate-200 dark:border-[#2d2f33] text-slate-800 dark:text-[#ececed] text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>💾</span>
            <span>Save as Template</span>
          </button>
        </div>
      </div>

      {/* ── SAVE TEMPLATE MODAL ────────────────────────────────────────────── */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#212225] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">💾</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#ececed]">
                  Save Configuration as Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-[#ececed] text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] space-y-1 text-[11px] text-slate-600 dark:text-[#81848b]">
              <div><strong className="text-slate-900 dark:text-[#ececed]">Title:</strong> {title}</div>
              <div><strong className="text-slate-900 dark:text-[#ececed]">Budget:</strong> ${totalBudget} USD ({milestones.length} milestones)</div>
              <div><strong className="text-slate-900 dark:text-[#ececed]">Criteria:</strong> {milestones.reduce((acc, m) => acc + m.criteria.length, 0)} total criteria items</div>
            </div>

            <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-700 dark:text-[#ececed] font-medium">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js API Contract, Python Scraper 2-Stage..."
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  autoFocus
                  className="w-full rounded bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1b1e] dark:hover:bg-[#212225] text-slate-700 dark:text-[#81848b] text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!templateNameInput.trim()}
                  className="px-4 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MAIN CONTRACT FORM ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] transition-colors">
        
        {/* Job Title & Scope */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono font-medium text-slate-700 dark:text-[#ececed]">
              Contract Title
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
              Task Description / Prompt
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
                  Escrow Budget &amp; Split Strategy
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-[#1f2038] dark:text-[#9fa6fc] dark:border-[#373a6e]">
                  Auto-Calculator
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] mt-0.5">
                Total budget is automatically kept in balance across {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}.
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
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
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
                Split Strategy ({milestones.length} milestone{milestones.length !== 1 ? 's' : ''})
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleStrategyChange('equal')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors cursor-pointer ${
                    splitStrategy === 'equal'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  ⚖️ Split Equally
                </button>
                <button
                  type="button"
                  onClick={() => handleStrategyChange('front_loaded')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors cursor-pointer ${
                    splitStrategy === 'front_loaded'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  🚀 Front-Loaded
                </button>
                <button
                  type="button"
                  onClick={() => handleStrategyChange('back_loaded')}
                  className={`px-2 py-1.5 rounded text-[11px] font-mono border text-center transition-colors cursor-pointer ${
                    splitStrategy === 'back_loaded'
                      ? 'bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] border-slate-900 dark:border-white font-bold'
                      : 'bg-white dark:bg-[#0e0f10] text-slate-700 dark:text-[#81848b] border-slate-200 dark:border-[#212225] hover:bg-slate-100 dark:hover:bg-[#1a1b1e]'
                  }`}
                >
                  🎯 Back-Loaded
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
                className="text-[11px] px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white font-bold transition-colors cursor-pointer"
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
                (Min: 1 • Max: 6)
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddMilestone}
              disabled={milestones.length >= 6}
              className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
            >
              <span>+ Add Milestone</span>
              <span className="text-[10px] opacity-75">({milestones.length}/6)</span>
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
                  key={m.id}
                  className="p-5 rounded-lg bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] space-y-4 font-mono text-xs transition-colors"
                >
                  {/* Milestone Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-[#212225] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-[#212225] text-slate-800 dark:text-[#ececed] text-xs font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-[#ececed]">
                        Milestone {idx + 1} of {milestones.length}
                      </span>
                      {milestones.length === 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-[#1a1e36] dark:text-[#9fa6fc] border border-indigo-200 dark:border-[#2c3258]">
                          Single Milestone Escrow
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Milestone Amount Input */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-[#81848b] text-[11px]">Payout:</span>
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1 text-xs text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            value={m.amount}
                            onChange={(e) => handleMilestoneAmountChange(idx, e.target.value)}
                            className="w-full rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] pl-6 pr-1.5 py-1 text-xs font-bold text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782]"
                          />
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-slate-600 dark:text-[#81848b]">
                          {percentageOfTotal}%
                        </span>
                      </div>

                      {/* Prominent Remove Milestone Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        disabled={milestones.length <= 1}
                        title={
                          milestones.length <= 1
                            ? 'An escrow job requires at least 1 milestone'
                            : `Remove Milestone ${idx + 1}`
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                          milestones.length <= 1
                            ? 'opacity-30 cursor-not-allowed text-slate-400 border border-transparent'
                            : 'text-rose-600 hover:text-white hover:bg-rose-600 dark:text-[#e5484d] dark:hover:bg-[#e5484d] dark:hover:text-white border border-rose-200 dark:border-[#4c1e22] cursor-pointer'
                        }`}
                      >
                        <span className="text-sm leading-none font-bold">✕</span>
                        <span>Remove Milestone</span>
                      </button>
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

                  {/* ── Criteria Checklist ─────────────────────────────────── */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-[#212225]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-[#ececed] uppercase tracking-wider">
                        Acceptance Criteria ({m.criteria.length})
                      </span>

                      {/* Criteria Quick Suggestions — ALWAYS VISIBLE on all viewports */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Quick add:</span>
                        <button
                          type="button"
                          onClick={() => handleAddCriterion(idx, 'Outputs clean, valid CSV format with header row.')}
                          className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-[#4cb782] transition-colors cursor-pointer"
                        >
                          + CSV Format
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCriterion(idx, 'Handles invalid inputs, network timeouts, and non-200 HTTP codes.')}
                          className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-[#4cb782] transition-colors cursor-pointer"
                        >
                          + Error Handling
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCriterion(idx, 'Automated unit tests passing with >80% code coverage.')}
                          className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#81848b] hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-[#4cb782] transition-colors cursor-pointer"
                        >
                          + Unit Tests
                        </button>
                      </div>
                    </div>

                    {/* Criteria items list — with inline editing and rock-solid delete */}
                    <div className="space-y-2">
                      {m.criteria.map((c, cIdx) => (
                        <div
                          key={c.id || cIdx}
                          className="flex items-center gap-2 p-1.5 sm:p-2 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#9b9da3] text-xs transition-colors"
                        >
                          <span className="text-slate-400 dark:text-[#81848b] font-mono text-[11px] font-bold pl-1 shrink-0 select-none">
                            {cIdx + 1}.
                          </span>

                          {/* Inline editable criterion input */}
                          <input
                            type="text"
                            required
                            value={c.description}
                            onChange={(e) => handleCriterionChange(idx, cIdx, e.target.value)}
                            className="flex-1 bg-transparent text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:underline"
                            placeholder="Type verifiable criterion description..."
                          />

                          {/* Delete criterion button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx, cIdx)}
                            disabled={m.criteria.length <= 1}
                            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 shrink-0 ${
                              m.criteria.length <= 1
                                ? 'opacity-25 cursor-not-allowed text-slate-400'
                                : 'text-rose-600 hover:text-white hover:bg-rose-600 dark:text-[#e5484d] dark:hover:bg-[#e5484d] dark:hover:text-white border border-rose-200 dark:border-[#4c1e22] cursor-pointer'
                            }`}
                            title={
                              m.criteria.length <= 1
                                ? 'Milestone must have at least 1 criterion'
                                : 'Delete this criterion'
                            }
                          >
                            <span className="font-bold leading-none">✕</span>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new custom criterion row */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type new acceptance criterion (or click + Add Criterion to insert a blank one)..."
                        value={criterionDrafts[m.id] || ''}
                        onChange={(e) =>
                          setCriterionDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCriterion(idx);
                          }
                        }}
                        className="flex-1 rounded bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] px-3 py-2 text-xs font-mono text-slate-900 dark:text-[#ececed] focus:outline-none focus:border-indigo-500 dark:focus:border-[#4cb782] placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(idx)}
                        className="px-3.5 py-2 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] hover:bg-slate-800 dark:hover:bg-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-sm shrink-0 flex items-center gap-1"
                      >
                        <span>+</span>
                        <span>Add Criterion</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Milestone button at bottom */}
          {milestones.length < 6 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAddMilestone}
                className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-[#2d2f33] hover:border-slate-500 dark:hover:border-[#4cb782] text-xs font-mono text-slate-600 dark:text-[#81848b] hover:text-slate-900 dark:hover:text-[#ececed] transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white/50 dark:bg-[#0e0f10]/50"
              >
                <span className="font-bold text-sm">+</span>
                <span>Add Another Milestone ({milestones.length + 1} of 6)</span>
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] font-mono text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                <span>Creating Escrow Contract...</span>
              </>
            ) : (
              <span>
                Create Job &amp; Fund Escrow via PayPal Sandbox (${allocatedTotal.toFixed(2)} USD) →
              </span>
            )}
          </button>
          <p className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] text-center mt-2">
            Deterministic Policy: Funds held securely in PayPal escrow until AI Arbiter verifies criteria (score ≥ 90/100).
          </p>
        </div>
      </form>
    </div>
  );
}
