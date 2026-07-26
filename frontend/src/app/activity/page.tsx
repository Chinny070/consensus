"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { readAgreementIdsFor, readAgreement } from "@/lib/genlayer/contract";
import { NotchedPanel } from "@/components/ui/NotchedPanel";
import { StampedButton } from "@/components/ui/StampedButton";
import { SignalCapsule } from "@/components/ui/SignalCapsule";
import { MicroLabel } from "@/components/ui/MicroLabel";
import type { Agreement, StatusCode } from "@/types/agreement";

type Tab = "client" | "worker";

export default function ActivityPage() {
  const { address, isConnected, connect } = useWallet();
  const [tab, setTab] = useState<Tab>("client");
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [lookupError, setLookupError] = useState("");

  const loadAgreements = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const ids = await readAgreementIdsFor(address);
      const targetIds = tab === "client" ? ids.as_creator : ids.as_fulfiller;
      const loaded = await Promise.all(
        targetIds.map((id) => readAgreement(id))
      );
      setAgreements(loaded);
    } catch {
      setAgreements([]);
    }
    setLoading(false);
  }, [address, tab]);

  useEffect(() => {
    loadAgreements();
  }, [loadAgreements]);

  const handleLookup = () => {
    const id = parseInt(lookupId);
    if (isNaN(id) || id < 1) {
      setLookupError("Enter a valid agreement ID");
      return;
    }
    setLookupError("");
    window.location.href = `/agreement/${id}`;
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Activity</h1>
        <p className="text-ink-800 mb-6">
          Connect your wallet to see your agreements.
        </p>
        <StampedButton variant="acid" onClick={connect}>
          Connect instrument
        </StampedButton>

        <div className="mt-12 max-w-md mx-auto">
          <MicroLabel className="block mb-2">Or look up an agreement</MicroLabel>
          <div className="flex gap-2">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Agreement ID"
              className="flex-1 bg-bone-000 border-2 border-ink-950 px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-acid-500"
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <StampedButton variant="ink" onClick={handleLookup}>
              View
            </StampedButton>
          </div>
          {lookupError && (
            <p className="text-ember-500 font-mono text-xs mt-1">
              {lookupError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <MicroLabel className="block mb-1">Your agreements</MicroLabel>
          <h1 className="text-2xl font-display">Activity</h1>
        </div>
        <Link href="/forge">
          <StampedButton variant="acid" size="sm">
            Forge new
          </StampedButton>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(["client", "worker"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              tab === t
                ? "bg-ink-950 text-bone-000 notch-tr"
                : "text-ink-800 hover:text-ink-950"
            }`}
          >
            As {t}
          </button>
        ))}
      </div>

      {/* Lookup */}
      <div className="mb-6">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="Look up by ID"
            className="flex-1 bg-bone-000 border border-ink-800 px-3 py-2 font-mono text-sm focus:outline-none focus:border-acid-500"
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <StampedButton variant="ghost" size="sm" onClick={handleLookup}>
            Go
          </StampedButton>
        </div>
        {lookupError && (
          <p className="text-ember-500 font-mono text-xs mt-1">
            {lookupError}
          </p>
        )}
      </div>

      {/* Agreements list */}
      {loading ? (
        <div className="animate-pulse font-mono text-ink-800 text-center py-12">
          Loading agreements...
        </div>
      ) : agreements.length === 0 ? (
        <NotchedPanel className="p-8 text-center" notch="both">
          <p className="text-ink-800 mb-4">
            No agreements found as {tab}.
          </p>
          <Link href="/forge">
            <StampedButton variant="acid" size="sm">
              Create your first
            </StampedButton>
          </Link>
        </NotchedPanel>
      ) : (
        <div className="space-y-3">
          {agreements.map((a) => (
            <Link key={a.id} href={`/agreement/${a.id}`}>
              <NotchedPanel
                className="p-4 hover:border-acid-500 transition-colors cursor-pointer"
                notch="tr"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-800">
                      #{a.id}
                    </span>
                    <h3 className="font-bold text-sm">{a.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-acid-500 bg-ink-950 px-2 py-0.5">
                      {(a.amount_wei / 1e18).toFixed(2)} GEN
                    </span>
                    <SignalCapsule
                      status={a.status as StatusCode}
                      label={a.status_label}
                    />
                  </div>
                </div>
              </NotchedPanel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
