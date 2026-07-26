"use client";

import { useState, useCallback } from "react";
import type { TxState, TxPhase } from "@/types/transaction";
import { INITIAL_TX_STATE } from "@/types/transaction";
import { waitForReceipt } from "@/lib/genlayer/contract";

export function useTransactionLifecycle() {
  const [tx, setTx] = useState<TxState>(INITIAL_TX_STATE);

  const setPhase = useCallback((phase: TxPhase) => {
    setTx((s) => ({ ...s, phase, lastCheckedAt: Date.now() }));
  }, []);

  const execute = useCallback(
    async (writeFn: () => Promise<string>) => {
      setTx({ ...INITIAL_TX_STATE, phase: "preparing" });

      try {
        setPhase("awaiting_signature");
        console.log("[Consensus] Requesting wallet signature...");
        const hash = await writeFn();
        console.log("[Consensus] Transaction hash:", hash);

        setTx((s) => ({
          ...s,
          hash,
          phase: "submitted",
          submittedAt: Date.now(),
        }));

        setPhase("pending");
        console.log("[Consensus] Waiting for receipt...");

        const receipt = await waitForReceipt(hash, "ACCEPTED");
        console.log("[Consensus] Receipt received:", receipt);

        setTx((s) => ({
          ...s,
          receipt,
          phase: "accepted",
          lastCheckedAt: Date.now(),
        }));

        return { hash, receipt };
      } catch (error: unknown) {
        console.error("[Consensus] Transaction failed:", error);
        const message =
          error instanceof Error ? error.message : "Transaction failed";
        setTx((s) => ({
          ...s,
          phase: "failed",
          error: message,
        }));
        throw error;
      }
    },
    [setPhase]
  );

  const reset = useCallback(() => {
    setTx(INITIAL_TX_STATE);
  }, []);

  return { tx, execute, reset, setPhase };
}
