# ArbiterPay — Agent Instructions

## ROLE

You are the lead engineer on a 3-week hackathon build. Work in this GitHub repo. Follow the phases below in order. Do not start a phase until the previous phase's acceptance checks pass. After each task, commit with a clear message and tell me what you did in 2-3 lines.

## THE HACKATHON

"Build What's Next with PayPal and AI" (Devpost). The project must meaningfully use both PayPal and AI, with PayPal central. Submission needs:

- A working prototype judges can run: a hosted demo URL or complete setup instructions in the repo. Mockups and non-functional demos do not count.
- Public GitHub repo, all source included, open-source license file visible in the About section.
- Text description of features and functionality.
- Tools list: which AI models and services were used and how.
- Demo video under 3 minutes, public on YouTube, showing the real app running, with no copyrighted music or third-party trademarks.
- Compliance with the Official Rules.

Judging: Technological Implementation, Design, Potential Impact, Innovation/Idea, Presentation.

Target prizes: 1st-3rd, Most Impactful, Most Creative, Best Use of PayPal + AI, Best Use of Agentic Commerce, Best Demo Delivery, plus sponsor awards where the use is real and visible: AG Grid (audit ledger), Render (full deploy), APIMatic (SDK or context plugin, mention in write-up), Bryntum (timeline, stretch only). Skip Channel3.

## THE PROJECT: Milestone Escrow

An AI-verified milestone escrow on the PayPal sandbox. A client funds a job, an AI arbiter checks each delivery against the agreed criteria, and the payout is released or blocked with a clear reason. Funds sit in the platform's PayPal sandbox account until the arbiter approves a milestone.

Audience: freelancers and small sellers, especially in markets with weak payment protection. Problem: non-payment and unfair disputes.

### MVP (one complete, polished flow)

1. Client creates a job with 2-4 milestones, each with acceptance criteria and an amount.
2. Client funds the whole job through PayPal sandbox checkout (Orders v2, create and capture).
3. Freelancer submits a deliverable per milestone (GitHub repo link, file upload, or text).
4. AI arbiter checks the deliverable against the criteria and returns pass, partial, or fail with a reason and quoted evidence for each criterion.
5. Pass releases that milestone's payout via PayPal Payouts. Partial or fail returns a specific fix list and the freelancer can resubmit.
6. A disputed milestone goes to a human review screen with the AI's evidence attached; the reviewer can approve the payout. Use PayPal Disputes if the sandbox supports it, otherwise a mocked dispute step clearly labeled as mocked.
7. PayPal Webhooks confirm payment and payout status and update the ledger.
8. Audit ledger (AG Grid) of every AI decision and payment event, with filters and a decision detail view.

### Stretch (only after the core flow is stable, and frozen by end of Week 3 day 4)

Scam/risk check before funding, Bryntum milestone timeline, voice or chat job creation.

### Out of scope

Real money, KYC, multiple currencies, mobile apps.

## TECH STACK

- Next.js (App Router) with a TypeScript API, Postgres (Drizzle ORM, migrations in the repo).
- PayPal: Orders v2, Payouts, Webhooks (verify signatures), Disputes or a mock. Sandbox only.
- AI arbiter: Claude API with tool use and strict JSON output validated by a schema (zod). Model name read from an env var.
- Deliverable fetching: GitHub API (repo tree, README, tests, docs) and file parsing (PDF, docx, text).
- UI: AG Grid for the ledger. Consistent design system across every screen.
- Hosting: Render with a web service, Postgres, and a background worker (for webhook processing and arbiter jobs).
- Tooling: Postman collection for sandbox testing; APIMatic PayPal SDK or context plugin if it helps.

## NON-NEGOTIABLE DESIGN RULES

1. The AI never moves money. It returns a structured verdict. A deterministic policy layer in code decides whether to call Payouts.
2. Every verdict stores: criteria, evidence quoted, per-criterion result, confidence, model used, and prompt version.
3. Low confidence or a high-value milestone routes to human review instead of auto-release. Thresholds live in config.
4. Payouts are idempotent: a milestone can never be paid twice, even on webhook retries or double clicks.
5. Every payment event and AI decision is written to an append-only ledger table.
6. Secrets only in env vars. `.env` is gitignored. Commit a `.env.example`.
7. Describe the product honestly as a demo of escrow logic on PayPal sandbox, not a licensed escrow service.
8. Keep the demo to checkable deliverables (code with tests, documents against a checklist). Do not claim the AI can judge subjective work.

## PHASES (3 weeks, fixed scope)

### Phase 0: Setup (Oct 13-14) ✅
### Phase 1: Foundation proof (Oct 14-19)
### Phase 2: Core escrow flow (Oct 20-26)
### Phase 3: Trust, polish, ship (Oct 27-Nov 2)
### Buffer (Nov 3 onward)

## HOW TO WORK

- At the start of each phase, write a short task list and show it to me. Then execute.
- Keep changes small and committed per task on a feature branch; open a PR or merge to main only when the phase's acceptance checks pass.
- When you need something only I can do (PayPal sandbox accounts, API keys, Render account, YouTube upload), stop and give me exact numbered steps.
- When something is ambiguous, pick the simplest option that keeps the MVP intact, state your choice in one line, and continue. Ask me only if the choice cannot be undone.
- Never expand scope. If a task threatens the schedule, propose the cut and wait for my answer.
- At the end of each phase, give me: what works, what is mocked, what is left, and any risk to the schedule.
