import { describe, expect, it } from "vitest";
import { validateCreateLink } from "@/lib/validation";
import { createLink, publicLink } from "@/lib/payments";
import { LocalStore } from "@/lib/store/memory";

const base = {
  recipientAddress: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
  description: "Retainer",
  clientRef: "Acme",
};

describe("line items", () => {
  it("auto-sums when amountUsd is blank", () => {
    const v = validateCreateLink({
      ...base,
      lineItems: [
        { description: "Words", qty: 2, unitAmountUsd: "10" },
        { description: "Edit", qty: 1, unitAmountUsd: "5.50" },
      ],
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.value.amountUsd).toBe("25.50");
      expect(v.value.lineItems).toHaveLength(2);
    }
  });

  it("rejects mismatch between amount and line sum", () => {
    const v = validateCreateLink({
      ...base,
      amountUsd: "20",
      lineItems: [{ description: "A", qty: 1, unitAmountUsd: "10" }],
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.lineItems).toMatch(/sum/i);
  });

  it("stores line items and exposes them on publicLink", async () => {
    const store = new LocalStore();
    const v = validateCreateLink({
      ...base,
      amountUsd: "15",
      lineItems: [{ description: "Article", qty: 1, unitAmountUsd: "15" }],
    });
    if (!v.ok) throw new Error("bad fixture");
    const { link } = await createLink(v.value, store);
    expect(link.lineItems[0].description).toBe("Article");
    expect(publicLink(link).lineItems).toHaveLength(1);
    expect((await store.getLink(link.id))?.lineItems[0].unitAmountUsd).toBe("15");
  });

  it("keeps simple create without line items", () => {
    const v = validateCreateLink({ ...base, amountUsd: "25.50" });
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value.lineItems).toEqual([]);
  });
});
