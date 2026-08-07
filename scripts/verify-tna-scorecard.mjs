import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const html = await readFile(path.join(outputRoot, 'scorecard-tna.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const failures = [];

for (const id of ['BT-TNA-001', 'BT-TNA-003']) {
  if (!html.includes(`data-asset-id="${id}"`)) failures.push(`Missing ${id}`);
}
if (/src(set)?="https?:\/\//i.test(html)) failures.push('TNA scorecard contains a remote browser image source');
if (!html.includes('archive-scorecard-photo') || !html.includes('archive-scorecard-evidence')) failures.push('TNA scorecard photo frames are missing');
if (!html.includes('image-credits.html')) failures.push('TNA scorecard does not link image credits');
if (!html.includes('73.2') || !html.includes('51.6%') || !html.includes('Twenty-one of 46')) failures.push('Canonical TNA scorecard values changed');
if (!css.includes('.archive-scorecard-photo') || !css.includes('grid-template-rows:minmax(0,1fr) auto')) failures.push('TNA photo/caption separation CSS is missing');

if (failures.length) {
  console.error('TNA scorecard verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('TNA scorecard verified: authentic local photographs, separate captions and preserved canonical values.');
