# Reusability Gap Analysis

Produced: 2026-07-26

Target positioning: "Consensus is a reusable Intelligent Contract primitive for AI-verifiable agreements. Consensus Freelance is its first polished application."

---

## 1. Preserve the current product

| Item | Status | Notes |
|------|--------|-------|
| Create + fund | Already implemented | `create_agreement` payable method |
| Worker accepts | Already implemented | `accept_agreement` method |
| Submit evidence | Already implemented | `submit_delivery` method |
| Client approves directly | Already implemented | `approve_delivery` method |
| Either party requests adjudication | Already implemented | `request_adjudication` method |
| Frozen acceptance criteria | Already implemented | Criteria immutable after creation |
| Claim payout/refund | Already implemented | `claim_worker_payout`, `claim_client_refund` |

**Classification: Already implemented**

---

## 2. Generalise the contract terminology

| Item | Status | Notes |
|------|--------|-------|
| Contract role names | Partially implemented | Storage uses `client`/`worker` — need rename to `creator`/`fulfiller` |
| Method names | Partially implemented | `submit_delivery` → `submit_evidence`; `approve_delivery` → `approve_directly`; `cancel_open_agreement` → `cancel_agreement`; `claim_worker_payout` → `claim_fulfiller_payout`; `claim_client_refund` → `claim_creator_refund` |
| Storage field names | Partially implemented | `Agreement.client` → `creator`; `Agreement.worker` → `fulfiller`; `worker_is_open` → `fulfiller_is_open`; `worker_claimed` → `fulfiller_claimed`; `client_claimed` → `creator_claimed`; `worker_address` param → `fulfiller_address` |
| Index maps | Partially implemented | `client_agreements` → `creator_agreements`; `worker_agreements` → `fulfiller_agreements` |
| Claimable sets | Partially implemented | `WORKER_CLAIMABLE` → `FULFILLER_CLAIMABLE`; `CLIENT_CLAIMABLE` → `CREATOR_CLAIMABLE` |
| View method returns | Partially implemented | `get_claimable` returns `role: "worker"/"client"` → `"fulfiller"/"creator"` |
| View method names | Partially implemented | Keep generic (`get_agreement`, `get_criteria` etc. are already generic) |
| Remove freelance-specific content | Missing | Prompt text says "submitted work" — should say "submitted evidence". Default criteria in tests reference "landing page" and "hero section" — tests are fine (they're examples), but contract prompt must stay generic. |

**Classification: Partially implemented** — contract field/method rename + prompt generalisation needed

---

## 3. Three internal domains

| Domain | Status | Notes |
|--------|--------|-------|
| Agreement domain | Already implemented | Creation, participants, escrow, acceptance, deadlines, cancellation, expiry, lifecycle — all in contract |
| Evidence domain | Already implemented | Submission statement, evidence manifest, content hashes, criterion mappings — all in `Submission` dataclass |
| Adjudication domain | Already implemented | Prompt building, evidence inspection, custom leader/validator, JSON parsing, PASS/FAIL/UNKNOWN, deterministic outcome, verdict storage, payout/refund eligibility |
| Code organisation | Missing | Currently a single flat file. Need to organise into clearly labelled sections with domain headers. |

**Classification: Partially implemented** — need structural comments/section organisation

---

## 4. Configurable policy structure

| Item | Status | Notes |
|------|--------|-------|
| Agreement statement (title + brief) | Already implemented | |
| Acceptance criteria (JSON) | Already implemented | |
| Evidence policy | Already implemented | |
| Decision threshold in bps | Missing | `DEFAULT_PASS_THRESHOLD_BPS` is a global constant. Need per-agreement `pass_threshold_bps` field. |
| Mandatory criteria | Already implemented | `is_mandatory` per criterion |
| Acceptance deadline | Already implemented | `accept_by` |
| Delivery deadline | Already implemented | `deliver_by` |
| Adjudication policy version | Already implemented | `POLICY_VERSION` stored with each verdict |
| Criterion: label, human_rule, validator_test, failure_boundary, weight_bps, mandatory | Already implemented | |
| Weights sum to 10,000 | Already implemented | Enforced in `create_agreement` |
| LLM determines only PASS/FAIL/UNKNOWN | Already implemented | |
| Contract computes outcome deterministically | Already implemented | `_compute_outcome()` |
| Outcome: SATISFIED/NOT_SATISFIED/INCONCLUSIVE | Already implemented | |
| Mandatory FAIL → NOT_SATISFIED | Already implemented | |
| Mandatory UNKNOWN → INCONCLUSIVE | Already implemented | |
| Score vs threshold comparison | Partially implemented | Uses global constant, not per-agreement |

**Classification: Partially implemented** — need per-agreement threshold

---

## 5. Policy version

| Item | Status | Notes |
|------|--------|-------|
| `POLICY_VERSION` constant | Already implemented | `POLICY_VERSION = "consensus-v1"` |
| Stored with every agreement | Missing | Not stored on Agreement dataclass, only on Verdict |
| Stored with every verdict | Already implemented | `Verdict.policy_version` field |

**Classification: Partially implemented** — need `policy_version` field on Agreement

---

## 6. Frontend templates

| Item | Status | Notes |
|------|--------|-------|
| CRITERION_TEMPLATES in forge | Already implemented | 7 templates exist in `forge-schema.ts` |
| Category templates (Website, Written content, Design asset, Custom) | Missing | Need top-level agreement templates that prefill title, brief, criteria, and evidence policy |
| Custom Agreement exposes generic primitive | Missing | Need a "Custom Agreement" template that shows raw fields |
| Templates must not create separate contracts | N/A | Design constraint — will comply |

**Classification: Partially implemented** — need top-level agreement category templates

---

## 7. Protocol/developer page

| Item | Status | Notes |
|------|--------|-------|
| `/protocol` page exists | Already implemented | Shows lifecycle, principles, network info |
| Explains Consensus Freelance as first interface | Missing | Needs reframing text |
| Shows lifecycle method names | Missing | Should show `createAgreement → acceptAgreement → ...` |
| Deployed contract address | Missing | Needs dynamic display from env var |
| Public view methods list | Missing | |
| Public write methods list | Missing | |
| Transaction finality explanation | Missing | |
| Integration example | Missing | |

**Classification: Partially implemented** — page exists but needs developer-facing content

---

## 8. Reusable documentation

| Item | Status | Notes |
|------|--------|-------|
| `docs/AGREEMENT_PRIMITIVE.md` | Missing | New file needed |
| `docs/INTEGRATION_GUIDE.md` | Missing | New file needed |
| `docs/ADJUDICATION_POLICY.md` | Already implemented | Exists with correct content |
| `docs/EVIDENCE_FORMAT.md` | Missing | New file needed |
| `docs/SECURITY.md` | Already implemented | Exists with correct content |
| `docs/EXAMPLE_USE_CASES.md` | Missing | New file needed |

**Classification: Partially implemented** — 2 of 6 docs exist, 4 new needed

---

## 9. Research bounty reuse test

| Item | Status | Notes |
|------|--------|-------|
| Research bounty test fixture | Missing | Need new test that creates a non-freelance agreement |
| Uses same contract methods | N/A | Will use existing contract |
| Proves reuse | Missing | New test file needed |

**Classification: Missing**

---

## 10. Live evidence handling

| Item | Status | Notes |
|------|--------|-------|
| Fetch evidence URLs | Already implemented | `gl.nondet.web.render(url, mode="text")` in adjudication |
| Up to 8 URLs, 3000 chars each | Already implemented | `evidence_urls[:8]`, `[:3000]` |
| HTTPS-only URLs | Already implemented | `url.startswith("https://")` check |
| Untrusted evidence treatment | Already implemented | Prompt includes security instructions |
| Never obey embedded instructions | Already implemented | In prompt text |
| Never introduce new criteria | Already implemented | In prompt text |
| UNKNOWN for unavailable/contradictory | Already implemented | In prompt text |
| Don't claim unchecked properties | Missing | Need explicit prompt instruction not to claim properties that weren't actually checked |

**Classification: Partially implemented** — minor prompt enhancement needed

---

## 11. Transaction correctness

| Item | Status | Notes |
|------|--------|-------|
| All write operations call contract | Already implemented | Every write function in `contract.ts` calls `client.writeContract()` |
| Transaction phases: preparing → awaiting_signature → submitted → pending → accepted → finalized → failed | Already implemented | `use-transaction-lifecycle.ts` |
| Accepted vs Finalized distinction | Already implemented | `waitForReceipt` accepts status parameter |

**Classification: Already implemented**

---

## 12. No duplicate submissions

| Item | Status | Notes |
|------|--------|-------|
| Document primitive is part of Consensus project | Missing | Need statement in README and docs |

**Classification: Missing** — documentation addition only

---

## 13. Implementation process

| Item | Status | Notes |
|------|--------|-------|
| Gap analysis in `docs/REUSABILITY_GAP_ANALYSIS.md` | This document | |
| Smallest safe changes | N/A | Implementation constraint |
| Run linter after contract changes | Blocked | Python not available on this machine; `genvm-lint` requires Python |
| Run tests after contract changes | Blocked | `pytest` requires Python |
| Update schema after deployment | Blocked | Requires deployed contract |

**Classification: Partially blocked** — Python not available for linter/tests

---

## Summary

| Category | Already | Partial | Missing | Blocked |
|----------|---------|---------|---------|---------|
| 1. Preserve product | ✓ | | | |
| 2. Generalise terminology | | ✓ | | |
| 3. Three domains | | ✓ | | |
| 4. Configurable policy | | ✓ | | |
| 5. Policy version | | ✓ | | |
| 6. Frontend templates | | ✓ | | |
| 7. Protocol/developer page | | ✓ | | |
| 8. Documentation | | ✓ | | |
| 9. Research bounty test | | | ✓ | |
| 10. Evidence handling | | ✓ | | |
| 11. Transaction correctness | ✓ | | | |
| 12. No duplicate submissions | | | ✓ | |
| 13. Implementation process | | | | ✓ (Python) |

## Execution plan (smallest safe changes)

1. **Contract: generalise terminology** — rename fields, methods, storage maps, variables
2. **Contract: add per-agreement threshold + policy_version** — two new fields on Agreement
3. **Contract: organise into domain sections** — restructure with clear headers
4. **Contract: enhance adjudication prompt** — remove any freelance-specific language, add "do not claim unchecked properties"
5. **Tests: update to match renamed methods** — mechanical find/replace
6. **Tests: add research bounty reuse test** — new test file
7. **Frontend: update contract adapter** — match renamed methods
8. **Frontend: add agreement category templates** — Website, Written Content, Design Asset, Custom
9. **Frontend: enhance protocol page** — developer-facing content, lifecycle, integration info
10. **Docs: create missing documentation** — 4 new doc files + update existing
11. **Frontend: update UI labels** — keep "Client"/"Worker" in UI, map to creator/fulfiller in adapter
