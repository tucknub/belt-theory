import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'wwe-aew-star-manifest.json'), 'utf8'));
const file = path.join(out, 'image-credits.html');
let html = await readFile(file, 'utf8');
const esc = (value) => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cards = manifest.assets.map((asset) => {
  const variant = asset.variants.find((v) => v.requestedWidth === asset.defaultWidth) || asset.variants.at(-1);
  return `<article class="ff-star-credit-card"><img src="assets/archive/${variant.filename}" alt="${esc(asset.alt)}" loading="lazy" decoding="async"><div><p class="ff-section-label">${esc(asset.promotion)} champion library</p><h3>${esc(asset.caption)}</h3><p>${esc(asset.creator)} · <a href="${asset.licenseUrl}" rel="noreferrer" target="_blank">${esc(asset.license)}</a></p><p>${esc(asset.changes)}</p><a class="ff-text-link" href="${asset.sourcePage}" rel="noreferrer" target="_blank">Open source record →</a></div></article>`;
}).join('');
const section = `<section class="ff-simple-section ff-shell ff-star-credit-section ff-star-credit-section-wwe-aew"><div class="ff-section-intro"><div><p class="ff-section-label">Expanded WWE + AEW champion library</p><h2>Champions that match the argument.</h2></div><p>These images replace generic arena photography on the WWE and AEW fan-facing surfaces. The photographed wrestlers and championship belts remain authentic and unretouched; Belt Theory only resizes, frames and tones the source photography.</p></div><div class="ff-star-credit-grid">${cards}</div></section>`;
if (html.includes('ff-star-credit-section-wwe-aew')) throw new Error('WWE/AEW star credits already present.');
html = html.replace('</main>', `${section}</main>`);
await writeFile(file, html);
console.log('Published credits for six expanded WWE/AEW champion photographs.');
