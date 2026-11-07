# Payday / motion as a paper handoff

The visual design, fonts and palette are unchanged. This adds actual Motion for React behavior, not just hover colors. The existing `motion` 14 dependency was already installed; no dependency update was needed.

## What moves

- Payment slip: a 600ms entrance from 26px below with a 1.5-degree registration angle. Headings, denomination, payer, receiver, destination and footer register in a 55ms stagger, each moving 9px over 400ms.
- Token selection: a shared-layout chartreuse selection block travels between buttons in 300ms. `AnimatePresence` hands the payer label from the old token to the new token in 200ms per direction. Pressing a selector gives 200ms compression feedback. The available token illustrations do not cycle automatically.
- Settlement numbers: only the documented digits (`2.020567`, `2.00`) and the actual `$0` platform fee slide through small digit windows, once. Values do not count from zero, change balances or invent an intermediate payment amount. Each glyph moves in 400ms, staggered by 25ms. Assistive technology receives one intact amount, not a changing stream of digits.
- Editorial columns and feature inventory: once-in-view, 18px paper registration in 500ms with small column offsets. Historical docket rows register 16px horizontally, once. Viewport observers stop after first entry. No scrolling is intercepted.
- API workbench: three keyboard-accessible documentation-example selectors (Read, Quote, Track). Commands type once when first visible or selected, with a complete accessible text equivalent. A 200ms per-glyph opacity transition and capped stagger finish within 580ms. Request/response excerpts slide horizontally between choices (250ms each direction). This is deliberately labeled illustrative documentation: no API call is made, no real address is fabricated, and no payment is simulated.
- Navigation: an active/hover/focus underline moves between marketing navigation items in 300ms using a shared layout ID. The mobile menu enters/exits over 250ms. CTA and navigation links have 200ms press compression.
- Page handoff: each marketing page gets a 400ms entrance on route mount/change. This is enter-only, intentionally avoiding retained stale App Router children, frozen router internals, intercepted navigation, or global remounts of payment/dashboard routes. A clipped outer window prevents temporary horizontal overflow.

All Motion transitions use `[0.22, 1, 0.36, 1]`. There is no hero typewriter, orbit, cursor tracking, scroll-jacking or perpetual animation. No network calls or live settlement state were added to marketing.

## Static / reduced-motion / no-JavaScript behavior

- `initial={false}` and imperative animation controls keep meaningful content visible in the server-rendered HTML. Entrance states are set only after hydration and only when animation is permitted.
- One shared `matchMedia('(prefers-reduced-motion: no-preference)')` subscription, exposed through `useSyncExternalStore`, defaults to false during SSR. Missing browser preference support also defaults to static.
- The shared preference reacts to OS changes while the page is open. Disabling motion stops/reset controls, removes layout/press animation and uses zero-duration state updates. CSS guards also clear in-flight decorative transforms/opacity under reduced motion.
- The provider explicitly uses `MotionConfig`'s `always` policy when static, and `never` only when the reactive shared preference allows motion. This also avoids relying on the installed Motion hook's non-reactive preference snapshot.
- Native FAQ disclosure, links, token selection and documentation-example selection remain usable. Static does not mean disabled.
- Payment, dashboard and receipt animation helpers remain unchanged.

## Scope and checks

- No changes to `CreateLinkForm`, pay flow, dashboard, receipt, CSV, line items, API routes, contracts or settlement libraries.
- Existing payment utility CSS, from its boundary comment to EOF, preserved verbatim.
- React best-practices reviewed: server pages remain server components; only small animation islands are client components; no extra fetching, polling or timers; one shared media listener; cleanup stops animation controls; static example data and motion variants are hoisted.
- `npm test`: 57/57 passed, 12 files. Includes six new tests for static SSR content, truthful amounts and documentation, plus preference subscription/dynamic changes.
- `npm run build`: passed, Next.js 16.4.4.
- Modified-file ESLint: passed.
- Browser/motion timing and screenshot QA are left to the parent, as requested. No Shell browser automation was used.

The pre-existing untracked `shots/design-v2/preview-error-172.30.0.2.png` was left untouched and is not part of this change. No deployment protection settings, main branch, merge or production promotion were changed.
