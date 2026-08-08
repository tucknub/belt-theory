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
  'index.html': ['cody-rhodes-undisputed-champion-2024','swerve-strickland-aew-world-champion-2024','hangman-page-aew-world-champion-2021'],
  'scorecard-wwe.html': ['ff-score-wwe-champions','cody-rhodes-undisputed-champion-2024','roman-reigns-universal-champion-2022','damian-priest-world-heavyweight-champion-2024','HHH ERA · 2024','LATE VINCE · 2022'],
  'scorecard-aew.html': ['ff-score-aew-champions','hangman-page-aew-world-champion-2021','swerve-strickland-aew-world-champion-2024','cm-punk-jon-moxley-aew-world-champions-2022'],
  'scorecards.html': ['cody-rhodes-undisputed-champion-2024','swerve-strickland-aew-world-champion-2024'],
  'comparisons.html': ['swerve-strickland-aew-world-champion-2024'],
  'report-wwe-vs-aew.html': ['ff-matchup-star-pair','cody-rhodes-undisputed-champion-2024','swerve-strickland-aew-world-champion-2024'],
  'image-credits.html': ['ff-star-credit-section-wwe-aew','Cody Rhodes with the Undisputed WWE Championship','Roman Reigns with the WWE Universal Championship','Damian Priest as World Heavyweight Champion','Hangman Adam Page photographed as AEW World Champion','Swerve Strickland as AEW World Champion','Interim AEW World Champion Jon Moxley and lineal AEW World Champion CM Punk']
};
for (const [file, needles] of Object.entries(checks)) {
  const html = await readFile(path.join(out, file), 'utf8');
  for (const needle of needles) if (!html.includes(needle)) failures.push(`${file}: missing ${needle}.`);
  if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:\/\//i.test(html)) failures.push(`${file}: remote image hotlink detected.`);
}

for (const file of ['scorecard-wwe.html','scorecard-aew.html']) {
  const html = await readFile(path.join(out, file), 'utf8');
  const hero = html.match(/<header class="ff-score-hero">[\s\S]*?<\/header>/)?.[0] || '';
  if (/wwe-raw-o2-2008|aew-all-in-2023/.test(hero)) failures.push(`${file}: generic arena image still leads the promotion hero.`);
}

const comparison = await readFile(path.join(out, 'report-wwe-vs-aew.html'), 'utf8');
if (!comparison.includes('<span>WWE</span>') || !comparison.includes('<span>AEW</span>')) failures.push('WWE vs AEW: independent source-frame labels missing.');

if (failures.length) {
  console.error('WWE/AEW champion imagery verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WWE/AEW champion imagery verified: six rights-approved photographs are self-hosted, credited and integrated without generic arena heroes or fake confrontation imagery.');
