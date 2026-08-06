#!/usr/bin/env bash
set -euo pipefail

EXPECTED_SHA256="c7ead293ebe9490f949f8c78c9a1909ab631794cd36e4a9d5f6dc1f6b789f2a3"
ARCHIVE=".belt-theory-site.zip"
OUTPUT="dist"

rm -rf "$OUTPUT" "$ARCHIVE"
mkdir -p "$OUTPUT"

cat release-parts/site.zip.b64.part* | base64 --decode > "$ARCHIVE"
ACTUAL_SHA256="$(sha256sum "$ARCHIVE" | awk '{print $1}')"

if [[ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]]; then
  echo "Release checksum mismatch." >&2
  echo "Expected: $EXPECTED_SHA256" >&2
  echo "Actual:   $ACTUAL_SHA256" >&2
  exit 1
fi

unzip -q "$ARCHIVE" -d "$OUTPUT"
rm "$ARCHIVE"

required=(
  index.html
  scorecards.html
  comparisons.html
  methodology.html
  research.html
  about.html
  update-policy.html
  assets/site.css
  assets/site.js
  assets/mark.svg
  data/canonical.json
  _headers
  _redirects
)

for path in "${required[@]}"; do
  if [[ ! -f "$OUTPUT/$path" ]]; then
    echo "Missing required production file: $path" >&2
    exit 1
  fi
done

BASE_PAGE_COUNT="$(find "$OUTPUT" -maxdepth 1 -type f -name '*.html' | wc -l | tr -d ' ')"
if [[ "$BASE_PAGE_COUNT" != "17" ]]; then
  echo "Expected 17 base HTML pages; found $BASE_PAGE_COUNT." >&2
  exit 1
fi

# Authentic Archive build. Approved Commons originals are fetched during the
# build and saved under Belt Theory's own output paths. Browser markup uses only
# local URLs; source and license URLs remain visible in the credits pages.
for script in \
  scripts/*archive*.mjs \
  scripts/verify-rights-ledger.mjs \
  scripts/retrofit-production-home.mjs \
  scripts/verify-production-home.mjs \
  scripts/retrofit-tna-scorecard.mjs \
  scripts/verify-tna-scorecard.mjs \
  scripts/retrofit-tna-investigation.mjs \
  scripts/verify-tna-investigation.mjs; do
  node --check "$script"
done
node scripts/verify-rights-ledger.mjs
node scripts/fetch-archive-assets.mjs "$OUTPUT"
node scripts/build-authentic-prototype.mjs "$OUTPUT"
node scripts/retrofit-production-home.mjs "$OUTPUT"
node scripts/retrofit-tna-scorecard.mjs "$OUTPUT"
node scripts/retrofit-tna-investigation.mjs "$OUTPUT"
node scripts/verify-authentic-prototype.mjs "$OUTPUT"
node scripts/verify-production-home.mjs "$OUTPUT"
node scripts/verify-tna-scorecard.mjs "$OUTPUT"
node scripts/verify-tna-investigation.mjs "$OUTPUT"

for path in \
  index.html \
  image-credits.html \
  scorecard-tna.html \
  report-did-tna-create-stars.html \
  prototype/authentic-home.html \
  prototype/authentic-home.css \
  prototype/image-credits.html \
  assets/archive/manifest.json; do
  if [[ ! -f "$OUTPUT/$path" ]]; then
    echo "Missing Authentic Archive file: $path" >&2
    exit 1
  fi
done

FINAL_PAGE_COUNT="$(find "$OUTPUT" -maxdepth 1 -type f -name '*.html' | wc -l | tr -d ' ')"
if [[ "$FINAL_PAGE_COUNT" != "18" ]]; then
  echo "Expected 18 final production HTML pages; found $FINAL_PAGE_COUNT." >&2
  exit 1
fi

python "$OUTPUT/scripts/verify.py"

echo "Belt Theory v1.2 Authentic Archive build succeeded."
echo "Output: $OUTPUT"
echo "Production HTML pages: $FINAL_PAGE_COUNT"
echo "Production homepage: $OUTPUT/index.html"
echo "TNA scorecard: $OUTPUT/scorecard-tna.html"
echo "TNA investigation: $OUTPUT/report-did-tna-create-stars.html"
echo "Production credits: $OUTPUT/image-credits.html"
echo "Archive prototype: $OUTPUT/prototype/authentic-home.html"
echo "Release SHA-256: $ACTUAL_SHA256"
