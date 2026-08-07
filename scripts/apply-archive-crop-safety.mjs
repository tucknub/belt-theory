import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const targets = [
  path.join(outputRoot, 'assets', 'site.css'),
  path.join(outputRoot, 'prototype', 'authentic-home.css')
];
const marker = '/* Authentic Archive crop-safety overrides */';
const rules = `${marker}
img[data-asset-id="BT-AEW-003"],
img[data-asset-id="BT-WCW-003"] {
  object-fit: contain !important;
  object-position: center center !important;
  background: #050707;
}
`;

for (const target of targets) {
  const css = await readFile(target, 'utf8');
  if (!css.includes(marker)) await writeFile(target, `${css.trimEnd()}\n\n${rules}`);
}

console.log('Applied crop-safe contain framing to the AEW identity and WCW championship portraits.');
