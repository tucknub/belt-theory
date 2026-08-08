import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'wwe-aew-star-manifest.json'), 'utf8'));
const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]));

const esc = (value) => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function asset(id) {
  const a = assets.get(id); if (!a) throw new Error(`Missing star asset ${id}`);
  const v = a.variants.find((x) => x.requestedWidth === a.defaultWidth) || a.variants.at(-1);
  return { ...a, src: `assets/archive/${v.filename}` };
}
function credit(a, cls='ff-photo-credit') { const attr=cls?` class="${cls}"`:''; return `<a${attr} href="${esc(a.sourcePage)}" rel="noreferrer" target="_blank">${esc(a.shortCredit)}</a>`; }
function setOnce(html, pattern, replacement, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const matches = [...html.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) throw new Error(`${label}: expected one replacement, got ${matches.length}`);
  return html.replace(pattern, replacement);
}

const cody = asset('BT-WWE-STAR-001');
const roman = asset('BT-WWE-STAR-002');
const priest = asset('BT-WWE-STAR-003');
const codyPortrait = asset('BT-WWE-STAR-004');
const hangman = asset('BT-AEW-STAR-001');
const punkMox = asset('BT-AEW-STAR-003');
const aewContext = 'assets/archive/aew-all-in-2023-1280.jpg';

const wweHero = `<div class="ff-score-hero-media ff-score-champion-wall ff-score-wwe-champions" aria-hidden="true"><div class="ff-champion-panel ff-champion-cody"><img src="${cody.src}" alt="" fetchpriority="high" decoding="async"><span>HHH ERA · 2024</span></div><div class="ff-champion-panel ff-champion-roman"><img src="${roman.src}" alt="" fetchpriority="high" decoding="async"><span>LATE VINCE · 2022</span></div></div>`;
const aewHero = `<div class="ff-score-hero-media ff-score-champion-wall ff-score-aew-champions" aria-hidden="true"><div class="ff-champion-panel ff-champion-hangman"><img src="${hangman.src}" alt="" fetchpriority="high" decoding="async"><span>AEW WORLD CHAMPION · 2021</span></div><div class="ff-champion-panel ff-champion-aew-context"><img src="${aewContext}" alt="" fetchpriority="high" decoding="async"><span>ALL IN · WEMBLEY</span></div></div>`;

for (const spec of [
  { file:'scorecard-wwe.html', hero:wweHero, credits:[cody,roman], support:priest, supportClass:'ff-wwe-support-photo' },
  { file:'scorecard-aew.html', hero:aewHero, credits:[hangman], support:punkMox, supportClass:'ff-aew-support-photo' }
]) {
  const file = path.join(out, spec.file);
  let html = await readFile(file, 'utf8');
  html = setOnce(html, /<div class="ff-score-hero-media"><img src="[^"]+" alt="" aria-hidden="true" fetchpriority="high" decoding="async"><\/div>/, spec.hero, `${spec.file} champion hero`);
  html = setOnce(html, /(<header class="ff-score-hero">[\s\S]*?<\/div>)<a class="ff-photo-credit"[\s\S]*?<\/a>(\s*<\/header>)/, `$1<div class="ff-star-credits ff-champion-credits">${spec.credits.map((a)=>credit(a,'')).join('')}</div>$2`, `${spec.file} hero credits`);
  html = setOnce(html, /<figure><img src="[^"]+" alt="[^"]*" loading="lazy" decoding="async"><figcaption>[\s\S]*?<\/figcaption><\/figure>/, `<figure class="${spec.supportClass}"><img src="${spec.support.src}" alt="${esc(spec.support.alt)}" loading="lazy" decoding="async"><figcaption>${credit(spec.support)}</figcaption></figure>`, `${spec.file} support photo`);
  await writeFile(file, html);
}

let home = await readFile(path.join(out, 'index.html'), 'utf8');
home = setOnce(home, /(<a class="ff-story ff-story-large" href="report-wwe-vs-aew\.html"><span class="ff-story-media ff-media-pair">)[\s\S]*?(<\/span><span class="ff-story-copy">)/, `$1<img src="${cody.src}" alt="${esc(cody.alt)}" loading="lazy"><img src="${hangman.src}" alt="${esc(hangman.alt)}" loading="lazy">$2`, 'homepage WWE-AEW story imagery');
home = setOnce(home, /(<a class="ff-promotion" href="scorecard-wwe\.html"[\s\S]*?<span class="ff-promotion-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${cody.src}$2${esc(cody.alt)}$3`, 'homepage WWE promotion image');
home = setOnce(home, /(<a class="ff-promotion" href="scorecard-aew\.html"[\s\S]*?<span class="ff-promotion-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${hangman.src}$2${esc(hangman.alt)}$3`, 'homepage AEW promotion image');
await writeFile(path.join(out, 'index.html'), home);

let directory = await readFile(path.join(out, 'scorecards.html'), 'utf8');
directory = setOnce(directory, /(<a class="ff-directory-row" href="scorecard-wwe\.html"[\s\S]*?<span class="ff-directory-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${cody.src}$2${esc(cody.alt)}$3`, 'Promotions WWE image');
directory = setOnce(directory, /(<a class="ff-directory-row" href="scorecard-aew\.html"[\s\S]*?<span class="ff-directory-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${hangman.src}$2${esc(hangman.alt)}$3`, 'Promotions AEW image');
await writeFile(path.join(out, 'scorecards.html'), directory);

let comparison = await readFile(path.join(out, 'report-wwe-vs-aew.html'), 'utf8');
const matchupMedia = `<div class="ff-matchup-media ff-matchup-media-2 ff-matchup-star-pair"><figure class="ff-matchup-cody"><img src="${codyPortrait.src}" alt="${esc(codyPortrait.alt)}" fetchpriority="high" decoding="async"><span>WWE</span>${credit(codyPortrait)}</figure><figure class="ff-matchup-hangman"><img src="${hangman.src}" alt="${esc(hangman.alt)}" fetchpriority="high" decoding="async"><span>AEW</span>${credit(hangman)}</figure></div><div class="ff-matchup-fade">`;
comparison = setOnce(comparison, /<div class="ff-matchup-media ff-matchup-media-2">[\s\S]*?<\/div><div class="ff-matchup-fade">/, matchupMedia, 'WWE vs AEW champion comparison imagery');
await writeFile(path.join(out, 'report-wwe-vs-aew.html'), comparison);

let debates = await readFile(path.join(out, 'comparisons.html'), 'utf8');
debates = setOnce(debates, /(<a class="ff-debate-row" href="report-wwe-vs-aew\.html">[\s\S]*?<span class="ff-debate-media"><img src=")[^"]+(" alt=")[^"]*(")/, `$1${hangman.src}$2${esc(hangman.alt)}$3`, 'Big Debates WWE-AEW image');
await writeFile(path.join(out, 'comparisons.html'), debates);

console.log('Enhanced WWE and AEW fan-first surfaces with sharp, rights-approved champion photography and protected separate comparison frames.');
