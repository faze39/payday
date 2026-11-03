import { errorResponse } from "@/lib/http";
import { publicLink } from "@/lib/payments";
import { getStore } from "@/lib/store";

export async function GET(_req: Request, ctx: RouteContext<"/api/links/[id]">) {
  try {
    const { id } = await ctx.params;
    const link = await getStore().getLink(id);
    if (!link) return Response.json({ error: "This payment link does not exist." }, { status: 404 });
    return Response.json({ link: publicLink(link) });
  } catch (err) {
    return errorResponse(err);
  }
}
