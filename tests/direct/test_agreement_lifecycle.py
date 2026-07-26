"""Test the full agreement lifecycle: create → accept → submit → approve → claim."""

from tests.direct.conftest import to_hex, make_criteria_json, SAMPLE_EVIDENCE_MANIFEST


def test_create_agreement(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    result = contract.create_agreement(
        "",  # open fulfiller
        "Deliverable agreement",
        "Complete the specified deliverable meeting all acceptance criteria",
        1000000,  # accept_by
        2000000,  # deliver_by
        "Submit public evidence URLs",
        make_criteria_json(),
        8000,  # pass_threshold_bps
        1_500_000,  # amount_wei
    )

    assert result == 1
    agreement = contract.get_agreement(1)
    assert agreement["title"] == "Deliverable agreement"
    assert agreement["status"] == 0  # OPEN
    assert agreement["amount_wei"] == 1_500_000
    assert agreement["fulfiller_is_open"] is True
    assert agreement["criteria_count"] == 2
    assert agreement["pass_threshold_bps"] == 8000
    assert agreement["policy_version"] == "consensus-v1"


def test_create_rejects_zero_value(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("EXPECTED: escrow amount must be > 0"):
        contract.create_agreement(
            "", "Title", "Brief description", 1000000, 2000000, "Policy",
            make_criteria_json(), 8000, 0,
        )


def test_create_rejects_invalid_deadlines(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("EXPECTED: deliver_by must be after accept_by"):
        contract.create_agreement(
            "", "Title", "Brief description", 2000000, 1000000, "Policy",
            make_criteria_json(), 8000, 1000,
        )


def test_create_rejects_zero_criteria(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    with direct_vm.expect_revert("EXPECTED: need 1-8 criteria"):
        contract.create_agreement(
            "", "Title", "Brief description", 1000000, 2000000, "Policy", "[]", 8000, 1000,
        )


def test_create_rejects_too_many_criteria(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    criteria = []
    for i in range(9):
        criteria.append({
            "label": f"Criterion {i}",
            "human_rule": "A rule that is long enough",
            "validator_test": "A test that is long enough to pass",
            "failure_boundary": "A boundary that is long enough",
            "weight_bps": 1000 if i < 8 else 2000,
            "is_mandatory": i == 0,
        })

    with direct_vm.expect_revert("EXPECTED: need 1-8 criteria"):
        contract.create_agreement(
            "", "Title", "Brief description", 1000000, 2000000, "Policy",
            make_criteria_json(criteria), 8000, 1000,
        )


def test_create_rejects_bad_weight_sum(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    criteria = [{
        "label": "Only criterion",
        "human_rule": "Must satisfy the requirement",
        "validator_test": "Check evidence for requirement fulfilment",
        "failure_boundary": "Fail if requirement not met",
        "weight_bps": 5000,
        "is_mandatory": True,
    }]

    with direct_vm.expect_revert("EXPECTED: weights must sum to 10000"):
        contract.create_agreement(
            "", "Title", "Brief description", 1000000, 2000000, "Policy",
            make_criteria_json(criteria), 8000, 1000,
        )


def test_accept_agreement(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 1  # ACTIVE
    assert agreement["fulfiller"] == to_hex(direct_bob)


def test_accept_rejects_creator(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    with direct_vm.expect_revert("EXPECTED: creator cannot accept own agreement"):
        contract.accept_agreement(1)


def test_accept_specific_fulfiller(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    bob_hex = to_hex(direct_bob)

    direct_vm.sender = direct_alice
    contract.create_agreement(
        bob_hex, "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)
    agreement = contract.get_agreement(1)
    assert agreement["status"] == 1


def test_submit_evidence(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)
    contract.submit_evidence(
        1, "Completed the deliverable", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc123"
    )

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 2  # SUBMITTED

    submission = contract.get_submission(1)
    assert submission["summary"] == "Completed the deliverable"
    assert submission["content_hash"] == "sha256:abc123"


def test_approve_directly(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)
    contract.submit_evidence(1, "Done", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc")

    direct_vm.sender = direct_alice
    contract.approve_directly(1)

    agreement = contract.get_agreement(1)
    assert agreement["status"] == 4  # APPROVED


def test_cancel_agreement(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    contract.cancel_agreement(1)
    agreement = contract.get_agreement(1)
    assert agreement["status"] == 10  # CANCELLED


def test_terminal_state_rejects_mutations(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )
    contract.cancel_agreement(1)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: agreement is not OPEN"):
        contract.accept_agreement(1)


def test_criteria_view(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    criteria = contract.get_criteria(1)
    assert len(criteria) == 2
    assert criteria[0]["label"] == "Primary deliverable present"
    assert criteria[0]["is_mandatory"] is True
    assert criteria[0]["weight_bps"] == 5000
    assert criteria[1]["label"] == "Secondary requirement met"
    assert criteria[1]["is_mandatory"] is False


def test_agreement_ids_for_address(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)

    alice_ids = contract.get_agreement_ids_for(direct_alice)
    assert 1 in alice_ids["as_creator"]

    bob_ids = contract.get_agreement_ids_for(direct_bob)
    assert 1 in bob_ids["as_fulfiller"]


def test_configurable_threshold(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 6000, 1000,
    )

    agreement = contract.get_agreement(1)
    assert agreement["pass_threshold_bps"] == 6000
