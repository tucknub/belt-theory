# Era Theory

Era Theory is a reusable sports-leadership analysis site. It turns complete research workbooks into visual, interactive reports without pretending every sport should use the same scoring model.

## Site structure

- `/` — Era Theory umbrella homepage and report library
- `/reports/colts/` — Report 001: Colts Era Lab
- `REPORT_TEMPLATE.md` — requirements and route rules for future reports

## Report 001: Colts Era Lab

The completed 1998–2025 Indianapolis Colts front-office study compares Bill Polian, Ryan Grigson, and Chris Ballard.

- Bill Polian: 70.5
- Ryan Grigson: 61.1
- Chris Ballard: 47.8
- Seven weighted dimensions
- Interactive sensitivity model
- Quarterback, draft, transaction, coaching, player-peak, and resilience chapters

## Visual policy

The production site does not use AI-generated lookalikes of real people or synthetic documentary imagery. Generated material may support abstract atmosphere, textures, maps, diagrams, and data visualization. Any future real-person or historical-event photography must be authentic and appropriately licensed or sourced.

## Local use

```bash
npm run build
npm run verify
npm run start
```

Open `http://localhost:4173` for the homepage and `http://localhost:4173/reports/colts/` for Report 001.

## Deployment

The output directory is `dist`.

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

## Research source

The complete native Google Sheet remains the evidence base:

https://docs.google.com/spreadsheets/d/1Zl42YOhVsX5eMijGNVE1irY-5r5eUJ32es7rifFD3Hk/edit
