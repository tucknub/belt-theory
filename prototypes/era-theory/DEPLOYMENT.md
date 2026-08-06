# Era Theory deployment

Era Theory is a static multi-route site. The build output is `dist/`.

## Cloudflare Pages direct upload

Prerequisites:

- Node.js 20+
- An authenticated Cloudflare account
- Wrangler 4.x

```bash
npm run build
npm run verify
npx wrangler pages project create era-theory --production-branch main
npx wrangler pages deploy dist --project-name era-theory --branch main
```

The first production URL will be:

`https://era-theory.pages.dev`

Subsequent releases only require:

```bash
npm run build
npm run verify
npx wrangler pages deploy dist --project-name era-theory --branch main
```

## Cloudflare Pages repository build

- Root directory: `/`
- Build command: `npm run build && npm run verify`
- Build output directory: `dist`
- Production branch: `main`

## Routes

- `/` — Era Theory report library
- `/reports/colts/` — Colts Era Lab

## Release gate

Do not publish until both routes pass desktop and mobile visual review, the interaction tests pass, and the research cutoff remains visible.
