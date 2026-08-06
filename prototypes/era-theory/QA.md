# Era Theory v2 QA

## Scope

The prototype now has two routes:

- `/` — Era Theory umbrella homepage and report library
- `/reports/colts/` — Colts Era Lab interactive report

## Visual target

The approved direction established a dark navy sports-documentary interface with verdict-first reporting, strong typography, scorecards, comparative charts, timelines, and interactive model testing.

## Intentional production deviations

- Removed AI-generated lookalikes of Bill Polian, Ryan Grigson, and Chris Ballard.
- Removed simulated Colts marks and synthetic documentary scenes.
- Replaced those elements with abstract stadium geometry, Indianapolis-inspired city forms, typography, and data visualization.
- Authentic licensed/editorial imagery can be added later without changing the page structure.

## Static verification completed

1. `npm run build`
2. `npm run verify`
3. JavaScript syntax checks for `app.js` and `home.js`
4. Duplicate-ID scan for both HTML routes
5. Relative asset and route link scan for both HTML routes
6. Homepage markers, report markers, and interaction-code markers verified

## Interaction implementation retained

- Methodology dialog
- Mobile navigation on both routes
- Preset sensitivity models
- Custom slider-weight normalization
- Drafting + transactions stress test selects Chris Ballard
- Roster + resilience stress test selects Ryan Grigson
- Reset restores the published Bill Polian model

## Environment limitation

The current browser runtime blocked local and file URL navigation, so the new umbrella route could not receive a fresh screenshot pass in this environment. The earlier Colts report screenshots remain available, and all new routes and assets pass static verification. A final browser pass is required before public deployment.
