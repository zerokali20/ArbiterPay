import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArbiterPay — AI-Verified Milestone Escrow',
  description:
    'Eliminating freelance payment disputes through neutral, explainable AI arbitration and automated PayPal escrow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
