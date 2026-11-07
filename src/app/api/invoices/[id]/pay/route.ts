import { errorResponse } from "@/lib/http";
import { createAttempt, publicLink } from "@/lib/payments";
import { mapStatus } from "@/lib/status";

/**
 * Agent payment entry: create a 1Click quote for an existing invoice.
 * Body: { originAsset: string, refundTo: string } — same as POST /api/links/:id/quote.
 * Docs: docs/agent-payments.md
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const { attempt, quote, link } = await createAttempt(id, body);
    const phase = mapStatus(attempt.status);
    return Response.json(
      {
        schema: "payday.quote.v1",
        attemptId: attempt.id,
        status: attempt.status,
        phase: phase.phase,
        label: phase.label,
        guidance: phase.guidance,
        depositAddress: attempt.depositAddress,
        depositMemo: attempt.depositMemo,
        amountIn: attempt.amountIn,
        amountInFormatted: attempt.amountInFormatted,
        minAmountIn: attempt.minAmountIn,
        originSymbol: attempt.originSymbol,
        originChain: attempt.originChain,
        quoteExpiresAt: attempt.quoteExpiresAt,
        correlationId: attempt.correlationId,
        timeEstimateSeconds: quote.timeEstimate,
        pollUrl: `/api/attempts/${attempt.id}`,
        link: publicLink(link),
      },
      {
        status: 201,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    );
  } catch (err) {
    return errorResponse(err);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
