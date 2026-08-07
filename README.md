# Belt Theory

**Championship history, measured.**

Belt Theory is a static wrestling championship analytics publication built from the project's canonical WWE, AEW, TNA, WCW and original ECW research.

Production: https://belt-theory.tucknub.workers.dev/

## Launch library

- Five promotion scorecards: WWE, AEW, TNA, WCW and original ECW
- Three matched comparisons
- One focused TNA star-creation investigation
- Methodology, research-source, about, image-credit and update-policy pages
- Shared canonical research data
- Eighteen production HTML pages including the custom 404 page

## Build

The verified v1.1 source package is stored in text-safe release payloads, with repaired subsegments for the two payload sections that could not be transferred intact through the original contents API path.

```bash
npm run build
```

The v1.2 build:

1. Reassembles the verified release archive.
2. Verifies SHA-256 `c7ead293ebe9490f949f8c78c9a1909ab631794cd36e4a9d5f6dc1f6b789f2a3`.
3. Expands the site into `dist/`.
4. Verifies the image-rights ledger.
5. Downloads and validates eight approved historical photo records and responsive derivatives.
6. Applies the Authentic Archive production retrofits.
7. Verifies crop safety, accessibility, links and canonical research values.
8. Adds the production hostname, canonical URLs, Open Graph/Twitter metadata, sitemap, robots file and deployment metadata.
9. Confirms exactly 18 production HTML pages exist.

## Cloudflare Workers Static Assets

Cloudflare production settings:

```text
Repository: tucknub/belt-theory
Production branch: main
Build command: npm run build
Deploy command: npx wrangler deploy
Root directory: /
Build variables: none
```

`wrangler.toml` publishes `./dist` as Cloudflare Workers Static Assets.

Current production URL:

```text
https://belt-theory.tucknub.workers.dev/
```

## Local preview

```bash
npm run build
python -m http.server 8080 --directory dist
```

Open `http://localhost:8080`.

## Research snapshot

The current canonical research cutoff is **August 5, 2026**. The build emits the production audit, copyright, deployment and fidelity documentation into `dist/`.
