import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ArbiterPay — AI-Verified Milestone Escrow on PayPal',
  description:
    'Eliminating freelance payment disputes through neutral, explainable AI arbitration and automated PayPal escrow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50/70 text-slate-900 antialiased flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-sm py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 ArbiterPay • Built for the PayPal AI Hackathon</span>
            <span className="text-slate-400">PayPal Sandbox Environment • Not a licensed banking service</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
