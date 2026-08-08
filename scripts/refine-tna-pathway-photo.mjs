import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'tna-star-manifest.json'), 'utf8'));
const storm = manifest.assets.find((asset) => asset.id === 'BT-TNA-STAR-003');
if (!storm) throw new Error('Missing BT-TNA-STAR-003.');
const variant = storm.variants.find((v) => v.requestedWidth === storm.defaultWidth) || storm.variants.at(-1);
const src = `assets/archive/${variant.filename}`;
const esc = (value) => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;');

const oldFigure = new RegExp(`<figure class="ff-tna-pathway-photo"><img src="${src.replaceAll('.', '\\.')}" alt="[^"]*" loading="lazy" decoding="async"><figcaption>([\\s\\S]*?)<\\/figcaption><\\/figure>`);
const newFigure = `<figure class="ff-tna-pathway-photo ff-tna-pathway-portrait"><img class="ff-pathway-bg" src="${src}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img class="ff-pathway-main" src="${src}" alt="${esc(storm.alt)}" loading="lazy" decoding="async"><figcaption><a class="ff-photo-credit" href="${storm.sourcePage}" rel="noreferrer" target="_blank">${esc(storm.shortCredit)}</a></figcaption></figure>`;

for (const page of ['report-did-tna-create-stars.html','scorecard-tna.html']) {
  const file = path.join(out, page);
  const html = await readFile(file, 'utf8');
  const matches = html.match(oldFigure);
  if (!matches) throw new Error(`${page}: TNA pathway figure not found.`);
  const next = html.replace(oldFigure, newFigure);
  await writeFile(file, next);
}
console.log('Protected James Storm tag-title evidence with full-subject portrait framing on both TNA pages.');
