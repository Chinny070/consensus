"use client";

import { use } from "react";
import { useAgreement } from "@/hooks/use-agreement";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactionLifecycle } from "@/hooks/use-transaction-lifecycle";
import {
  writeAcceptAgreement,
  writeCancelAgreement,
  writeApproveDirectly,
  writeRequestAdjudication,
  writeClaimFulfillerPayout,
  writeClaimCreatorRefund,
  writeExpireAgreement,
} from "@/lib/genlayer/contract";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { StampedButton } from "@/components/ui/StampedButton";
import { SignalCapsule } from "@/components/ui/SignalCapsule";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { CriterionPlate } from "@/components/ui/CriterionPlate";
import { TransactionCapsule } from "@/components/ui/TransactionCapsule";
import { STATUS } from "@/types/agreement";
import type { CriterionResult } from "@/types/agreement";
import Link from "next/link";

export default function AgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agreementId = parseInt(id);
  const { agreement, criteria, submission, verdict, loading, error, reload } =
    useAgreement(isNaN(agreementId) ? null : agreementId);
  const { address } = useWallet();
  const { tx, execute, reset } = useTransactionLifecycle();

  const isClient =
    address && agreement?.creator.toLowerCase() === address.toLowerCase();
  const isWorker =
    address && agreement?.fulfiller.toLowerCase() === address.toLowerCase();

  const handleAction = async (fn: () => Promise<string>) => {
    try {
      await execute(fn);
      setTimeout(reload, 2000);
    } catch {
      // Error in tx state
    }
  };

  let criterionResults: CriterionResult[] = [];
  if (verdict) {
    try {
      criterionResults = JSON.parse(verdict.criterion_results_json);
    } catch {
      // Invalid JSON
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse font-mono text-ink-800">
          Loading agreement #{id}...
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Agreement not found</h1>
        <p className="text-ink-800 mb-6">{error || `No agreement with ID ${id}`}</p>
        <Link href="/forge">
          <StampedButton variant="acid">Forge an agreement</StampedButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <MicroLabel className="block mb-1">Agreement #{agreement.id}</MicroLabel>
          <h1 className="text-2xl sm:text-3xl font-display">{agreement.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <SignalCapsule
            status={agreement.status}
            label={agreement.status_label}
          />
          <span className="font-mono text-lg text-acid-500 bg-ink-950 px-3 py-1">
            {(agreement.amount_wei / 1e18).toFixed(4)} GEN
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Promise */}
          <NotchedPanel className="p-5" notch="tr">
            <MicroLabel className="block mb-2">Agreement statement</MicroLabel>
            <p className="text-sm leading-relaxed">{agreement.brief}</p>
          </NotchedPanel>

          {/* Criteria */}
          <div>
            <MicroLabel className="block mb-3">
              Acceptance criteria ({criteria.length})
            </MicroLabel>
            <div className="space-y-3">
              {criteria.map((c, i) => {
                const result = criterionResults.find((r) => r.index === i);
                return (
                  <CriterionPlate
                    key={i}
                    criterion={c}
                    index={i}
                    result={result || null}
                  />
                );
              })}
            </div>
          </div>

          {/* Submission */}
          {submission && (
            <NotchedPanel className="p-5" notch="tr">
              <MicroLabel className="block mb-2">Evidence submission</MicroLabel>
              <p className="text-sm mb-3">{submission.summary}</p>
              <div>
                <MicroLabel>Evidence manifest</MicroLabel>
                <pre className="mt-1 text-xs font-mono bg-bone-000 border border-ink-800/20 p-3 overflow-x-auto">
                  {submission.evidence_manifest}
                </pre>
              </div>
              {submission.content_hash && (
                <div className="mt-2">
                  <MicroLabel>Content hash</MicroLabel>
                  <p className="text-xs font-mono text-ink-800 mt-0.5">
                    {submission.content_hash}
                  </p>
                </div>
              )}
            </NotchedPanel>
          )}

          {/* Verdict */}
          {verdict && (
            <NotchedPanel className="p-5" notch="both">
              <MicroLabel className="block mb-2">Verdict</MicroLabel>
              <div className="flex items-center gap-3 mb-4">
                <SignalCapsule
                  status={verdict.outcome as typeof STATUS[keyof typeof STATUS]}
                  label={verdict.outcome_label}
                />
                <span className="font-mono text-sm">
                  Score: {verdict.score_bps / 100}%
                </span>
                <span className="font-mono text-[10px] text-ink-800">
                  {verdict.reason_code}
                </span>
              </div>
              <p className="text-sm text-ink-800 mb-3">{verdict.explanation}</p>
              <div className="text-[10px] font-mono text-ink-800">
                Policy: {verdict.policy_version} · Decided: {verdict.decided_at}
              </div>
            </NotchedPanel>
          )}
        </div>

        {/* Side rail */}
        <div className="space-y-4">
          {/* Participants */}
          <NotchedPanel className="p-4" notch="bl">
            <MicroLabel className="block mb-3">Participants</MicroLabel>
            <div className="space-y-2">
              <div>
                <span className="font-mono text-[10px] text-rose-500 block">
                  CLIENT
                </span>
                <span className="font-mono text-xs break-all">
                  {agreement.creator}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] text-rose-500 block">
                  WORKER
                </span>
                <span className="font-mono text-xs break-all">
                  {agreement.fulfiller_is_open
                    ? "Open — awaiting acceptance"
                    : agreement.fulfiller}
                </span>
              </div>
            </div>
          </NotchedPanel>

          {/* Deadlines */}
          <NotchedPanel className="p-4" notch="bl">
            <MicroLabel className="block mb-3">Deadlines</MicroLabel>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-ink-800">Accept by</span>
                <span>{new Date(agreement.accept_by * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-800">Deliver by</span>
                <span>{new Date(agreement.deliver_by * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </NotchedPanel>

          {/* Evidence policy */}
          <NotchedPanel className="p-4" notch="bl">
            <MicroLabel className="block mb-2">Evidence policy</MicroLabel>
            <p className="text-xs text-ink-800">{agreement.evidence_policy}</p>
          </NotchedPanel>

          {/* Transaction status */}
          <TransactionCapsule
            phase={tx.phase}
            hash={tx.hash}
            error={tx.error}
          />

          {/* Actions */}
          <div className="space-y-2">
            {tx.phase === "failed" && (
              <StampedButton variant="ghost" size="sm" onClick={reset} className="w-full">
                Reset
              </StampedButton>
            )}

            {agreement.status === STATUS.OPEN && isWorker && (
              <StampedButton
                variant="acid"
                size="md"
                className="w-full"
                onClick={() =>
                  handleAction(() =>
                    writeAcceptAgreement(address!, agreementId)
                  )
                }
                disabled={tx.phase !== "idle" && tx.phase !== "failed"}
              >
                Accept agreement
              </StampedButton>
            )}

            {agreement.status === STATUS.OPEN &&
              agreement.fulfiller_is_open &&
              address &&
              !isClient && (
                <StampedButton
                  variant="acid"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    handleAction(() =>
                      writeAcceptAgreement(address, agreementId)
                    )
                  }
                  disabled={tx.phase !== "idle" && tx.phase !== "failed"}
                >
                  Accept agreement
                </StampedButton>
              )}

            {agreement.status === STATUS.OPEN && isClient && (
              <StampedButton
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() =>
                  handleAction(() =>
                    writeCancelAgreement(address!, agreementId)
                  )
                }
                disabled={tx.phase !== "idle" && tx.phase !== "failed"}
              >
                Cancel agreement
              </StampedButton>
            )}

            {agreement.status === STATUS.ACTIVE && isWorker && (
              <Link href={`/agreement/${agreementId}/submit`} className="block">
                <StampedButton variant="acid" size="md" className="w-full">
                  Submit evidence
                </StampedButton>
              </Link>
            )}

            {agreement.status === STATUS.SUBMITTED && isClient && (
              <>
                <StampedButton
                  variant="acid"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    handleAction(() =>
                      writeApproveDirectly(address!, agreementId)
                    )
                  }
                  disabled={tx.phase !== "idle" && tx.phase !== "failed"}
                >
                  Approve directly
                </StampedButton>
                <StampedButton
                  variant="ink"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    handleAction(() =>
                      writeRequestAdjudication(address!, agreementId)
                    )
                  }
                  disabled={tx.phase !== "idle" && tx.phase !== "failed"}
                >
                  Ask Consensus
                </StampedButton>
              </>
            )}

            {agreement.status === STATUS.SUBMITTED && isWorker && (
              <StampedButton
                variant="ink"
                size="md"
                className="w-full"
                onClick={() =>
                  handleAction(() =>
                    writeRequestAdjudication(address!, agreementId)
                  )
                }
                disabled={tx.phase !== "idle" && tx.phase !== "failed"}
              >
                Ask Consensus
              </StampedButton>
            )}

            {(agreement.status === STATUS.APPROVED ||
              agreement.status === STATUS.SATISFIED) &&
              isWorker &&
              !agreement.fulfiller_claimed && (
                <StampedButton
                  variant="acid"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    handleAction(() =>
                      writeClaimFulfillerPayout(address!, agreementId)
                    )
                  }
                  disabled={tx.phase !== "idle" && tx.phase !== "failed"}
                >
                  Claim payout
                </StampedButton>
              )}

            {(agreement.status === STATUS.CANCELLED ||
              agreement.status === STATUS.EXPIRED ||
              agreement.status === STATUS.NOT_SATISFIED ||
              agreement.status === STATUS.INCONCLUSIVE) &&
              isClient &&
              !agreement.creator_claimed && (
                <StampedButton
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() =>
                    handleAction(() =>
                      writeClaimCreatorRefund(address!, agreementId)
                    )
                  }
                  disabled={tx.phase !== "idle" && tx.phase !== "failed"}
                >
                  Claim refund
                </StampedButton>
              )}

            <StampedButton
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={reload}
            >
              Refresh
            </StampedButton>
          </div>

          {/* Network info */}
          <div className="font-mono text-[10px] text-ink-800 space-y-0.5">
            <p>Policy: {agreement.policy_version}</p>
            <p>Threshold: {agreement.pass_threshold_bps / 100}%</p>
            <p>Network: GenLayer StudioNet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
