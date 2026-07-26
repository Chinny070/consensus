"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StampedButton } from "@/components/ui/StampedButton";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { MicroLabel } from "@/components/ui/MicroLabel";
import { useState } from "react";

const MORPH_STAGES = [
  { label: "BRIEF", text: "Build a responsive landing page with our logo..." },
  { label: "CRITERIA", text: "Hero section · Contact link · Mobile layout · Logo placement" },
  { label: "ESCROW", text: "1.5 GEN locked until consensus" },
  { label: "EVIDENCE", text: "https://client-site.example.com" },
  { label: "CONSENSUS", text: "SATISFIED — all mandatory criteria met" },
];

export default function LandingPage() {
  const [morphIndex, setMorphIndex] = useState(0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <MicroLabel className="block mb-4">
                Human promise → Machine-settled agreement
              </MicroLabel>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display leading-[0.95] mb-6">
                Make the goalposts
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-950 to-ink-800">
                  impossible to move.
                </span>
              </h1>
              <p className="text-lg text-ink-800 max-w-lg mb-10 leading-relaxed">
                Forge the work, lock the value, and let decentralized AI
                validators decide whether the promise was fulfilled.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/forge">
                  <StampedButton variant="acid" size="lg">
                    Forge an agreement
                  </StampedButton>
                </Link>
                <Link href="/activity">
                  <StampedButton variant="ghost" size="lg">
                    Enter an agreement ID
                  </StampedButton>
                </Link>
              </div>
            </div>

            {/* Morphing agreement card */}
            <div className="relative">
              <NotchedPanel
                variant="ink"
                notch="both"
                className="p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <MicroLabel className="!text-sand-400">
                    Agreement preview
                  </MicroLabel>
                  <div className="flex gap-1">
                    {MORPH_STAGES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMorphIndex(i)}
                        className={`w-2 h-2 transition-colors cursor-pointer ${
                          i === morphIndex ? "bg-acid-500" : "bg-ink-800"
                        }`}
                        aria-label={`Show ${MORPH_STAGES[i].label}`}
                      />
                    ))}
                  </div>
                </div>
                <motion.div
                  key={morphIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-mono text-acid-500 text-[10px] uppercase tracking-[0.2em] block mb-2">
                    {MORPH_STAGES[morphIndex].label}
                  </span>
                  <p className="text-bone-100 text-sm leading-relaxed font-mono">
                    {MORPH_STAGES[morphIndex].text}
                  </p>
                </motion.div>
                <div className="mt-8 pt-4 border-t border-ink-800">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-sand-400 uppercase tracking-wider">
                    <span>GenLayer StudioNet</span>
                    <span>·</span>
                    <span>Chain 61999</span>
                    <span>·</span>
                    <span className="text-petrol-600">Consensus v1</span>
                  </div>
                </div>
              </NotchedPanel>

              {/* Decorative contour */}
              <svg
                className="absolute -bottom-8 -right-8 w-32 h-32 text-bone-100 opacity-30 -z-10"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* The judgement gap */}
      <section className="border-t-2 border-ink-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MicroLabel className="block mb-4">The judgement gap</MicroLabel>
          <h2 className="text-3xl sm:text-4xl font-display mb-6">
            Code can move money.
            <br />
            It cannot judge creative work.
          </h2>
          <p className="text-ink-800 text-lg max-w-2xl leading-relaxed mb-12">
            Traditional contracts can verify that a timestamp passed or a payment
            arrived. They cannot decide whether a landing page matches a brief,
            or whether a design follows a reference. Consensus exists for that
            judgement gap.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Forge",
                desc: "Convert vague promises into explicit, testable acceptance criteria.",
              },
              {
                label: "Lock",
                desc: "Escrow funds on-chain. The goalposts are sealed.",
              },
              {
                label: "Decide",
                desc: "GenLayer validators evaluate evidence against the frozen rubric.",
              },
            ].map((step, i) => (
              <NotchedPanel key={i} className="p-5">
                <span className="font-mono text-[10px] text-ink-800 uppercase tracking-widest block mb-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl mb-2">{step.label}</h3>
                <p className="text-sm text-ink-800 leading-relaxed">
                  {step.desc}
                </p>
              </NotchedPanel>
            ))}
          </div>
        </div>
      </section>

      {/* Example criterion */}
      <section className="border-t-2 border-ink-950 py-20 bg-bone-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MicroLabel className="block mb-4">The Forge Lens</MicroLabel>
          <h2 className="text-3xl font-display mb-8">
            Every criterion, three views.
          </h2>

          <NotchedPanel variant="bone" notch="both" className="p-6 border-2 border-ink-950 bg-bone-000">
            <div className="space-y-4">
              <div>
                <MicroLabel>Human meaning</MicroLabel>
                <p className="mt-1 text-base">
                  &quot;The page must work on mobile.&quot;
                </p>
              </div>
              <div className="border-t border-ink-800/20 pt-4">
                <MicroLabel>Validator test</MicroLabel>
                <p className="mt-1 text-sm text-ink-800">
                  &quot;Inspect the submitted public URL at a mobile viewport. Confirm
                  that navigation, text, primary CTA, and major content sections
                  are usable without horizontal overflow.&quot;
                </p>
              </div>
              <div className="border-t border-ink-800/20 pt-4">
                <MicroLabel>Failure boundary</MicroLabel>
                <p className="mt-1 text-sm text-ember-500">
                  &quot;Fail only if a core section is clipped, inaccessible,
                  unreadable, or unusable at mobile width.&quot;
                </p>
              </div>
            </div>
          </NotchedPanel>
        </div>
      </section>

      {/* Why GenLayer */}
      <section className="border-t-2 border-ink-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MicroLabel className="block mb-4">Why GenLayer</MicroLabel>
          <h2 className="text-3xl font-display mb-8">
            Judgement requires more than logic gates.
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "AI-native contracts",
                desc: "Intelligent Contracts in GenVM natively access LLMs and the open web.",
              },
              {
                title: "Decentralized consensus",
                desc: "Multiple independent validators evaluate evidence and converge on a verdict.",
              },
              {
                title: "Equivalence principle",
                desc: "Non-deterministic outputs are normalized to deterministic outcomes through structured comparison.",
              },
              {
                title: "On-chain finality",
                desc: "Every verdict is permanently recorded: transparent, auditable, and immutable.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border-l-2 border-petrol-600 pl-4 py-1"
              >
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-ink-800">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t-2 border-ink-950 py-20 bg-ink-950 text-bone-000">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display mb-4">
            Ready to make a promise provable?
          </h2>
          <p className="text-bone-100/80 mb-8 max-w-lg mx-auto">
            Define the work. Lock the value. Let consensus decide.
          </p>
          <Link href="/forge">
            <StampedButton variant="acid" size="lg">
              Forge an agreement
            </StampedButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
