import { errorResponse } from "@/lib/http";
import { publicLink, refreshAttempt } from "@/lib/payments";
import { mapStatus } from "@/lib/status";
import { hashToken } from "@/lib/secrets";
import { getStore } from "@/lib/store";
import { txExplorerUrl } from "@/lib/explorer";
import type { DashboardAttemptSummary } from "@/lib/client-types";

function summarizeAttempt(a: {
  id: string;
  status: string;
  originSymbol: string;
  originChain: string;
  amountInFormatted: string;
  amountOutFormatted: string | null;
  originTxs: { hash: string; explorerUrl: string }[];
  destinationTxs: { hash: string; explorerUrl: string }[];
  refundReason: string | null;
  updatedAt: string;
}, payoutChain: string): DashboardAttemptSummary {
  const phase = mapStatus(a.status);
  const o = a.originTxs[0];
  const d = a.destinationTxs[0];
  return {
    id: a.id,
    status: a.status,
    phase: phase.phase,
    label: phase.label,
    originSymbol: a.originSymbol,
    originChain: a.originChain,
    amountInFormatted: a.amountInFormatted,
    amountOutFormatted: a.amountOutFormatted,
    depositTxUrl: o ? txExplorerUrl(a.originChain, o.hash, o.explorerUrl) : null,
    deliveryTxUrl: d ? txExplorerUrl(payoutChain, d.hash, d.explorerUrl) : null,
    refundReason: a.refundReason,
    updatedAt: a.updatedAt,
  };
}

/** The dashboard token comes in the Authorization header, so it never appears in server URLs or logs. */
export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    if (token.length < 20) return Response.json({ error: "Missing or invalid dashboard key." }, { status: 401 });
    const store = getStore();
    const links = await store.listLinksByOwner(hashToken(token));
    const rows = await Promise.all(
      links.map(async (link) => {
        let l = link;
        let attempts = await store.listAttemptsByLink(l.id);
        // Refresh the latest unfinished attempt so the dashboard is up to date without a cron job.
        const latest = attempts[0];
        if (!l.paidAt && latest && !mapStatus(latest.status).terminal) {
          const fresh = await refreshAttempt(latest.id, store).catch(() => null);
          if (fresh) {
            attempts = [fresh.attempt, ...attempts.slice(1)];
            if (fresh.link) l = fresh.link;
          }
        }
        const paid = attempts.find((a) => a.status === "SUCCESS");
        const latestSummary = attempts[0] ? summarizeAttempt(attempts[0], l.payoutChain) : null;
        return {
          ...publicLink(l),
          receivedUsdc: paid?.amountOutFormatted ?? null,
          paidAttemptId: paid?.id ?? null,
          attempts: attempts.length,
          latestAttempt: latestSummary,
        };
      }),
    );
    const totalReceived = rows.reduce((s, r) => s + (r.receivedUsdc ? Number(r.receivedUsdc) : 0), 0);
    return Response.json({ links: rows, totalReceived: totalReceived.toFixed(2) });
  } catch (err) {
    return errorResponse(err);
  }
}
