import { errorResponse } from "@/lib/http";
import { publicLink, refreshAttempt } from "@/lib/payments";

/** Poll target for the pay and receipt pages. Each call refreshes the status from 1Click /v0/status. */
export async function GET(_req: Request, ctx: RouteContext<"/api/attempts/[id]">) {
  try {
    const { id } = await ctx.params;
    const { attempt, link, phase } = await refreshAttempt(id);
    return Response.json({ attempt, phase, link: link ? publicLink(link) : null });
  } catch (err) {
    return errorResponse(err);
  }
}
