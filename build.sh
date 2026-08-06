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

echo "Belt Theory v1.1 built successfully."
echo "Output: $OUTPUT"
echo "HTML pages: $PAGE_COUNT"
echo "SHA-256: $ACTUAL_SHA256"
