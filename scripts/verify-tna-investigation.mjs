import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const html = await readFile(path.join(outputRoot, 'report-did-tna-create-stars.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const failures = [];

for (const id of ['BT-TNA-003', 'BT-TNA-001']) {
  if (!html.includes(`data-asset-id="${id}"`)) failures.push(`Missing ${id}`);
}
if (/src(set)?="https?:\/\//i.test(html)) failures.push('TNA investigation contains a remote browser image source');
if (!html.includes('archive-investigation-photo') || !html.includes('archive-investigation-evidence')) failures.push('TNA investigation protected photo frames are missing');
if (!html.includes('image-credits.html')) failures.push('TNA investigation does not link image credits');
if (!html.includes('archive-image-policy')) failures.push('TNA investigation is missing archive policy metadata');
for (const canonical of ['51.6 / 48.4', '21/46', '19/28', '>15<', '>11<', 'TNA created stars.', 'The wrestlers were not']) {
  if (!html.includes(canonical)) failures.push(`Canonical TNA investigation content changed: ${canonical}`);
}
if (!html.includes('1GYlWZnbtQY4RQoyvX-QWeVklRHqRfKQUwSKDL-DIvkg')) failures.push('Canonical TNA workbook link changed');
if (!css.includes('.archive-investigation-photo') || !css.includes('.archive-investigation-evidence')) failures.push('TNA investigation photo-frame CSS is missing');
if (!css.includes('grid-template-rows:minmax(0,1fr) auto')) failures.push('TNA investigation captions are not separated from photo pixels');

if (failures.length) {
  console.error('TNA investigation verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('TNA investigation verified: authentic local photographs, protected captions and preserved canonical argument.');
