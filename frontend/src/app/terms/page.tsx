"use client";

import { MicroLabel } from "@/components/ui/MicroLabel";
import { NotchedPanel } from "@/components/ui/NotchedPanel";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <MicroLabel className="block mb-2">Legal</MicroLabel>
      <h1 className="text-3xl font-display mb-8">
        Demo limitations & safety
      </h1>

      <div className="space-y-6 text-sm text-ink-800 leading-relaxed">
        <NotchedPanel className="p-5" notch="tr">
          <h2 className="font-bold text-ink-950 mb-2">Demo only</h2>
          <p>
            This application is a hackathon demonstration running on GenLayer
            StudioNet. It is not a production service. Do not use real
            funds or rely on it for actual work agreements.
          </p>
        </NotchedPanel>

        <NotchedPanel className="p-5" notch="tr">
          <h2 className="font-bold text-ink-950 mb-2">No guarantees</h2>
          <p>
            Consensus uses AI validators to adjudicate work delivery. AI
            judgement is probabilistic, not guaranteed. Outcomes may vary
            between runs. The protocol provides INCONCLUSIVE as an explicit
            outcome when evidence is insufficient.
          </p>
        </NotchedPanel>

        <NotchedPanel className="p-5" notch="tr">
          <h2 className="font-bold text-ink-950 mb-2">No backend</h2>
          <p>
            All agreement state lives on-chain. There is no centralized
            database, no admin override, and no support team. If you lose
            access to your wallet, you lose access to your agreements.
          </p>
        </NotchedPanel>

        <NotchedPanel className="p-5" notch="tr">
          <h2 className="font-bold text-ink-950 mb-2">Evidence requirements</h2>
          <p>
            Evidence must be publicly accessible via HTTPS URLs. Private
            files, password-protected pages, and local files cannot be
            verified by validators.
          </p>
        </NotchedPanel>

        <NotchedPanel className="p-5" notch="tr">
          <h2 className="font-bold text-ink-950 mb-2">
            Transaction finality
          </h2>
          <p>
            GenLayer transactions progress through submitted → pending →
            accepted → finalized. Accepted is provisional. Only finalized
            transactions are permanent. The UI distinguishes these states.
          </p>
        </NotchedPanel>
      </div>
    </div>
  );
}
