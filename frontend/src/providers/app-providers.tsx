"use client";

import { WalletProvider } from "@/hooks/use-wallet";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
