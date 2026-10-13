import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ArbiterPay
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700 border border-blue-200/60">
                Sandbox
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">
              AI Escrow & Arbitration
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/jobs/new"
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors"
          >
            Create Job
          </Link>
          <Link
            href="/jobs/sample-demo-job"
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors"
          >
            Live Demo
          </Link>
          <Link
            href="/ledger"
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Audit Ledger</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block"></span>
          </Link>
          <Link
            href="/review"
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-lg transition-colors"
          >
            Human Review
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/25 transition-all hover:shadow"
          >
            + New Escrow
          </Link>
        </div>
      </div>
    </header>
  );
}
