/** Approximate USD→NGN rate from ExchangeRate-API's open endpoint (no key). This is only for display, never for settlement. */
export const FX_SOURCE_URL = "https://open.er-api.com/v6/latest/USD";
export const FX_SOURCE_NAME = "ExchangeRate-API (open.er-api.com)";

export interface FxRate {
  rate: number;
  updatedAt: string;
  source: string;
}

export async function getUsdNgn(): Promise<FxRate | null> {
  try {
    const res = await fetch(FX_SOURCE_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const body = await res.json();
    const rate = body?.rates?.NGN;
    if (body?.result !== "success" || typeof rate !== "number") return null;
    return { rate, updatedAt: body.time_last_update_utc, source: FX_SOURCE_NAME };
  } catch {
    return null;
  }
}
