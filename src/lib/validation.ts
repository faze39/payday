import { toBaseUnits } from "./amount";
import { DEFAULT_PAYOUT_CHAIN, PAYOUT_CHAINS, USDC_DECIMALS, isPayoutChainId, isValidAddress, type PayoutChainId } from "./chains";

export const MIN_USD = 1;
export const MAX_USD = 10_000;
export const MAX_EXPIRY_DAYS = 30;

export interface CreateLinkInput {
  recipientAddress: string;
  payoutChain: PayoutChainId;
  amountUsd: string;
  amountBaseUnits: string;
  description: string;
  clientRef: string;
  expiresInDays: number;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateCreateLink(body: unknown): ValidationResult<CreateLinkInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const payoutChain = b.payoutChain === undefined || b.payoutChain === "" ? DEFAULT_PAYOUT_CHAIN : b.payoutChain;
  if (!isPayoutChainId(payoutChain)) errors.payoutChain = "Choose a supported payout chain.";

  const recipientAddress = str(b.recipientAddress);
  if (!recipientAddress) errors.recipientAddress = "Enter the wallet address that should receive USDC.";
  else if (isPayoutChainId(payoutChain) && !isValidAddress(payoutChain, recipientAddress))
    errors.recipientAddress = `This doesn't look like a valid ${PAYOUT_CHAINS[payoutChain].name} address (${PAYOUT_CHAINS[payoutChain].addressHint}).`;

  const amountUsd = str(typeof b.amountUsd === "number" ? String(b.amountUsd) : b.amountUsd);
  let amountBaseUnits = "";
  if (!/^\d+(\.\d{1,2})?$/.test(amountUsd)) errors.amountUsd = "Enter an amount in US dollars, e.g. 25 or 25.50.";
  else {
    const n = Number(amountUsd);
    if (n < MIN_USD || n > MAX_USD) errors.amountUsd = `Amount must be between $${MIN_USD} and $${MAX_USD.toLocaleString()}.`;
    else amountBaseUnits = toBaseUnits(amountUsd, USDC_DECIMALS);
  }

  const description = str(b.description);
  if (!description) errors.description = "Describe what the payment is for.";
  else if (description.length > 280) errors.description = "Keep the description under 280 characters.";

  const clientRef = str(b.clientRef);
  if (clientRef.length > 80) errors.clientRef = "Keep the client reference under 80 characters.";

  const expiresInDays = b.expiresInDays === undefined || b.expiresInDays === "" ? 7 : Number(b.expiresInDays);
  if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > MAX_EXPIRY_DAYS)
    errors.expiresInDays = `Expiry must be 1–${MAX_EXPIRY_DAYS} days.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      recipientAddress,
      payoutChain: payoutChain as PayoutChainId,
      amountUsd,
      amountBaseUnits,
      description,
      clientRef,
      expiresInDays,
    },
  };
}
