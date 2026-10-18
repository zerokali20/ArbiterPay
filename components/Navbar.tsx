'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Create Job', href: '/jobs/new' },
    { label: 'Live Demo', href: '/jobs/sample-demo-job' },
    { label: 'Human Review', href: '/review' },
    { label: 'Audit Ledger', href: '/ledger' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-[#212225] bg-white/90 dark:bg-[#08090a]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-heading text-base font-bold tracking-tight text-slate-900 dark:text-[#ececed]">
              ArbiterPay
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1b1e] border border-slate-200 dark:border-[#2d2f33] text-slate-600 dark:text-[#81848b]">
              sandbox
            </span>
          </Link>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-mono transition-colors rounded ${
                    active
                      ? 'bg-slate-100 dark:bg-[#1a1b1e] text-slate-900 dark:text-[#ececed] font-medium'
                      : 'text-slate-600 dark:text-[#81848b] hover:text-slate-900 dark:hover:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#141517]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Indicator & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded bg-slate-100 dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-slate-700 dark:text-[#81848b] hover:text-slate-900 dark:hover:text-[#ececed]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-slate-100 dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-xs font-mono text-slate-700 dark:text-[#81848b] hover:text-slate-900 dark:hover:text-[#ececed] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                {/* Sun icon for switching to light mode */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-400"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
                <span className="hidden sm:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                {/* Moon icon for switching to dark mode */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-600"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
                <span className="hidden sm:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 dark:bg-[#0e0f10] border border-slate-200 dark:border-[#212225] text-[11px] font-mono text-slate-600 dark:text-[#81848b]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4cb782]"></span>
            <span>Policy: Enforced</span>
          </div>

          <Link
            href="/jobs/new"
            className="px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-[#ececed] dark:text-[#08090a] text-xs font-mono font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors"
          >
            Fund Escrow
          </Link>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#212225] bg-white dark:bg-[#08090a] px-4 py-3 space-y-1 transition-colors">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-mono rounded transition-colors ${
                  active
                    ? 'bg-slate-100 dark:bg-[#1a1b1e] text-slate-900 dark:text-[#ececed] font-medium'
                    : 'text-slate-600 dark:text-[#81848b] hover:text-slate-900 dark:hover:text-[#ececed] hover:bg-slate-50 dark:hover:bg-[#141517]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
