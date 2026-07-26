"""Shared helpers for direct mode tests."""

import json


def to_hex(addr_bytes):
    if hasattr(addr_bytes, "as_hex"):
        return addr_bytes.as_hex
    from genlayer.py.types import Address
    return Address(addr_bytes).as_hex


def make_criteria_json(criteria=None):
    if criteria is None:
        criteria = [
            {
                "label": "Primary deliverable present",
                "human_rule": "The submitted evidence must demonstrate that the primary deliverable exists and is accessible",
                "validator_test": "Check the submitted evidence for the presence of the primary deliverable as described in the agreement",
                "failure_boundary": "Fail if the primary deliverable is not found or not accessible",
                "weight_bps": 5000,
                "is_mandatory": True,
            },
            {
                "label": "Secondary requirement met",
                "human_rule": "The submission must satisfy the secondary requirement specified in the agreement",
                "validator_test": "Verify the submitted evidence demonstrates the secondary requirement is fulfilled",
                "failure_boundary": "Fail if the secondary requirement is not evidenced",
                "weight_bps": 5000,
                "is_mandatory": False,
            },
        ]
    return json.dumps(criteria)


SAMPLE_EVIDENCE_MANIFEST = json.dumps([
    {"url": "https://example.com/deliverable", "label": "Primary evidence", "criteria_indexes": [0, 1]}
])
