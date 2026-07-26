export const CONSENSUS_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONSENSUS_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const NETWORK_CONFIG = {
  name: "studionet",
  chainId: parseInt(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"),
  rpcUrl:
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ||
    "https://studio.genlayer.com/api",
} as const;
