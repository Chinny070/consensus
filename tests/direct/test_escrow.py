"""Test escrow value recording and claim logic."""

from tests.direct.conftest import make_criteria_json, SAMPLE_EVIDENCE_MANIFEST


def test_correct_amount_recorded(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice

    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 5_000_000,
    )

    agreement = contract.get_agreement(1)
    assert agreement["amount_wei"] == 5_000_000


def test_cancel_makes_refund_available(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    contract.cancel_agreement(1)

    claimable = contract.get_claimable(1, direct_alice)
    assert claimable["can_claim"] is True
    assert claimable["role"] == "creator"
    assert claimable["amount"] == 1000


def test_approval_makes_fulfiller_claimable(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 2000,
    )

    direct_vm.sender = direct_bob
    contract.accept_agreement(1)
    contract.submit_evidence(1, "Done", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc")

    direct_vm.sender = direct_alice
    contract.approve_directly(1)

    claimable = contract.get_claimable(1, direct_bob)
    assert claimable["can_claim"] is True
    assert claimable["role"] == "fulfiller"
    assert claimable["amount"] == 2000


def test_wrong_claimant_rejected(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    contract.cancel_agreement(1)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only creator can claim refund"):
        contract.claim_creator_refund(1)


def test_no_double_claim(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )
    contract.cancel_agreement(1)
    contract.claim_creator_refund(1)

    with direct_vm.expect_revert("EXPECTED: refund already claimed"):
        contract.claim_creator_refund(1)
