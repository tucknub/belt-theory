# Authentic Archive review status

## Production implementation complete

The draft branch reconstructs the verified v1.1 production release, verifies the rights ledger, downloads approved Commons photography into Belt Theory-local responsive paths during a connected build, and applies the Authentic Archive policy across the complete production library.

### Authentic-photo production surfaces

- Production homepage
- WWE scorecard
- AEW scorecard
- TNA scorecard
- WCW scorecard
- Original ECW scorecard
- WWE vs. AEW comparison
- TNA vs. AEW comparison
- WWE vs. WCW vs. ECW comparison
- TNA star-creation investigation
- Root production image-credits page
- Archival component and crop prototype

### Abstract-only support surfaces

- Scorecard library
- Comparison library
- Research library
- Methodology
- About
- Update policy

These support pages use code-native gradients and line textures rather than synthetic historical scenes.

## Rights and integrity controls

- Browser-facing remote image hotlinks are rejected.
- Missing alt text, creator, source page, license, focal point or responsive derivative is rejected.
- Jurisdiction-limited Vince McMahon magazine scans are excluded from global production.
- The 2006 WWE-era ECW Paul Heyman photograph and WWE-era ECW belt are prohibited from original-ECW presentation.
- Original ECW uses the period-correct December 23, 1999 Paul Heyman TNN-taping photograph.
- Every historical photograph maps to the rights ledger and generated credits page.
- Credits and captions occupy separate bands outside photographed pixels.
- Independent source frames are used instead of fabricated cross-promotion confrontations.
- Generated material may not cross into a photographed face, body, clothing, hands or championship belt.

## Structural QA complete

Dimension-matched local test images were used because the chat runtime cannot retrieve Wikimedia binaries.

- Desktop viewport: 1536 × 1024
- Mobile viewport: 390 × 844
- Horizontal overflow: none
- JavaScript errors: none
- Broken local image references: none
- Mobile navigation: working
- Internal links and canonical source blocks: preserved
- Canonical metrics, findings, comparison results and sensitivity statements: preserved
- Root production page count after credits generation: 18

## Remaining release gates

No production-page retrofit remains. The branch stays draft until a connected GitHub or Cloudflare build creates the real derivatives and these final gates pass:

1. Download and checksum verification of all eight approved image records
2. Desktop photographic crop review
3. 390-pixel mobile photographic crop review
4. Face, body, clothing, hand and championship-belt boundary review
5. Visible attribution and license review
6. Historical-caption review
7. Existing-design fidelity review using the real photographs
8. Accessibility review
9. Performance review
10. Canonical-number verification
11. Final merge and deployment decision

Do not merge PR #2 before these gates pass.
