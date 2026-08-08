import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'tna-star-manifest.json'), 'utf8'));
const file = path.join(out, 'image-credits.html');
let html = await readFile(file, 'utf8');
const cards = manifest.assets.map((asset) => {
  const variant = asset.variants.find((v) => v.requestedWidth === asset.defaultWidth) || asset.variants.at(-1);
  return `<article class="ff-star-credit-card"><img src="assets/archive/${variant.filename}" alt="${asset.alt.replaceAll('&','&amp;').replaceAll('"','&quot;')}" loading="lazy" decoding="async"><div><p class="ff-section-label">Expanded TNA editorial library</p><h3>${asset.caption}</h3><p>${asset.creator} · <a href="${asset.licenseUrl}" rel="noreferrer" target="_blank">${asset.license}</a></p><p>${asset.changes}</p><a class="ff-text-link" href="${asset.sourcePage}" rel="noreferrer" target="_blank">Open source record →</a></div></article>`;
}).join('');
const section = `<section class="ff-simple-section ff-shell ff-star-credit-section"><div class="ff-section-intro"><div><p class="ff-section-label">Expanded TNA star library</p><h2>Real wrestlers. Real source records.</h2></div><p>These four photographs were added specifically to improve the fan-first TNA storytelling. They remain unretouched historical photography; only responsive resizing, CSS framing and tonal treatment are used.</p></div><div class="ff-star-credit-grid">${cards}</div></section>`;
if (html.includes('ff-star-credit-section')) throw new Error('TNA star credits already present.');
html = html.replace('</main>', `${section}</main>`);
await writeFile(file, html);
console.log('Published credits for four expanded TNA star photographs.');
