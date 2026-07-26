"use client";

import { useState, useEffect, useCallback } from "react";
import type { Agreement, CriterionData, SubmissionData, VerdictData } from "@/types/agreement";
import {
  readAgreement,
  readCriteria,
  readSubmission,
  readVerdict,
} from "@/lib/genlayer/contract";

interface AgreementState {
  agreement: Agreement | null;
  criteria: CriterionData[];
  submission: SubmissionData | null;
  verdict: VerdictData | null;
  loading: boolean;
  error: string | null;
}

export function useAgreement(agreementId: number | null) {
  const [state, setState] = useState<AgreementState>({
    agreement: null,
    criteria: [],
    submission: null,
    verdict: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!agreementId) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const agreement = await readAgreement(agreementId);
      const criteria = await readCriteria(agreementId);

      let submission: SubmissionData | null = null;
      if (agreement.submission_id > 0) {
        try {
          submission = await readSubmission(agreementId);
        } catch {
          // No submission yet
        }
      }

      let verdict: VerdictData | null = null;
      if (agreement.verdict_id > 0) {
        try {
          verdict = await readVerdict(agreementId);
        } catch {
          // No verdict yet
        }
      }

      setState({
        agreement,
        criteria,
        submission,
        verdict,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load agreement";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, [agreementId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
