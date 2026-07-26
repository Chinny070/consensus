export type TxPhase =
  | "idle"
  | "preparing"
  | "awaiting_signature"
  | "submitted"
  | "pending"
  | "accepted"
  | "finalized"
  | "failed";

export interface TxState {
  hash: string | null;
  phase: TxPhase;
  error: string | null;
  receipt: unknown | null;
  submittedAt: number | null;
  lastCheckedAt: number | null;
}

export const INITIAL_TX_STATE: TxState = {
  hash: null,
  phase: "idle",
  error: null,
  receipt: null,
  submittedAt: null,
  lastCheckedAt: null,
};
