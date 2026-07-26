"""Prove the Consensus primitive is reusable beyond freelance delivery.

This test creates a research bounty agreement:
"Pay the fulfiller if they submit a report comparing three GenLayer applications,
cite at least five accessible sources, include a clear conclusion, and deliver
before the deadline."

It uses the same contract methods, storage structure, evidence manifest format,
and adjudication policy as every other agreement type.
"""

import json

from tests.direct.conftest import to_hex


RESEARCH_CRITERIA = [
    {
        "label": "Compares three GenLayer applications",
        "human_rule": "The report must compare at least three distinct GenLayer applications or use cases",
        "validator_test": "Read the submitted report and verify it identifies and compares at least three separate GenLayer applications with substantive analysis of each",
        "failure_boundary": "Fail if fewer than three GenLayer applications are discussed or if the comparison is superficial",
        "weight_bps": 3000,
        "is_mandatory": True,
    },
    {
        "label": "Cites five accessible sources",
        "human_rule": "The report must cite at least five sources that are publicly accessible",
        "validator_test": "Check the evidence for at least five distinct citations or references to publicly accessible URLs, documents, or publications",
        "failure_boundary": "Fail if fewer than five sources are cited or if cited sources are not publicly accessible",
        "weight_bps": 2500,
        "is_mandatory": True,
    },
    {
        "label": "Includes clear conclusion",
        "human_rule": "The report must end with a clear, substantive conclusion summarising the findings",
        "validator_test": "Verify the report contains a clearly labelled conclusion section with a summary of findings and a recommendation or assessment",
        "failure_boundary": "Fail if no conclusion section exists or if it is vague and does not summarise the comparison",
        "weight_bps": 2500,
        "is_mandatory": True,
    },
    {
        "label": "Delivered before deadline",
        "human_rule": "The submission must be made before the agreement delivery deadline",
        "validator_test": "Verify the submission timestamp is before the delivery deadline recorded in the agreement",
        "failure_boundary": "Fail if the submission was made after the delivery deadline",
        "weight_bps": 2000,
        "is_mandatory": False,
    },
]

RESEARCH_EVIDENCE_MANIFEST = json.dumps([
    {
        "url": "https://example.com/genlayer-research-report.pdf",
        "label": "Research report PDF",
        "criteria_indexes": [0, 1, 2],
    },
    {
        "url": "https://example.com/genlayer-sources.md",
        "label": "Source bibliography",
        "criteria_indexes": [1],
    },
])


def test_research_bounty_full_lifecycle(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Create, accept, submit, and approve a research bounty using the same primitive."""
    contract = direct_deploy("contracts/consensus.py")

    direct_vm.sender = direct_alice

    agreement_id = contract.create_agreement(
        "",
        "GenLayer Application Comparison Report",
        "Research and write a report comparing at least three GenLayer applications. "
        "Cite at least five publicly accessible sources. Include a clear conclusion "
        "summarising which applications best demonstrate GenLayer capabilities.",
        1000000,
        2000000,
        "Submit one or more public HTTPS URLs where the report can be read. "
        "A PDF or Markdown document is acceptable.",
        json.dumps(RESEARCH_CRITERIA),
        7500,
        3_000_000,
    )

    assert agreement_id == 1

    agreement = contract.get_agreement(1)
    assert agreement["title"] == "GenLayer Application Comparison Report"
    assert agreement["criteria_count"] == 4
    assert agreement["pass_threshold_bps"] == 7500
    assert agreement["policy_version"] == "consensus-v1"

    criteria = contract.get_criteria(1)
    assert len(criteria) == 4
    assert criteria[0]["label"] == "Compares three GenLayer applications"
    assert criteria[0]["is_mandatory"] is True
    assert criteria[1]["label"] == "Cites five accessible sources"
    assert criteria[2]["label"] == "Includes clear conclusion"
    assert criteria[3]["label"] == "Delivered before deadline"
    assert criteria[3]["is_mandatory"] is False
    assert sum(c["weight_bps"] for c in criteria) == 10000

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 1
    assert agreement["fulfiller"] == to_hex(direct_bob)

    contract.submit_evidence(
        1,
        "Completed research report comparing Football Bets, Consensus, and "
        "Prediction Markets on GenLayer. 7 sources cited. Conclusion recommends "
        "Consensus pattern for agreement-style use cases.",
        RESEARCH_EVIDENCE_MANIFEST,
        "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    )

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 2

    submission = contract.get_submission(1)
    assert "research report" in submission["summary"].lower()
    manifest = json.loads(submission["evidence_manifest"])
    assert len(manifest) == 2
    assert manifest[0]["url"].endswith(".pdf")

    direct_vm.sender = direct_alice
    contract.approve_directly(1)

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 4

    claimable = contract.get_claimable(1, direct_bob)
    assert claimable["can_claim"] is True
    assert claimable["role"] == "fulfiller"
    assert claimable["amount"] == 3_000_000


def test_research_bounty_uses_custom_threshold(direct_vm, direct_deploy, direct_alice):
    """The research bounty uses a 75% threshold instead of the default 80%."""
    contract = direct_deploy("contracts/consensus.py")

    direct_vm.sender = direct_alice

    contract.create_agreement(
        "",
        "Focused GenLayer Review",
        "Write a focused review of GenLayer intelligent contracts.",
        1000000,
        2000000,
        "Submit a public URL to the review.",
        json.dumps(RESEARCH_CRITERIA),
        7500,
        1_000_000,
    )

    agreement = contract.get_agreement(1)
    assert agreement["pass_threshold_bps"] == 7500

    config = contract.get_protocol_config()
    assert config["default_pass_threshold_bps"] == 8000
    assert agreement["pass_threshold_bps"] != config["default_pass_threshold_bps"]
