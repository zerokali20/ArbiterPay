import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="max-w-3xl text-center space-y-6">
        <div className="text-6xl">🏛️</div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          ArbiterPay
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Eliminating freelance payment disputes through neutral, explainable AI arbitration and automated PayPal escrow.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 py-2">
          <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-800">
            PayPal Orders v2 & Payouts
          </span>
          <span className="rounded-full bg-purple-100 px-4 py-1.5 text-xs font-semibold text-purple-800">
            Claude AI Arbiter (Zod Validated)
          </span>
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-800">
            Deterministic Idempotent Policy
          </span>
          <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-800">
            Append-Only Audit Ledger
          </span>
        </div>

        {/* Quick Demo Flow CTA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="text-left space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Interactive Prototype Actions:</h3>
            <p className="text-sm text-slate-600">
              Run the full escrow lifecycle: Create a job with verifiable milestones, fund the escrow through PayPal Sandbox checkout, submit deliverable proofs, and let the AI Arbiter evaluate and release payouts automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              💼 Create New Escrow Job
            </Link>
            <Link
              href="/jobs/sample-demo-job"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-bold rounded-xl text-slate-800 bg-white hover:bg-slate-50 shadow-sm"
            >
              ⚡ Explore Demo Escrow Flow
            </Link>
          </div>
        </div>

        {/* Sandbox Notice */}
        <p className="text-xs text-slate-400">
          Built for the Devpost PayPal AI Hackathon (2026). PayPal Sandbox only — not a licensed escrow service.
        </p>
      </div>
    </main>
  );
}
