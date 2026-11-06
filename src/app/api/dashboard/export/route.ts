import { errorResponse } from "@/lib/http";
import { refreshAttempt } from "@/lib/payments";
import { mapStatus } from "@/lib/status";
import { hashToken } from "@/lib/secrets";
import { getStore } from "@/lib/store";
import { buildDashboardCsv } from "@/lib/csv";

/** CSV download of the owner's links and attempts (Authorization: Bearer dashboard key). */
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
        const latest = attempts[0];
        if (!l.paidAt && latest && !mapStatus(latest.status).terminal) {
          const fresh = await refreshAttempt(latest.id, store).catch(() => null);
          if (fresh) {
            attempts = [fresh.attempt, ...attempts.slice(1)];
            if (fresh.link) l = fresh.link;
          }
        }
        return { link: l, attempts };
      }),
    );
    const csv = buildDashboardCsv(rows);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payday-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
