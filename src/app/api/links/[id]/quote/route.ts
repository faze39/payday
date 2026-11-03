import { errorResponse } from "@/lib/http";
import { createAttempt } from "@/lib/payments";

/** Ask 1Click for a real quote (dry: false). The response includes a unique deposit address. */
export async function POST(req: Request, ctx: RouteContext<"/api/links/[id]/quote">) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) ?? {};
    const { attempt, quote } = await createAttempt(id, body);
    return Response.json({ attempt, fees: { refundFee: quote.refundFee, withdrawFee: quote.withdrawFee }, timeEstimate: quote.timeEstimate }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
