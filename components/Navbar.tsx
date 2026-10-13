'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Milestones Demo', href: '/jobs/sample-demo-job' },
    { label: 'Create Job', href: '/jobs/new' },
    { label: 'Audit Ledger', href: '/ledger' },
    { label: 'Human Review', href: '/review' },
  ];

  return (
    <header className="border-b border-[#212225] bg-[#08090a] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-mono text-base font-bold tracking-tight text-[#ececed]">
              ArbiterPay
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1a1b1e] border border-[#2d2f33] text-[#81848b]">
              sandbox
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors rounded ${
                    active
                      ? 'bg-[#1a1b1e] text-[#ececed] font-medium'
                      : 'text-[#81848b] hover:text-[#ececed] hover:bg-[#141517]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e0f10] border border-[#212225] text-[11px] font-mono text-[#81848b]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cb782]"></span>
            <span>Policy: Enforced</span>
          </div>
          <Link
            href="/jobs/new"
            className="px-3 py-1.5 rounded bg-[#ececed] text-[#08090a] text-xs font-mono font-semibold hover:bg-white transition-colors"
          >
            Fund Escrow
          </Link>
        </div>
      </div>
    </header>
  );
}
