/**
 * Payout chains Payday supports. Each one was checked against the live
 * 1Click token list (GET /v0/tokens) and a dry quote (POST /v0/quote) on 2026-11-03.
 */
export type PayoutChainId = "base" | "arb" | "near" | "sol";

export interface PayoutChain {
  id: PayoutChainId;
  name: string;
  /** 1Click asset id of native USDC on this chain. */
  usdcAssetId: string;
  addressHint: string;
}

export const PAYOUT_CHAINS: Record<PayoutChainId, PayoutChain> = {
  base: {
    id: "base",
    name: "Base",
    usdcAssetId: "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
    addressHint: "0x… (42 characters)",
  },
  arb: {
    id: "arb",
    name: "Arbitrum",
    usdcAssetId: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
    addressHint: "0x… (42 characters)",
  },
  near: {
    id: "near",
    name: "NEAR",
    usdcAssetId: "nep141:17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
    addressHint: "name.near or 64-character hex account",
  },
  sol: {
    id: "sol",
    name: "Solana",
    usdcAssetId: "nep141:sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near",
    addressHint: "Base58 address (32–44 characters)",
  },
};

export const DEFAULT_PAYOUT_CHAIN: PayoutChainId = "base";
export const USDC_DECIMALS = 6;

export function isPayoutChainId(value: unknown): value is PayoutChainId {
  return typeof value === "string" && value in PAYOUT_CHAINS;
}

const EVM_CHAINS = new Set([
  "eth", "arb", "base", "op", "pol", "bsc", "avax", "gnosis", "monad",
  "xlayer", "abs", "scroll", "bera", "plasma", "hood", "adi",
]);

const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;
const NEAR_NAMED_RE = /^(?=.{2,64}$)(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
const NEAR_IMPLICIT_RE = /^[0-9a-f]{64}$/;

/**
 * Format check for an address on a 1Click `blockchain` id.
 * This only checks the format. It cannot prove that the address exists or that its owner controls it.
 */
export function isValidAddress(chain: string, address: string): boolean {
  const a = address.trim();
  if (!a || a.length > 128 || /\s/.test(a)) return false;
  if (EVM_CHAINS.has(chain)) return EVM_RE.test(a);
  switch (chain) {
    case "sol":
      return BASE58_RE.test(a) && a.length >= 32 && a.length <= 44;
    case "near":
      return NEAR_IMPLICIT_RE.test(a) || EVM_RE.test(a) || NEAR_NAMED_RE.test(a);
    case "tron":
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a);
    case "btc":
      return /^(bc1[02-9ac-hj-np-z]{11,71}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/.test(a);
    default:
      // Chains without a dedicated rule: require a plausible single token.
      return a.length >= 20;
  }
}
