import type { ReactNode } from "react";

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
    </div>
  );
}
