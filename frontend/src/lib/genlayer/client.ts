import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const GENLAYER_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"
);
export const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16)}`;
export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export function createReadClient() {
  return createClient({ chain: studionet });
}

export function createWriteClient(address: `0x${string}`) {
  return createClient({
    chain: studionet,
    account: address,
  });
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function requestAccounts(): Promise<string[]> {
  if (!window.ethereum) throw new Error("No wallet detected");
  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  return accounts;
}

export async function getAccounts(): Promise<string[]> {
  if (!window.ethereum) return [];
  const accounts = (await window.ethereum.request({
    method: "eth_accounts",
  })) as string[];
  return accounts;
}

export async function getCurrentChainId(): Promise<string> {
  if (!window.ethereum) throw new Error("No wallet detected");
  return (await window.ethereum.request({ method: "eth_chainId" })) as string;
}

export function isCorrectChain(chainId: string): boolean {
  return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}

export async function switchToStudioNet(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet detected");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
  } catch (error: unknown) {
    const switchError = error as { code?: number };
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: GENLAYER_CHAIN_ID_HEX,
            chainName: "GenLayer StudioNet",
            rpcUrls: [GENLAYER_RPC_URL],
            nativeCurrency: {
              name: "GEN",
              symbol: "GEN",
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw error;
    }
  }
}
