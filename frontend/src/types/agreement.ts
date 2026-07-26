export const STATUS = {
  OPEN: 0,
  ACTIVE: 1,
  SUBMITTED: 2,
  ADJUDICATING: 3,
  APPROVED: 4,
  SATISFIED: 5,
  NOT_SATISFIED: 6,
  INCONCLUSIVE: 7,
  PAID: 8,
  REFUNDED: 9,
  CANCELLED: 10,
  EXPIRED: 11,
} as const;

export type StatusCode = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_LABELS: Record<number, string> = {
  0: "OPEN",
  1: "ACTIVE",
  2: "SUBMITTED",
  3: "ADJUDICATING",
  4: "APPROVED",
  5: "SATISFIED",
  6: "NOT SATISFIED",
  7: "INCONCLUSIVE",
  8: "PAID",
  9: "REFUNDED",
  10: "CANCELLED",
  11: "EXPIRED",
};

export const TERMINAL_STATUSES = new Set([
  STATUS.PAID,
  STATUS.REFUNDED,
  STATUS.CANCELLED,
  STATUS.EXPIRED,
]);

export interface Agreement {
  id: number;
  creator: string;
  fulfiller: string;
  fulfiller_is_open: boolean;
  amount_wei: number;
  created_at: string;
  accept_by: number;
  deliver_by: number;
  status: StatusCode;
  status_label: string;
  title: string;
  brief: string;
  evidence_policy: string;
  criteria_count: number;
  submission_id: number;
  verdict_id: number;
  creator_claimed: boolean;
  fulfiller_claimed: boolean;
  pass_threshold_bps: number;
  policy_version: string;
}

export interface CriterionData {
  position: number;
  label: string;
  human_rule: string;
  validator_test: string;
  failure_boundary: string;
  weight_bps: number;
  is_mandatory: boolean;
}

export interface SubmissionData {
  id: number;
  agreement_id: number;
  fulfiller: string;
  submitted_at: string;
  summary: string;
  evidence_manifest: string;
  content_hash: string;
  revision_number: number;
}

export interface VerdictData {
  id: number;
  agreement_id: number;
  outcome: number;
  outcome_label: string;
  score_bps: number;
  mandatory_pass: boolean;
  criterion_results_json: string;
  evidence_digest: string;
  reason_code: string;
  explanation: string;
  decided_at: string;
  policy_version: string;
}

export interface CriterionResult {
  index: number;
  status: "PASS" | "FAIL" | "UNKNOWN";
  evidence_refs: number[];
  reason: string;
}

export interface ClaimableInfo {
  can_claim: boolean;
  amount: number;
  role: string;
}

export interface CriterionDraft {
  id: string;
  label: string;
  humanRule: string;
  validatorTest: string;
  failureBoundary: string;
  weightBps: number;
  mandatory: boolean;
}

export interface ForgeDraft {
  title: string;
  brief: string;
  workerMode: "specific" | "open";
  workerAddress?: string;
  amountGen: string;
  acceptByIso: string;
  deliverByIso: string;
  evidencePolicy: string;
  criteria: CriterionDraft[];
  passThresholdBps: number;
}

export interface EvidenceEntry {
  url: string;
  label: string;
  criteria_indexes: number[];
  note?: string;
}

export type AgreementTemplate = {
  id: string;
  name: string;
  description: string;
  title: string;
  brief: string;
  evidencePolicy: string;
  criteria: Omit<CriterionDraft, "id">[];
  passThresholdBps: number;
};
