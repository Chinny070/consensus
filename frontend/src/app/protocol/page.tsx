"use client";

import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { MicroLabel } from "@/components/ui/MicroLabel";
import Link from "next/link";
import { StampedButton } from "@/components/ui/StampedButton";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONSENSUS_CONTRACT_ADDRESS;

const LIFECYCLE_STEPS = [
  {
    step: "01",
    method: "createAgreement",
    title: "Create & fund",
    desc: "Creator defines the agreement: title, statement, acceptance criteria with validator tests and failure boundaries, evidence policy, decision threshold, deadlines, and escrow amount.",
  },
  {
    step: "02",
    method: "acceptAgreement",
    title: "Accept",
    desc: "Fulfiller reviews the frozen terms and accepts the agreement. Criteria become immutable.",
  },
  {
    step: "03",
    method: "submitEvidence",
    title: "Submit evidence",
    desc: "Fulfiller submits evidence — public URLs, documents, or repository links — mapped to each criterion before the deadline.",
  },
  {
    step: "04",
    method: "approveDirectly",
    title: "Approve or adjudicate",
    desc: "Creator approves directly, or either eligible party triggers GenLayer adjudication via requestAdjudication.",
  },
  {
    step: "05",
    method: "requestAdjudication",
    title: "Consensus",
    desc: "A leader proposes a verdict; independent validators evaluate equivalence. The contract deterministically computes the outcome from PASS/FAIL/UNKNOWN per criterion.",
  },
  {
    step: "06",
    method: "claimFulfillerPayout / claimCreatorRefund",
    title: "Finalize",
    desc: "The verdict — SATISFIED, NOT SATISFIED, or INCONCLUSIVE — is stored permanently. The correct party claims the escrowed value.",
  },
];

const VIEW_METHODS = [
  { name: "get_agreement(agreement_id)", desc: "Full agreement state" },
  { name: "get_criteria(agreement_id)", desc: "Acceptance criteria array" },
  { name: "get_submission(agreement_id)", desc: "Evidence submission" },
  { name: "get_verdict(agreement_id)", desc: "Adjudication verdict" },
  { name: "get_status(agreement_id)", desc: "Status code and label" },
  { name: "get_agreement_ids_for(address)", desc: "IDs by creator/fulfiller" },
  { name: "get_claimable(agreement_id, address)", desc: "Claim eligibility" },
  { name: "get_protocol_config()", desc: "Policy version, limits, threshold" },
];

const WRITE_METHODS = [
  { name: "create_agreement(...)", desc: "Create and fund (payable)" },
  { name: "accept_agreement(id)", desc: "Accept frozen terms" },
  { name: "submit_evidence(id, ...)", desc: "Submit evidence manifest" },
  { name: "approve_directly(id)", desc: "Creator approves without adjudication" },
  { name: "request_adjudication(id)", desc: "Trigger GenLayer consensus" },
  { name: "claim_fulfiller_payout(id)", desc: "Fulfiller claims escrow" },
  { name: "claim_creator_refund(id)", desc: "Creator claims refund" },
  { name: "expire_agreement(id)", desc: "Expire past deadline" },
  { name: "cancel_agreement(id)", desc: "Cancel before acceptance" },
];

export default function ProtocolPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <MicroLabel className="block mb-2">Protocol & developers</MicroLabel>
      <h1 className="text-3xl sm:text-4xl font-display mb-4">
        The Consensus Agreement Primitive
      </h1>
      <p className="text-ink-800 text-lg mb-4 max-w-2xl">
        Consensus is a reusable Intelligent Contract primitive for
        AI-verifiable agreements on GenLayer.
      </p>
      <p className="text-ink-800 mb-12 max-w-2xl">
        <strong>Consensus Freelance</strong> is the first polished application
        built on this primitive. The same contract can power research bounties,
        DAO milestones, creator agreements, AI-agent tasks, and any scenario
        where two parties need a machine-verifiable commitment.
      </p>

      {/* Lifecycle */}
      <MicroLabel className="block mb-4">Agreement lifecycle</MicroLabel>
      <div className="space-y-4 mb-16">
        {LIFECYCLE_STEPS.map((s) => (
          <div key={s.step} className="flex gap-4">
            <div className="shrink-0 w-12 h-12 bg-ink-950 text-acid-500 flex items-center justify-center font-mono text-sm font-bold notch-tr">
              {s.step}
            </div>
            <NotchedPanel className="flex-1 p-4" notch="tr">
              <h3 className="font-display text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-ink-800 leading-relaxed">{s.desc}</p>
              <p className="font-mono text-[10px] text-petrol-600 mt-1">
                {s.method}
              </p>
            </NotchedPanel>
          </div>
        ))}
      </div>

      {/* Key principles */}
      <MicroLabel className="block mb-4">Key principles</MicroLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {[
          {
            title: "Frozen criteria",
            desc: "Once a fulfiller accepts, the acceptance criteria cannot change. No moving goalposts.",
          },
          {
            title: "Three outcomes",
            desc: "SATISFIED, NOT SATISFIED, or INCONCLUSIVE. Validators never fabricate certainty.",
          },
          {
            title: "Deterministic aggregation",
            desc: "LLM output is narrowed to PASS/FAIL/UNKNOWN per criterion. The contract computes the final outcome deterministically using the agreement threshold.",
          },
          {
            title: "Evidence safety",
            desc: "All fetched evidence is treated as untrusted data. Embedded instructions are ignored.",
          },
        ].map((p, i) => (
          <NotchedPanel key={i} className="p-4" notch="bl">
            <h3 className="font-bold text-sm mb-1">{p.title}</h3>
            <p className="text-xs text-ink-800">{p.desc}</p>
          </NotchedPanel>
        ))}
      </div>

      {/* Contract API */}
      <MicroLabel className="block mb-4">Contract API</MicroLabel>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <NotchedPanel className="p-4" notch="tr">
          <MicroLabel className="block mb-3">View methods (read-only)</MicroLabel>
          <div className="space-y-1.5">
            {VIEW_METHODS.map((m) => (
              <div key={m.name} className="text-xs">
                <code className="font-mono text-petrol-600">{m.name}</code>
                <span className="text-ink-800 ml-1">— {m.desc}</span>
              </div>
            ))}
          </div>
        </NotchedPanel>
        <NotchedPanel className="p-4" notch="tr">
          <MicroLabel className="block mb-3">Write methods (state-changing)</MicroLabel>
          <div className="space-y-1.5">
            {WRITE_METHODS.map((m) => (
              <div key={m.name} className="text-xs">
                <code className="font-mono text-acid-500">{m.name}</code>
                <span className="text-ink-800 ml-1">— {m.desc}</span>
              </div>
            ))}
          </div>
        </NotchedPanel>
      </div>

      {/* Transaction finality */}
      <MicroLabel className="block mb-4">Transaction finality</MicroLabel>
      <NotchedPanel className="p-5 mb-12" notch="tr">
        <div className="space-y-3 text-sm text-ink-800">
          <p>
            GenLayer transactions progress through several states:
            <strong> PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED</strong>.
          </p>
          <p>
            <strong>ACCEPTED</strong> means the transaction was validated by
            consensus and is committed to the chain. Most read operations
            reflect ACCEPTED state.
          </p>
          <p>
            <strong>FINALIZED</strong> means the transaction has passed the
            finality window and cannot be reverted. Value transfers (payouts
            and refunds) execute on finalization.
          </p>
          <p>
            The frontend distinguishes these states so users know whether
            their transaction is still pending consensus or fully settled.
          </p>
        </div>
      </NotchedPanel>

      {/* Network */}
      <NotchedPanel variant="ink" className="p-6 mb-8" notch="both">
        <MicroLabel className="block mb-3 !text-sand-400">Network</MicroLabel>
        <div className="grid grid-cols-2 gap-4 text-bone-000 font-mono text-sm">
          <div>
            <span className="text-[10px] text-sand-400 block">CHAIN</span>
            GenLayer StudioNet
          </div>
          <div>
            <span className="text-[10px] text-sand-400 block">CHAIN ID</span>
            61999
          </div>
          <div>
            <span className="text-[10px] text-sand-400 block">RPC</span>
            studio.genlayer.com/api
          </div>
          <div>
            <span className="text-[10px] text-sand-400 block">POLICY</span>
            consensus-v1
          </div>
          {CONTRACT_ADDRESS && (
            <div className="col-span-2">
              <span className="text-[10px] text-sand-400 block">CONTRACT</span>
              <span className="break-all">{CONTRACT_ADDRESS}</span>
            </div>
          )}
        </div>
      </NotchedPanel>

      <div className="text-center">
        <Link href="/forge">
          <StampedButton variant="acid" size="lg">
            Forge an agreement
          </StampedButton>
        </Link>
      </div>
    </div>
  );
}
