import { errorResponse } from "@/lib/http";
import { agentInvoiceView } from "@/lib/payments";
import { getStore } from "@/lib/store";

function baseUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://payday-near.vercel.app";
}

/**
 * Agent-readable invoice JSON.
 * Docs: docs/agent-payments.md
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const store = getStore();
    const link = await store.getLink(id);
    if (!link) return Response.json({ error: "Invoice not found." }, { status: 404 });
    const attempts = await store.listAttemptsByLink(id);
    const body = agentInvoiceView(link, { baseUrl: baseUrl(req), latestAttempt: attempts[0] ?? null });
    return Response.json(body, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
