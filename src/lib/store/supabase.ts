import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PaymentAttempt, PaymentLink, Store } from "./types";

/* Maps between camelCase app objects and snake_case columns (see supabase/migrations). */
const toRow = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), v]));
const fromRow = <T>(r: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v])) as T;

export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  private static check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
    if (error) throw new Error(`Database error: ${error.message}`);
    return data;
  }

  async createLink(link: PaymentLink) {
    SupabaseStore.check(await this.db.from("payment_links").insert(toRow(link)));
  }
  async getLink(id: string) {
    const row = SupabaseStore.check(await this.db.from("payment_links").select("*").eq("id", id).maybeSingle());
    return row ? fromRow<PaymentLink>(row) : null;
  }
  async listLinksByOwner(hash: string) {
    const rows = SupabaseStore.check(
      await this.db.from("payment_links").select("*").eq("owner_token_hash", hash).order("created_at", { ascending: false }),
    );
    return (rows ?? []).map((r) => fromRow<PaymentLink>(r));
  }
  async markLinkPaid(id: string, paidAt: string) {
    SupabaseStore.check(await this.db.from("payment_links").update({ paid_at: paidAt }).eq("id", id).is("paid_at", null));
  }
  async createAttempt(a: PaymentAttempt) {
    SupabaseStore.check(await this.db.from("payment_attempts").insert(toRow(a)));
  }
  async getAttempt(id: string) {
    const row = SupabaseStore.check(await this.db.from("payment_attempts").select("*").eq("id", id).maybeSingle());
    return row ? fromRow<PaymentAttempt>(row) : null;
  }
  async listAttemptsByLink(linkId: string) {
    const rows = SupabaseStore.check(
      await this.db.from("payment_attempts").select("*").eq("link_id", linkId).order("created_at", { ascending: false }),
    );
    return (rows ?? []).map((r) => fromRow<PaymentAttempt>(r));
  }
  async updateAttempt(id: string, patch: Partial<PaymentAttempt>) {
    SupabaseStore.check(await this.db.from("payment_attempts").update(toRow(patch)).eq("id", id));
  }
}
