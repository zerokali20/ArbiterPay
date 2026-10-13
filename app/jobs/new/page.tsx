'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Production Microservice & Automated CI Pipeline');
  const [description, setDescription] = useState(
    'Deliver a TypeScript microservice with Docker containerization, comprehensive test coverage, and documentation.'
  );
  const [clientEmail, setClientEmail] = useState('sb-bhnlh53339270@business.example.com');
  const [freelancerEmail, setFreelancerEmail] = useState('sb-okeek53339723@personal.example.com');

  const [milestones, setMilestones] = useState([
    {
      title: 'Milestone 1: Core Service & Authentication',
      description: 'Implement JWT authentication, user registration, and bcrypt password hashing with tests.',
      amount: '50.00',
      criteria: [
        { id: 'crit-1', description: 'POST /auth/register and /auth/login with bcrypt password hashing.' },
        { id: 'crit-2', description: 'JWT middleware protecting routes.' },
        { id: 'crit-3', description: 'Automated test suite with >80% code coverage.' },
      ],
    },
    {
      title: 'Milestone 2: Dockerization & Health Checks',
      description: 'Create multi-stage Dockerfile and healthcheck endpoints.',
      amount: '50.00',
      criteria: [
        { id: 'crit-1', description: 'Multi-stage Dockerfile with non-root security user.' },
        { id: 'crit-2', description: 'GET /health endpoint reporting status, uptime, and memory usage.' },
      ],
    },
    {
      title: 'Milestone 3: CI/CD Pipeline & OpenAPI Spec',
      description: 'GitHub Actions workflow file and OpenAPI/Swagger documentation.',
      amount: '50.00',
      criteria: [
        { id: 'crit-1', description: 'GitHub Actions workflow running lint, typecheck, and test.' },
        { id: 'crit-2', description: 'OpenAPI 3.0 specification file documenting all endpoints.' },
      ],
    },
  ]);

  const totalAmount = milestones
    .reduce((sum, m) => sum + parseFloat(m.amount || '0'), 0)
    .toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          clientEmail,
          freelancerEmail,
          freelancerPayPalEmail: freelancerEmail,
          milestones,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create job');

      alert(`Job created successfully! Total escrow required: $${totalAmount}`);
      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      alert(`Error creating job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            ← Back to Home
          </a>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create Escrow Job with Milestones
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Define verifiable milestones with strict acceptance criteria. Funds are held in PayPal sandbox escrow until Arbiter AI approves each deliverable.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Job Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Job Description</label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Client Email (Sandbox)</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Freelancer PayPal Email (Receiver)</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={freelancerEmail}
                onChange={(e) => setFreelancerEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Milestones ({milestones.length})
              </h3>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Total: ${totalAmount} USD
              </span>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-800">Milestone #{idx + 1}</span>
                    <span className="font-semibold text-slate-900">${m.amount} USD</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].title = e.target.value;
                      setMilestones(updated);
                    }}
                    className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white"
                  />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Criteria ({m.criteria.length})
                    </span>
                    <ul className="mt-1 space-y-1">
                      {m.criteria.map((c, cIdx) => (
                        <li key={cIdx} className="text-xs text-slate-600 flex items-start">
                          <span className="mr-1.5 text-blue-500">•</span>
                          {c.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Creating Job...' : `Create Job & Proceed to PayPal Escrow Funding ($${totalAmount})`}
          </button>
        </form>
      </div>
    </div>
  );
}
