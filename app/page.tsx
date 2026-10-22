import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero / Header Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-600 dark:text-[#81848b] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4cb782]"></span>
          <span>Devpost PayPal &amp; AI Hackathon • Sandbox Environment</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-[#ececed] leading-[1.15] transition-colors">
          Client posts a coding task. Freelancer uploads code. AI scores 0–100. Score ≥ 90 releases PayPal payment instantly.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-[#9b9da3] leading-relaxed transition-colors">
          ArbiterPay eliminates freelance payment disputes without slow human mediation. The client funds escrow through PayPal sandbox checkout, the freelancer uploads their code file, Claude evaluates it against objective criteria and returns a numeric 0–100 score — score ≥ 90 automatically triggers PayPal Payouts. No subjective decisions. No grey areas.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/jobs/sample-demo-job"
            className="px-4 py-2.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] text-xs font-mono font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Try the 3-step demo →
          </Link>
          <Link
            href="/review"
            className="px-4 py-2.5 rounded bg-white text-slate-700 dark:bg-[#141517] dark:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-xs font-mono transition-colors"
          >
            Human review screen
          </Link>
          <Link
            href="/ledger"
            className="px-4 py-2.5 rounded bg-white text-slate-700 dark:bg-[#141517] dark:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-xs font-mono transition-colors"
          >
            Inspect audit ledger
          </Link>
        </div>
      </div>

      {/* Key Invariants / System Metrics - 4 Column Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Auto-Payout Threshold
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed]">
            90<span className="text-xs text-slate-500 dark:text-[#81848b] font-normal">/100</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            AI score ≥ 90 triggers automatic PayPal Payouts release.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            AI Arbiter Model
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed] flex items-center gap-2">
            <span>Claude</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#1a1b1e] dark:text-[#4cb782] dark:border-[#2d2f33]">
              STRICT JSON
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            Zod-validated schema with quoted evidence &amp; per-criterion scores.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Policy Layer
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed] flex items-center gap-2">
            <span>Deterministic</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            Rule: AI never moves money. Code triggers PayPal Payouts.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Payout Idempotency
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed]">
            Guaranteed
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            Milestones cannot be paid twice under webhook retries or replay.
          </p>
        </div>
      </div>

      {/* Try it in three steps */}
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] transition-colors">
            Try it in three steps
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#81848b] font-mono mt-0.5 transition-colors">
            Follow the coding-task escrow lifecycle from funding to automated release
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col justify-between space-y-4 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#81848b]">
                <span className="font-bold text-slate-900 dark:text-[#ececed]">01</span>
                <span>Orders v2</span>
              </div>
              <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-[#ececed]">
                Client creates coding contract &amp; funds escrow
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                Define a Python/JS coding task with objective acceptance criteria (e.g. "extract H1 tags to CSV"). Fund the job through PayPal sandbox Orders v2.
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center text-xs font-mono text-blue-600 dark:text-[#ececed] hover:underline"
            >
              Create coding contract →
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col justify-between space-y-4 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#81848b]">
                <span className="font-bold text-slate-900 dark:text-[#ececed]">02</span>
                <span>AI Arbiter · 0–100</span>
              </div>
              <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-[#ececed]">
                Freelancer uploads code → Claude scores it
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                Upload a <span className="font-mono">.py</span> or paste code. Claude evaluates each criterion and returns a 0–100 score with quoted evidence. Score ≥ 90 triggers PayPal Payouts.
              </p>
            </div>
            <Link
              href="/jobs/sample-demo-job"
              className="inline-flex items-center text-xs font-mono text-blue-600 dark:text-[#ececed] hover:underline"
            >
              Run live AI evaluation →
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col justify-between space-y-4 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#81848b]">
                <span className="font-bold text-slate-900 dark:text-[#ececed]">03</span>
                <span>AG Grid</span>
              </div>
              <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-[#ececed]">
                Inspect the immutable audit ledger
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                Every AI verdict, score, quoted evidence snippet, confidence rating, and PayPal batch ID is logged in an append-only AG Grid audit trail.
              </p>
            </div>
            <Link
              href="/ledger"
              className="inline-flex items-center text-xs font-mono text-blue-600 dark:text-[#ececed] hover:underline"
            >
              Open audit ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Non-Negotiable Architecture Rules Table */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-[#ececed]">
            Non-Negotiable System Design Rules
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#81848b]">
            Enforced in code
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#212225] text-xs font-mono">
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">1. The AI never moves money</span>
            <span className="text-slate-500 dark:text-[#81848b]">Returns structured verdict only; policy layer evaluates score and calls Payouts</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">2. Score ≥ 90/100 triggers auto-payout</span>
            <span className="text-slate-500 dark:text-[#81848b]">Deterministic threshold — no ambiguity, no overrides by the AI</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">3. Safety routing threshold</span>
            <span className="text-slate-500 dark:text-[#81848b]">Confidence &lt; 0.60 or milestone ≥ $500 routes to human review</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">4. Strict payout idempotency</span>
            <span className="text-slate-500 dark:text-[#81848b]">Milestones can never be paid twice under webhook retries or replay</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">5. Append-only audit trail</span>
            <span className="text-slate-500 dark:text-[#81848b]">All verdicts, scores, evidence, and PayPal events written to AG Grid ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
