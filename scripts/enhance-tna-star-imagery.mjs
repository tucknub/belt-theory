import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'tna-star-manifest.json'), 'utf8'));
const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]));

function esc(value) {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}
function asset(id) {
  const a = assets.get(id);
  if (!a) throw new Error(`Missing TNA star asset ${id}`);
  const v = a.variants.find((variant) => variant.requestedWidth === a.defaultWidth) || a.variants.at(-1);
  return { ...a, src: `assets/archive/${v.filename}` };
}
function credit(a) {
  return `<a href="${esc(a.sourcePage)}" rel="noreferrer" target="_blank">${esc(a.shortCredit)}</a>`;
}
function setOnce(html, pattern, replacement, label) {
  let count = 0;
  const next = html.replace(pattern, (...args) => { count += 1; return typeof replacement === 'function' ? replacement(...args) : replacement; });
  if (count !== 1) throw new Error(`${label}: expected one replacement, got ${count}`);
  return next;
}

const aj = asset('BT-TNA-STAR-001');
const joe = asset('BT-TNA-STAR-002');
const storm = asset('BT-TNA-STAR-003');
const gail = asset('BT-TNA-STAR-004');

const heroWall = `<div class="ff-hero-photo ff-hero-star-wall" aria-hidden="true"><div class="ff-star-panel ff-star-panel-aj"><img src="${aj.src}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-star-panel ff-star-panel-joe"><img src="${joe.src}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-star-panel ff-star-panel-storm"><img src="${storm.src}" alt="" fetchpriority="high" decoding="async"></div></div>`;
const articleWall = `<div class="ff-article-photo ff-article-star-wall" aria-hidden="true"><div class="ff-star-panel ff-star-panel-aj"><img src="${aj.src}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-star-panel ff-star-panel-joe"><img src="${joe.src}" alt="" fetchpriority="high" decoding="async"></div></div>`;
const credits = `<div class="ff-star-credits">${credit(aj)}${credit(joe)}${credit(storm)}</div>`;
const articleCredits = `<div class="ff-star-credits">${credit(aj)}${credit(joe)}</div>`;

let home = await readFile(path.join(out, 'index.html'), 'utf8');
home = setOnce(home, /<div class="ff-hero-photo" aria-hidden="true">[\s\S]*?<\/div>\s*<div class="ff-hero-vignette"/, `${heroWall}<div class="ff-hero-vignette"`, 'homepage hero image wall');
home = setOnce(home, /(<section class="ff-hero">[\s\S]*?<\/div>\s*)<a class="ff-photo-credit"[\s\S]*?<\/a>(\s*<\/section>)/, `$1${credits}$2`, 'homepage hero credits');
home = setOnce(home, /(<a class="ff-promotion" href="scorecard-tna\.html"[\s\S]*?<span class="ff-promotion-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${aj.src}$2${esc(aj.alt)}$3`, 'homepage TNA promotion card');
await writeFile(path.join(out, 'index.html'), home);

let story = await readFile(path.join(out, 'report-did-tna-create-stars.html'), 'utf8');
story = setOnce(story, /<div class="ff-article-photo" aria-hidden="true">[\s\S]*?<\/div><div class="ff-article-vignette"/, `${articleWall}<div class="ff-article-vignette"`, 'TNA story hero wall');
story = setOnce(story, /(<header class="ff-article-hero">[\s\S]*?<\/div>)<a class="ff-photo-credit"[\s\S]*?<\/a>(\s*<\/header>)/, `$1${articleCredits}$2`, 'TNA story hero credits');
story = setOnce(story, /<figure><img src="[^"]+" alt="[^"]*" loading="lazy" decoding="async"><figcaption>[\s\S]*?<\/figcaption><\/figure>/, `<figure class="ff-tna-pathway-photo"><img src="${storm.src}" alt="${esc(storm.alt)}" loading="lazy" decoding="async"><figcaption><a class="ff-photo-credit" href="${esc(storm.sourcePage)}" rel="noreferrer" target="_blank">${esc(storm.shortCredit)}</a></figcaption></figure>`, 'TNA story evidence image');
await writeFile(path.join(out, 'report-did-tna-create-stars.html'), story);

let scorecard = await readFile(path.join(out, 'scorecard-tna.html'), 'utf8');
scorecard = setOnce(scorecard, /<div class="ff-score-hero-media"><img src="[^"]+" alt="" aria-hidden="true" fetchpriority="high" decoding="async"><\/div>/, `<div class="ff-score-hero-media ff-score-tna-wall" aria-hidden="true"><div class="ff-star-panel ff-star-panel-aj"><img src="${aj.src}" alt="" fetchpriority="high" decoding="async"></div><div class="ff-star-panel ff-star-panel-gail"><img src="${gail.src}" alt="" fetchpriority="high" decoding="async"></div></div>`, 'TNA scorecard hero wall');
scorecard = setOnce(scorecard, /(<header class="ff-score-hero">[\s\S]*?<\/div>)<a class="ff-photo-credit"[\s\S]*?<\/a>(\s*<\/header>)/, `$1<div class="ff-star-credits">${credit(aj)}${credit(gail)}</div>$2`, 'TNA scorecard hero credits');
scorecard = setOnce(scorecard, /<figure><img src="[^"]+" alt="[^"]*" loading="lazy" decoding="async"><figcaption>[\s\S]*?<\/figcaption><\/figure>/, `<figure class="ff-tna-pathway-photo"><img src="${storm.src}" alt="${esc(storm.alt)}" loading="lazy" decoding="async"><figcaption><a class="ff-photo-credit" href="${esc(storm.sourcePage)}" rel="noreferrer" target="_blank">${esc(storm.shortCredit)}</a></figcaption></figure>`, 'TNA scorecard pathway image');
await writeFile(path.join(out, 'scorecard-tna.html'), scorecard);

let directory = await readFile(path.join(out, 'scorecards.html'), 'utf8');
directory = setOnce(directory, /(<a class="ff-directory-row" href="scorecard-tna\.html"[\s\S]*?<span class="ff-directory-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${aj.src}$2${esc(aj.alt)}$3`, 'Promotions TNA image');
await writeFile(path.join(out, 'scorecards.html'), directory);

let compare = await readFile(path.join(out, 'report-tna-vs-aew.html'), 'utf8');
compare = setOnce(compare, /(<div class="ff-matchup-media ff-matchup-media-2"><figure><img src=")[^"]+(" alt=")[^"]*(" fetchpriority="high" decoding="async">)/, `$1${joe.src}$2${esc(joe.alt)}$3`, 'TNA vs AEW hero TNA image');
await writeFile(path.join(out, 'report-tna-vs-aew.html'), compare);

console.log('Enhanced fan-first TNA surfaces with four self-hosted, rights-approved wrestler photographs.');
