import { describe, expect, it } from "vitest";
import { linkStatus, mapStatus } from "@/lib/status";

describe("mapStatus", () => {
  it.each([
    ["PENDING_DEPOSIT", "awaiting_deposit", false],
    ["KNOWN_DEPOSIT_TX", "swapping", false],
    ["PROCESSING", "swapping", false],
    ["INCOMPLETE_DEPOSIT", "underpaid", false],
    ["SUCCESS", "delivered", true],
    ["REFUNDED", "refunded", true],
    ["FAILED", "failed", true],
  ])("%s -> %s", (s, phase, terminal) => {
    const m = mapStatus(s);
    expect(m.phase).toBe(phase);
    expect(m.terminal).toBe(terminal);
    expect(m.guidance.length).toBeGreaterThan(10);
  });
  it("keeps polling on unknown statuses", () => {
    expect(mapStatus("NEW_THING").terminal).toBe(false);
  });
});

describe("linkStatus", () => {
  const now = new Date("2026-11-05T00:00:00Z");
  it("paid wins over expiry", () => expect(linkStatus({ paidAt: "2026-11-04T00:00:00Z", expiresAt: "2026-11-01T00:00:00Z" }, now)).toBe("paid"));
  it("expired", () => expect(linkStatus({ paidAt: null, expiresAt: "2026-11-04T00:00:00Z" }, now)).toBe("expired"));
  it("pending", () => expect(linkStatus({ paidAt: null, expiresAt: "2026-11-06T00:00:00Z" }, now)).toBe("pending"));
});
