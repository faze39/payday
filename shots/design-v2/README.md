# Design v2 capture queue (not screenshots)

No images have been captured yet. The executor has no browser/screenshot/subagent tool, and did not use prohibited Shell browser automation.

Production preview: http://localhost:3101

A browser-capable parent should capture full-page PNGs at 1440×1000 and 390×844:

| Route           | Desktop file               | Mobile file               |
| --------------- | -------------------------- | ------------------------- |
| `/`             | `home-desktop.png`         | `home-mobile.png`         |
| `/features`     | `features-desktop.png`     | `features-mobile.png`     |
| `/how-it-works` | `how-it-works-desktop.png` | `how-it-works-mobile.png` |
| `/pricing`      | `pricing-desktop.png`      | `pricing-mobile.png`      |
| `/faq`          | `faq-desktop.png`          | `faq-mobile.png`          |

Optional viewport-only hero crop: `home-hero-desktop.png`.

Check 320px and 768px for overflow, open the mobile menu and FAQ disclosures, select ETH and USDT in the route illustration, and verify that reduced motion leaves all content visible. The illustration is explanatory, not a quote. Do not submit an invoice or send funds for visual QA.
