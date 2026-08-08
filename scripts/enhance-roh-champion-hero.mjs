import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'roh-manifest.json'), 'utf8'));
const map = new Map(manifest.assets.map((asset) => [asset.id, asset]));

const esc = (value) => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function asset(id) {
  const a = map.get(id);
  if (!a) throw new Error(`Missing ROH archive asset ${id}`);
  const v = a.variants?.find((x) => x.requestedWidth === a.defaultWidth) || a.variants?.at(-1);
  if (!v) throw new Error(`Missing built variant for ${id}`);
  return { ...a, src: `assets/archive/${v.filename}` };
}
function credit(a) {
  return `<a href="${esc(a.sourcePage)}" rel="noreferrer" target="_blank">${esc(a.shortCredit)}</a>`;
}
function setOnce(html, pattern, replacement, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...html.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) throw new Error(`${label}: expected one replacement, got ${matches.length}`);
  return html.replace(pattern, replacement);
}

const context = asset('BT-ROH-001');
const jay = asset('BT-ROH-002');

let scorecard = await readFile(path.join(out, 'scorecard-roh.html'), 'utf8');
const hero = `<div class="ff-score-hero-media ff-score-roh-champion-hero" aria-hidden="true"><div class="ff-roh-context"><img src="${context.src}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-roh-champion"><img src="${jay.src}" alt="" fetchpriority="high" decoding="async"><span>ROH WORLD CHAMPION · 2013</span></div></div>`;
scorecard = setOnce(scorecard, /<div class="ff-score-hero-media"><img src="[^"]+" alt="" aria-hidden="true" fetchpriority="high" decoding="async"><\/div>/, hero, 'ROH champion hero');
scorecard = setOnce(scorecard, /(<header class="ff-score-hero">[\s\S]*?<\/div>)<a class="ff-photo-credit"[\s\S]*?<\/a>(\s*<\/header>)/, `$1<div class="ff-star-credits ff-roh-hero-credits">${credit(context)}${credit(jay)}</div>$2`, 'ROH hero credits');
await writeFile(path.join(out, 'scorecard-roh.html'), scorecard);

let home = await readFile(path.join(out, 'index.html'), 'utf8');
home = setOnce(home, /(<a class="ff-promotion" href="scorecard-roh\.html"[\s\S]*?<span class="ff-promotion-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${jay.src}$2${esc(jay.alt)}$3`, 'homepage ROH promotion image');
await writeFile(path.join(out, 'index.html'), home);

let directory = await readFile(path.join(out, 'scorecards.html'), 'utf8');
directory = setOnce(directory, /(<a class="ff-directory-row" href="scorecard-roh\.html"[\s\S]*?<span class="ff-directory-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${jay.src}$2${esc(jay.alt)}$3`, 'Promotions ROH image');
await writeFile(path.join(out, 'scorecards.html'), directory);

console.log('Enhanced ROH fan-first surfaces with the approved Jay Briscoe World Champion photograph and authentic ROH event context.');
