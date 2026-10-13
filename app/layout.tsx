import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ArbiterPay — Spend Control & AI Milestone Escrow',
  description:
    'Freelancers deliver, Claude AI inspects against agreed criteria, a deterministic policy decides, and PayPal confirms every cent. Sandbox only.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-[#08090a]">
      <body className="min-h-screen bg-[#08090a] text-[#ececed] flex flex-col font-sans selection:bg-[#212225] selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-[#212225] bg-[#08090a] py-6 text-xs text-[#81848b] font-mono">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span>ArbiterPay • PayPal Developer & AI Hackathon (2026)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>PayPal Orders v2 & Payouts v1</span>
              <span>•</span>
              <span>Claude 3.5 Sonnet</span>
              <span>•</span>
              <span>Sandbox Only</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
