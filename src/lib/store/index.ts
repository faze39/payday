import { join } from "node:path";
import { tmpdir } from "node:os";
import { LocalStore } from "./memory";
import { SupabaseStore } from "./supabase";
import type { Store } from "./types";

let store: Store | undefined;

/** Uses Supabase when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set; otherwise a local JSON file. */
export function getStore(): Store {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = new SupabaseStore(url, key);
  } else {
    const dir = process.env.VERCEL ? tmpdir() : join(process.cwd(), ".data");
    store = new LocalStore(join(dir, "payday-dev.json"));
  }
  return store;
}

export const storeKind = () => (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local");
export type { Store, PaymentLink, PaymentAttempt } from "./types";
