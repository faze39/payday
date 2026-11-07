"use client";
import { useMemo, useState, type FormEvent } from "react";
import { PAYOUT_CHAINS, DEFAULT_PAYOUT_CHAIN, type PayoutChainId } from "@/lib/chains";
import { formatUsd, sumLineItemsUsd, type LineItem } from "@/lib/line-items";
import { Alert, Button, Card, CopyText, Eyebrow, Field, api, inputClass, primaryButtonClass } from "./ui";
import { NgnEstimate } from "./NgnEstimate";

interface Created { link: { id: string }; dashboardToken: string }

export const DASHBOARD_KEY_STORAGE = "payday.dashboardKey";

type DraftLine = { description: string; qty: string; unitAmountUsd: string };

const emptyLine = (): DraftLine => ({ description: "", qty: "1", unitAmountUsd: "" });

export function CreateLinkForm() {
  const [chain, setChain] = useState<PayoutChainId>(DEFAULT_PAYOUT_CHAIN);
  const [amount, setAmount] = useState("");
  const [showLines, setShowLines] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  const lineSum = useMemo(() => {
    if (!showLines) return null;
    const items: LineItem[] = [];
    for (const l of lines) {
      if (!l.description.trim() && !l.unitAmountUsd.trim()) continue;
      const qty = Number(l.qty);
      if (!l.description.trim() || !/^\d+(\.\d{1,2})?$/.test(l.unitAmountUsd) || !Number.isInteger(qty) || qty < 1) return null;
      items.push({ description: l.description.trim(), qty, unitAmountUsd: l.unitAmountUsd.trim() });
    }
    return items.length ? formatUsd(sumLineItemsUsd(items)) : null;
  }, [lines, showLines]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    const f = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(f.entries());
    if (showLines) {
      payload.lineItems = lines
        .filter((l) => l.description.trim() || l.unitAmountUsd.trim())
        .map((l) => ({ description: l.description.trim(), qty: Number(l.qty), unitAmountUsd: l.unitAmountUsd.trim() }));
      if (!payload.amountUsd && lineSum) payload.amountUsd = lineSum;
    }
    const existingKey = localStorage.getItem(DASHBOARD_KEY_STORAGE);
    try {
      const res = await api<Created>("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(existingKey ? { Authorization: `Bearer ${existingKey}` } : {}) },
        body: JSON.stringify(payload),
      });
      localStorage.setItem(DASHBOARD_KEY_STORAGE, res.dashboardToken);
      setCreated(res);
    } catch (err) {
      const body = (err as { body?: { errors?: Record<string, string> } }).body;
      if (body?.errors) setErrors(body.errors);
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    const origin = window.location.origin;
    return (
      <Card className="!rounded-[27px]">
        <div className="space-y-5">
          <Alert kind="success">Your payment link is ready. Send it to your client.</Alert>
          <Field label="Payment link">
            <CopyText value={`${origin}/pay/${created.link.id}`} label="payment link" />
          </Field>
          <Field label="Your private dashboard link" hint="Keep this secret. Anyone with it can see your links. It is saved in this browser too.">
            <CopyText value={`${origin}/dashboard#k=${created.dashboardToken}`} label="dashboard link" />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <a className={primaryButtonClass} href={`/pay/${created.link.id}`}>Open payment page →</a>
            <button type="button" className="min-h-11 rounded-xl px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100" onClick={() => setCreated(null)}>Create another</button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="!rounded-[27px]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Eyebrow>New payment link</Eyebrow>
          <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Request a payment</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">USDC</span>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Receive USDC on" error={errors.payoutChain}>
          <select name="payoutChain" className={inputClass} value={chain} onChange={(e) => setChain(e.target.value as PayoutChainId)}>
            {Object.values(PAYOUT_CHAINS).map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.id === DEFAULT_PAYOUT_CHAIN ? " (recommended)" : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="Your receiving wallet address" error={errors.recipientAddress} hint={PAYOUT_CHAINS[chain].addressHint}>
          <input name="recipientAddress" className={inputClass} autoComplete="off" spellCheck={false} required />
        </Field>
        <Field
          label="Amount (USD)"
          error={errors.amountUsd}
          hint={showLines ? "Leave blank to use the line-item total, or enter an amount that matches the lines." : "Your client pays the equivalent in their token. You receive this much USDC."}
        >
          <input
            name="amountUsd"
            inputMode="decimal"
            className={inputClass}
            placeholder={lineSum ?? "50"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required={!showLines}
          />
        </Field>
        <NgnEstimate usd={Number(amount || lineSum || 0)} />

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Line items (optional)</p>
              <p className="text-xs text-slate-600">Break the invoice into rows. Skip this for a simple one-line request.</p>
            </div>
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
              onClick={() => setShowLines((v) => !v)}
            >
              {showLines ? "Hide" : "Add lines"}
            </button>
          </div>
          {showLines && (
            <div className="mt-3 space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_4.5rem_6.5rem_auto]">
                  <input
                    className={inputClass}
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) => setLines((rows) => rows.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))}
                    maxLength={120}
                  />
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="Qty"
                    value={line.qty}
                    onChange={(e) => setLines((rows) => rows.map((r, j) => (j === i ? { ...r, qty: e.target.value } : r)))}
                  />
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    placeholder="Unit $"
                    value={line.unitAmountUsd}
                    onChange={(e) => setLines((rows) => rows.map((r, j) => (j === i ? { ...r, unitAmountUsd: e.target.value } : r)))}
                  />
                  <button
                    type="button"
                    className="min-h-11 rounded-xl px-2 text-sm font-semibold text-slate-600 hover:bg-white"
                    onClick={() => setLines((rows) => (rows.length === 1 ? [emptyLine()] : rows.filter((_, j) => j !== i)))}
                    aria-label="Remove line"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {errors.lineItems && <p className="text-sm text-red-700">{errors.lineItems}</p>}
              {lineSum && <p className="text-xs font-medium text-slate-700">Line total: ${lineSum}</p>}
              <button
                type="button"
                className="text-sm font-semibold text-emerald-800 hover:underline"
                onClick={() => setLines((rows) => [...rows, emptyLine()])}
              >
                + Add another line
              </button>
            </div>
          )}
        </div>

        <Field label="What is this payment for?" error={errors.description}>
          <input name="description" className={inputClass} maxLength={280} placeholder="Blog post: 1,500 words on DeFi" required />
        </Field>
        <Field label="Client name or reference (optional)" error={errors.clientRef}>
          <input name="clientRef" className={inputClass} maxLength={80} placeholder="Acme Inc / INV-001" />
        </Field>
        <Field label="Link expires after (days)" error={errors.expiresInDays}>
          <input name="expiresInDays" type="number" min={1} max={30} defaultValue={7} className={inputClass} />
        </Field>
        {formError && <Alert>{formError}</Alert>}
        <div className="pt-1 [&>button]:w-full">
          <Button type="submit" disabled={busy}>{busy ? "Creating…" : "Create payment link"}</Button>
        </div>
      </form>
    </Card>
  );
}
