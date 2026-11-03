import { errorResponse } from "@/lib/http";
import { getLinkView } from "@/lib/payments";

export async function GET(_req: Request, ctx: RouteContext<"/api/links/[id]">) {
  try {
    const { id } = await ctx.params;
    const link = await getLinkView(id);
    if (!link) return Response.json({ error: "This payment link does not exist." }, { status: 404 });
    return Response.json({ link });
  } catch (err) {
    return errorResponse(err);
  }
}
