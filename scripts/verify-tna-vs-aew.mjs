import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const html = await readFile(path.join(outputRoot, 'report-tna-vs-aew.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const failures = [];

for (const id of ['BT-TNA-001', 'BT-AEW-001', 'BT-TNA-003', 'BT-AEW-003']) {
  if (!html.includes(`data-asset-id="${id}"`)) failures.push(`Missing ${id}`);
}
if (/src(set)?="https?:\/\//i.test(html)) failures.push('TNA–AEW report contains a remote browser image source');
if (!html.includes('archive-matched-pair-hero') || !html.includes('archive-matched-pair-editorial')) failures.push('Matched photo pairs are missing');
if (!html.includes('image-credits.html')) failures.push('TNA–AEW report does not link image credits');
if (!html.includes('archive-image-policy')) failures.push('TNA–AEW report is missing archive policy metadata');
for (const canonical of ['TNA 51.9 — AEW 48.1', '82.7', '95.0', '67.4', '60.1', '97.5', '92.9', '50.7', '53.6', 'TNA built the deeper total system. AEW built the sharper crown.']) {
  if (!html.includes(canonical)) failures.push(`Canonical TNA–AEW content changed: ${canonical}`);
}
if (!html.includes('1J3sc2JCFxES-sKllOz9Z0MIFNUgh3YuBw1Mi9-bsO7Y')) failures.push('Canonical TNA–AEW workbook link changed');
if (!css.includes('.archive-matched-photo') || !css.includes('.archive-matched-pair-editorial')) failures.push('Matched photo-frame CSS is missing');
if (!css.includes('grid-template-rows:minmax(0,1fr) auto')) failures.push('Matched report captions are not separated from photo pixels');

if (failures.length) {
  console.error('TNA–AEW report verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('TNA–AEW report verified: four local authentic photographs, separate credits and preserved matched comparison data.');
