import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const html = await readFile(path.join(outputRoot, 'scorecard-wwe.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const failures = [];

for (const id of ['BT-WWE-001', 'BT-GENERAL-001']) {
  if (!html.includes(`data-asset-id="${id}"`)) failures.push(`Missing ${id}`);
}
for (const prohibited of ['BT-WWE-002', 'BT-WWE-003', 'Vince_McMahon_Sr_and_Vince_McMahon_Jr.jpg', 'Vince_McMahon,_1986.png']) {
  if (html.includes(prohibited)) failures.push(`Jurisdiction-limited WWE image entered the scorecard: ${prohibited}`);
}
if (/src(set)?="https?:\/\//i.test(html)) failures.push('WWE scorecard contains a remote browser image source');
if (!html.includes('archive-wwe-scorecard-photo') || !html.includes('archive-wwe-scorecard-evidence')) failures.push('WWE scorecard protected photo frames are missing');
if (!html.includes('image-credits.html')) failures.push('WWE scorecard does not link image credits');
if (!html.includes('archive-image-policy')) failures.push('WWE scorecard is missing archive policy metadata');
for (const canonical of ['55.8', '111', '18.9%', '93.6%', '100%', 'All eight matched-period first-time WWE men’s world champions']) {
  if (!html.includes(canonical)) failures.push(`Canonical WWE scorecard content changed: ${canonical}`);
}
if (!html.includes('1ZOPO8udG4mirN489ZvlKcvoywOeVApwQrcS1UdwMgCE')) failures.push('Canonical WWE research link changed');
if (!css.includes('.archive-wwe-scorecard-photo') || !css.includes('.archive-wwe-scorecard-evidence')) failures.push('WWE scorecard photo-frame CSS is missing');
if (!css.includes('grid-template-rows:minmax(0,1fr) auto')) failures.push('WWE scorecard captions are not separated from photo pixels');

if (failures.length) {
  console.error('WWE scorecard verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('WWE scorecard verified: globally approved local event photographs, protected captions and preserved canonical values.');
