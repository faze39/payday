/** Convert a decimal string such as "12.5" into integer base units, e.g. "12500000" for 6 decimals. */
export function toBaseUnits(amount: string, decimals: number): string {
  const s = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error("Amount must be a positive number");
  const [whole, frac = ""] = s.split(".");
  if (frac.length > decimals) throw new Error(`At most ${decimals} decimal places allowed`);
  const units = BigInt(whole + frac.padEnd(decimals, "0"));
  return units.toString();
}

/** Convert integer base units into a human-readable decimal string without trailing zeros. */
export function fromBaseUnits(units: string, decimals: number): string {
  if (!/^\d+$/.test(units)) throw new Error("Base units must be a non-negative integer string");
  const padded = units.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals).replace(/^0+(?=\d)/, "");
  const frac = decimals ? padded.slice(-decimals).replace(/0+$/, "") : "";
  return frac ? `${whole}.${frac}` : whole;
}
