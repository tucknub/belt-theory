# Authentic Archive review status

The draft branch is validated by `.github/workflows/authentic-archive-review.yml` on pull request updates and manual dispatches.

## Automated gate

The workflow must:

- Reconstruct the verified v1.1 production release
- Download eight approved authentic photographs during the build
- Generate responsive Belt Theory-hosted derivatives
- Generate the archival homepage and complete image-credits page
- Reject browser-facing image hotlinks
- Reject missing alt text, source records, license links, ledger IDs or focal points
- Reject the WWE-era ECW belt and 2006 WWE-era ECW imagery from original-ECW presentation
- Reject the U.S.-specific Vince magazine scans from the global build
- Reject globally ambiguous or incomplete production-rights records
- Upload the complete `dist` directory as a seven-day review artifact

## Rights correction completed

- The Vince McMahon magazine scans remain listed for research/legal review but are prohibited from production distribution.
- The WWE homepage proof uses the verified 2007 WWE Raw crowd photograph by JBZA2003 under CC BY-SA 2.5 instead.
- The original-ECW feature uses the period-correct 1999 Paul Heyman ECW TNN photograph by Mr Jonathan Ice under CC BY-SA 2.0.
- The WWE-era ECW belt and 2006 WWE-era ECW Paul Heyman photograph remain context-restricted and cannot appear as original-ECW evidence.

## Manual gates still required

The branch remains draft-only until all of these are completed against the generated artifact:

- Desktop visual review
- 390-pixel mobile crop review
- Image-license and visible-attribution review
- Historical-caption review
- Existing-design fidelity review
- Accessible alt-text review
- Performance review
- Canonical-number verification

Do not merge PR #2 before those manual gates pass.
