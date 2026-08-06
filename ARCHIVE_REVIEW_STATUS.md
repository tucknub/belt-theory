# Authentic Archive review status

The draft branch is validated by `.github/workflows/authentic-archive-review.yml` on pull request updates and manual dispatches.

## Completed implementation

- Reconstruct the verified v1.1 production release
- Verify the rights ledger before any archival download
- Download eight approved authentic photographs during a connected build
- Generate responsive Belt Theory-hosted derivatives
- Generate the archival component prototype and credits page
- Retrofit the approved production homepage without changing its navigation, copy, metrics or page structure
- Generate a root production `image-credits.html`
- Remove the generic Unsplash wrestling background from built production CSS
- Reject browser-facing image hotlinks
- Reject missing alt text, source records, license links, ledger IDs or focal points
- Reject the WWE-era ECW belt and 2006 WWE-era ECW imagery from original-ECW presentation
- Reject the jurisdiction-limited Vince McMahon magazine scans from the global build
- Verify the production retrofit structurally at 1536 × 1024 and 390 × 844

## Rights decisions

- The Vince McMahon magazine scans remain listed for research/legal review but are prohibited from production distribution.
- The WWE homepage uses the verified 2007 WWE Raw crowd photograph by JBZA2003 under CC BY-SA 2.5.
- The original-ECW feature uses the period-correct 1999 Paul Heyman ECW TNN photograph by Mr Jonathan Ice under CC BY-SA 2.0.
- The WWE-era ECW belt and 2006 WWE-era ECW Paul Heyman photograph remain context-restricted and cannot appear as original-ECW evidence.

## Manual gates still required

The branch remains draft-only until all of these are completed against the real generated derivatives:

- Desktop photographic crop review
- 390-pixel mobile photographic crop review
- Face, body, clothing, hand and championship-belt boundary review
- Image-license and visible-attribution review
- Historical-caption review
- Existing-design fidelity review
- Accessible alt-text review
- Performance review
- Canonical-number verification

Do not merge PR #2 before those manual gates pass.
