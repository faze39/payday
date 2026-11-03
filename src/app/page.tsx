import { CreateLinkForm } from "@/components/CreateLinkForm";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Get paid in USDC by anyone, from any token on any chain.</h1>
        <p className="text-slate-600">
          Create a payment link in 30 seconds. Your client pays with whatever they hold, and NEAR Intents swaps it and delivers USDC
          straight to your wallet. Payday never touches your funds.
        </p>
      </section>
      <CreateLinkForm />
    </div>
  );
}
