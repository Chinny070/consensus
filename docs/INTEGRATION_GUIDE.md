# Integration Guide

## Prerequisites

- GenLayer StudioNet access
- GenLayerJS 1.1.8+
- A deployed instance of `contracts/consensus.py`
- MetaMask or compatible wallet

## Reading contract state

```typescript
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const client = createClient({ chain: studionet });

// Read a single agreement
const agreement = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: "get_agreement",
  args: [agreementId],
});

// Read criteria
const criteria = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: "get_criteria",
  args: [agreementId],
});

// Read agreements for an address
const ids = await client.readContract({
  address: CONTRACT_ADDRESS,
  functionName: "get_agreement_ids_for",
  args: [walletAddress],
});
// ids.as_creator: number[], ids.as_fulfiller: number[]
```

## Writing transactions

```typescript
import { TransactionStatus } from "genlayer-js/types";

const client = createClient({ chain: studionet, account: walletAddress });

// Create and fund an agreement
const hash = await client.writeContract({
  address: CONTRACT_ADDRESS,
  functionName: "create_agreement",
  args: [
    title,           // string
    brief,           // string
    fulfillerAddress, // address or "" for open agreements
    criteriaJson,    // JSON string of criteria array
    evidencePolicy,  // string
    passThresholdBps, // number (1-10000)
    acceptByIso,     // ISO datetime string
    deliverByIso,    // ISO datetime string
  ],
  value: escrowAmountWei,
});

// Wait for acceptance
const receipt = await client.waitForTransactionReceipt({
  hash,
  status: TransactionStatus.ACCEPTED,
  retries: 24,
  interval: 5000,
});
```

## Transaction finality

GenLayer transactions progress: PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED.

- **ACCEPTED** — validated by consensus, committed to chain. Safe for reads.
- **FINALIZED** — past finality window, cannot revert. Value transfers execute here.

Always wait for ACCEPTED before reading updated state. For payout claims, the transfer executes on FINALIZED.

## Criteria format

```json
[
  {
    "label": "Page is publicly accessible",
    "human_rule": "The website must be publicly accessible via the submitted URL",
    "validator_test": "Fetch the submitted URL and verify it returns a 200 status with rendered HTML content",
    "failure_boundary": "Fail if the URL is unreachable, returns an error, or requires authentication",
    "weight_bps": 3000,
    "is_mandatory": true
  }
]
```

See [EVIDENCE_FORMAT.md](EVIDENCE_FORMAT.md) for the evidence submission format.

## Network details

| Key | Value |
|-----|-------|
| Chain | GenLayer StudioNet |
| Chain ID | 61999 |
| RPC | `https://studio.genlayer.com/api` |
| Currency | GEN |
| Policy | consensus-v1 |
