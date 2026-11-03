import { OneClickError } from "./oneclick";
import { UserError } from "./payments";

/** Convert errors into JSON responses with messages that are safe to show the user. */
export function errorResponse(err: unknown): Response {
  if (err instanceof UserError) return Response.json({ error: err.message, field: err.field }, { status: err.status });
  if (err instanceof OneClickError) {
    const status = err.httpStatus === 400 ? 400 : 502;
    return Response.json({ error: `Swap service: ${err.message}` }, { status });
  }
  console.error(err);
  return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
}
