import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Short, URL-safe public id for a payment link. */
export const newLinkId = () => randomBytes(6).toString("base64url");
export const newId = () => randomBytes(9).toString("base64url");
/** Secret the freelancer keeps for the dashboard. Only its hash is stored. */
export const newDashboardToken = () => randomBytes(24).toString("base64url");

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function tokenMatches(token: string, hash: string): boolean {
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
