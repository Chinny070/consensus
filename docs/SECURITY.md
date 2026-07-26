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

### Duplicate payout
Terminal state flags (`fulfiller_claimed`, `creator_claimed`) prevent double claims. State changes occur before value transfer.

### Frontend spoofing
All authoritative values (status, escrow, criteria) are read from the contract on every page load.

### Address mismatch
Every write method checks `gl.message.sender_address` against the expected role.

### Deadline manipulation
Timestamps come from `gl.message.raw['datetime']`, not client-local clocks.

### Oversized inputs
All string fields are bounded by constants enforced in the contract.
