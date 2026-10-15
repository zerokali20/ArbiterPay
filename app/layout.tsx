import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import WelcomeScreen from '@/components/WelcomeScreen';
import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" className="dark h-full">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200 antialiased">
        <ThemeProvider>
          <WelcomeScreen />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-[#212225] bg-white/50 dark:bg-[#08090a] py-6 text-xs text-slate-500 dark:text-[#81848b] font-mono transition-colors">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
