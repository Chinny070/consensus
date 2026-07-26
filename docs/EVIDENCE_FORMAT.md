# Evidence Format

## Submission structure

When a fulfiller calls `submit_evidence`, they provide:

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string (max 1000) | Plain-text description of what was delivered |
| `evidence_manifest` | JSON string | Array of evidence entries (see below) |
| `content_hash` | string (max 128) | Optional integrity hash (e.g. `sha256:...`) |

## Evidence manifest

The manifest is a JSON array of evidence entries:

```json
[
  {
    "url": "https://example.com/deliverable",
    "label": "Deployed website",
    "criteria_indexes": [0, 1, 2]
  },
  {
    "url": "https://github.com/org/repo",
    "label": "Source repository",
    "criteria_indexes": [1]
  }
]
```

### Entry fields

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Public HTTPS URL where evidence can be inspected |
| `label` | string | Human-readable label for this evidence item |
| `criteria_indexes` | number[] | Zero-based indexes of criteria this evidence supports |

## Constraints

- Maximum 8 evidence entries per submission
- All URLs must be publicly accessible HTTPS endpoints
- Each URL's content is fetched and truncated to 3000 characters during adjudication
- Only one submission per agreement (no revisions after sealing)

## During adjudication

The contract fetches each URL using `gl.nondet.web.render()` and includes the content in the adjudication prompt. Evidence content is treated as **untrusted data** — any embedded instructions are ignored by the validator prompt.

If a URL is unreachable or returns an error, the corresponding criterion receives `UNKNOWN` status rather than a forced PASS or FAIL.

## Content hash

The optional `content_hash` field allows the fulfiller to record an integrity hash of the deliverable at submission time. This is stored on-chain but not currently used in adjudication — it serves as a timestamp proof that the deliverable existed in a specific state at submission time.
