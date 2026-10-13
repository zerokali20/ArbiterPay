import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Background Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[500px] pointer-events-none opacity-40 blur-3xl overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        {/* Welcome Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
            PayPal Developer & AI Hackathon Prototype (2026)
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Where Code Meets Neutrality.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Arbitrated Escrow
            </span>{' '}
            on PayPal.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Eliminating freelance payment disputes. Clients fund verifiable milestones via PayPal Sandbox checkout.
            Our Claude AI Arbiter independently evaluates code and test deliverables, releasing payouts automatically or generating actionable fix-lists.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              🚀 Create Milestone Job
            </Link>
            <Link
              href="/jobs/sample-demo-job"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              ⚡ Interactive Escrow Demo
            </Link>
            <Link
              href="/ledger"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/60 shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              📊 AG Grid Audit Ledger
            </Link>
          </div>
        </div>

        {/* Live System Metric Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-14">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Escrow Status</span>
              <span className="p-1 rounded bg-blue-50 text-blue-600 font-bold">Orders v2</span>
            </div>
            <div className="text-2xl font-black text-slate-900">$150.00 <span className="text-xs font-semibold text-slate-400">USD</span></div>
            <p className="text-xs text-slate-500 mt-1">Platform Sandbox Balance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Arbiter Confidence</span>
              <span className="p-1 rounded bg-purple-50 text-purple-600 font-bold">Claude 3.5</span>
            </div>
            <div className="text-2xl font-black text-slate-900">0.95 <span className="text-xs font-semibold text-emerald-600 font-mono">(Pass)</span></div>
            <p className="text-xs text-slate-500 mt-1">Safety Threshold: ≥ 0.75</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Automated Payouts</span>
              <span className="p-1 rounded bg-emerald-50 text-emerald-600 font-bold">Payouts v1</span>
            </div>
            <div className="text-2xl font-black text-slate-900">100% <span className="text-xs font-semibold text-emerald-600 font-mono">Idempotent</span></div>
            <p className="text-xs text-slate-500 mt-1">Strict Double-Pay Prevention</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Audit Records</span>
              <span className="p-1 rounded bg-amber-50 text-amber-700 font-bold">AG Grid</span>
            </div>
            <div className="text-2xl font-black text-slate-900">Append-Only</div>
            <p className="text-xs text-slate-500 mt-1">Tamper-Proof Audit Trail</p>
          </div>
        </div>

        {/* Dashboard Visualizer - 3 Pillars */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How the Arbitration Engine Works
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, 4-step escrow pipeline that safeguards both the client's money and the freelancer's time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Client Funds Escrow</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client creates a milestone job and deposits funds into the platform escrow via <strong>PayPal Orders v2</strong> checkout.
              </p>
              <div className="text-[11px] font-mono text-blue-600 pt-2 border-t border-slate-200/60">
                POST /v2/checkout/orders
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Deliverable Submitted</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Freelancer provides a GitHub repository link or code deliverable with verifiable test suites and acceptance checklist proofs.
              </p>
              <div className="text-[11px] font-mono text-indigo-600 pt-2 border-t border-slate-200/60">
                GitHub Tree + Test Extraction
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Claude Arbiter Evaluates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI Arbiter checks deliverables against criteria, returning strict JSON verdicts with direct quoted evidence and confidence ratings.
              </p>
              <div className="text-[11px] font-mono text-purple-600 pt-2 border-t border-slate-200/60">
                Strict Zod-Validated JSON
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Policy Triggers Payout</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic policy layer calls <strong>PayPal Payouts</strong> immediately if pass, or sends an actionable fix-list to the freelancer.
              </p>
              <div className="text-[11px] font-mono text-emerald-600 pt-2 border-t border-slate-200/60">
                POST /v1/payments/payouts
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <Link
              href="/jobs/sample-demo-job"
              className="group p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all"
            >
              <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                <span>⚡ Interactive Escrow Demo</span>
                <span>→</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Experience full pass, fail, and ambiguous arbitration scenarios in seconds.
              </p>
            </Link>

            <Link
              href="/ledger"
              className="group p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all"
            >
              <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                <span>📊 AG Grid Audit Ledger</span>
                <span>→</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inspect every system event, confidence score, and PayPal batch ID.
              </p>
            </Link>

            <Link
              href="/review"
              className="group p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all"
            >
              <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                <span>🛡️ Human Review Screen</span>
                <span>→</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inspect flagged edge cases and override with manual PayPal Payout release.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
