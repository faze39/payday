# Payday / the settlement desk

## Direction

A freelancer's working desk, not an abstract financial universe. The visual language is routing marks, a perforated payment slip, column rules and documentary records. It is deliberately flat, editorial and useful. The only interactive illustration lets a visitor choose an example origin token. It does not fetch a quote, show a fictional amount, claim a completed payment or send funds.

## Type

- **Syne**, variable 400–800: headlines, wordmark and large currency labels. Broad geometric letterforms, upright, no serif emphasis.
- **DM Sans**, variable 100–1000: body, navigation and application controls. A quieter, readable counterpoint.
- **JetBrains Mono**: small routing and document labels, retained from the existing app.
- Syne and DM Sans are self-hosted through `next/font/local`. Source: Google Fonts' public `ofl/syne` and `ofl/dmsans` directories. SIL Open Font License files are alongside the fonts.
- Instrument fonts and the old orbital/typewriter component have been removed, not just hidden.

## Palette

| Role                                            | Hex       |
| ----------------------------------------------- | --------- |
| Chassis                                         | `#101815` |
| Desk surface                                    | `#1c2921` |
| Primary ink                                     | `#f3f4e9` |
| Secondary ink                                   | `#a9b4ad` |
| Primary accent, buttons and typographic marks   | `#d5f66b` |
| Secondary accent, settlement and route details  | `#5fd29b` |
| Invoice paper, confined to the explanatory slip | `#ecf0dc` |

Buttons have an 8px corner. The route picker uses 4px corners. There are no pill navigation containers, blurred glows, gradient text or purple surfaces. The original live payment form keeps its light application surface and behavior.

## Specific changes from `a10d9f8`

- Removed the inset framed hero, rotating typed word, blinking caret and floating token orbits. Replaced them with an unframed editorial headline and a compact, interactive paper payment slip.
- Replaced black/cream/serif contrast with green-black, chartreuse and upright geometric typography. Mint is now a supporting settlement color, not the sole brand accent.
- Removed the homepage's six glowing feature cards. The homepage now uses three ruled editorial columns: ask, handoff and record. The Features page uses a two-column technical inventory and an actual invoice-API endpoint panel.
- Removed the sticky `01–04` process composition. How it works now has a currency-routing banner and a horizontal four-stage handoff, reflowing to rows on narrow screens. Stages have action labels rather than decorative serif numbers.
- Replaced the full-width transaction ledger with a compact historical payment-test docket. The amounts and public explorer link remain the documented real test, explicitly not a live feed.
- Removed the homepage definition-list section and light FAQ band. Questions now remain on the dark chassis with native disclosure controls and compact index labels.
- Pricing is a joined fee-and-inclusions sheet followed by a separate cost breakdown. It is not a pair of glowing pricing cards. Pricing remains free only during the hackathon; network and settlement costs are clearly separate.
- Navigation is a plain baseline row with a short active underline, not a frosted floating container. Dashboard/Create and all marketing routes remain available, including in the mobile menu.
- Footer is now a large, low-contrast wordmark with an offset route arrow and a practical link directory.
- Inner pages use a narrow label gutter and a wide headline column, not a centered/revealed heading block.

## Motion

No scroll-triggered effects on marketing pages. No typewriter, orbit, perpetual pulse or auto-cycling token labels. All copy is visible in server-rendered HTML with JavaScript disabled.

The headline underline prints once in 500ms. Choosing an illustrative token runs a single 550ms straight route marker. Buttons shift only their arrow, and feature-row indices translate horizontally on hover. `prefers-reduced-motion` disables animation, transitions and those hover transforms. The payment/dashboard/receipt animation helpers are unchanged.

## Scope and verification

- `CreateLinkForm`, `PayFlow`, dashboard, receipt, line-item code, CSV, APIs and settlement libraries are unchanged.
- The existing payment-flow utility CSS was preserved verbatim. Header/footer and the global body font are intentionally shared presentation changes.
- Privacy/terms content is unchanged and uses the updated shared marketing shell.
- Added nine server-rendered marketing contract tests covering single headings, visible content, the actual form fields, the historical proof, illustrative route labeling, native FAQ disclosures and honest fee copy.
- `npm test`: **51/51 passed**, 11 files.
- `npm run build`: **passed** (Next.js 16.4.4).
- Targeted ESLint for all modified TS/TSX files: **passed**.
- Full `npm run lint` reports the existing `react-hooks/set-state-in-effect` issue at `src/app/dashboard/page.tsx:21`. That file was deliberately not changed.
- Local production preview: `http://localhost:3101`. Port 3100 was already occupied, so the existing process was left alone.

## Screenshot review still required

The executor was not given browser, desktop, screenshot or browser-subagent tools. Tool discovery returned no matching capability. Shell-driven browser automation is not permitted by the desktop instructions, so no substitute was used and no PNGs are claimed. `shots/design-v2/README.md` lists the exact captures for a browser-capable parent to take against the local production preview. The implementation is responsive in CSS, but desktop/mobile visual and interactive browser QA remain pending until those captures are made.

Everything is local on `design-v2`. No push, merge, deployment or public preview was performed.
