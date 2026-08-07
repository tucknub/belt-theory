# WCW and Original ECW scorecard retrofit audit

Audit date: August 6, 2026

## Scope

The approved v1.1 scorecard architecture, typography, verdict hierarchy, canonical metrics, findings and research links remain unchanged. Only the historical-image layer, visible credits and minimum responsive CSS were added.

## WCW

### Authentic image

- `BT-WCW-003` — Diamond Dallas Page photographed as WCW World Heavyweight Champion
- Rights holder/source record: Diamond Dallas Page with Wikimedia VRT correspondence
- License: CC BY-SA 2.5
- The photographed person and championship belt are not retouched or covered by generated material.

### Canonical values preserved

- 90% of standard career-first world champions held earlier WCW-platform gold
- 400 operational records
- 12 tracked lineages
- 64.8% of world-title days held by established major-world veterans
- 94 recognized tag participants

## Original ECW

### Authentic image

- `BT-ECW-003` — Paul Heyman addressing the crowd at an original ECW TNN taping in White Plains, New York, on December 23, 1999
- Creator: Mr Jonathan Ice
- License: CC BY-SA 2.0
- This period-correct photograph replaces every WWE-era ECW substitute.

### Canonical values preserved

- 61.5% of mature World Champions held prior ECW core gold
- 135 operational records
- 13 standard mature world-era champions
- 6 tag-before-world paths
- 4.9% imported-veteran world-title share

## Prohibited imagery

The original ECW page verifier rejects:

- `BT-ECW-001`, the 2006 WWE-era ECW Paul Heyman photograph
- `BT-ECW-002`, the WWE-era ECW championship belt
- Source fragments `Paulheyman.jpg` and `ECW_Championship.jpg`

## Structural QA completed

Dimension-matched local test images were used because the chat runtime cannot retrieve Wikimedia binaries.

- Desktop viewport: 1536 × 1024
- Mobile viewport: 390 × 844
- Horizontal overflow: none
- Broken local images: none
- JavaScript errors: none
- Mobile navigation: opens and updates `aria-expanded`
- Captions and credits: separate bands below the photograph pixels
- Canonical source blocks and workbook links: preserved

## Open gate

The real generated derivatives still require desktop and 390-pixel inspection for faces, bodies, clothing, hands and the WCW championship belt. Draft PR #2 remains unmerged until those real-photo reviews pass.
