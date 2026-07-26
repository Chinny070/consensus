# The Consensus Agreement Primitive

## Positioning

Consensus is a reusable Intelligent Contract primitive for AI-verifiable agreements on GenLayer. Consensus Freelance is its first polished application.

## What the primitive provides

A single Intelligent Contract (`contracts/consensus.py`) that handles:

1. **Agreement creation** — A creator defines a statement, acceptance criteria (with validator tests and failure boundaries), evidence policy, decision threshold, deadlines, and escrow amount.
2. **Two-party commitment** — A fulfiller reviews and accepts the frozen terms.
3. **Evidence submission** — The fulfiller submits public URLs mapped to criteria.
4. **AI adjudication** — GenLayer validators independently evaluate evidence against each criterion and reach consensus on the outcome.
5. **Deterministic resolution** — The contract computes SATISFIED, NOT_SATISFIED, or INCONCLUSIVE from per-criterion PASS/FAIL/UNKNOWN results using a configurable threshold.
6. **Escrow settlement** — The correct party claims the locked value.

## Why it is reusable

The contract uses **generic terminology** (creator/fulfiller, not client/worker) and **no domain-specific logic**. The acceptance criteria are free-form text evaluated by AI validators — they can describe any verifiable condition:

- "The website has a working contact form" (freelance)
- "The research report compares three GenLayer applications" (bounty)
- "The milestone deliverable matches the DAO proposal" (governance)
- "The AI agent completed the assigned task correctly" (automation)

Templates are a **frontend convenience** that prefill the same generic `create_agreement` call. They do not create separate contracts or specialised on-chain logic.

## Configurable per agreement

| Field | Purpose | Default |
|-------|---------|---------|
| `pass_threshold_bps` | Weighted score threshold for SATISFIED (1–10000) | 8000 (80%) |
| `policy_version` | Adjudication policy applied | `"consensus-v1"` |

## Domain organisation

The contract is internally organised into three domains:

1. **Agreement domain** — Creation, acceptance, cancellation, expiration
2. **Evidence domain** — Submission and direct approval
3. **Adjudication domain** — Consensus triggering, verdict parsing, outcome computation, claims

## What it is not

- Not a marketplace or matching service
- Not a multi-party voting system
- Not a token or DAO framework
- Not a dispute resolution service with human arbitrators

The primitive handles exactly one pattern: two parties, one verifiable commitment, AI-judged outcome, escrow settlement.
