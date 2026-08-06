# Belt Theory

**Championship history, measured.**

Belt Theory is a static wrestling championship analytics publication built from the project's canonical WWE, AEW, TNA, WCW and original ECW research.

## Launch library

- Five promotion scorecards: WWE, AEW, TNA, WCW and original ECW
- Three matched comparisons
- One focused TNA star-creation investigation
- Methodology, research-source, about and update-policy pages
- Shared canonical research data
- Seventeen production HTML pages

## Build

The verified v1.1 site is stored as eight text-safe release segments so the complete package can be transferred through the GitHub connection without losing files.

```bash
npm run build
```

The build:

1. Reassembles the release archive from `release-parts/`.
2. Verifies SHA-256 `c7ead293ebe9490f949f8c78c9a1909ab631794cd36e4a9d5f6dc1f6b789f2a3`.
3. Expands the complete site into `dist/`.
4. Confirms all required assets and exactly 17 HTML pages exist.

## Cloudflare Pages

Use these settings:

```text
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
Production branch: main
```

`wrangler.toml` already points Cloudflare Pages to `dist`.

## Local preview

```bash
npm run build
python -m http.server 8080 --directory dist
```

Open `http://localhost:8080`.

## Research snapshot

The current canonical research cutoff is **August 5, 2026**. See the generated `AUDIT.md`, `COPYRIGHT.md`, `DEPLOY.md` and `FIDELITY_LEDGER.md` files inside `dist` after building.
