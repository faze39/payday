/** Invoice line items. Amounts are USD strings with at most 2 decimal places. */

export interface LineItem {
  description: string;
  qty: number;
  unitAmountUsd: string;
}

export function lineItemTotalUsd(item: LineItem): number {
  return item.qty * Number(item.unitAmountUsd);
}

export function sumLineItemsUsd(items: LineItem[]): number {
  return items.reduce((s, i) => s + lineItemTotalUsd(i), 0);
}

/** Format a number as a USD amount string with exactly 2 decimals when needed. */
export function formatUsd(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
