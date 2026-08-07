#!/usr/bin/env bash
set -euo pipefail
EXPECTED_SHA256="c7ead293ebe9490f949f8c78c9a1909ab631794cd36e4a9d5f6dc1f6b789f2a3"
ARCHIVE=".belt-theory-site.zip"
OUTPUT="dist"
rm -rf "$OUTPUT" "$ARCHIVE"; mkdir -p "$OUTPUT"
{
  cat release-parts/site.zip.b64.part00
  cat release-parts/site.zip.b64.part01
  cat release-repair/part02-*
  cat release-repair/part03-*
  cat release-parts/site.zip.b64.part04
  cat release-parts/site.zip.b64.part05
  cat release-parts/site.zip.b64.part06
  cat release-parts/site.zip.b64.part07
} | LC_ALL=C tr -cd 'A-Za-z0-9+/=' | base64 --decode > "$ARCHIVE"
ACTUAL_SHA256="$(sha256sum "$ARCHIVE" | awk '{print $1}')"
[[ "$ACTUAL_SHA256" == "$EXPECTED_SHA256" ]] || { echo "Release checksum mismatch." >&2; echo "Expected: $EXPECTED_SHA256" >&2; echo "Actual:   $ACTUAL_SHA256" >&2; exit 1; }
unzip -q "$ARCHIVE" -d "$OUTPUT"; rm "$ARCHIVE"
required=(index.html scorecards.html comparisons.html methodology.html research.html about.html update-policy.html assets/site.css assets/site.js assets/mark.svg data/canonical.json _headers _redirects)
for path in "${required[@]}"; do [[ -f "$OUTPUT/$path" ]] || { echo "Missing required production file: $path" >&2; exit 1; }; done
BASE_PAGE_COUNT="$(find "$OUTPUT" -maxdepth 1 -type f -name '*.html' | wc -l | tr -d ' ')"
[[ "$BASE_PAGE_COUNT" == "17" ]] || { echo "Expected 17 base HTML pages; found $BASE_PAGE_COUNT." >&2; exit 1; }

scripts=(
  scripts/*archive*.mjs scripts/verify-rights-ledger.mjs scripts/verify-release-links.mjs
  scripts/apply-archive-crop-safety.mjs scripts/verify-archive-crop-safety.mjs
  scripts/finalize-release-accessibility.mjs scripts/verify-release-accessibility.mjs
  scripts/finalize-live-deployment.mjs scripts/verify-live-deployment.mjs
  scripts/finalize-systems-index-navigation.mjs
  scripts/build-systems-index.mjs scripts/verify-systems-index.mjs
  scripts/retrofit-production-home.mjs scripts/verify-production-home.mjs
  scripts/retrofit-wwe-scorecard.mjs scripts/verify-wwe-scorecard.mjs
  scripts/retrofit-aew-scorecard.mjs scripts/verify-aew-scorecard.mjs
  scripts/retrofit-tna-scorecard.mjs scripts/verify-tna-scorecard.mjs
  scripts/retrofit-historical-scorecards.mjs scripts/verify-historical-scorecards.mjs
  scripts/retrofit-tna-investigation.mjs scripts/verify-tna-investigation.mjs
  scripts/retrofit-tna-vs-aew.mjs scripts/verify-tna-vs-aew.mjs
  scripts/retrofit-comparison-reports.mjs scripts/verify-comparison-reports.mjs
  scripts/retrofit-support-pages.mjs scripts/verify-support-pages.mjs
)
for script in "${scripts[@]}"; do node --check "$script"; done

node scripts/verify-rights-ledger.mjs
node scripts/fetch-archive-assets.mjs "$OUTPUT"
node scripts/build-authentic-prototype.mjs "$OUTPUT"
node scripts/retrofit-production-home.mjs "$OUTPUT"
node scripts/retrofit-wwe-scorecard.mjs "$OUTPUT"
node scripts/retrofit-aew-scorecard.mjs "$OUTPUT"
node scripts/retrofit-tna-scorecard.mjs "$OUTPUT"
node scripts/retrofit-historical-scorecards.mjs "$OUTPUT"
node scripts/retrofit-tna-investigation.mjs "$OUTPUT"
node scripts/retrofit-tna-vs-aew.mjs "$OUTPUT"
node scripts/retrofit-comparison-reports.mjs "$OUTPUT"
node scripts/retrofit-support-pages.mjs "$OUTPUT"
node scripts/apply-archive-crop-safety.mjs "$OUTPUT"
node scripts/build-systems-index.mjs "$OUTPUT"
node scripts/finalize-systems-index-navigation.mjs "$OUTPUT"
node scripts/finalize-release-accessibility.mjs "$OUTPUT"
node scripts/finalize-live-deployment.mjs "$OUTPUT"
node scripts/verify-authentic-prototype.mjs "$OUTPUT"
node scripts/verify-production-home.mjs "$OUTPUT"
node scripts/verify-wwe-scorecard.mjs "$OUTPUT"
node scripts/verify-aew-scorecard.mjs "$OUTPUT"
node scripts/verify-tna-scorecard.mjs "$OUTPUT"
node scripts/verify-historical-scorecards.mjs "$OUTPUT"
node scripts/verify-tna-investigation.mjs "$OUTPUT"
node scripts/verify-tna-vs-aew.mjs "$OUTPUT"
node scripts/verify-comparison-reports.mjs "$OUTPUT"
node scripts/verify-support-pages.mjs "$OUTPUT"
node scripts/verify-archive-crop-safety.mjs "$OUTPUT"
node scripts/verify-systems-index.mjs "$OUTPUT"
node scripts/verify-release-accessibility.mjs "$OUTPUT"
node scripts/verify-release-links.mjs "$OUTPUT"
node scripts/verify-live-deployment.mjs "$OUTPUT"

archive_pages=(index.html systems-index.html image-credits.html scorecards.html comparisons.html research.html methodology.html about.html update-policy.html scorecard-wwe.html scorecard-aew.html scorecard-tna.html scorecard-wcw.html scorecard-ecw.html report-did-tna-create-stars.html report-tna-vs-aew.html report-wwe-vs-aew.html report-wwe-wcw-ecw.html prototype/authentic-home.html prototype/authentic-home.css prototype/image-credits.html assets/archive/manifest.json sitemap.xml robots.txt DEPLOY.md)
for path in "${archive_pages[@]}"; do [[ -f "$OUTPUT/$path" ]] || { echo "Missing production file: $path" >&2; exit 1; }; done
FINAL_PAGE_COUNT="$(find "$OUTPUT" -maxdepth 1 -type f -name '*.html' | wc -l | tr -d ' ')"
[[ "$FINAL_PAGE_COUNT" == "19" ]] || { echo "Expected 19 final production HTML pages; found $FINAL_PAGE_COUNT." >&2; exit 1; }
echo "Belt Theory v1.2 Authentic Archive build succeeded."
echo "Production HTML pages: $FINAL_PAGE_COUNT"
echo "Championship Systems Index: v1.0"
echo "Canonical production URL: https://belt-theory.tucknub.workers.dev/"
echo "Authentic surfaces: complete production library plus abstract-only support pages"
echo "Production credits: $OUTPUT/image-credits.html"
echo "Release SHA-256: $ACTUAL_SHA256"
