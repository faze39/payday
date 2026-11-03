import { describe, expect, it } from "vitest";
import { validateCreateLink } from "@/lib/validation";
import { createLink, publicLink } from "@/lib/payments";
import { LocalStore } from "@/lib/store/memory";
import { hashToken } from "@/lib/secrets";
import { isValidAddress } from "@/lib/chains";

const good = {
  recipientAddress: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
  amountUsd: "25.50",
  description: "Blog post",
  clientRef: "Acme",
};

describe("validateCreateLink", () => {
  it("accepts a valid Base link and defaults chain/expiry", () => {
    const v = validateCreateLink(good);
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value).toMatchObject({ payoutChain: "base", amountBaseUnits: "25500000", expiresInDays: 7 });
  });
  it("reports each bad field with a message", () => {
    const v = validateCreateLink({ recipientAddress: "0x123", amountUsd: "abc", description: "" , payoutChain: "base" });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(Object.keys(v.errors).sort()).toEqual(["amountUsd", "description", "recipientAddress"]);
  });
  it("enforces amount bounds and cents precision", () => {
    expect(validateCreateLink({ ...good, amountUsd: "0.5" }).ok).toBe(false);
    expect(validateCreateLink({ ...good, amountUsd: "10001" }).ok).toBe(false);
    expect(validateCreateLink({ ...good, amountUsd: "1.234" }).ok).toBe(false);
  });
  it("rejects unsupported chains and validates address per chain", () => {
    expect(validateCreateLink({ ...good, payoutChain: "eth" }).ok).toBe(false);
    expect(validateCreateLink({ ...good, payoutChain: "sol" }).ok).toBe(false);
    expect(validateCreateLink({ ...good, payoutChain: "sol", recipientAddress: "13QkxhNMrTPxoCkRdYdJ65tFuwXPhL5gLS2Z5Nr6gjRK" }).ok).toBe(true);
    expect(validateCreateLink({ ...good, payoutChain: "near", recipientAddress: "mubarak.near" }).ok).toBe(true);
  });
});

describe("isValidAddress", () => {
  it("checks common formats", () => {
    expect(isValidAddress("arb", "0x2527D02599Ba641c19FEa793cD0F167589a0f10D")).toBe(true);
    expect(isValidAddress("near", "Bad.Near")).toBe(false);
    expect(isValidAddress("tron", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")).toBe(true);
    expect(isValidAddress("sol", "0OIl" + "1".repeat(40))).toBe(false);
  });
});

describe("createLink", () => {
  it("stores only the hash of the dashboard token and hides it from public view", async () => {
    const store = new LocalStore();
    const v = validateCreateLink(good);
    if (!v.ok) throw new Error("fixture invalid");
    const { link, dashboardToken } = await createLink(v.value, store, new Date("2026-11-03T00:00:00Z"));
    const saved = await store.getLink(link.id);
    expect(saved?.ownerTokenHash).toBe(hashToken(dashboardToken));
    expect(JSON.stringify(saved)).not.toContain(dashboardToken);
    expect(saved?.expiresAt).toBe("2026-11-10T00:00:00.000Z");
    expect(publicLink(link)).not.toHaveProperty("ownerTokenHash");
    expect(await store.listLinksByOwner(hashToken(dashboardToken))).toHaveLength(1);
  });
});
