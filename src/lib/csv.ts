import { mapStatus } from "./status";
import { txExplorerUrl } from "./explorer";
import type { PaymentAttempt, PaymentLink } from "./store/types";
import { PAYOUT_CHAINS } from "./chains";
import { linkStatus } from "./status";

export interface CsvRowInput {
  link: PaymentLink;
  attempts: PaymentAttempt[];
}

function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function firstExplorer(txs: { hash: string; explorerUrl: string }[], chain: string | undefined): string {
  const t = txs[0];
  if (!t) return "";
  return txExplorerUrl(chain, t.hash, t.explorerUrl) ?? t.hash;
}

/** Column headers for the dashboard export. */
export const CSV_HEADERS = [
  "link_id",
  "description",
  "client_ref",
  "amount_usd",
  "payout_chain",
  "recipient",
  "link_status",
  "created_at",
  "paid_at",
  "attempt_id",
  "attempt_status",
  "attempt_phase",
  "attempt_label",
  "origin_symbol",
  "origin_chain",
  "amount_in",
  "amount_out_usdc",
  "deposit_tx_url",
  "delivery_tx_url",
  "refund_reason",
  "refunded_amount",
] as const;

/**
 * Build a CSV of the owner's links and their payment attempts.
 * Attempt status values are the raw 1Click statuses (SUCCESS, REFUNDED, …).
 * Phase/label come from mapStatus.
 */
export function buildDashboardCsv(rows: CsvRowInput[], now = new Date()): string {
  const lines: string[] = [CSV_HEADERS.join(",")];
  for (const { link, attempts } of rows) {
    const chainName = PAYOUT_CHAINS[link.payoutChain]?.name ?? link.payoutChain;
    const lStatus = linkStatus(link, now);
    if (attempts.length === 0) {
      lines.push(
        [
          link.id,
          link.description,
          link.clientRef,
          link.amountUsd,
          chainName,
          link.recipientAddress,
          lStatus,
          link.createdAt,
          link.paidAt ?? "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]
          .map((c) => csvEscape(String(c)))
          .join(","),
      );
      continue;
    }
    for (const a of attempts) {
      const phase = mapStatus(a.status);
      lines.push(
        [
          link.id,
          link.description,
          link.clientRef,
          link.amountUsd,
          chainName,
          link.recipientAddress,
          lStatus,
          link.createdAt,
          link.paidAt ?? "",
          a.id,
          a.status,
          phase.phase,
          phase.label,
          a.originSymbol,
          a.originChain,
          a.amountInFormatted,
          a.amountOutFormatted ?? "",
          firstExplorer(a.originTxs, a.originChain),
          firstExplorer(a.destinationTxs, link.payoutChain),
          a.refundReason ?? "",
          a.refundedAmountFormatted ?? "",
        ]
          .map((c) => csvEscape(String(c)))
          .join(","),
      );
    }
  }
  return lines.join("\n") + "\n";
}
