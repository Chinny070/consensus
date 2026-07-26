"""Test the verdict JSON parser and outcome computation logic."""

import json
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))


@pytest.fixture(scope="module")
def contract():
    import tests.direct.genlayer_mock  # noqa: F401
    from contracts import consensus
    return consensus


def _make_valid_result(criteria_statuses, policy_version="consensus-v1"):
    criteria = []
    for i, status in enumerate(criteria_statuses):
        criteria.append({
            "index": i,
            "status": status,
            "evidence_refs": [0],
            "reason": "Criterion " + str(i) + " reason",
        })
    return json.dumps({
        "policy_version": policy_version,
        "criteria": criteria,
        "evidence_digest": "inspected example.com",
        "summary": "Assessment complete",
    })


def _make_criteria_meta(mandatory_flags, weights=None):
    BPS_TOTAL = 10_000
    count = len(mandatory_flags)
    if weights is None:
        w = BPS_TOTAL // count
        weights = [w] * count
        weights[-1] = BPS_TOTAL - w * (count - 1)
    result = []
    for i, (mand, weight) in enumerate(zip(mandatory_flags, weights)):
        result.append({
            "position": i,
            "is_mandatory": mand,
            "weight_bps": weight,
        })
    return result


def test_valid_json_parses(contract):
    raw = _make_valid_result(["PASS", "PASS"])
    data = contract._parse_verdict_json(raw, 2)
    assert len(data["criteria"]) == 2
    assert data["criteria"][0]["status"] == "PASS"


def test_fenced_json_parses(contract):
    fence = chr(96) + chr(96) + chr(96)
    inner = _make_valid_result(["PASS", "FAIL"])
    fenced = fence + "json\n" + inner + "\n" + fence
    data = contract._parse_verdict_json(fenced, 2)
    assert data["criteria"][1]["status"] == "FAIL"


def test_missing_fields_raises(contract):
    try:
        contract._parse_verdict_json('{"criteria": []}', 1)
        assert False, "should raise"
    except Exception as e:
        assert "policy_version" in str(e) or "expected 1 criteria" in str(e)


def test_invalid_outcome_raises(contract):
    raw = json.dumps({
        "policy_version": contract.POLICY_VERSION,
        "criteria": [{"index": 0, "status": "MAYBE", "evidence_refs": [], "reason": "x"}],
        "evidence_digest": "",
        "summary": "",
    })
    try:
        contract._parse_verdict_json(raw, 1)
        assert False, "should raise"
    except Exception as e:
        assert "invalid status" in str(e)


def test_duplicate_indexes_raises(contract):
    raw = json.dumps({
        "policy_version": contract.POLICY_VERSION,
        "criteria": [
            {"index": 0, "status": "PASS", "evidence_refs": [], "reason": "x"},
            {"index": 0, "status": "FAIL", "evidence_refs": [], "reason": "y"},
        ],
        "evidence_digest": "",
        "summary": "",
    })
    try:
        contract._parse_verdict_json(raw, 2)
        assert False, "should raise"
    except Exception as e:
        assert "duplicate" in str(e)


def test_alias_normalization(contract):
    raw = json.dumps({
        "policy_version": contract.POLICY_VERSION,
        "criteria": [
            {"index": 0, "status": "pass", "evidence_refs": [], "reason": "x"},
            {"index": 1, "status": "Pass", "evidence_refs": [], "reason": "y"},
        ],
        "evidence_digest": "",
        "summary": "",
    })
    data = contract._parse_verdict_json(raw, 2)
    assert data["criteria"][0]["status"] == "PASS"
    assert data["criteria"][1]["status"] == "PASS"


def test_all_mandatory_pass(contract):
    results = [{"index": 0, "status": "PASS"}, {"index": 1, "status": "PASS"}]
    meta = _make_criteria_meta([True, True])
    outcome, score, mand_pass, rc = contract._compute_outcome(results, meta, contract.DEFAULT_PASS_THRESHOLD_BPS)
    assert outcome == contract.STATUS_SATISFIED
    assert score == contract.BPS_TOTAL
    assert mand_pass is True


def test_mandatory_fail(contract):
    results = [{"index": 0, "status": "FAIL"}, {"index": 1, "status": "PASS"}]
    meta = _make_criteria_meta([True, False])
    outcome, score, mand_pass, rc = contract._compute_outcome(results, meta, contract.DEFAULT_PASS_THRESHOLD_BPS)
    assert outcome == contract.STATUS_NOT_SATISFIED
    assert mand_pass is False
    assert rc == "MANDATORY_CRITERION_FAILED"


def test_mandatory_unknown(contract):
    results = [{"index": 0, "status": "UNKNOWN"}, {"index": 1, "status": "PASS"}]
    meta = _make_criteria_meta([True, False])
    outcome, score, mand_pass, rc = contract._compute_outcome(results, meta, contract.DEFAULT_PASS_THRESHOLD_BPS)
    assert outcome == contract.STATUS_INCONCLUSIVE
    assert rc == "MANDATORY_CRITERION_UNKNOWN"


def test_score_above_threshold(contract):
    results = [
        {"index": 0, "status": "PASS"},
        {"index": 1, "status": "PASS"},
        {"index": 2, "status": "FAIL"},
    ]
    meta = _make_criteria_meta([True, False, False], [4000, 4500, 1500])
    outcome, score, _, rc = contract._compute_outcome(results, meta, contract.DEFAULT_PASS_THRESHOLD_BPS)
    assert outcome == contract.STATUS_SATISFIED
    assert score == 8500
    assert rc == "ALL_MANDATORY_AND_THRESHOLD_MET"


def test_score_below_threshold(contract):
    results = [
        {"index": 0, "status": "PASS"},
        {"index": 1, "status": "FAIL"},
        {"index": 2, "status": "FAIL"},
    ]
    meta = _make_criteria_meta([True, False, False], [3000, 3500, 3500])
    outcome, score, _, rc = contract._compute_outcome(results, meta, contract.DEFAULT_PASS_THRESHOLD_BPS)
    assert outcome == contract.STATUS_NOT_SATISFIED
    assert score == 3000
    assert rc == "SCORE_BELOW_THRESHOLD"


def test_custom_threshold_changes_outcome(contract):
    results = [
        {"index": 0, "status": "PASS"},
        {"index": 1, "status": "PASS"},
        {"index": 2, "status": "FAIL"},
    ]
    meta = _make_criteria_meta([True, False, False], [4000, 3000, 3000])
    outcome_high, score, _, _ = contract._compute_outcome(results, meta, 8000)
    outcome_low, _, _, _ = contract._compute_outcome(results, meta, 6000)
    assert score == 7000
    assert outcome_high == contract.STATUS_NOT_SATISFIED
    assert outcome_low == contract.STATUS_SATISFIED
