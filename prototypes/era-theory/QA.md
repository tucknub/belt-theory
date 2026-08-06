# Era Theory v1 QA

## Visual target

The approved concept established a dark navy sports-documentary interface with a strong verdict-first hero, era scorecards, radar comparison, quarterback timeline, draft and transaction modules, and a sensitivity lab.

## Intentional production deviations

- Removed AI-generated lookalikes of Bill Polian, Ryan Grigson, and Chris Ballard.
- Removed the simulated Colts horseshoe and other unlicensed team marks.
- Replaced those elements with abstract stadium geometry, Indianapolis-inspired city forms, typography, and data visualization.
- Authentic licensed/editorial imagery can be added later without changing the page structure.

## Verified comparison points

1. Verdict-first hero, three era scores, and report metadata preserved.
2. Dark blue, silver, and electric-blue palette preserved without copied team marks.
3. Three scorecards and seven-dimension radar comparison implemented.
4. Quarterback, draft, transaction, contradiction, and future-update chapters implemented.
5. Sensitivity lab is interactive rather than a static mockup.
6. Desktop navigation and mobile menu verified.
7. No horizontal overflow at 1536 × 1000 or 390 × 844.

## Interaction checks

- Methodology dialog opens and closes.
- Preset model selection updates weights.
- Custom slider weights are normalized before scoring.
- Drafting + transactions selects Chris Ballard.
- Roster + resilience selects Ryan Grigson.
- Reset restores published weights and Bill Polian.

## Build checks

- `npm run build`
- `npm run verify`
