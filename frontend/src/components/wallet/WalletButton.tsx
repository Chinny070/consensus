"use client";

import { useWallet } from "@/hooks/use-wallet";
import { StampedButton } from "@/components/ui/StampedButton";

export function WalletButton() {
  const { address, isConnected, isCorrectNetwork, isInstalled, isConnecting, connect, disconnect, switchNetwork } =
    useWallet();

  if (!isInstalled) {
    return (
      <StampedButton variant="ghost" size="sm" disabled>
        Wallet unavailable
      </StampedButton>
    );
  }

  if (!isConnected) {
    return (
      <StampedButton
        variant="acid"
        size="sm"
        onClick={connect}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect instrument"}
      </StampedButton>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <StampedButton variant="ember" size="sm" onClick={switchNetwork}>
        Switch to StudioNet
      </StampedButton>
    );
  }

  return (
    <button
      onClick={disconnect}
      className="font-mono text-[11px] tracking-wider text-ink-800 hover:text-ink-950 px-3 py-1.5 border border-ink-800 notch-tr bg-bone-000 transition-colors cursor-pointer"
      title="Disconnect"
    >
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </button>
  );
}
