import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const files = [
  path.join(outputRoot, 'assets', 'site.css'),
  path.join(outputRoot, 'prototype', 'authentic-home.css')
];
const failures = [];

for (const file of files) {
  const css = await readFile(file, 'utf8');
  for (const id of ['BT-AEW-003', 'BT-WCW-003']) {
    if (!css.includes(`data-asset-id="${id}"`)) failures.push(`${path.relative(outputRoot, file)} is missing ${id} crop protection.`);
  }
  if (!css.includes('object-fit: contain !important')) failures.push(`${path.relative(outputRoot, file)} is missing contain framing.`);
  if (!css.includes('background: #050707')) failures.push(`${path.relative(outputRoot, file)} is missing the neutral crop-safe background.`);
}

if (failures.length) {
  console.error('Archive crop-safety verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Archive crop safety verified for the AEW identity and WCW championship portraits.');
