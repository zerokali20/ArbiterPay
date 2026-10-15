import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center font-mono space-y-4">
      <div className="text-sm text-slate-500 dark:text-[#81848b]">404_NOT_FOUND</div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-[#ececed]">Page does not exist</h1>
      <p className="text-xs text-slate-600 dark:text-[#81848b]">
        The requested resource was not found on ArbiterPay.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="px-3 py-1.5 rounded bg-slate-100 dark:bg-[#141517] text-slate-800 dark:text-[#ececed] border border-slate-200 dark:border-[#212225] text-xs hover:bg-slate-200 dark:hover:bg-[#1a1b1e] transition-colors"
        >
          Return to Overview →
        </Link>
      </div>
    </div>
  );
}
