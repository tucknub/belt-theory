# Era Theory Report Template

Every Era Theory report is a complete research project first and a website page second.

## Required report manifest

- Report number and slug
- Sport, league, team, promotion, or competition
- Era names and exact season/date cutoffs
- Active/incomplete evidence excluded from final scoring
- Native research workbook URL
- Final dimensions, weights, formulas, and limitations
- Final ranking and sensitivity-test result
- Last completed season included
- Next scheduled evidence update

## Minimum research modules

1. Era and leadership timeline
2. Season-level results
3. Sport-specific premium-position or cornerstone decisions
4. Drafting, recruiting, talent acquisition, or development
5. Trades, contracts, free agency, or resource allocation
6. Coaching and organizational ecosystem
7. Player/team peak production and retention
8. Injury, absence, disruption, or adversity response
9. Final weighted scorecard
10. Sensitivity and leave-one-dimension-out tests

The modules can change when a sport requires different categories. Era Theory should not force baseball, wrestling, college sports, or fantasy football into an NFL-specific model.

## Website route

Each report belongs at:

`src/reports/<slug>/index.html`

The umbrella homepage remains at:

`src/index.html`

Shared design and interaction files stay in `src/` unless the report genuinely needs a sport-specific visual system.

## Visual policy

- Use authentic editorial or archival imagery for real people, teams, crowds, venues, matches, games, ceremonies, and historical events.
- Never use generated lookalikes or fabricated documentary scenes.
- Generated material may support abstract atmosphere, maps, timelines, diagrams, textures, lighting, and data visualization.
- Every report must remain understandable without decorative imagery.

## Publication gate

A report is publishable only when:

- The workbook is source-linked and auditable.
- Scored cutoffs are explicit.
- Unresolved evidence is visibly excluded or labeled.
- The final conclusion survives plausible alternative weighting models.
- Mobile and desktop routes function.
- All relative links and assets pass the verification script.
