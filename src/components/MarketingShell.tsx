import type { ReactNode } from "react";
import { Reveal } from "@/components/motion";
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
    <div className="marketing inner-page">
      <div className="wrap">
        <Reveal>
          <header className="inner-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display">{title}</h1>
            <p className="lead">{lead}</p>
          </header>
        </Reveal>
        <div className="inner-content">{children}</div>
      </div>
    </div>
  );
}
