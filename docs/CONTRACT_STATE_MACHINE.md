# Contract State Machine

```
OPEN ─────────────────────────────────────── CANCELLED (terminal)
  │                                              │
  │ accept_agreement()                      claim_creator_refund()
  │                                              │
  ▼                                              ▼
ACTIVE ────────────────────────────────── EXPIRED (terminal → REFUNDED)
  │
  │ submit_evidence()
  │
  ▼
SUBMITTED
  │         │
  │         │ request_adjudication()
  │         │
  │         ▼
  │    ADJUDICATING
  │         │
  │         ├── SATISFIED ── claim_fulfiller_payout() ── PAID (terminal)
  │         ├── NOT_SATISFIED ── claim_creator_refund() ── REFUNDED (terminal)
  │         └── INCONCLUSIVE ── claim_creator_refund() ── REFUNDED (terminal)
  │
  │ approve_directly()
  │
  ▼
APPROVED ── claim_fulfiller_payout() ── PAID (terminal)
```

## Status codes

| Code | Name | Description |
|------|------|-------------|
| 0 | OPEN | Funded, waiting for fulfiller |
| 1 | ACTIVE | Fulfiller accepted |
| 2 | SUBMITTED | Evidence submitted |
| 3 | ADJUDICATING | Consensus in progress |
| 4 | APPROVED | Creator manually approved |
| 5 | SATISFIED | Consensus says criteria met |
| 6 | NOT_SATISFIED | Consensus says criteria not met |
| 7 | INCONCLUSIVE | Evidence insufficient |
| 8 | PAID | Fulfiller received escrow (terminal) |
| 9 | REFUNDED | Creator received escrow (terminal) |
| 10 | CANCELLED | Cancelled before acceptance (terminal) |
| 11 | EXPIRED | Deadline elapsed (terminal) |
