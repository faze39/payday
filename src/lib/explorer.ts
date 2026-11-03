/** Block explorer transaction URLs for chains whose URL format is well known. */
const TX_URL: Record<string, (hash: string) => string> = {
  sol: (h) => `https://solscan.io/tx/${h}`,
  base: (h) => `https://basescan.org/tx/${h}`,
  arb: (h) => `https://arbiscan.io/tx/${h}`,
  near: (h) => `https://nearblocks.io/txns/${h}`,
  eth: (h) => `https://etherscan.io/tx/${h}`,
};

const SAFE_HASH = /^[0-9A-Za-z_-]{16,128}$/;

/**
 * Explorer link for a transaction. Uses the URL returned by 1Click when present,
 * otherwise builds one for a known chain. Returns null when no trustworthy URL exists.
 */
export function txExplorerUrl(chain: string | undefined, hash: string, provided?: string): string | null {
  if (provided && /^https:\/\//.test(provided)) return provided;
  if (!chain || !SAFE_HASH.test(hash)) return null;
  const build = TX_URL[chain.toLowerCase()];
  return build ? build(hash) : null;
}
