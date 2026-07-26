"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isMetaMaskInstalled,
  requestAccounts,
  getAccounts,
  getCurrentChainId,
  isCorrectChain,
  switchToStudioNet,
  GENLAYER_CHAIN_ID,
} from "@/lib/genlayer/client";

interface WalletState {
  address: `0x${string}` | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isInstalled: boolean;
  isConnecting: boolean;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const DISCONNECT_KEY = "consensus_wallet_disconnected";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false,
    isInstalled: false,
    isConnecting: false,
  });

  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setState((s) => ({ ...s, isInstalled: false }));
      return;
    }
    setState((s) => ({ ...s, isInstalled: true }));

    if (localStorage.getItem(DISCONNECT_KEY) === "true") return;

    try {
      const accounts = await getAccounts();
      if (accounts.length > 0) {
        const chainId = await getCurrentChainId();
        setState((s) => ({
          ...s,
          address: accounts[0] as `0x${string}`,
          isConnected: true,
          isCorrectNetwork: isCorrectChain(chainId),
        }));
      }
    } catch {
      // Silent fail on auto-reconnect
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setState((s) => ({
          ...s,
          address: null,
          isConnected: false,
        }));
      } else {
        setState((s) => ({
          ...s,
          address: accounts[0] as `0x${string}`,
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      setState((s) => ({
        ...s,
        isCorrectNetwork: parseInt(chainId, 16) === GENLAYER_CHAIN_ID,
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, isConnecting: true }));
    try {
      const accounts = await requestAccounts();
      localStorage.removeItem(DISCONNECT_KEY);
      const chainId = await getCurrentChainId();
      if (!isCorrectChain(chainId)) {
        await switchToStudioNet();
      }
      const updatedChainId = await getCurrentChainId();
      setState((s) => ({
        ...s,
        address: accounts[0] as `0x${string}`,
        isConnected: true,
        isCorrectNetwork: isCorrectChain(updatedChainId),
        isConnecting: false,
      }));
    } catch {
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.setItem(DISCONNECT_KEY, "true");
    setState((s) => ({
      ...s,
      address: null,
      isConnected: false,
    }));
  }, []);

  const switchNetwork = useCallback(async () => {
    try {
      await switchToStudioNet();
      const chainId = await getCurrentChainId();
      setState((s) => ({
        ...s,
        isCorrectNetwork: isCorrectChain(chainId),
      }));
    } catch {
      // User rejected
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ ...state, connect, disconnect, switchNetwork }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}
