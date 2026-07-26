"""Test access control: every write method with creator, fulfiller, and third party."""

from tests.direct.conftest import to_hex, make_criteria_json, SAMPLE_EVIDENCE_MANIFEST


def _create_and_accept(contract, direct_vm, creator, fulfiller):
    direct_vm.sender = creator
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )
    direct_vm.sender = fulfiller
    contract.accept_agreement(1)


def _submit(contract, direct_vm, fulfiller):
    direct_vm.sender = fulfiller
    contract.submit_evidence(1, "Done", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc")


def test_cancel_rejects_non_creator(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    direct_vm.sender = direct_alice
    contract.create_agreement(
        "", "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only creator can cancel"):
        contract.cancel_agreement(1)


def test_submit_rejects_creator(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    _create_and_accept(contract, direct_vm, direct_alice, direct_bob)

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("EXPECTED: only fulfiller can submit"):
        contract.submit_evidence(1, "Done", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc")


def test_submit_rejects_third_party(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/consensus.py")
    _create_and_accept(contract, direct_vm, direct_alice, direct_bob)

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("EXPECTED: only fulfiller can submit"):
        contract.submit_evidence(1, "Done", SAMPLE_EVIDENCE_MANIFEST, "sha256:abc")


def test_approve_rejects_fulfiller(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/consensus.py")
    _create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    _submit(contract, direct_vm, direct_bob)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("EXPECTED: only creator can approve"):
        contract.approve_directly(1)


def test_approve_rejects_third_party(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/consensus.py")
    _create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    _submit(contract, direct_vm, direct_bob)

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("EXPECTED: only creator can approve"):
        contract.approve_directly(1)


def test_accept_rejects_wrong_specific_fulfiller(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/consensus.py")
    bob_hex = to_hex(direct_bob)
    direct_vm.sender = direct_alice
    contract.create_agreement(
        bob_hex, "Title", "Brief description", 1000000, 2000000, "Policy",
        make_criteria_json(), 8000, 1000,
    )

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("EXPECTED: only intended fulfiller can accept"):
        contract.accept_agreement(1)


def test_adjudication_rejects_third_party(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract = direct_deploy("contracts/consensus.py")
    _create_and_accept(contract, direct_vm, direct_alice, direct_bob)
    _submit(contract, direct_vm, direct_bob)

    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("EXPECTED: only creator or fulfiller can request adjudication"):
        contract.request_adjudication(1)
