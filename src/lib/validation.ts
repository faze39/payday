import { toBaseUnits } from "./amount";
import { DEFAULT_PAYOUT_CHAIN, PAYOUT_CHAINS, USDC_DECIMALS, isPayoutChainId, isValidAddress, type PayoutChainId } from "./chains";
import { formatUsd, sumLineItemsUsd, type LineItem } from "./line-items";

export const MIN_USD = 1;
export const MAX_USD = 10_000;
export const MAX_EXPIRY_DAYS = 30;
export const MAX_LINE_ITEMS = 20;

export interface CreateLinkInput {
  recipientAddress: string;
  payoutChain: PayoutChainId;
  amountUsd: string;
  amountBaseUnits: string;
  description: string;
  clientRef: string;
  expiresInDays: number;
  lineItems: LineItem[];
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function parseLineItems(raw: unknown): { items: LineItem[]; error?: string } {
  if (raw === undefined || raw === null || raw === "") return { items: [] };
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return { items: [], error: "Line items must be valid JSON." };
    }
  }
  if (!Array.isArray(arr)) return { items: [], error: "Line items must be a list." };
  if (arr.length > MAX_LINE_ITEMS) return { items: [], error: `At most ${MAX_LINE_ITEMS} line items.` };
  const items: LineItem[] = [];
  for (let i = 0; i < arr.length; i++) {
    const row = (arr[i] ?? {}) as Record<string, unknown>;
    const description = str(row.description);
    const qty = typeof row.qty === "number" ? row.qty : Number(str(row.qty));
    const unitAmountUsd = str(typeof row.unitAmountUsd === "number" ? String(row.unitAmountUsd) : row.unitAmountUsd);
    if (!description) return { items: [], error: `Line ${i + 1}: enter a description.` };
    if (description.length > 120) return { items: [], error: `Line ${i + 1}: keep the description under 120 characters.` };
    if (!Number.isInteger(qty) || qty < 1 || qty > 9999) return { items: [], error: `Line ${i + 1}: quantity must be a whole number from 1 to 9999.` };
    if (!/^\d+(\.\d{1,2})?$/.test(unitAmountUsd) || Number(unitAmountUsd) <= 0)
      return { items: [], error: `Line ${i + 1}: enter a unit amount in US dollars, e.g. 25 or 25.50.` };
    items.push({ description, qty, unitAmountUsd });
  }
  return { items };
}

export function validateCreateLink(body: unknown): ValidationResult<CreateLinkInput> {
  const b = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const payoutChain = b.payoutChain === undefined || b.payoutChain === "" ? DEFAULT_PAYOUT_CHAIN : b.payoutChain;
  if (!isPayoutChainId(payoutChain)) errors.payoutChain = "Choose a supported payout chain.";

  const recipientAddress = str(b.recipientAddress);
  if (!recipientAddress) errors.recipientAddress = "Enter the wallet address that should receive USDC.";
  else if (isPayoutChainId(payoutChain) && !isValidAddress(payoutChain, recipientAddress))
    errors.recipientAddress = `This doesn't look like a valid ${PAYOUT_CHAINS[payoutChain].name} address (${PAYOUT_CHAINS[payoutChain].addressHint}).`;

  const parsedLines = parseLineItems(b.lineItems);
  if (parsedLines.error) errors.lineItems = parsedLines.error;
  const lineItems = parsedLines.items;

  let amountUsd = str(typeof b.amountUsd === "number" ? String(b.amountUsd) : b.amountUsd);
  // When line items are present and amount is blank, auto-sum them.
  if (!amountUsd && lineItems.length > 0) amountUsd = formatUsd(sumLineItemsUsd(lineItems));

  let amountBaseUnits = "";
  if (!/^\d+(\.\d{1,2})?$/.test(amountUsd)) errors.amountUsd = "Enter an amount in US dollars, e.g. 25 or 25.50.";
  else {
    const n = Number(amountUsd);
    if (n < MIN_USD || n > MAX_USD) errors.amountUsd = `Amount must be between $${MIN_USD} and $${MAX_USD.toLocaleString()}.`;
    else {
      amountBaseUnits = toBaseUnits(amountUsd, USDC_DECIMALS);
      if (lineItems.length > 0) {
        const sum = sumLineItemsUsd(lineItems);
        if (Math.abs(sum - n) > 0.009) {
          errors.lineItems = `Line items sum to $${formatUsd(sum)}, but the invoice amount is $${amountUsd}. Make them match, or clear the amount to auto-sum.`;
        }
      }
    }
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
      lineItems,
    },
  };
}
