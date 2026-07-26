"use client";

import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { TxPhase } from "@/types/transaction";

const phaseConfig: Record<
  TxPhase,
  { label: string; color: string; animate: boolean }
> = {
  idle: { label: "", color: "", animate: false },
  preparing: {
    label: "Preparing",
    color: "bg-sand-400 text-ink-950",
    animate: true,
  },
  awaiting_signature: {
    label: "Sign in wallet",
    color: "bg-rose-500 text-bone-000",
    animate: true,
  },
  submitted: {
    label: "Submitted",
    color: "bg-violet-600 text-bone-000",
    animate: true,
  },
  pending: {
    label: "Pending",
    color: "bg-violet-600 text-bone-000",
    animate: true,
  },
  accepted: {
    label: "Accepted",
    color: "bg-petrol-600 text-bone-000",
    animate: false,
  },
  finalized: {
    label: "Finalized",
    color: "bg-petrol-600 text-bone-000",
    animate: false,
  },
  failed: {
    label: "Failed",
    color: "bg-ember-500 text-bone-000",
    animate: false,
  },
};

interface TransactionCapsuleProps {
  phase: TxPhase;
  hash?: string | null;
  error?: string | null;
  className?: string;
}

export function TransactionCapsule({
  phase,
  hash,
  error,
  className,
}: TransactionCapsuleProps) {
  const config = phaseConfig[phase];
  if (phase === "idle") return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className={clsx(
          "px-4 py-2 font-mono text-xs border-2 border-ink-950 notch-tr",
          config.color,
          config.animate && "animate-pulse",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <span className="uppercase tracking-widest font-bold">
          {config.label}
        </span>
        {hash && (
          <span className="ml-3 opacity-60 text-[10px]">
            {hash.slice(0, 8)}...{hash.slice(-6)}
          </span>
        )}
        {error && phase === "failed" && (
          <p className="mt-1 text-[10px] opacity-80 break-all">{error}</p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
