# Security Model

## Threat mitigations

### Moving goalposts
Criteria are immutable after fulfiller acceptance. No method can edit criteria on an active agreement.

### Prompt injection in evidence
The canonical adjudication prompt includes explicit instructions to treat all evidence as untrusted data and ignore embedded instructions. The prompt warns validators: "Do not claim that any property was verified unless you actually inspected evidence."

### Malformed LLM output
Strict JSON schema validation, alias normalization, range clamping, and deterministic recomputation of aggregate scores.

### Unavailable evidence
Returns INCONCLUSIVE rather than fabricating certainty. Fetches are bounded in count and size.

### Balance-backed escrow
`create_agreement` is `@gl.public.write.payable` and records `gl.message.value` as escrow. The caller must send real tokens with the transaction; no parameter-based amount is accepted.

### Real value transfers
`claim_fulfiller_payout` and `claim_creator_refund` call `gl.chain.Account(addr).emit_transfer(amount, on='finalized')` to move tokens on-chain. State is updated before the transfer (checks-effects-interactions pattern).

### Duplicate payout
Terminal state flags (`fulfiller_claimed`, `creator_claimed`) prevent double claims. State changes occur before value transfer.

### Equivalence-principle evidence fetching
Evidence URLs are fetched inside `gl.vm.run_nondet` in both leader and validator functions using `gl.nondet.web.render()`. This ensures evidence is fetched within a valid equivalence-principle flow and validators independently verify external data.

### Frontend spoofing
All authoritative values (status, escrow, criteria) are read from the contract on every page load.

### Address mismatch
Every write method checks `gl.message.sender_address` against the expected role.

### Deadline enforcement
`expire_agreement` enforces real on-chain deadlines by comparing a caller-provided timestamp against `accept_by` (for OPEN agreements) and `deliver_by` (for ACTIVE agreements). Only agreements past their deadline can be expired. On-chain timestamps from `gl.message.raw['datetime']` are used for creation and submission records.

### Oversized inputs
All string fields are bounded by constants enforced in the contract.
