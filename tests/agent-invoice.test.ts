import { describe, expect, it } from "vitest";
import { agentInvoiceView, createLink } from "@/lib/payments";
import { validateCreateLink } from "@/lib/validation";
import { LocalStore } from "@/lib/store/memory";

describe("agentInvoiceView", () => {
  it("returns payday.invoice.v1 with quote URL and deposit instructions hooks", async () => {
    const store = new LocalStore();
    const v = validateCreateLink({
      recipientAddress: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
      amountUsd: "10",
      description: "Agent-payable invoice",
      clientRef: "bot",
      lineItems: [{ description: "Task", qty: 1, unitAmountUsd: "10" }],
    });
    if (!v.ok) throw new Error("bad");
    const { link } = await createLink(v.value, store);
    const view = agentInvoiceView(link, { baseUrl: "https://example.test" });
    expect(view.schema).toBe("payday.invoice.v1");
    expect(view.agent.self).toBe(`https://example.test/api/invoices/${link.id}`);
    expect(view.agent.quoteUrl).toBe(`https://example.test/api/invoices/${link.id}/pay`);
    expect(view.lineItems).toHaveLength(1);
    expect(view.payUrl).toContain(`/pay/${link.id}`);
    expect(view.notes.some((n) => n.includes("1Click"))).toBe(true);
  });
});
