# Production homepage Authentic Archive retrofit audit

Audit date: August 6, 2026

## Scope

The production homepage remains the approved v1.1 page. The retrofit changes only its imagery, credits and minimum supporting CSS. Navigation, hero copy, promotion order, metrics, comparison links, TNA investigation argument and responsive component structure remain intact.

## Implemented image map

- Hero — BT-AEW-001, AEW All In 2023 at Wembley Stadium
- WWE scorecard card — BT-WWE-002, Vince McMahon Sr. and Vince McMahon Jr.
- AEW scorecard card — BT-AEW-003, Sting and Darby Allin at All In 2023
- TNA scorecard card — BT-TNA-001, Raven at a TNA Impact taping in 2010
- WCW scorecard card — BT-WCW-003, Diamond Dallas Page as WCW World Heavyweight Champion
- Original ECW scorecard card — BT-ECW-003, Paul Heyman at an original ECW TNN taping in 1999
- WWE vs. AEW comparison card — BT-WWE-001 and BT-AEW-001
- TNA investigation evidence — BT-TNA-003, Raven and Tommy Dreamer at a TNA Impact taping in 2010

## Removed

- All `images.unsplash.com` wrestling-background dependencies from the built production CSS
- Generic shared wrestling imagery from the promotion scorecards
- Image-like background treatment from comparison cards that do not have an approved historical photo pairing
- The rejected WWE-era ECW belt and 2006 WWE-era ECW Paul Heyman imagery

## Added

- Local responsive `srcset` records under `assets/archive/`
- Visible creator/license/event credits
- Separate desktop and mobile focal points
- Root-level `image-credits.html`
- Authentic-image-policy metadata
- Automated preservation checks for production navigation and principal homepage copy
- Automated checks for remote image URLs, missing alt text, missing derivatives, missing source/license links and prohibited ECW assets

## Structural QA completed

The retrofit was exercised with dimension-matched local test images because the chat runtime cannot resolve Wikimedia's binary host.

- Desktop viewport: 1536 × 1024
- Mobile viewport: 390 × 844
- Horizontal overflow: none
- Broken images after lazy-load scroll: none
- JavaScript errors: none
- Mobile menu: opens and updates `aria-expanded`
- Local link/asset verification: 18 pages, zero errors
- Homepage archival IDs: all eight present
- Approved navigation and headline copy: preserved

## Open review gate

The actual photographic derivatives must still be generated in GitHub or Cloudflare and inspected visually. Structural QA does not approve face, body, hand, clothing or championship-belt crops. PR #2 must remain draft until that review is complete.
