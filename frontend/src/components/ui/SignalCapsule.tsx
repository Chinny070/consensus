"use client";

import clsx from "clsx";
import type { StatusCode } from "@/types/agreement";
import { STATUS } from "@/types/agreement";

const statusStyles: Record<number, string> = {
  [STATUS.OPEN]: "bg-acid-500 text-ink-950",
  [STATUS.ACTIVE]: "bg-acid-500 text-ink-950",
  [STATUS.SUBMITTED]: "bg-violet-600 text-bone-000",
  [STATUS.ADJUDICATING]: "bg-violet-600 text-bone-000 animate-pulse",
  [STATUS.APPROVED]: "bg-petrol-600 text-bone-000",
  [STATUS.SATISFIED]: "bg-petrol-600 text-bone-000",
  [STATUS.NOT_SATISFIED]: "bg-ember-500 text-bone-000",
  [STATUS.INCONCLUSIVE]: "bg-sand-400 text-ink-950",
  [STATUS.PAID]: "bg-petrol-600 text-bone-000",
  [STATUS.REFUNDED]: "bg-sand-400 text-ink-950",
  [STATUS.CANCELLED]: "bg-ink-800 text-bone-000",
  [STATUS.EXPIRED]: "bg-ink-800 text-bone-000",
};

interface SignalCapsuleProps {
  status: StatusCode;
  label: string;
  className?: string;
}

export function SignalCapsule({ status, label, className }: SignalCapsuleProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold",
        "notch-tr",
        statusStyles[status] || "bg-sand-400 text-ink-950",
        className
      )}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
