"use client";

import { use } from "react";
import Link from "next/link";
import { useAgreement } from "@/hooks/use-agreement";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { SignalCapsule } from "@/components/ui/SignalCapsule";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { CriterionPlate } from "@/components/ui/CriterionPlate";
import { StampedButton } from "@/components/ui/StampedButton";
import { STATUS } from "@/types/agreement";
import type { CriterionResult } from "@/types/agreement";

export default function VerdictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agreementId = parseInt(id);
  const { agreement, criteria, verdict, loading } = useAgreement(
    isNaN(agreementId) ? null : agreementId
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse font-mono text-ink-800">Loading...</div>
      </div>
    );
  }

  if (!agreement || !verdict) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">No verdict</h1>
        <p className="text-ink-800 mb-6">
          This agreement has not been adjudicated yet.
        </p>
        <Link href={`/agreement/${id}`}>
          <StampedButton variant="ghost">Back to agreement</StampedButton>
        </Link>
      </div>
    );
  }

  let criterionResults: CriterionResult[] = [];
  try {
    criterionResults = JSON.parse(verdict.criterion_results_json);
  } catch {
    // Invalid JSON
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MicroLabel className="block mb-2">
        Agreement #{agreement.id} · Verdict
      </MicroLabel>

      {/* Outcome */}
      <div className="flex items-center gap-4 mb-8">
        <SignalCapsule
          status={verdict.outcome as typeof STATUS[keyof typeof STATUS]}
          label={verdict.outcome_label}
          className="text-lg px-5 py-2"
        />
        <div className="font-mono text-sm text-ink-800">
          Score: {verdict.score_bps / 100}%
        </div>
      </div>

      {/* Explanation */}
      <NotchedPanel className="p-5 mb-8" notch="both">
        <MicroLabel className="block mb-2">Explanation</MicroLabel>
        <p className="text-sm leading-relaxed">{verdict.explanation}</p>
        <div className="mt-4 flex flex-wrap gap-4 font-mono text-[10px] text-ink-800">
          <span>Reason: {verdict.reason_code}</span>
          <span>Policy: {verdict.policy_version}</span>
          <span>
            Mandatory:{" "}
            <span
              className={verdict.mandatory_pass ? "text-petrol-600" : "text-ember-500"}
            >
              {verdict.mandatory_pass ? "ALL PASS" : "FAILED"}
            </span>
          </span>
        </div>
      </NotchedPanel>

      {/* Criterion-by-criterion */}
      <MicroLabel className="block mb-3">Criterion results</MicroLabel>
      <div className="space-y-3 mb-8">
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

      {/* Evidence digest */}
      {verdict.evidence_digest && (
        <NotchedPanel className="p-4 mb-8" notch="tr">
          <MicroLabel className="block mb-1">Evidence digest</MicroLabel>
          <p className="text-xs font-mono text-ink-800">
            {verdict.evidence_digest}
          </p>
        </NotchedPanel>
      )}

      {/* Meta */}
      <div className="font-mono text-[10px] text-ink-800 space-y-0.5 mb-8">
        <p>Decided: {verdict.decided_at}</p>
        <p>Verdict ID: {verdict.id}</p>
      </div>

      <Link href={`/agreement/${id}`}>
        <StampedButton variant="ghost">Back to agreement</StampedButton>
      </Link>
    </div>
  );
}
