export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="mb-6 text-6xl">🏛️</div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900">
          ArbiterPay
        </h1>
        <p className="mb-8 text-xl text-slate-600">
          AI-Verified Milestone Escrow on PayPal
        </p>
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-slate-700">
            Eliminating freelance payment disputes through neutral, explainable
            AI arbitration and automated PayPal escrow.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-800">
              PayPal Sandbox
            </span>
            <span className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-800">
              Claude AI Arbiter
            </span>
            <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
              Milestone Escrow
            </span>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          🚧 Demo prototype — PayPal sandbox only, not a licensed escrow service.
        </p>
      </div>
    </main>
  );
}
