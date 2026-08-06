import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const html = await readFile(path.join(outputRoot, 'scorecard-aew.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const failures = [];

for (const id of ['BT-AEW-001', 'BT-AEW-003']) {
  if (!html.includes(`data-asset-id="${id}"`)) failures.push(`Missing ${id}`);
}
if (/src(set)?="https?:\/\//i.test(html)) failures.push('AEW scorecard contains a remote browser image source');
if (!html.includes('archive-aew-scorecard-photo') || !html.includes('archive-aew-scorecard-evidence')) failures.push('AEW scorecard protected photo frames are missing');
if (!html.includes('image-credits.html')) failures.push('AEW scorecard does not link image credits');
if (!html.includes('archive-image-policy')) failures.push('AEW scorecard is missing archive policy metadata');
for (const canonical of ['68.2', '151', '>11<', '>97<', '82.1', 'Five of ten men’s World Champions']) {
  if (!html.includes(canonical)) failures.push(`Canonical AEW scorecard content changed: ${canonical}`);
}
if (!html.includes('1RtNQvKs1muSYFOO-zQTg7Utiv1nN6JKdsloGesIJPLU')) failures.push('Canonical AEW workbook link changed');
if (!css.includes('.archive-aew-scorecard-photo') || !css.includes('.archive-aew-scorecard-evidence')) failures.push('AEW scorecard photo-frame CSS is missing');
if (!css.includes('grid-template-rows:minmax(0,1fr) auto')) failures.push('AEW scorecard captions are not separated from photo pixels');

if (failures.length) {
  console.error('AEW scorecard verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('AEW scorecard verified: local authentic photographs, protected captions and preserved canonical values.');
