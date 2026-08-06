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

PAGE_COUNT="$(find "$OUTPUT" -maxdepth 1 -type f -name '*.html' | wc -l | tr -d ' ')"
if [[ "$PAGE_COUNT" != "17" ]]; then
  echo "Expected 17 HTML pages; found $PAGE_COUNT." >&2
  exit 1
fi

# Authentic Archive review build. Approved Commons originals are fetched during
# the build and saved under Belt Theory's own output paths. Browser markup uses
# only local URLs; source and license URLs remain visible in the credits page.
node scripts/fetch-archive-assets.mjs "$OUTPUT"
node scripts/build-authentic-prototype.mjs "$OUTPUT"
node scripts/verify-authentic-prototype.mjs "$OUTPUT"

for path in \
  prototype/authentic-home.html \
  prototype/authentic-home.css \
  prototype/image-credits.html \
  assets/archive/manifest.json; do
  if [[ ! -f "$OUTPUT/$path" ]]; then
    echo "Missing Authentic Archive file: $path" >&2
    exit 1
  fi
done

echo "Belt Theory v1.2 Authentic Archive review build succeeded."
echo "Output: $OUTPUT"
echo "Production HTML pages: $PAGE_COUNT"
echo "Archive prototype: $OUTPUT/prototype/authentic-home.html"
echo "Release SHA-256: $ACTUAL_SHA256"
