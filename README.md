# Consensus — The AI Agreement Protocol

**Promises, made provable.**

Consensus is a reusable Intelligent Contract primitive for AI-verifiable agreements on GenLayer. **Consensus Freelance** is the first polished application built on this primitive.

The same contract can power freelance delivery, research bounties, DAO milestones, creator agreements, AI-agent tasks, and any scenario where two parties need a machine-verifiable commitment.

## Why GenLayer

The core transaction requires judgement over language and potentially live web evidence. It cannot be safely reduced to a deterministic boolean. GenLayer provides:

- Python Intelligent Contracts in GenVM
- Native LLM and web-aware reasoning
- Decentralized AI-validator consensus
- Explicit equivalence principles for non-deterministic execution
- On-chain transaction finality

## Architecture

```
Frontend (Next.js) → GenLayerJS → Intelligent Contract (GenVM) → GenLayer Consensus
```

- **No backend. No database.** On-chain contract state is authoritative.
- **Single contract:** `contracts/consensus.py` handles escrow, lifecycle, and adjudication.
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, GenLayerJS 1.1.8.

## Agreement lifecycle

1. **Create & fund** — Creator defines the agreement with criteria, evidence policy, threshold, deadlines, and escrow
2. **Accept** — Fulfiller reviews and accepts the frozen terms
3. **Submit evidence** — Fulfiller provides public URLs mapped to each criterion
4. **Approve or adjudicate** — Creator approves directly, or either party triggers GenLayer consensus
5. **Verdict** — SATISFIED, NOT_SATISFIED, or INCONCLUSIVE, computed deterministically
6. **Claim** — The correct party claims the escrowed value

## Prerequisites

- Node.js 18+
- Python 3.12+
- MetaMask or compatible wallet
- GenLayer CLI: `npm install -g genlayer`
- GenVM linter: `pip install genvm-linter`
- Test runner: `pip install genlayer-test`

## Setup

### 1. Contract lint

```bash
genvm-lint check contracts/consensus.py --json
```

### 2. Direct tests

```bash
pytest tests/direct/ -v
```

### 3. Deploy to StudioNet

```bash
genlayer network set studionet
genlayer deploy contracts/consensus.py
```

### 4. Export schema

```bash
genlayer schema <CONTRACT_ADDRESS>
```

### 5. Frontend setup

```bash
cd frontend
cp .env.example .env
# Edit .env and set NEXT_PUBLIC_CONSENSUS_CONTRACT_ADDRESS=<deployed address>
npm install
npm run dev
```

## Network

| Key | Value |
|---|---|
| Network | GenLayer StudioNet |
| Chain ID | 61999 |
| RPC | `https://studio.genlayer.com/api` |
| Currency | GEN |

## Transaction Finality

GenLayer transactions progress through distinct states:

- **Submitted** — Transaction sent to the network
- **Pending** — Being processed
- **Accepted** — Provisionally accepted (NOT final)
- **Finalized** — Permanently settled

The UI distinguishes all states. Only finalized transactions are permanent.

## Documentation

- [Agreement Primitive](docs/AGREEMENT_PRIMITIVE.md) — What the primitive is and why it is reusable
- [Contract State Machine](docs/CONTRACT_STATE_MACHINE.md) — Status codes and transitions
- [Adjudication Policy](docs/ADJUDICATION_POLICY.md) — How AI consensus works
- [Evidence Format](docs/EVIDENCE_FORMAT.md) — Submission and manifest structure
- [Integration Guide](docs/INTEGRATION_GUIDE.md) — GenLayerJS code examples
- [Example Use Cases](docs/EXAMPLE_USE_CASES.md) — Freelance, bounties, DAO milestones, and more
- [Security Model](docs/SECURITY.md) — Threat mitigations

## Security

- Criteria freeze after fulfiller acceptance — no moving goalposts
- Evidence is treated as untrusted data — prompt injection is guarded
- Pull-based claims prevent reentrancy
- State changes occur before value transfers
- Three outcomes: SATISFIED, NOT_SATISFIED, INCONCLUSIVE — never forced certainty

## Live Deployment

| | |
|---|---|
| **Frontend** | [consensus-chinny070s-projects.vercel.app](https://consensus-4shm1fmn1-chinny070s-projects.vercel.app) |
| **Contract** | `0xCB4e83Eff50F674a8a4156cd7BF47d92503E0fAD` on StudioNet |
| **GitHub** | [github.com/Chinny070/consensus](https://github.com/Chinny070/consensus) |

## Known Limitations

- StudioNet demo only — not production
- Evidence must be publicly accessible HTTPS URLs
- No file uploads — evidence lives externally
- Single submission per agreement in MVP
- Two parties only — no multi-party agreements
- No notifications — poll chain state
