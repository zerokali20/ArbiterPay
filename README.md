<div align="center">

  # 🏛️ ArbiterPay
  
  ### 🤖 AI-Verified Milestone Escrow on PayPal
  
  <p>
    <b>Eliminating freelance payment disputes through neutral, explainable AI arbitration and automated PayPal escrow.</b>
  </p>

  <!-- Hackathon & Status Badges -->
  <p>
    <img src="https://img.shields.io/badge/Hackathon-PayPal%20%2B%20AI%202026-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDEgMjFoMjJMMTIgMnoiLz48L3N2Zz4=" alt="Hackathon"/>
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=github" alt="Status"/>
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative" alt="License"/>
  </p>

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal"/>
    <img src="https://img.shields.io/badge/Claude%20AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI"/>
    <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/>
  </p>

  <a href="https://arbiterpay.onrender.com"><strong>🌐 Live Demo (Render) »</strong></a> •
  <a href="#demo-video"><strong>🎬 Demo Video »</strong></a>
  <br />
  <a href="#getting-started">🚀 Setup Instructions</a> •
  <a href="#how-it-works">⚙️ How it Works</a> •
  <a href="#tech-stack">🛠️ Tech Stack</a> •
  <a href="#hackathon-awards">🏆 Targeted Awards</a>

</div>

---

## 🌟 The Problem & Our Solution

> *"Freelancers deliver and don't get paid; clients pay and don't get what they ordered."*

Traditional escrow relies on slow, expensive human mediation. **ArbiterPay** introduces an **AI Arbiter** that sits on the critical path of payments. The client funds a job via PayPal, the freelancer submits deliverables, and our AI (Claude) instantly verifies the work against the agreed-upon criteria. 

If it passes, PayPal Payouts releases the funds automatically. If it fails, the AI generates a specific, actionable fix-list. If disputed, it escalates to a human review screen with full AI evidence attached. **Every decision is 100% auditable.**

---

## ✨ Key Features (MVP)

- 💼 **Milestone Job Creation:** Clients define 2-4 milestones with strict acceptance criteria and escrow amounts.
- 💰 **Automated PayPal Funding:** Full job amount is captured into the platform's PayPal sandbox account via Orders v2.
- 📤 **Flexible Submissions:** Freelancers submit via GitHub repo links, file uploads, or text.
- 🤖 **AI Arbiter Verdicts:** Claude API reads the brief and deliverable, returning a structured JSON verdict (Pass, Partial, Fail) with per-criterion reasoning.
- 🔄 **Smart Payouts & Fix-Lists:** Passing auto-triggers PayPal Payouts. Failing loops back to the freelancer with an AI-generated fix list.
- 🛡️ **Human-in-the-Loop Disputes:** Low-confidence or contested milestones route to a human review dashboard with AI evidence attached.
- 📊 **AG Grid Audit Ledger:** A first-class, filterable audit trail of every AI decision, confidence score, and payment webhook event.

---

## ⚙️ How It Works

```mermaid
graph TD
    A[Client Creates Job & Funds via PayPal] --> B[Freelancer Submits Deliverable]
    B --> C{AI Arbiter Checks Criteria}
    C -->|Pass| D[PayPal Payouts Releases Funds]
    C -->|Partial/Fail| E[AI Generates Specific Fix List]
    E --> B
    C -->|Low Confidence / Disputed| F[Human Review Screen]
    F -->|Approved| D
    F -->|Rejected| E
    D --> G[AG Grid Audit Ledger Updates]
