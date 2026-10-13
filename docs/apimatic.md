# APIMatic Context Plugin & Integration Architecture

This document describes how **ArbiterPay** integrates with and leverages **APIMatic** to achieve production-grade PayPal API integration.

## 🎯 Overview

As highlighted in the PayPal AI Hackathon developer sessions, integrating payment APIs into AI agent workflows requires:
1. Complete, authoritative API specifications.
2. Robust error handling, retries, and idempotency guarantees.
3. Strict schema validation to prevent malformed API calls.

**ArbiterPay** utilizes APIMatic's Context Plugin methodology and PayPal REST OpenAPI specifications to ensure high-reliability agentic payments.

---

## 🛠️ How APIMatic is Used in ArbiterPay

1. **API Schema Validation:**
   - All PayPal Orders v2 and Payouts v1 payloads are built using typed interfaces generated from authoritative OpenAPI specs, preventing parameter drift.
   - Endpoint contracts for `POST /v2/checkout/orders` and `POST /v1/payments/payouts` follow strict APIMatic-aligned contracts with idempotency keys (`sender_batch_id`, `sender_item_id`).

2. **Agent Context Plugin:**
   - For agentic execution, APIMatic context files are utilized to ensure AI coding agents produce correct PayPal API calls with built-in retries, OAuth client credential caching, and webhook signature verification logic.

3. **Deterministic Policy Boundary:**
   - The AI Arbiter never moves money directly. Instead, APIMatic-validated API clients in `/lib/paypal` are called exclusively by the deterministic policy layer (`/lib/policy`), strictly after Zod schema validation passes.
