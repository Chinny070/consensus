"""Integration test: full lifecycle on StudioNet."""

import pytest
import json

pytestmark = pytest.mark.integration


SAMPLE_CRITERIA = json.dumps([
    {
        "label": "Primary deliverable present",
        "human_rule": "The submitted evidence must demonstrate the primary deliverable",
        "validator_test": "Check the submitted evidence for the primary deliverable",
        "failure_boundary": "Fail if the primary deliverable is not found",
        "weight_bps": 5000,
        "is_mandatory": True,
    },
    {
        "label": "Secondary requirement met",
        "human_rule": "The submission must satisfy the secondary requirement",
        "validator_test": "Verify the secondary requirement is fulfilled",
        "failure_boundary": "Fail if the secondary requirement is not evidenced",
        "weight_bps": 5000,
        "is_mandatory": False,
    },
])

SAMPLE_EVIDENCE = json.dumps([
    {"url": "https://example.com/deliverable", "label": "Primary evidence", "criteria_indexes": [0, 1]}
])


def test_full_lifecycle(gl_deploy, gl_account_alice, gl_account_bob, gl_client):
    contract_address = gl_deploy("contracts/consensus.py")

    agreement_id = gl_client.write_contract(
        contract_address,
        "create_agreement",
        ["", "Test Agreement", "Complete the deliverable", 1000000, 2000000, "Submit URL", SAMPLE_CRITERIA, 8000],
        value=1000,
        sender=gl_account_alice,
    )

    agreement = gl_client.read_contract(contract_address, "get_agreement", [1])
    assert agreement["status"] == 0  # OPEN

    gl_client.write_contract(
        contract_address,
        "accept_agreement",
        [1],
        sender=gl_account_bob,
    )

    agreement = gl_client.read_contract(contract_address, "get_agreement", [1])
    assert agreement["status"] == 1  # ACTIVE

    gl_client.write_contract(
        contract_address,
        "submit_evidence",
        [1, "Completed the deliverable", SAMPLE_EVIDENCE, "sha256:test123"],
        sender=gl_account_bob,
    )

    agreement = gl_client.read_contract(contract_address, "get_agreement", [1])
    assert agreement["status"] == 2  # SUBMITTED


def test_manual_approval_path(gl_deploy, gl_account_alice, gl_account_bob, gl_client):
    contract_address = gl_deploy("contracts/consensus.py")

    gl_client.write_contract(
        contract_address,
        "create_agreement",
        ["", "Test Agreement", "Complete the deliverable", 1000000, 2000000, "Submit URL", SAMPLE_CRITERIA, 8000],
        value=500,
        sender=gl_account_alice,
    )

    gl_client.write_contract(
        contract_address, "accept_agreement", [1], sender=gl_account_bob,
    )

    gl_client.write_contract(
        contract_address,
        "submit_evidence",
        [1, "Done", SAMPLE_EVIDENCE, "sha256:test"],
        sender=gl_account_bob,
    )

    gl_client.write_contract(
        contract_address, "approve_directly", [1], sender=gl_account_alice,
    )

    agreement = gl_client.read_contract(contract_address, "get_agreement", [1])
    assert agreement["status"] == 4  # APPROVED
