import { createReadClient, createWriteClient } from "./client";
import type {
  Agreement,
  CriterionData,
  SubmissionData,
  VerdictData,
  ClaimableInfo,
} from "@/types/agreement";
import type { TransactionHash } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONSENSUS_CONTRACT_ADDRESS as `0x${string}`;

function getContractAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_CONSENSUS_CONTRACT_ADDRESS is not set. Deploy the contract first."
    );
  }
  return CONTRACT_ADDRESS;
}

// ── Agreement Domain — Reads ────────────────────────────────────────────────

export async function readAgreement(agreementId: number): Promise<Agreement> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_agreement",
    args: [String(agreementId)],
  })) as unknown as Agreement;
}

export async function readStatus(
  agreementId: number
): Promise<{ status: number; status_label: string }> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_status",
    args: [String(agreementId)],
  })) as unknown as { status: number; status_label: string };
}

export async function readAgreementIdsFor(
  address: string
): Promise<{ as_creator: number[]; as_fulfiller: number[] }> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_agreement_ids_for",
    args: [address],
  })) as unknown as { as_creator: number[]; as_fulfiller: number[] };
}

export async function readClaimable(
  agreementId: number,
  address: string
): Promise<ClaimableInfo> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_claimable",
    args: [String(agreementId), address],
  })) as unknown as ClaimableInfo;
}

export async function readProtocolConfig(): Promise<Record<string, unknown>> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_protocol_config",
    args: [],
  })) as unknown as Record<string, unknown>;
}

// ── Evidence Domain — Reads ─────────────────────────────────────────────────

export async function readCriteria(
  agreementId: number
): Promise<CriterionData[]> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_criteria",
    args: [String(agreementId)],
  })) as unknown as CriterionData[];
}

export async function readSubmission(
  agreementId: number
): Promise<SubmissionData> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_submission",
    args: [String(agreementId)],
  })) as unknown as SubmissionData;
}

// ── Adjudication Domain — Reads ─────────────────────────────────────────────

export async function readVerdict(agreementId: number): Promise<VerdictData> {
  const client = createReadClient();
  return (await client.readContract({
    address: getContractAddress(),
    functionName: "get_verdict",
    args: [String(agreementId)],
  })) as unknown as VerdictData;
}

// ── Agreement Domain — Writes ───────────────────────────────────────────────

export async function writeCreateAgreement(
  account: `0x${string}`,
  args: {
    fulfillerAddress: string;
    title: string;
    brief: string;
    acceptBy: number;
    deliverBy: number;
    evidencePolicy: string;
    criteriaJson: string;
    passThresholdBps: number;
  },
  valueWei: bigint
): Promise<string> {
  const client = createWriteClient(account);
  const callArgs = [
    args.fulfillerAddress,
    args.title,
    args.brief,
    String(args.acceptBy),
    String(args.deliverBy),
    args.evidencePolicy,
    args.criteriaJson,
    String(args.passThresholdBps),
  ];
  console.log("[Consensus] create_agreement args:", callArgs);
  console.log("[Consensus] contract address:", getContractAddress());
  console.log("[Consensus] account:", account);
  console.log("[Consensus] value (wei):", valueWei.toString());
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "create_agreement",
    args: callArgs,
    value: valueWei,
  })) as string;
}

export async function writeAcceptAgreement(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "accept_agreement",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

export async function writeCancelAgreement(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "cancel_agreement",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

// ── Evidence Domain — Writes ────────────────────────────────────────────────

export async function writeSubmitEvidence(
  account: `0x${string}`,
  agreementId: number,
  summary: string,
  evidenceManifest: string,
  contentHash: string
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "submit_evidence",
    args: [String(agreementId), summary, evidenceManifest, contentHash],
    value: BigInt(0),
  })) as string;
}

// ── Adjudication Domain — Writes ────────────────────────────────────────────

export async function writeApproveDirectly(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "approve_directly",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

export async function writeRequestAdjudication(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "request_adjudication",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

export async function writeClaimFulfillerPayout(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "claim_fulfiller_payout",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

export async function writeClaimCreatorRefund(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "claim_creator_refund",
    args: [String(agreementId)],
    value: BigInt(0),
  })) as string;
}

export async function writeExpireAgreement(
  account: `0x${string}`,
  agreementId: number
): Promise<string> {
  const client = createWriteClient(account);
  const now = Math.floor(Date.now() / 1000);
  return (await client.writeContract({
    address: getContractAddress(),
    functionName: "expire_agreement",
    args: [String(agreementId), String(now)],
    value: BigInt(0),
  })) as string;
}

// ── Transaction receipt ─────────────────────────────────────────────────────

export async function waitForReceipt(
  hash: string,
  status: "ACCEPTED" | "FINALIZED" = "ACCEPTED"
) {
  const client = createReadClient();
  const txStatus =
    status === "FINALIZED"
      ? TransactionStatus.FINALIZED
      : TransactionStatus.ACCEPTED;
  return await client.waitForTransactionReceipt({
    hash: hash as unknown as TransactionHash,
    status: txStatus,
    retries: 30,
    interval: 5000,
  });
}
