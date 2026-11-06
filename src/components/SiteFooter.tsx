import Link from "next/link";
import { Logo } from "@/components/Logo";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link href="/" aria-label="Payday home">
              <Logo dark />
            </Link>
            <p className="lead">
              Your work. Your wallet.
              <br />
              One less payment conversation.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <p>Explore</p>
              {[
                ["Features", "features"],
                ["How it works", "how-it-works"],
                ["Pricing", "pricing"],
                ["FAQ", "faq"],
              ].map(([label, path]) => (
                <Link key={path} href={`/${path}`}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <p>Use Payday</p>
              <Link href="/#create">Create a link</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <a href="https://github.com/faze39/payday">Source code ↗</a>
              <a href="https://docs.near-intents.org">NEAR Intents ↗</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Payday. Built for the NEAR Protocol Hackathon.</span>
          <span>Non-custodial. USDC to your wallet.</span>
        </div>
      </div>
    </footer>
  );
}
