import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const prototypeOut = path.join(outputRoot, 'prototype');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const focalPoints = JSON.parse(await readFile(path.join(root, 'data', 'archive-focal-points.json'), 'utf8'));

await mkdir(prototypeOut, { recursive: true });
const baseCss = await readFile(path.join(root, 'prototype', 'authentic-home.css'), 'utf8');
const protectionCss = await readFile(path.join(root, 'prototype', 'authentic-subject-protection.css'), 'utf8');
const archiveCss = `${baseCss}

/* Rights-aware responsive crop component. Generated atmosphere is kept outside
   image boundaries; these variables only choose the crop of the authentic photo. */
.archive-image { object-position: var(--archive-focus-desktop, 50% 50%) !important; }
@media (max-width: 760px) {
  .archive-image { object-position: var(--archive-focus-mobile, var(--archive-focus-desktop, 50% 50%)) !important; }
}
`;
await writeFile(path.join(prototypeOut, 'authentic-home.css'), archiveCss);
await writeFile(path.join(prototypeOut, 'authentic-subject-protection.css'), protectionCss);

let html = await readFile(path.join(root, 'prototype', 'authentic-home.html'), 'utf8');
for (const asset of manifest.assets) {
  const focus = focalPoints[asset.id];
  if (!focus) throw new Error(`Missing protected focal points for ${asset.id}`);
  const defaultFile = `../assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}`;
  const srcset = asset.widths
    .map((width) => `../assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`)
    .join(', ');
  const replacement = `data-asset-id="${asset.id}" class="archive-image" style="--archive-focus-desktop:${focus.desktop};--archive-focus-mobile:${focus.mobile}" src="${defaultFile}" srcset="${srcset}" sizes="(max-width: 760px) 100vw, 70vw" decoding="async"`;
  const needle = `src="${asset.remoteSrc}"`;
  if (!html.includes(needle)) throw new Error(`Prototype does not reference ${asset.id}: ${asset.remoteSrc}`);
  html = html.replaceAll(needle, replacement);
}

html = html.replace(
  '</head>',
  '  <meta name="archive-image-policy" content="Authentic photography for real people and real events; AI is decorative only.">\n</head>'
);
html = html.replace(
  '<p>Prototype assets remain subject to the rights ledger and final production review.</p>',
  '<p>All displayed historical photographs are self-hosted build derivatives with visible credits.</p>\n    <a class="text-link" href="image-credits.html">Photography credits and licenses →</a>'
);
await writeFile(path.join(prototypeOut, 'authentic-home.html'), html);

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const creditCards = manifest.assets.map((asset) => `
      <article class="credit-card" id="${escapeHtml(asset.id)}">
        <img src="../assets/archive/${escapeHtml(asset.slug)}-${asset.defaultWidth}.${escapeHtml(asset.extension)}" alt="${escapeHtml(asset.alt)}" loading="lazy" decoding="async">
        <div>
          <span>${escapeHtml(asset.id)}</span>
          <h2>${escapeHtml(asset.caption)}</h2>
          <p><strong>Creator:</strong> ${escapeHtml(asset.creator)}</p>
          <p><strong>License:</strong> <a href="${escapeHtml(asset.licenseUrl)}">${escapeHtml(asset.license)}</a></p>
          <p><strong>Changes:</strong> ${escapeHtml(asset.changes)}</p>
          <p><a href="${escapeHtml(asset.sourcePage)}">Open the original source record →</a></p>
        </div>
      </article>`).join('');

const credits = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Photography credits, licenses, source records and transformation disclosures for Belt Theory's Authentic Archive edition.">
  <title>Belt Theory — Photography Credits</title>
  <link rel="stylesheet" href="authentic-home.css">
  <style>
    .credits-main{width:min(1180px,calc(100% - 32px));margin:auto;padding:120px 0 80px}.credits-main>h1{font:clamp(58px,8vw,118px)/.82 Impact,sans-serif;margin:0 0 24px;text-transform:uppercase}.credits-main>p{max-width:850px;color:var(--paper-dim);font-size:17px;line-height:1.7}.credits-grid{display:grid;gap:18px;margin-top:46px}.credit-card{display:grid;grid-template-columns:minmax(260px,.7fr) 1fr;border:1px solid var(--line);background:#0a0c0c}.credit-card img{height:100%;min-height:320px;object-fit:cover}.credit-card>div{padding:30px}.credit-card span{color:var(--gold-soft);font-size:10px;font-weight:900;letter-spacing:.14em}.credit-card h2{font:36px/.95 Impact,sans-serif;text-transform:uppercase}.credit-card p{color:var(--paper-dim);line-height:1.6}.credit-card a{color:var(--gold-soft)}@media(max-width:720px){.credit-card{grid-template-columns:1fr}.credit-card img{min-height:240px}}
  </style>
</head>
<body>
  <header class="site-header"><a class="wordmark" href="authentic-home.html"><span>BELT</span><b>THEORY</b></a><nav aria-label="Credits navigation"><a href="authentic-home.html">Archive homepage</a></nav></header>
  <main class="credits-main">
    <p class="section-number">Authentic Archive Edition</p>
    <h1>Photography credits<br>and licenses.</h1>
    <p>Real wrestlers, promoters, crowds, venues, championship belts and named historical events are presented only through authentic photography. Responsive crops are disclosed below. No generative material is placed over a photographed person, clothing, hands, body or championship belt.</p>
    <section class="credits-grid">${creditCards}
    </section>
  </main>
</body>
</html>`;
await writeFile(path.join(prototypeOut, 'image-credits.html'), credits);
console.log(`Built Authentic Archive prototype with ${manifest.assets.length} self-hosted image records and protected focal crops.`);
