import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const failures = [];
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'wwe-aew-star-manifest.json'), 'utf8'));
if (manifest.assets.length !== 6) failures.push(`Expected 6 WWE/AEW champion assets, found ${manifest.assets.length}.`);
for (const asset of manifest.assets) {
  if (!['CC0 1.0','CC BY-SA 4.0'].includes(asset.license)) failures.push(`${asset.id}: unexpected license ${asset.license}.`);
  if (!asset.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:')) failures.push(`${asset.id}: source page is not Wikimedia Commons.`);
  if (!asset.variants?.length) failures.push(`${asset.id}: no archived variants.`);
}

const checks = {
  'index.html': ['cody-rhodes-undisputed-champion-2024','hangman-page-aew-world-champion-2021'],
  'scorecard-wwe.html': ['ff-score-wwe-champions','cody-rhodes-undisputed-champion-2024','roman-reigns-universal-champion-2022','damian-priest-world-heavyweight-champion-2024','HHH ERA · 2024','LATE VINCE · 2022'],
  'scorecard-aew.html': ['ff-score-aew-champions','hangman-page-aew-world-champion-2021','aew-all-in-2023-1280.jpg','cm-punk-jon-moxley-aew-world-champions-2022','AEW WORLD CHAMPION · 2021'],
  'scorecards.html': ['cody-rhodes-undisputed-champion-2024','hangman-page-aew-world-champion-2021'],
  'comparisons.html': ['hangman-page-aew-world-champion-2021'],
  'report-wwe-vs-aew.html': ['ff-matchup-star-pair','cody-rhodes-undisputed-champion-2024','hangman-page-aew-world-champion-2021'],
  'image-credits.html': ['ff-star-credit-section-wwe-aew','Cody Rhodes with the Undisputed WWE Championship','Roman Reigns with the WWE Universal Championship','Damian Priest as World Heavyweight Champion','Hangman Adam Page photographed as AEW World Champion','Swerve Strickland as AEW World Champion','Interim AEW World Champion Jon Moxley and lineal AEW World Champion CM Punk']
};
for (const [file, needles] of Object.entries(checks)) {
  const html = await readFile(path.join(out, file), 'utf8');
  for (const needle of needles) if (!html.includes(needle)) failures.push(`${file}: missing ${needle}.`);
  if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:\/\//i.test(html)) failures.push(`${file}: remote image hotlink detected.`);
}

const wwe = await readFile(path.join(out, 'scorecard-wwe.html'), 'utf8');
const wweHero = wwe.match(/<header class="ff-score-hero">[\s\S]*?<\/header>/)?.[0] || '';
if (wweHero.includes('wwe-raw-o2-2008')) failures.push('WWE scorecard: generic arena image still leads the promotion hero.');
const aew = await readFile(path.join(out, 'scorecard-aew.html'), 'utf8');
const aewHero = aew.match(/<header class="ff-score-hero">[\s\S]*?<\/header>/)?.[0] || '';
if (!aewHero.includes('hangman-page-aew-world-champion-2021')) failures.push('AEW scorecard: recognizable World Champion is not the lead hero subject.');

const comparison = await readFile(path.join(out, 'report-wwe-vs-aew.html'), 'utf8');
if (!comparison.includes('<span>WWE</span>') || !comparison.includes('<span>AEW</span>')) failures.push('WWE vs AEW: independent source-frame labels missing.');
if (comparison.includes('swerve-strickland-aew-world-champion-2024')) failures.push('WWE vs AEW: soft Swerve crop is still being enlarged in the primary comparison hero.');

if (failures.length) {
  console.error('WWE/AEW champion imagery verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WWE/AEW champion imagery verified: six rights-approved photographs are self-hosted, sharp champion imagery leads both promotions, and the comparison keeps separate authentic source frames.');
