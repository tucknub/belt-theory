import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const homepagePath = path.join(outputRoot, 'prototype', 'authentic-home.html');
const creditsPath = path.join(outputRoot, 'prototype', 'image-credits.html');
const homepage = await readFile(homepagePath, 'utf8');
const credits = await readFile(creditsPath, 'utf8');
const failures = [];

if (/src(set)?="https?:\/\//i.test(homepage)) failures.push('Homepage still contains a remote image src or srcset.');
if (homepage.includes('Special:Redirect/file/')) failures.push('Homepage still contains Wikimedia redirect hotlinks.');
if (homepage.includes('ECW_Championship.jpg') || homepage.includes('Paulheyman.jpg')) failures.push('Rejected WWE-era ECW imagery is present.');
if (!homepage.includes('image-credits.html')) failures.push('Homepage does not link the photography credits page.');
if (!credits.includes('No generative material is placed over a photographed person')) failures.push('Credits page is missing the hybrid-composition disclosure.');

for (const asset of manifest.assets) {
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
}

if (failures.length) {
  console.error('Authentic Archive verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Authentic Archive verified: ${manifest.assets.length} self-hosted historical assets, no image hotlinks, no rejected ECW imagery.`);
