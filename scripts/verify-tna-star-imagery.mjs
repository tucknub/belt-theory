import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const failures = [];
const manifest = JSON.parse(await readFile(path.join(out, 'assets', 'archive', 'tna-star-manifest.json'), 'utf8'));
if (manifest.assets.length !== 4) failures.push(`Expected 4 expanded TNA star assets, found ${manifest.assets.length}.`);
for (const asset of manifest.assets) {
  if (asset.license !== 'CC BY-SA 2.0') failures.push(`${asset.id}: unexpected license ${asset.license}.`);
  if (!asset.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:')) failures.push(`${asset.id}: source page is not Wikimedia Commons.`);
  if (!asset.variants?.length) failures.push(`${asset.id}: no archived variants.`);
}

const checks = {
  'index.html': ['ff-hero-star-wall','aj-styles-tna-live-2011','samoa-joe-tna-world-champion-2008','james-storm-tna-tag-champion-2008'],
  'report-did-tna-create-stars.html': ['ff-article-star-wall','aj-styles-tna-live-2011','samoa-joe-tna-world-champion-2008','james-storm-tna-tag-champion-2008'],
  'scorecard-tna.html': ['ff-score-tna-wall','aj-styles-tna-live-2011','gail-kim-tna-champion-2011','james-storm-tna-tag-champion-2008'],
  'scorecards.html': ['aj-styles-tna-live-2011'],
  'report-tna-vs-aew.html': ['samoa-joe-tna-world-champion-2008'],
  'image-credits.html': ['ff-star-credit-section','A.J. Styles at a TNA live event','Samoa Joe with the TNA World Heavyweight Championship','James Storm holding the TNA World Tag Team Championship belts','Gail Kim holding TNA championship belts']
};
for (const [file, needles] of Object.entries(checks)) {
  const html = await readFile(path.join(out, file), 'utf8');
  for (const needle of needles) if (!html.includes(needle)) failures.push(`${file}: missing ${needle}.`);
  const remoteImage = html.match(/<(?:img|source)\b[^>]*(?:src|srcset)="https?:\/\//i);
  if (remoteImage) failures.push(`${file}: remote image hotlink detected.`);
}

const home = await readFile(path.join(out, 'index.html'), 'utf8');
if (home.includes('raven-tna-impact-2010-1280.jpg') && home.match(/ff-hero-star-wall[\s\S]{0,500}raven-tna-impact/)) failures.push('Homepage hero still uses Raven as the dominant TNA star-creation image.');

if (failures.length) {
  console.error('Expanded TNA star imagery verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('Expanded TNA star imagery verified: four rights-approved wrestler photographs are self-hosted, credited and integrated across the fan-first TNA surfaces.');
