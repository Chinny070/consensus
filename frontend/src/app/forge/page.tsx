"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactionLifecycle } from "@/hooks/use-transaction-lifecycle";
import { writeCreateAgreement } from "@/lib/genlayer/contract";
import { CRITERION_TEMPLATES, AGREEMENT_TEMPLATES } from "@/lib/validation/forge-schema";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { StampedButton } from "@/components/ui/StampedButton";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { TransactionCapsule } from "@/components/ui/TransactionCapsule";
import type { CriterionDraft } from "@/types/agreement";

const STEPS = [
  "Template",
  "Promise",
  "Parties",
  "Value",
  "Criteria",
  "Evidence",
  "Deadlines",
  "Seal & Fund",
] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function emptyDraft(): CriterionDraft {
  return {
    id: generateId(),
    label: "",
    humanRule: "",
    validatorTest: "",
    failureBoundary: "",
    weightBps: 10000,
    mandatory: true,
  };
}

export default function ForgePage() {
  const router = useRouter();
  const { address, isConnected, connect } = useWallet();
  const { tx, execute, reset } = useTransactionLifecycle();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [workerMode, setWorkerMode] = useState<"open" | "specific">("open");
  const [workerAddress, setWorkerAddress] = useState("");
  const [amountGen, setAmountGen] = useState("");
  const [acceptBy, setAcceptBy] = useState("");
  const [deliverBy, setDeliverBy] = useState("");
  const [evidencePolicy, setEvidencePolicy] = useState(
    "Submit one or more public HTTPS URLs where the deliverable can be inspected."
  );
  const [criteria, setCriteria] = useState<CriterionDraft[]>([emptyDraft()]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyAgreementTemplate = useCallback(
    (templateId: string) => {
      const template = AGREEMENT_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      setSelectedTemplate(templateId);
      if (template.title) setTitle(template.title);
      if (template.brief) setBrief(template.brief);
      setEvidencePolicy(template.evidencePolicy);
      setCriteria(
        template.criteria.map((c) => ({
          id: generateId(),
          label: c.label,
          humanRule: c.humanRule,
          validatorTest: c.validatorTest,
          failureBoundary: c.failureBoundary,
          weightBps: c.weightBps,
          mandatory: c.mandatory,
        }))
      );
      setStep(1);
    },
    []
  );

  const addCriterion = useCallback(() => {
    if (criteria.length >= 8) return;
    setCriteria((prev) => [...prev, emptyDraft()]);
  }, [criteria.length]);

  const removeCriterion = useCallback((id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCriterion = useCallback(
    (id: string, field: keyof CriterionDraft, value: unknown) => {
      setCriteria((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const applyTemplate = useCallback(
    (id: string, templateIndex: number) => {
      const t = CRITERION_TEMPLATES[templateIndex];
      setCriteria((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                label: t.label,
                humanRule: t.humanRule,
                validatorTest: t.validatorTest,
                failureBoundary: t.failureBoundary,
              }
            : c
        )
      );
    },
    []
  );

  const totalWeight = criteria.reduce((sum, c) => sum + c.weightBps, 0);
  const hasMandatory = criteria.some((c) => c.mandatory);

  const handleSubmit = async () => {
    if (!address) {
      await connect();
      return;
    }

    const criteriaJson = JSON.stringify(
      criteria.map((c) => ({
        label: c.label,
        human_rule: c.humanRule,
        validator_test: c.validatorTest,
        failure_boundary: c.failureBoundary,
        weight_bps: c.weightBps,
        is_mandatory: c.mandatory,
      }))
    );

    const valueWei = BigInt(
      Math.floor(parseFloat(amountGen) * 1_000_000_000_000_000_000)
    );

    const acceptByTs = Math.floor(new Date(acceptBy).getTime() / 1000);
    const deliverByTs = Math.floor(new Date(deliverBy).getTime() / 1000);

    try {
      const result = await execute(() =>
        writeCreateAgreement(
          address,
          {
            fulfillerAddress: workerMode === "specific" ? workerAddress : "",
            title,
            brief,
            acceptBy: acceptByTs,
            deliverBy: deliverByTs,
            evidencePolicy,
            criteriaJson,
            passThresholdBps: 8000,
          },
          valueWei
        )
      );
      if (result?.receipt) {
        setTimeout(() => router.push("/activity"), 2000);
      }
    } catch {
      // Error handled by tx state
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <MicroLabel className="block mb-2">Agreement Forge</MicroLabel>
        <h1 className="text-3xl font-display">Forge an agreement</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer ${
              i === step
                ? "bg-acid-500 text-ink-950 notch-tr font-bold"
                : i < step
                  ? "bg-petrol-600 text-bone-000 notch-tr"
                  : "text-ink-800 hover:text-ink-950"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main editing area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <NotchedPanel className="p-6" notch="tr">
                {step === 0 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-2">
                      Choose a template
                    </h2>
                    <p className="text-sm text-ink-800 mb-4">
                      Select a starting point. Every template uses the same
                      Consensus Agreement Primitive — only the prefilled criteria
                      differ.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {AGREEMENT_TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => applyAgreementTemplate(t.id)}
                          className={`text-left border-2 p-4 transition-colors cursor-pointer ${
                            selectedTemplate === t.id
                              ? "border-acid-500 bg-acid-500/5"
                              : "border-ink-800 hover:border-ink-950"
                          }`}
                        >
                          <span className="font-bold text-sm block mb-1">
                            {t.name}
                          </span>
                          <span className="text-xs text-ink-800 leading-relaxed">
                            {t.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-4">
                      Define the promise
                    </h2>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>Title</MicroLabel>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Responsive landing page"
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-body text-sm focus:outline-none focus:border-acid-500 notch-tr"
                        maxLength={120}
                      />
                      <span className="font-mono text-[10px] text-ink-800 mt-1 block">
                        {title.length}/120
                      </span>
                    </div>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>Brief</MicroLabel>
                      </label>
                      <textarea
                        value={brief}
                        onChange={(e) => setBrief(e.target.value)}
                        placeholder="Build a responsive one-page launch site containing the supplied logo, a hero section, three feature cards, a pricing section, and a working contact link."
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-body text-sm h-32 resize-none focus:outline-none focus:border-acid-500"
                        maxLength={1200}
                      />
                      <span className="font-mono text-[10px] text-ink-800 mt-1 block">
                        {brief.length}/1200
                      </span>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-4">
                      Set the parties
                    </h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setWorkerMode("open")}
                        className={`flex-1 px-4 py-3 border-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                          workerMode === "open"
                            ? "border-acid-500 bg-acid-500 text-ink-950"
                            : "border-ink-800 text-ink-800"
                        }`}
                      >
                        Open to any worker
                      </button>
                      <button
                        onClick={() => setWorkerMode("specific")}
                        className={`flex-1 px-4 py-3 border-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                          workerMode === "specific"
                            ? "border-acid-500 bg-acid-500 text-ink-950"
                            : "border-ink-800 text-ink-800"
                        }`}
                      >
                        Specific worker
                      </button>
                    </div>
                    {workerMode === "specific" && (
                      <div>
                        <label className="block mb-1">
                          <MicroLabel>Worker address</MicroLabel>
                        </label>
                        <input
                          type="text"
                          value={workerAddress}
                          onChange={(e) => setWorkerAddress(e.target.value)}
                          placeholder="0x..."
                          className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-acid-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-4">
                      Lock the value
                    </h2>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>Escrow amount (GEN)</MicroLabel>
                      </label>
                      <input
                        type="text"
                        value={amountGen}
                        onChange={(e) => setAmountGen(e.target.value)}
                        placeholder="1.5"
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-mono text-2xl focus:outline-none focus:border-acid-500 notch-tr"
                      />
                      <p className="font-mono text-[10px] text-ink-800 mt-2">
                        This amount will be held in escrow until the agreement
                        resolves.
                      </p>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-xl">
                        Acceptance criteria
                      </h2>
                      <span
                        className={`font-mono text-xs ${totalWeight === 10000 ? "text-petrol-600" : "text-ember-500"}`}
                      >
                        {totalWeight}/10000 bps
                      </span>
                    </div>

                    {criteria.map((c, i) => (
                      <div
                        key={c.id}
                        className="border-2 border-ink-950 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-ink-800">
                            Criterion {i + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) =>
                                applyTemplate(c.id, parseInt(e.target.value))
                              }
                              value=""
                              className="text-[10px] font-mono bg-bone-000 border border-ink-800 px-2 py-1"
                            >
                              <option value="" disabled>
                                Use template...
                              </option>
                              {CRITERION_TEMPLATES.map((t, ti) => (
                                <option key={ti} value={ti}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            {criteria.length > 1 && (
                              <button
                                onClick={() => removeCriterion(c.id)}
                                className="text-ember-500 text-xs font-mono cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={c.label}
                          onChange={(e) =>
                            updateCriterion(c.id, "label", e.target.value)
                          }
                          placeholder="Criterion label"
                          className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm focus:outline-none focus:border-acid-500"
                          maxLength={60}
                        />
                        <textarea
                          value={c.humanRule}
                          onChange={(e) =>
                            updateCriterion(c.id, "humanRule", e.target.value)
                          }
                          placeholder="Human meaning — what must be true"
                          className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:border-acid-500"
                          maxLength={280}
                        />
                        <textarea
                          value={c.validatorTest}
                          onChange={(e) =>
                            updateCriterion(
                              c.id,
                              "validatorTest",
                              e.target.value
                            )
                          }
                          placeholder="Validator test — precise instruction for AI evaluation"
                          className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:border-acid-500"
                          maxLength={700}
                        />
                        <textarea
                          value={c.failureBoundary}
                          onChange={(e) =>
                            updateCriterion(
                              c.id,
                              "failureBoundary",
                              e.target.value
                            )
                          }
                          placeholder="Failure boundary — what causes this to fail"
                          className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm h-16 resize-none focus:outline-none focus:border-acid-500"
                          maxLength={400}
                        />

                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <MicroLabel>Weight (bps)</MicroLabel>
                            <input
                              type="number"
                              value={c.weightBps}
                              onChange={(e) =>
                                updateCriterion(
                                  c.id,
                                  "weightBps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full bg-bone-000 border border-ink-800 px-3 py-2 text-sm font-mono focus:outline-none focus:border-acid-500 mt-1"
                              min={1}
                              max={10000}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-4">
                            <input
                              type="checkbox"
                              checked={c.mandatory}
                              onChange={(e) =>
                                updateCriterion(
                                  c.id,
                                  "mandatory",
                                  e.target.checked
                                )
                              }
                              className="accent-ember-500 w-4 h-4"
                            />
                            <MicroLabel>Mandatory</MicroLabel>
                          </label>
                        </div>
                      </div>
                    ))}

                    {criteria.length < 8 && (
                      <StampedButton
                        variant="ghost"
                        size="sm"
                        onClick={addCriterion}
                      >
                        + Add criterion
                      </StampedButton>
                    )}

                    {!hasMandatory && (
                      <p className="text-ember-500 font-mono text-xs">
                        At least one criterion must be mandatory.
                      </p>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-4">
                      Evidence policy
                    </h2>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>
                          How should the worker submit evidence?
                        </MicroLabel>
                      </label>
                      <textarea
                        value={evidencePolicy}
                        onChange={(e) => setEvidencePolicy(e.target.value)}
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-body text-sm h-32 resize-none focus:outline-none focus:border-acid-500"
                        maxLength={1200}
                      />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl mb-4">
                      Set deadlines
                    </h2>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>Accept by (UTC)</MicroLabel>
                      </label>
                      <input
                        type="datetime-local"
                        value={acceptBy}
                        onChange={(e) => setAcceptBy(e.target.value)}
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-acid-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">
                        <MicroLabel>Deliver by (UTC)</MicroLabel>
                      </label>
                      <input
                        type="datetime-local"
                        value={deliverBy}
                        onChange={(e) => setDeliverBy(e.target.value)}
                        className="w-full bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-acid-500"
                      />
                    </div>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-xl mb-4">
                      Seal & fund the agreement
                    </h2>

                    <NotchedPanel variant="ink" notch="both" className="p-5">
                      <div className="space-y-3 text-bone-000">
                        <div className="flex justify-between">
                          <MicroLabel className="!text-sand-400">
                            Title
                          </MicroLabel>
                          <span className="text-sm">{title || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <MicroLabel className="!text-sand-400">
                            Escrow
                          </MicroLabel>
                          <span className="font-mono text-acid-500">
                            {amountGen || "0"} GEN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <MicroLabel className="!text-sand-400">
                            Criteria
                          </MicroLabel>
                          <span className="text-sm">
                            {criteria.length} criteria
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <MicroLabel className="!text-sand-400">
                            Worker
                          </MicroLabel>
                          <span className="text-sm font-mono">
                            {workerMode === "open"
                              ? "Open"
                              : workerAddress.slice(0, 10) + "..."}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <MicroLabel className="!text-sand-400">
                            Weight total
                          </MicroLabel>
                          <span
                            className={`font-mono text-sm ${totalWeight === 10000 ? "text-petrol-600" : "text-ember-500"}`}
                          >
                            {totalWeight}/10000
                          </span>
                        </div>
                      </div>
                    </NotchedPanel>

                    <TransactionCapsule
                      phase={tx.phase}
                      hash={tx.hash}
                      error={tx.error}
                    />

                    {tx.phase === "idle" || tx.phase === "failed" ? (
                      <div className="space-y-3">
                        {tx.phase === "failed" && (
                          <StampedButton
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                          >
                            Reset
                          </StampedButton>
                        )}
                        <StampedButton
                          variant="acid"
                          size="lg"
                          onClick={handleSubmit}
                          disabled={
                            !title ||
                            !brief ||
                            !amountGen ||
                            !acceptBy ||
                            !deliverBy ||
                            totalWeight !== 10000 ||
                            !hasMandatory ||
                            criteria.some(
                              (c) =>
                                !c.label ||
                                !c.humanRule ||
                                !c.validatorTest ||
                                !c.failureBoundary
                            )
                          }
                          className="w-full"
                        >
                          {isConnected
                            ? "Fund agreement"
                            : "Connect & fund"}
                        </StampedButton>
                      </div>
                    ) : tx.phase === "accepted" ? (
                      <div className="text-center">
                        <p className="font-mono text-petrol-600 text-sm font-bold">
                          The goalposts are now sealed.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </NotchedPanel>
            </motion.div>
          </AnimatePresence>

          {/* Step navigation */}
          <div className="flex justify-between mt-6">
            <StampedButton
              variant="ghost"
              size="sm"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              Back
            </StampedButton>
            {step < 7 && (
              <StampedButton
                variant="ink"
                size="sm"
                onClick={() => setStep(step + 1)}
              >
                Next
              </StampedButton>
            )}
          </div>
        </div>

        {/* Right rail — live preview */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <NotchedPanel variant="bone" notch="bl" className="p-5">
              <MicroLabel className="block mb-3">Sealed preview</MicroLabel>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-mono text-[10px] text-ink-800 block">
                    TITLE
                  </span>
                  <span className="font-bold">{title || "—"}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-ink-800 block">
                    ESCROW
                  </span>
                  <span className="font-mono text-lg text-acid-500 bg-ink-950 px-2 py-0.5 inline-block">
                    {amountGen || "0"} GEN
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-ink-800 block mb-1">
                    CRITERIA ({criteria.length})
                  </span>
                  {criteria.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 text-xs py-0.5"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${c.mandatory ? "bg-ember-500" : "bg-sand-400"}`}
                      />
                      <span className="truncate">
                        {c.label || `Criterion ${i + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-ink-800 block">
                    WORKER
                  </span>
                  <span>
                    {workerMode === "open"
                      ? "Open"
                      : workerAddress || "Not set"}
                  </span>
                </div>
              </div>
            </NotchedPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
