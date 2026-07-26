# Example Use Cases

The Consensus Agreement Primitive supports any scenario where two parties need a machine-verifiable commitment. Below are examples showing how the same contract handles different domains.

## Freelance delivery (Consensus Freelance)

A client commissions a website. The creator defines criteria like "page is publicly accessible", "required sections present", and "responsive on mobile". The fulfiller builds and deploys the site, then submits the live URL as evidence. GenLayer validators fetch the page, evaluate each criterion, and reach consensus on whether the work meets the agreement.

**Template:** Website delivery, Written content, Design asset

## Research bounty

A DAO posts a bounty for a research report. Criteria: "compares three GenLayer applications", "cites five accessible sources", "includes clear conclusion", "delivered before deadline". A researcher submits a public document URL. Validators read the document and evaluate it against each criterion. The threshold might be set lower (e.g., 75%) to allow partial credit.

**Proven:** See `tests/direct/test_reuse_research_bounty.py`

## DAO milestone verification

A contributor proposes a project with defined milestones. Each milestone becomes a separate agreement with criteria describing the expected deliverable. When the contributor submits evidence of completion, validators verify it matches the milestone description. The DAO treasury funds the escrow.

## Creator agreement

A brand commissions content from a creator. Criteria specify topic, format, length, and publication requirements. The creator publishes the content and submits the URL. Validators verify the published content meets each criterion.

## AI agent task

An autonomous agent is assigned a task with verifiable completion criteria. When the agent completes the task, it submits evidence URLs. Other validators verify the work independently, providing a trustless verification layer for agent-to-agent or human-to-agent agreements.

## How templates map to the primitive

All templates produce the same `create_agreement` call with the same arguments. A template is a frontend convenience that prefills:

- `evidencePolicy` — what kinds of evidence are expected
- `criteria[]` — label, validator test, failure boundary, weight, mandatory flag
- `passThresholdBps` — the score threshold for SATISFIED

The contract does not know or care which template was used. It evaluates the criteria it receives.
