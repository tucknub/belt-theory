import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const sourcePrototype = await readFile(path.join(root, 'prototype', 'authentic-home.html'), 'utf8');
const homepagePath = path.join(outputRoot, 'prototype', 'authentic-home.html');
const creditsPath = path.join(outputRoot, 'prototype', 'image-credits.html');
const homepage = await readFile(homepagePath, 'utf8');
const credits = await readFile(creditsPath, 'utf8');
const failures = [];
const prohibitedIds = new Set(['BT-WWE-002', 'BT-WWE-003', 'BT-ECW-001', 'BT-ECW-002']);
const prohibitedSourceFragments = [
  'Vince_McMahon_Sr_and_Vince_McMahon_Jr.jpg',
  'Vince%20McMahon%20Sr_and_Vince%20McMahon%20Jr.jpg',
  'Vince_McMahon,_1986.png',
  'ECW_Championship.jpg',
  'Paulheyman.jpg'
];

for (const fragment of prohibitedSourceFragments) {
  if (sourcePrototype.includes(fragment)) failures.push(`Source prototype contains prohibited or context-restricted imagery: ${fragment}`);
  if (homepage.includes(fragment)) failures.push(`Built homepage contains prohibited or context-restricted imagery: ${fragment}`);
}
if (/src(set)?="https?:\/\//i.test(homepage)) failures.push('Homepage still contains a remote image src or srcset.');
if (homepage.includes('Special:Redirect/file/')) failures.push('Homepage still contains Wikimedia redirect hotlinks.');
if (!homepage.includes('image-credits.html')) failures.push('Homepage does not link the photography credits page.');
if (!credits.includes('No generative material is placed over a photographed person')) failures.push('Credits page is missing the hybrid-composition disclosure.');
if (manifest.assets.length !== 8) failures.push(`Expected 8 approved homepage photo records; found ${manifest.assets.length}.`);

for (const asset of manifest.assets) {
  if (prohibitedIds.has(asset.id)) failures.push(`Prohibited or context-restricted asset is in the build manifest: ${asset.id}.`);
  if (/public domain in the united states/i.test(asset.license)) failures.push(`Jurisdiction-limited license entered the global build: ${asset.id}.`);
  if (!asset.creator || !asset.license || !asset.licenseUrl || !asset.sourcePage || !asset.caption || !asset.alt) failures.push(`Incomplete rights or context record: ${asset.id}.`);
  if (!sourcePrototype.includes(`src="${asset.remoteSrc}"`)) failures.push(`Source prototype is missing approved review source ${asset.id}.`);
  if (!homepage.includes(`data-asset-id="${asset.id}"`)) failures.push(`Homepage is missing data-asset-id ${asset.id}.`);
  if (!credits.includes(`id="${asset.id}"`)) failures.push(`Credits page is missing ${asset.id}.`);
  if (!credits.includes(asset.sourcePage)) failures.push(`Credits page is missing the source page for ${asset.id}.`);
  if (!credits.includes(asset.licenseUrl)) failures.push(`Credits page is missing the license link for ${asset.id}.`);
  for (const width of asset.widths) {
    const target = path.join(outputRoot, 'assets', 'archive', `${asset.slug}-${width}.${asset.extension}`);
    try { await access(target); } catch { failures.push(`Missing archived derivative: ${path.relative(outputRoot, target)}`); }
  }
}

const imageTags = homepage.match(/<img\b[^>]*>/gi) || [];
for (const tag of imageTags) {
  const alt = tag.match(/\balt="([^"]*)"/i)?.[1]?.trim();
  if (!alt) failures.push(`Image is missing meaningful alt text: ${tag.slice(0, 120)}`);
  if (!/\bdata-asset-id="BT-[^"]+"/i.test(tag)) failures.push(`Historical image is missing a rights-ledger asset ID: ${tag.slice(0, 120)}`);
}

if (failures.length) {
  console.error('Authentic Archive verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Authentic Archive verified: source and built output use ${manifest.assets.length} approved self-hosted historical assets, with no hotlinks, jurisdiction-limited scans or rejected ECW imagery.`);
