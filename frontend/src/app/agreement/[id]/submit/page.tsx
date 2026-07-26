"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAgreement } from "@/hooks/use-agreement";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactionLifecycle } from "@/hooks/use-transaction-lifecycle";
import { writeSubmitEvidence } from "@/lib/genlayer/contract";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { StampedButton } from "@/components/ui/StampedButton";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { TransactionCapsule } from "@/components/ui/TransactionCapsule";
import { STATUS } from "@/types/agreement";
import type { EvidenceEntry } from "@/types/agreement";

export default function SubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agreementId = parseInt(id);
  const router = useRouter();
  const { agreement, criteria, loading } = useAgreement(
    isNaN(agreementId) ? null : agreementId
  );
  const { address } = useWallet();
  const { tx, execute, reset } = useTransactionLifecycle();

  const [summary, setSummary] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([
    { url: "", label: "", criteria_indexes: [], note: "" },
  ]);
  const [attested, setAttested] = useState(false);

  const addEvidence = useCallback(() => {
    if (evidence.length >= 8) return;
    setEvidence((prev) => [
      ...prev,
      { url: "", label: "", criteria_indexes: [], note: "" },
    ]);
  }, [evidence.length]);

  const updateEvidence = (
    index: number,
    field: keyof EvidenceEntry,
    value: unknown
  ) => {
    setEvidence((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCriterionIndex = (evidenceIdx: number, criterionIdx: number) => {
    setEvidence((prev) =>
      prev.map((e, i) => {
        if (i !== evidenceIdx) return e;
        const indexes = e.criteria_indexes.includes(criterionIdx)
          ? e.criteria_indexes.filter((ci) => ci !== criterionIdx)
          : [...e.criteria_indexes, criterionIdx];
        return { ...e, criteria_indexes: indexes };
      })
    );
  };

  const handleSubmit = async () => {
    if (!address) return;
    const manifest = JSON.stringify(
      evidence
        .filter((e) => e.url.trim())
        .map((e) => ({
          url: e.url.trim(),
          label: e.label.trim(),
          criteria_indexes: e.criteria_indexes,
        }))
    );

    try {
      await execute(() =>
        writeSubmitEvidence(
          address,
          agreementId,
          summary,
          manifest,
          contentHash
        )
      );
      setTimeout(() => router.push(`/agreement/${agreementId}`), 2000);
    } catch {
      // Error in tx state
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse font-mono text-ink-800">Loading...</div>
      </div>
    );
  }

  if (!agreement || agreement.status !== STATUS.ACTIVE) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Cannot submit</h1>
        <p className="text-ink-800">
          This agreement is not in ACTIVE state.
        </p>
      </div>
    );
  }

  const isWorker =
    address && agreement.fulfiller.toLowerCase() === address.toLowerCase();

  if (!isWorker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Not authorized</h1>
        <p className="text-ink-800">
          Only the accepted worker can submit evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MicroLabel className="block mb-2">
        Agreement #{agreement.id} · Submit evidence
      </MicroLabel>
      <h1 className="text-2xl font-display mb-8">{agreement.title}</h1>

      <div className="space-y-6">
        {/* Criteria reference */}
        <NotchedPanel className="p-5" notch="tr">
          <MicroLabel className="block mb-3">
            Criteria to satisfy ({criteria.length})
          </MicroLabel>
          <div className="space-y-2">
            {criteria.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm py-1 border-b border-ink-800/10 last:border-0"
              >
                <span className="font-mono text-[10px] text-ink-800 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="font-bold text-xs">{c.label}</span>
                  {c.is_mandatory && (
                    <span className="ml-2 text-[9px] bg-ember-500 text-bone-000 px-1 py-0.5 font-mono uppercase">
                      Mandatory
                    </span>
                  )}
                  <p className="text-xs text-ink-800 mt-0.5">{c.human_rule}</p>
                </div>
              </div>
            ))}
          </div>
        </NotchedPanel>

        {/* Submission summary */}
        <div>
          <label className="block mb-1">
            <MicroLabel>Submission summary</MicroLabel>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe what you delivered and how it satisfies the criteria..."
            className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 text-sm h-24 resize-none focus:outline-none focus:border-acid-500"
            maxLength={1000}
          />
          <span className="font-mono text-[10px] text-ink-800 block mt-1">
            {summary.length}/1000
          </span>
        </div>

        {/* Evidence URLs */}
        <div>
          <MicroLabel className="block mb-3">Evidence URLs</MicroLabel>
          <div className="space-y-4">
            {evidence.map((e, i) => (
              <div key={i} className="border-2 border-ink-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink-800">
                    Evidence {i + 1}
                  </span>
                  {evidence.length > 1 && (
                    <button
                      onClick={() => removeEvidence(i)}
                      className="text-ember-500 text-xs font-mono cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={e.url}
                  onChange={(ev) => updateEvidence(i, "url", ev.target.value)}
                  placeholder="https://..."
                  className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm font-mono focus:outline-none focus:border-acid-500"
                />
                <input
                  type="text"
                  value={e.label}
                  onChange={(ev) => updateEvidence(i, "label", ev.target.value)}
                  placeholder="Label (e.g., Deployed site)"
                  className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm focus:outline-none focus:border-acid-500"
                />
                <div>
                  <MicroLabel>Covers criteria:</MicroLabel>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {criteria.map((c, ci) => (
                      <button
                        key={ci}
                        onClick={() => toggleCriterionIndex(i, ci)}
                        className={`px-2 py-1 text-[10px] font-mono border cursor-pointer ${
                          e.criteria_indexes.includes(ci)
                            ? "bg-acid-500 border-ink-950 text-ink-950"
                            : "border-ink-800 text-ink-800"
                        }`}
                      >
                        {ci + 1}: {c.label.slice(0, 20)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {evidence.length < 8 && (
            <StampedButton
              variant="ghost"
              size="sm"
              onClick={addEvidence}
              className="mt-3"
            >
              + Add evidence
            </StampedButton>
          )}
        </div>

        {/* Content hash */}
        <div>
          <label className="block mb-1">
            <MicroLabel>Content hash (optional)</MicroLabel>
          </label>
          <input
            type="text"
            value={contentHash}
            onChange={(e) => setContentHash(e.target.value)}
            placeholder="sha256:..."
            className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-acid-500"
          />
        </div>

        {/* Attestation */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
            className="accent-acid-500 w-4 h-4 mt-0.5"
          />
          <span className="text-sm text-ink-800">
            After submission, your evidence is sealed to this revision. You
            cannot modify it.
          </span>
        </label>

        {/* Submit */}
        <TransactionCapsule
          phase={tx.phase}
          hash={tx.hash}
          error={tx.error}
        />

        {tx.phase === "failed" && (
          <StampedButton variant="ghost" size="sm" onClick={reset}>
            Reset
          </StampedButton>
        )}

        {(tx.phase === "idle" || tx.phase === "failed") && (
          <StampedButton
            variant="acid"
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={
              !summary ||
              !attested ||
              evidence.every((e) => !e.url.trim())
            }
          >
            Submit evidence
          </StampedButton>
        )}

        {tx.phase === "accepted" && (
          <p className="text-center font-mono text-petrol-600 text-sm font-bold">
            Evidence sealed. Returning to agreement...
          </p>
        )}
      </div>
    </div>
  );
}
