import { errorResponse } from "@/lib/http";
import { publicLink, refreshAttempt } from "@/lib/payments";
import { mapStatus } from "@/lib/status";
import { hashToken } from "@/lib/secrets";
import { getStore } from "@/lib/store";

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
        return { ...publicLink(l), receivedUsdc: paid?.amountOutFormatted ?? null, paidAttemptId: paid?.id ?? null, attempts: attempts.length };
      }),
    );
    const totalReceived = rows.reduce((s, r) => s + (r.receivedUsdc ? Number(r.receivedUsdc) : 0), 0);
    return Response.json({ links: rows, totalReceived: totalReceived.toFixed(2) });
  } catch (err) {
    return errorResponse(err);
  }
}
