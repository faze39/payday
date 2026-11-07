# Payday marketing refresh

## Design

- Black chassis, mint `#5fd29b`, 1160px container and 96px desktop section spacing.
- Self-hosted Instrument Sans and Instrument Serif, with font licenses included.
- Framed hero, typed words, CSS settlement orbits, six feature cards, sticky steps,
  payment ledger, definition list, working create form and light FAQ band.
- Features, how-it-works, pricing and FAQ share the same system. Privacy and payment-risk
  terms pages explain the current hackathon implementation.
- Reduced-motion preferences disable typing and continuous CSS animation. Scroll reveals
  run once. CSS visuals do not represent a payment being processed.

## Payment record

The homepage ledger is a fixed historical record from README.md, not a live feed and
not fabricated activity: 2.020567 USDC deposited on Solana, 2.00 USDC delivered on Base
on 3 November 2026. The deposit has its original public Solscan link. The displayed
payout amount comes from the project's documented payment test; no payout transaction
hash is invented. There are no fake user counts, volume totals or performance claims.

## Verification

- `npm test`: 42 tests across 10 files pass.
- `npm run build`: production build passes, including all original application routes.
- Targeted ESLint on changed TSX files passes. Full `npm run lint` still has a pre-existing
  `react-hooks/set-state-in-effect` error in `src/app/dashboard/page.tsx:21`; dashboard
  implementation was deliberately not changed.
- Headless local browser: all five marketing routes return 200, desktop and mobile
  layouts have no horizontal overflow, FAQ opens, mobile menu navigates, create form
  is visible and the dashboard's no-key state renders. No browser page errors.
- Desktop and mobile screenshots: `shots/design-contri-v1/`. Machine-readable results:
  `shots/design-contri-v1/verification.json`.

## Scope

No changes to CreateLinkForm, PayFlow, dashboard logic, pay pages, receipt pages,
CSV export, line-item handling, agent APIs, database or contracts. The shared font,
header and footer are refreshed; original payment-flow utility CSS is retained and
dark surface styles are scoped to marketing. No transactions were initiated.

The missing `shots/contri-ref/` folder was not recreated. Reference craft was studied
in `/workspace/contri/app/public/css/site.css`; no Contri logo, copy, ember palette or
media assets were reused. The fonts are open-source font files, not brand assets.

## Local preview

`npm run start -- --port 3100` after building, then open `http://localhost:3100`.
No new remote deployment has been created as part of the local build.
