import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp } from "@/components/motion";
import { getLinkView, publicLink } from "@/lib/payments";
import { SupabaseStore } from "@/lib/store/supabase";
import type { PublicLink } from "@/lib/client-types";
import { toBaseUnits } from "@/lib/amount";

const db = vi.hoisted(() => ({
  select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), order: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: () => db }) }));

function row(amount: number | string = 50) {
  return {
    id: "PAY50AAA", owner_token_hash: "test-owner-hash", recipient_address: "0x0000000000000000000000000000000000000001",
    payout_chain: "base", dest_asset_id: "test-usdc", amount_usd: amount, amount_base_units: toBaseUnits(String(amount), 6),
    description: "Test invoice", client_ref: "", line_items: [], expires_at: "2099-01-01T00:00:00Z",
    created_at: "2026-11-08T08:00:00Z", paid_at: null, near_record_tx: null,
  };
}
const store = () => new SupabaseStore("https://example.supabase.co", "unit-test-placeholder");

beforeEach(() => {
  vi.clearAllMocks();
  db.select.mockReturnValue(db);
  db.eq.mockReturnValue(db);
});

describe("Supabase numeric amount → public payment JSON → amount render", () => {
  for (const amount of [50, 50.25, 0.01, 9999999999.99, "50.00", "50.25"]) {
    it(`renders an invoice loaded from amount_usd=${JSON.stringify(amount)}`, async () => {
      // Postgres numeric(12,2) arrives as JSON number, unlike LocalStore's strings.
      db.maybeSingle.mockResolvedValue({ data: row(amount), error: null });
      const view = await getLinkView("PAY50AAA", store());
      expect(view).not.toBeNull();
      // Exercise the same JSON serialization and real amount component used after PayFlow's fetch.
      const { link } = JSON.parse(JSON.stringify({ link: view })) as { link: PublicLink };
      const html = renderToStaticMarkup(createElement(CountUp, { value: link.amountUsd }));
      expect(html).toContain(`>${String(amount)}</span>`);
      expect(typeof link.amountUsd).toBe("string");
      expect(link.status).toBe("pending");
      expect(link).not.toHaveProperty("ownerTokenHash");
      expect(view?.amountUsd).toBe(String(amount));
    });
  }
  it("normalizes dashboard/list reads at the same database boundary without changing base units", async () => {
    db.order.mockResolvedValue({ data: [row(50), row(50.25)], error: null });
    const links = await store().listLinksByOwner("test-owner-hash");
    expect(links.map((link) => publicLink(link).amountUsd)).toEqual(["50", "50.25"]);
    expect(links.map((link) => link.amountBaseUnits)).toEqual(["50000000", "50250000"]);
  });
  it("preserves the missing-link result", async () => {
    db.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await getLinkView("missing", store())).toBeNull();
  });
});
