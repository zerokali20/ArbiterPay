'use client';

import React, { useEffect, useState } from 'react';

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check session storage so welcome splash only appears once per browser session
    const hasSeen = sessionStorage.getItem('arbiterpay-welcome-seen');
    if (!hasSeen) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('arbiterpay-welcome-seen', 'true');
      } catch {}
    }, 450);
  };

  if (!visible) return null;

  const title = 'ArbiterPay';

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#08090a] transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* Skip Button (matches reference design) */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 right-6 px-4 py-1.5 rounded-full text-xs font-mono text-[#81848b] hover:text-white bg-white/5 border border-white/10 hover:border-white/25 transition-all cursor-pointer z-10"
      >
        Skip →
      </button>

      {/* Small uppercase category badge */}
      <p
        className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#3b82f6] font-semibold mb-4 animate-welcome-sub"
        style={{ animationDelay: '100ms' }}
      >
        AI-Verified Milestone Escrow
      </p>

      {/* Main Title Letter-by-Letter Reveal Effect */}
      <h1
        aria-label="ArbiterPay"
        className="font-extrabold text-4xl sm:text-7xl tracking-tight text-white mb-4 flex justify-center overflow-hidden"
      >
        {title.split('').map((char, idx) => (
          <span
            key={idx}
            className="inline-block"
            style={{
              animation: 'welcomeLetterIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              animationDelay: `${150 + idx * 45}ms`,
              transform: 'translateY(110%)',
              opacity: 0,
            }}
          >
            {char}
          </span>
        ))}
      </h1>

      {/* Subtitle tag */}
      <p
        className="font-mono text-xs sm:text-sm text-[#81848b] uppercase tracking-[0.2em] animate-welcome-sub"
        style={{ animationDelay: '650ms' }}
      >
        PayPal Orders v2 • Claude Arbiter • Payouts
      </p>

      {/* Bottom Progress Bar Line (matches reference design) */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-welcome-progress"
          style={{ transformOrigin: 'left' }}
        ></div>
      </div>

      {/* Bottom branding watermark */}
      <span className="absolute bottom-6 right-6 text-[10px] font-mono text-[#81848b]/40 tracking-widest hidden sm:inline-block">
        PAYPAL × AI 2026
      </span>
    </div>
  );
}
