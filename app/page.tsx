import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero / Header Section styled directly after Bursar */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#141517] border border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-600 dark:text-[#81848b] transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4cb782]"></span>
          <span>Devpost PayPal & AI Hackathon • Sandbox Environment</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-[#ececed] leading-[1.15] transition-colors">
          Freelancers deliver. Claude evaluates. A deterministic policy decides. PayPal confirms every cent.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-[#9b9da3] leading-relaxed transition-colors">
          Eliminating freelance payment disputes without slow human mediation. A client funds a job through PayPal checkout, an AI arbiter checks each delivery against agreed criteria, and funds are automatically released or blocked with quoted evidence.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/jobs/sample-demo-job"
            className="px-4 py-2.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] text-xs font-mono font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Try the 3-step demo →
          </Link>
          <Link
            href="/ledger"
            className="px-4 py-2.5 rounded bg-white text-slate-700 dark:bg-[#141517] dark:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-xs font-mono transition-colors"
          >
            Inspect audit ledger
          </Link>
          <Link
            href="/review"
            className="px-4 py-2.5 rounded bg-white text-slate-700 dark:bg-[#141517] dark:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] border border-slate-200 dark:border-[#212225] text-xs font-mono transition-colors"
          >
            Human review screen
          </Link>
        </div>
      </div>

      {/* Key Invariants / System Metrics - 4 Column Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            Escrow State
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed]">
            $150.00 <span className="text-xs text-slate-500 dark:text-[#81848b] font-normal">USD</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            Held in platform sandbox account via Orders v2 capture.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] space-y-2 transition-colors">
          <div className="text-[11px] font-mono text-slate-500 dark:text-[#81848b] uppercase tracking-wider">
            AI Arbiter Mode
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-[#ececed] flex items-center gap-2">
            <span>Zod Schema</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#1a1b1e] dark:text-[#4cb782] dark:border-[#2d2f33]">
              STRICT
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#81848b]">
            Evaluates criteria, returns quoted evidence & calibrated confidence.
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
            Milestones cannot be paid twice under retries or replay.
          </p>
        </div>
      </div>

      {/* "Try it in three steps" Section */}
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-[#ececed] transition-colors">
            Try it in three steps
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#81848b] font-mono mt-0.5 transition-colors">
            Follow the escrow lifecycle from funding to automated release
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
                Client funds the job escrow
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                The client creates 2–4 milestones with strict criteria and funds the entire job through PayPal sandbox checkout.
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center text-xs font-mono text-blue-600 dark:text-[#ececed] hover:underline"
            >
              Open job creation →
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg bg-white dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] flex flex-col justify-between space-y-4 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#81848b]">
                <span className="font-bold text-slate-900 dark:text-[#ececed]">02</span>
                <span>AI Arbiter</span>
              </div>
              <h3 className="font-heading text-sm font-semibold text-slate-900 dark:text-[#ececed]">
                Submit deliverable & check verdict
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                Freelancer submits code proof. Claude verifies criteria. Pass triggers PayPal Payouts; fail returns an actionable fix-list.
              </p>
            </div>
            <Link
              href="/jobs/sample-demo-job"
              className="inline-flex items-center text-xs font-mono text-blue-600 dark:text-[#ececed] hover:underline"
            >
              Run milestone test scenarios →
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
                Inspect the audit ledger
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#81848b] leading-relaxed">
                Every prompt, quoted evidence snippet, confidence rating, and PayPal batch ID is logged in an append-only ledger.
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
            <span className="text-slate-500 dark:text-[#81848b]">Returns structured verdict only; policy layer evaluates</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">2. Strict payout idempotency</span>
            <span className="text-slate-500 dark:text-[#81848b]">Milestones can never be paid twice under webhook retries</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">3. Safety routing threshold</span>
            <span className="text-slate-500 dark:text-[#81848b]">Confidence &lt; 0.75 or milestone &ge; $500 routes to human review</span>
          </div>
          <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-900 dark:text-[#ececed] font-medium">4. Append-only audit trail</span>
            <span className="text-slate-500 dark:text-[#81848b]">All webhook events and AI evaluations written to AG Grid ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
