# Belt Theory v1.2 — Authentic Archive final release audit

Audit date: August 6–7, 2026

## Connected build

GitHub Actions successfully reconstructed the verified v1.1 release, verified the release SHA-256, downloaded all eight approved Wikimedia Commons image records, generated responsive local derivatives, applied every production retrofit, and uploaded the complete review artifact.

- Successful workflow run: `31136776021`
- Reviewed head commit: `59dd14ef8bd4ee22736442db5fa5e01be6d9dff0`
- Artifact ID: `8978241313`
- Artifact digest: `sha256:7b65b1fcb5ac5c7a98ce8941a852b72f72b2bab05a6a38c7e3c3b0edefd40bb6`
- Root production pages: 18
- Rights-approved archival records: 8
- Responsive image files: 19 plus generated manifest

## Real-photograph review

Every downloaded photograph was inspected in the actual production frame at 1536 × 1024 and 390 × 844.

Reviewed subjects and boundaries:

- AEW All In Wembley crowd and stage
- WWE Raw O2 Arena event
- WWE Raw Tucson crowd and arena
- Sting and Darby Allin coffin scene
- Raven at TNA Impact
- Diamond Dallas Page with the WCW World Heavyweight Championship
- Paul Heyman at the December 23, 1999 original ECW TNN taping
- Raven and Tommy Dreamer at TNA Impact

The Sting/Darby and Diamond Dallas Page photographs were changed from cover cropping to neutral contain framing after the first real-image review. The final framing preserves the full relevant subjects and championship belt.

## Browser QA

The final generated artifact was tested across every root page at both supported review sizes.

- Viewport checks: 36
- Horizontal-overflow failures: 0
- Broken-image failures: 0
- Missing intrinsic image dimensions: 0
- JavaScript or console errors: 0
- Missing descriptions: 0
- Heading-structure failures: 0
- Mobile menu failures: 0

Keyboard review:

- First Tab target: `Skip to content`
- Visible focus outline: 3px solid gold
- Activating the skip link moves the URL fragment to `#content`
- Mobile menu button has `type="button"`
- Mobile menu updates `aria-expanded` and exposes the navigation
- Current navigation links use `aria-current="page"`

## Rights and historical accuracy

- All real images map to the rights ledger and generated credits page.
- Visible captions include the source-supported event context.
- The Sting/Darby description was corrected to identify Darby Allin on the coffin rather than merely saying both wrestlers appeared together.
- The Diamond Dallas Page photograph does not invent an event date or venue.
- The original ECW photograph is the period-correct December 23, 1999 TNN taping image.
- Jurisdiction-limited Vince McMahon magazine scans remain excluded.
- WWE-era ECW imagery remains prohibited from original-ECW presentation.
- Captions and generated design remain outside photographed people, clothing, hands, bodies and championship belts.

## Canonical-content verification

All page-specific verifiers passed after the final build. The following remained unchanged:

- WWE scorecard: 55.8
- AEW scorecard: 68.2
- TNA scorecard: 73.2
- WCW pathway result: 90%
- Original ECW pathway result: 61.5%
- WWE vs. AEW: AEW 50.2 — WWE 49.8
- TNA vs. AEW: TNA 51.9 — AEW 48.1
- WWE vs. WCW vs. ECW: WWE 38.0 — ECW 32.7 — WCW 29.2
- TNA-created world-title share: 51.6% versus 48.4% imported

## Performance review

- Shared production CSS: 33,761 bytes
- Shared production JavaScript: 637 bytes
- Total responsive archival library: 4,860,176 bytes across all variants
- Largest single derivative: 668,485 bytes
- Homepage: one eager, high-priority establishing photograph; eight supporting photographs lazy-loaded
- All non-homepage archival photographs are lazy-loaded
- Responsive `srcset` variants are present
- Intrinsic width and height attributes prevent archival-image layout shift
- No browser-facing third-party image hotlinks remain
- No external web fonts or frontend framework payloads are required

## Release decision

The connected image build, real-photo crop review, attribution review, historical-caption review, design-preservation review, accessibility review, performance review and canonical-number verification all pass.

Belt Theory v1.2 — Authentic Archive Edition is approved for merge and deployment.
