# Support-page archive-policy audit

Audit date: August 6, 2026

## Pages covered

- Scorecard library
- Comparison library
- Research library
- Methodology
- About
- Update policy

## Decision

These pages do not need historical photography to communicate evidence. Their hero surfaces now use code-native gradients and line textures only. They do not depict real wrestlers, crowds, events, venues or championship belts.

## Added

- `archive-image-policy` metadata
- Production image-credits link
- Shared `archive-support-hero` class
- Abstract-only visual treatment

## Automated checks

Each support page must:

- Use the abstract support hero
- Link the production image-credits page
- Include archive-policy metadata
- Contain no remote browser image source
- Contain no historical `data-asset-id` without page-specific review

## Structural QA

Representative pages were tested at 1536 × 1024 and 390 × 844.

- Horizontal overflow: none
- JavaScript errors: none
- Mobile navigation: working
- Credits and policy metadata: present

This completes the production-page implementation phase. The remaining gates concern the connected real-derivative build and final accessibility, performance, copyright, caption and canonical-number reviews.
