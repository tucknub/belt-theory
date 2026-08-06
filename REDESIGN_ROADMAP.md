# Belt Theory — Authentic Imagery Retrofit Roadmap

## Objective

Replace synthetic or misleading historical imagery with authentic, rights-cleared wrestling photography **while preserving the existing Belt Theory design system**.

This is an imagery, attribution and historical-integrity retrofit—not a wholesale redesign.

The binding preservation rules are defined in `DESIGN_PRESERVATION_RULE.md`.

## Release target

**Belt Theory v1.2 — Authentic Archive Edition**

The release must preserve:

- approved page architecture
- existing typography and visual hierarchy
- black, charcoal, gold and promotion-accent system
- data rails, verdict blocks and comparison modules
- canonical findings and August 5, 2026 research snapshot
- navigation, source transparency and responsive behavior

## Phase 1 — Rights and asset foundation

- Maintain `IMAGE_RIGHTS_LEDGER.csv` for every real photograph, logo, document and historical graphic
- Maintain `AI_DESIGN_ASSET_LEDGER.csv` separately
- Verify the exact license, creator, source page and modification requirements before downloading
- Reject every `License review` image from production until verification is complete
- Store original files, optimized derivatives and attribution text separately
- Add focal-point metadata for desktop, tablet and mobile crops
- Create reusable caption, credit, license and image-source components
- Add a complete image-credits page

## Phase 2 — Homepage imagery retrofit

Start from the approved production homepage.

Preserve its composition, typography, data hierarchy, copy, promotion modules and overall visual character. Replace only the imagery and the minimum surrounding structure required for authentic photography.

### Required changes

- Replace synthetic championship and arena imagery that could be mistaken for real history
- Insert authentic event, arena, wrestler, owner and belt photographs into the existing page structure
- Add visible credits and historical captions
- Preserve negative space around faces, bodies, hands, clothing and belts
- Self-host approved responsive derivatives
- Retain original Belt Theory atmosphere through abstract textures and design outside the photo boundaries

### Prototype usage

`prototype/authentic-home.html` is a photo-component and crop test. It is not automatically the replacement homepage.

Use it to validate:

- photography choices
- caption design
- license presentation
- focal-point behavior
- mobile crops
- photo/data relationships

Transfer successful components into the production homepage without unnecessarily changing the production layout.

## Phase 3 — Five scorecard image packages

Retrofit the existing scorecards in this order:

1. TNA
2. WWE
3. AEW
4. WCW
5. Original ECW

For each scorecard:

- preserve the approved scorecard structure
- replace the hero and historical image surfaces
- add real promotion-specific photographs
- add visible credits and context
- maintain existing metrics, verdicts and data modules
- avoid turning the page into a generic photo gallery

### WWE imagery

- arena scale
- ownership and management portraits
- actual championship presentations
- generational historical photographs

### AEW imagery

- Wembley or major-event scale
- real faction and tag-team action
- crowd identity and modern production
- actual champions and title celebrations

### TNA imagery

- six-sided-ring and Impact Zone history
- X-Division action
- Knockouts and tag-team photography
- visual identity changes across management phases

### WCW imagery

- Nitro-era event photography
- Turner-era production scale
- world champions, U.S./TV pathways and faction-era imagery
- management and governance portraits

### Original ECW imagery

- intimate venue atmosphere
- core champions, belt and audience proximity
- Paul Heyman and operational identity
- clear distinction between original ECW and later WWE ECW photographs

## Phase 4 — Comparison report image packages

Preserve the existing report structures and comparison scorecards.

### WWE vs. AEW

- one authentic image per promotion in the existing split treatment
- matched image categories for world title, pathways, women, teams and governance
- no invented face-off or composite involving people who were not together

### TNA vs. AEW

- authentic TNA event or six-sided-ring image against authentic AEW stadium or crowd imagery
- existing blue/gold comparison atmosphere may remain outside the photographs

### WWE vs. WCW vs. ECW

- era-correct authentic images inside the existing three-promotion structure
- print and broadcast textures may remain as decoration

## Phase 5 — TNA investigation

Preserve the existing long-form report and canonical argument.

Replace synthetic historical imagery with:

- authentic TNA champion or event photography
- real X-Division, tag and Knockouts imagery
- management and ownership photographs for phase transitions
- a real photographic pathway wall where licensing permits

Do not restructure the report unless image integrity or accessibility requires it.

## Phase 6 — Reusable image components

Build only the components needed to retrofit the current site:

- authentic photo frame
- photo hero
- split-photo comparison
- caption and photographer credit
- license badge
- image-credit drawer
- archival date and location stamp
- responsive focal-point control
- photo/data side rail
- real belt detail panel
- AI-assisted conceptual divider outside photo boundaries
- corrections and source-note footer

## Phase 7 — Accessibility and integrity

- Every meaningful photograph receives editorial alt text
- Decorative AI texture receives empty alt text
- Credits remain visible without hover
- Mobile crops are manually approved
- Faces, belts and action focal points remain intact
- Historical claims are not conveyed by imagery alone
- Every image is traceable to a ledger entry
- Generated material never crosses into a real person’s face, body, clothing, hands or championship belt

## Phase 8 — Performance

- Preserve archival quality while generating responsive derivatives
- Use AVIF/WebP when appropriate and retain originals outside the delivery path
- Preload only the first hero image
- Lazy-load supporting photography
- Set dimensions and aspect ratios to prevent layout shift
- Avoid third-party hotlinks in production

## Phase 9 — Review gates

A page cannot merge until it passes:

1. Historical accuracy review
2. License and attribution review
3. Existing-design fidelity review
4. Desktop visual review
5. 390-pixel mobile crop review
6. Accessibility review
7. Performance review
8. Canonical-number verification

## Planned implementation order

1. Homepage image retrofit
2. TNA scorecard
3. TNA star-creation report
4. TNA vs. AEW
5. WWE scorecard
6. AEW scorecard
7. WCW scorecard
8. ECW scorecard
9. WWE vs. AEW
10. WWE vs. WCW vs. ECW
11. Research, methodology, about and policy image surfaces
12. Full credits page and final audit

## Definition of complete

The retrofit is complete when:

- the existing Belt Theory design remains recognizably intact
- no real person is represented by an AI-generated likeness
- every real image has a verified rights-ledger entry
- every AI-assisted image is clearly decorative or conceptual
- all canonical data remains unchanged unless the research workbook is updated
- the site passes all eight review gates
- the release is deployed only after side-by-side comparison with the approved production design

## Final principle

> Keep the Belt Theory style. Replace fake history with real history.
