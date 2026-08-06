# Authentic Archive review status

## Completed implementation

The draft branch now reconstructs the verified v1.1 production release, verifies the rights ledger, fetches approved Commons photography into Belt Theory-local responsive paths, and retrofits these production surfaces without replacing their approved data architecture:

- Production homepage
- WWE scorecard
- AEW scorecard
- TNA scorecard
- WCW scorecard
- Original ECW scorecard
- TNA star-creation investigation
- TNA vs. AEW comparison
- Root production image-credits page
- Archival component and crop prototype

## Rights controls

- Browser-facing remote image hotlinks are rejected.
- Missing alt text, creator, source page, license, focal point or derivative is rejected.
- Jurisdiction-limited Vince McMahon magazine scans are excluded from global production.
- The 2006 WWE-era ECW Paul Heyman photograph and WWE-era ECW belt are prohibited from original-ECW presentation.
- Original ECW uses the period-correct December 23, 1999 Paul Heyman TNN-taping photograph.
- Credits and captions occupy separate bands below photo pixels.
- Generated material may not cross into a photographed face, body, clothing, hands or championship belt.

## Structural QA completed

Dimension-matched local test images were used because the chat runtime cannot retrieve Wikimedia binaries.

- Desktop: 1536 × 1024
- Mobile: 390 × 844
- Horizontal overflow: none
- JavaScript errors: none
- Broken local image references: none
- Mobile navigation: working
- Internal links and source blocks: preserved
- Canonical metrics and findings: preserved

## Remaining implementation

- WWE vs. AEW comparison
- WWE vs. WCW vs. ECW comparison
- Research, methodology, about and policy image surfaces
- Final credits-page expansion

## Manual gates still required

The branch remains draft-only until the connected build creates the real derivatives and all of these pass:

- Desktop photographic crop review
- 390-pixel mobile photographic crop review
- Face, body, clothing, hand and championship-belt boundary review
- Visible attribution and license review
- Historical-caption review
- Existing-design fidelity review
- Accessibility review
- Performance review
- Canonical-number verification

Do not merge PR #2 before those gates pass.
