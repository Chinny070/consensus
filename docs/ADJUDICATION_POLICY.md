# Adjudication Policy — consensus-v1

## Overview

When either party triggers adjudication, the contract:

1. Builds a canonical prompt from the frozen agreement + criteria + submission
2. Fetches evidence from submitted URLs (up to 8, max 3000 chars each)
3. Sends the prompt to GenLayer's LLM via `gl.nondet.exec_prompt()`
4. Parses the structured JSON response
5. Deterministically computes the final outcome

## Criterion evaluation

Each criterion receives one of:
- **PASS** — evidence satisfies the validator test
- **FAIL** — evidence fails the failure boundary
- **UNKNOWN** — evidence is insufficient, inaccessible, or ambiguous

## Outcome computation (deterministic)

1. If any **mandatory** criterion is **FAIL** → `NOT_SATISFIED`
2. If any **mandatory** criterion is **UNKNOWN** → `INCONCLUSIVE`
3. Compute weighted score from PASS criteria
4. If score ≥ agreement's `pass_threshold_bps` (default 8000 bps / 80%) → `SATISFIED`
5. Otherwise → `NOT_SATISFIED`

The threshold is configurable per agreement via `pass_threshold_bps` (1–10000) set at creation time.

## Equivalence

Uses `gl.vm.run_nondet()` with custom leader/validator functions.

**Leader:** calls LLM, returns JSON result.

**Validator:** independently calls LLM, then compares:
- All mandatory criterion statuses must match
- Computed outcome and reason code must match
- Explanation wording differences are tolerated

## Evidence safety

- All evidence is treated as untrusted data
- Embedded instructions in evidence are ignored
- The prompt explicitly warns: "Do not claim that any property was verified unless you actually inspected evidence"
- Fetches are bounded (8 URLs, 3000 chars each)
- Inaccessible evidence → UNKNOWN, not forced decision

## Error classification

- `EXPECTED:` — contract-state issue (wrong status, missing fields)
- `EXTERNAL:` — evidence source unavailable
- `TRANSIENT:` — retryable network issue
- `LLM_ERROR:` — malformed model response
- `UNSAFE:` — injection or prohibited behaviour
- `MALFORMED:` — invalid stored structure

## Policy versioning

Each agreement stores a `policy_version` (currently `"consensus-v1"`). Each verdict also records the policy version used. This ensures future policy changes do not retroactively affect existing agreements.
