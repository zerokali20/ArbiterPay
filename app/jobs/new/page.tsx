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

      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      alert(`Error creating job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      <div>
        <div className="text-[11px] font-mono text-[#81848b] uppercase tracking-wider">
          Job Setup
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#ececed] mt-1">
          Create Escrow Job
        </h1>
        <p className="text-xs font-mono text-[#81848b] mt-0.5">
          Define verifiable milestones with strict acceptance criteria. Funds sit in PayPal sandbox escrow until Arbiter approvals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-lg bg-[#0e0f10] border border-[#212225]">
        <div className="space-y-1">
          <label className="block text-xs font-mono text-[#81848b]">Job Title</label>
          <input
            type="text"
            required
            className="w-full rounded bg-[#141517] border border-[#212225] px-3 py-2 text-xs font-mono text-[#ececed] focus:outline-none focus:border-[#4cb782]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-mono text-[#81848b]">Brief / Scope Description</label>
          <textarea
            required
            rows={3}
            className="w-full rounded bg-[#141517] border border-[#212225] px-3 py-2 text-xs font-mono text-[#ececed] focus:outline-none focus:border-[#4cb782]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono text-[#81848b]">Client Email (Sandbox Payer)</label>
            <input
              type="email"
              required
              className="w-full rounded bg-[#141517] border border-[#212225] px-3 py-2 text-xs font-mono text-[#ececed] focus:outline-none focus:border-[#4cb782]"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono text-[#81848b]">Freelancer PayPal Email (Receiver)</label>
            <input
              type="email"
              required
              className="w-full rounded bg-[#141517] border border-[#212225] px-3 py-2 text-xs font-mono text-[#ececed] focus:outline-none focus:border-[#4cb782]"
              value={freelancerEmail}
              onChange={(e) => setFreelancerEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-[#212225] pt-6 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="font-semibold text-[#ececed]">Milestones ({milestones.length})</span>
            <span className="text-[#4cb782] font-bold">Total: ${totalAmount} USD</span>
          </div>

          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-4 rounded bg-[#141517] border border-[#212225] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#81848b]">0{idx + 1}</span>
                  <span className="text-[#ececed] font-bold">${m.amount} USD</span>
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
                  className="w-full rounded bg-[#0e0f10] border border-[#212225] px-3 py-1.5 text-xs text-[#ececed]"
                />
                <div className="space-y-1">
                  <span className="text-[10px] text-[#81848b] uppercase">Criteria:</span>
                  <ul className="space-y-0.5 text-[#9b9da3] text-[11px]">
                    {m.criteria.map((c, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-[#81848b]">•</span>
                        <span>{c.description}</span>
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
          className="w-full py-2.5 rounded bg-[#ececed] text-[#08090a] font-mono text-xs font-bold hover:bg-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating Job...' : `Create Job & Fund via PayPal Sandbox ($${totalAmount})`}
        </button>
      </form>
    </div>
  );
}
