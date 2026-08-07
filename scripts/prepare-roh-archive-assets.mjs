import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const baseManifestPath = path.join(root, 'data', 'archive-assets.json');
const baseFocalPath = path.join(root, 'data', 'archive-focal-points.json');
const extension = JSON.parse(await readFile(path.join(root, 'data', 'roh-archive-assets.json'), 'utf8'));
const extensionFocal = JSON.parse(await readFile(path.join(root, 'data', 'roh-archive-focal-points.json'), 'utf8'));
const base = JSON.parse(await readFile(baseManifestPath, 'utf8'));
const baseFocal = JSON.parse(await readFile(baseFocalPath, 'utf8'));

for (const asset of extension.assets) {
  const existing = base.assets.findIndex((item) => item.id === asset.id);
  if (existing >= 0) base.assets[existing] = asset;
  else base.assets.push(asset);
}
Object.assign(baseFocal, extensionFocal);
base.version = '1.3.0-roh';
base.generatedFor = 'Belt Theory Authentic Archive production publication including ROH';
await writeFile(baseManifestPath, `${JSON.stringify(base, null, 2)}\n`);
await writeFile(baseFocalPath, `${JSON.stringify(baseFocal, null, 2)}\n`);
console.log(`Prepared ${base.assets.length} approved archival records including ROH.`);
