# Authentic Archive review status

This branch is validated by `.github/workflows/authentic-archive-review.yml` on pull request updates.

The gate must:

- Reconstruct the verified v1.1 production release
- Download eight approved authentic photographs during the build
- Generate responsive Belt Theory-hosted derivatives
- Generate the archival homepage and complete image-credits page
- Reject browser-facing image hotlinks
- Reject missing alt text, source records, license links or focal points
- Reject the WWE-era ECW belt and 2006 WWE-era ECW imagery from original-ECW presentation
- Upload the complete `dist` directory as a review artifact

The branch remains draft-only until the generated desktop and 390-pixel crops are visually reviewed.
