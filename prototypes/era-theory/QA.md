# Era Theory v2 QA

## Scope

The prototype has two routes:

- `/` — Era Theory umbrella homepage and report library
- `/reports/colts/` — Colts Era Lab interactive report

## Visual target

The selected direction established a dark navy sports-documentary interface with verdict-first reporting, strong typography, scorecards, comparative charts, timelines, and interactive model testing.

## Intentional production deviations

- Removed AI-generated lookalikes of Bill Polian, Ryan Grigson, and Chris Ballard.
- Removed simulated Colts marks and synthetic documentary scenes.
- Replaced those elements with abstract stadium geometry, Indianapolis-inspired city forms, typography, and data visualization.
- Authentic licensed/editorial imagery can be added later without changing the page structure.

## Browser verification

The runtime blocks direct `localhost` navigation, so Playwright Chromium loaded the completed production HTML, CSS, and JavaScript inline for the visual and interaction pass. The shipped files were not altered for testing.

Checked viewports:

- Desktop: 1536 × 1000
- Mobile: 390 × 844

Verified:

1. Umbrella homepage and Colts report render without JavaScript console errors.
2. Neither route has horizontal overflow on desktop or mobile.
3. Homepage mobile navigation opens correctly.
4. Colts mobile navigation opens correctly.
5. Methodology dialog opens and closes.
6. Drafting + transactions stress test selects Chris Ballard.
7. Roster + resilience stress test selects Ryan Grigson.
8. Published model loads Bill Polian first.
9. The homepage hero proof strip no longer overlaps the call-to-action buttons.

## Static verification

- `npm run build`
- `npm run verify`
- JavaScript syntax checks
- Duplicate-ID checks
- Relative route and asset checks
- Homepage, report, and interaction markers

## Publication status

The code is release-ready. A dedicated repository and authenticated hosting target remain infrastructure requirements, not product or QA defects.
