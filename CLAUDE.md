# Consensus — The AI Agreement Protocol

## Architecture

- **contracts/consensus.py** — Single Intelligent Contract with escrow, lifecycle, and adjudication
- **frontend/** — Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, GenLayerJS 1.1.8
- **No backend, no database** — on-chain contract state is authoritative

## Commands

```bash
# Contract linting
genvm-lint check contracts/consensus.py --json

# Direct tests (fast, mocked)
pytest tests/direct/ -v

# Integration tests (requires Studio)
gltest tests/integration/ -v -s

# Deploy to StudioNet
genlayer network set studionet
genlayer deploy contracts/consensus.py

# Schema export
genlayer schema <ADDRESS>

# Frontend
cd frontend && npm install && npm run dev
```

## Contract Patterns

- Contracts use `import genlayer as gl` and `from genlayer.types import *`
- Class extends `gl.contract.Contract`
- `@gl.public.view` for reads, `@gl.public.write` for writes, `@gl.public.write.payable` for payable
- Storage: `TreeMap[K, V]`, `DynArray[T]`, `@allow_storage` dataclasses
- Errors: `raise gl.vm.UserError("message")`
- Non-det: `gl.vm.run_nondet(leader_fn, validator_fn)`, `gl.nondet.exec_prompt()`, `gl.nondet.web.render()`
- Value: `gl.message.value`, `gl.chain.Account(addr).emit_transfer(amount, on='finalized')`
- Sender: `gl.message.sender_address`

## Contract terminology

- **creator** — the party who creates and funds the agreement
- **fulfiller** — the party who accepts and delivers
- Methods: `create_agreement`, `accept_agreement`, `submit_evidence`, `approve_directly`, `request_adjudication`, `claim_fulfiller_payout`, `claim_creator_refund`, `expire_agreement`, `cancel_agreement`
- Views: `get_agreement`, `get_criteria`, `get_submission`, `get_verdict`, `get_status`, `get_agreement_ids_for`, `get_claimable`, `get_protocol_config`

## GenLayerJS Frontend

```typescript
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const client = createClient({ chain: studionet, account: address });
client.readContract({ address, functionName, args });
client.writeContract({ address, functionName, args, value });
client.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED, retries: 24, interval: 5000 });
```

## Design System

Bio-Industrial Signal — warm bone canvas, aubergine ink, chartreuse actions. No generic Web3 aesthetics.
