"use client";
import { useState, type FormEvent } from "react";
import { PAYOUT_CHAINS, DEFAULT_PAYOUT_CHAIN, type PayoutChainId } from "@/lib/chains";
import { Alert, Button, Card, CopyText, Eyebrow, Field, api, inputClass, primaryButtonClass } from "./ui";
import { NgnEstimate } from "./NgnEstimate";

interface Created { link: { id: string }; dashboardToken: string }

export const DASHBOARD_KEY_STORAGE = "payday.dashboardKey";

export function CreateLinkForm() {
  const [chain, setChain] = useState<PayoutChainId>(DEFAULT_PAYOUT_CHAIN);
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError("");
    const f = new FormData(e.currentTarget);
    // Reuse the existing dashboard key so all links from this browser appear on one dashboard.
    const existingKey = localStorage.getItem(DASHBOARD_KEY_STORAGE);
    try {
      const res = await api<Created>("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(existingKey ? { Authorization: `Bearer ${existingKey}` } : {}) },
        body: JSON.stringify(Object.fromEntries(f.entries())),
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
        <Field label="Amount (USD)" error={errors.amountUsd} hint="Your client pays the equivalent in their token. You receive this much USDC.">
          <input name="amountUsd" inputMode="decimal" className={inputClass} placeholder="50" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </Field>
        <NgnEstimate usd={Number(amount)} />
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
