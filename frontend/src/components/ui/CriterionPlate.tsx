"use client";

import clsx from "clsx";
import type { CriterionData } from "@/types/agreement";
import { MicroLabel } from "./MicroLabel";

interface CriterionPlateProps {
  criterion: CriterionData;
  index: number;
  result?: { status: string; reason: string } | null;
}

export function CriterionPlate({ criterion, index, result }: CriterionPlateProps) {
  const resultColor = result
    ? {
        PASS: "border-l-petrol-600",
        FAIL: "border-l-ember-500",
        UNKNOWN: "border-l-sand-400",
      }[result.status] || "border-l-ink-800"
    : "border-l-ink-800";

  return (
    <div
      className={clsx(
        "border-2 border-ink-950 border-l-4 p-4",
        resultColor,
        "bg-bone-000"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink-800">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="font-bold text-sm">{criterion.label}</h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {criterion.is_mandatory && (
            <span className="bg-ember-500 text-bone-000 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider">
              Mandatory
            </span>
          )}
          <span className="font-mono text-xs text-ink-800">
            {criterion.weight_bps / 100}%
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <MicroLabel>Human meaning</MicroLabel>
          <p className="mt-0.5">{criterion.human_rule}</p>
        </div>
        <div>
          <MicroLabel>Validator test</MicroLabel>
          <p className="mt-0.5 text-ink-800">{criterion.validator_test}</p>
        </div>
        <div>
          <MicroLabel>Failure boundary</MicroLabel>
          <p className="mt-0.5 text-ink-800">{criterion.failure_boundary}</p>
        </div>
      </div>

      {result && (
        <div
          className={clsx(
            "mt-3 pt-3 border-t border-ink-800/20 flex items-start gap-2",
            result.status === "PASS" && "text-petrol-600",
            result.status === "FAIL" && "text-ember-500",
            result.status === "UNKNOWN" && "text-sand-400"
          )}
        >
          <span className="font-mono text-xs font-bold uppercase">
            {result.status}
          </span>
          {result.reason && (
            <p className="text-xs text-ink-800">{result.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
