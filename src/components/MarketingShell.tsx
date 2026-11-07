import type { ReactNode } from "react";
import { MarketingPage } from "@/components/marketing-motion";

export function MarketingShell({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <MarketingPage className="marketing inner-page">
      <div className="wrap">
        <header className="inner-heading">
          <div className="page-index">
            <span className="eyebrow">{eyebrow}</span>
            <span className="index-mark" aria-hidden="true">
              ↘
            </span>
          </div>
          <div>
            <h1 className="display">{title}</h1>
            <p className="lead">{lead}</p>
          </div>
        </header>
        <div className="inner-content">{children}</div>
      </div>
    </MarketingPage>
  );
}
