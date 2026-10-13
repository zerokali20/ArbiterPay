import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center font-mono space-y-4">
      <div className="text-sm text-[#81848b]">404_NOT_FOUND</div>
      <h1 className="text-xl font-bold text-[#ececed]">Page does not exist</h1>
      <p className="text-xs text-[#81848b]">
        The requested resource was not found on ArbiterPay.
      </p>
      <div className="pt-4">
        <Link
          href="/"
          className="px-3 py-1.5 rounded bg-[#141517] text-[#ececed] border border-[#212225] text-xs hover:bg-[#1a1b1e]"
        >
          Return to Overview →
        </Link>
      </div>
    </div>
  );
}
