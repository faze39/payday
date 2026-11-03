import { errorResponse } from "@/lib/http";
import { createLink, publicLink } from "@/lib/payments";
import { validateCreateLink } from "@/lib/validation";

const bearer = (req: Request) => req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || undefined;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const v = validateCreateLink(body);
    if (!v.ok) return Response.json({ error: "Please fix the highlighted fields.", errors: v.errors }, { status: 400 });
    const { link, dashboardToken } = await createLink(v.value, undefined, undefined, bearer(req));
    return Response.json({ link: publicLink(link), dashboardToken }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
