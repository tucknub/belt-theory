import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const index = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
const credits = await readFile(path.join(outputRoot, 'image-credits.html'), 'utf8');
const failures = [];

if (/images\.unsplash\.com/i.test(index + css)) failures.push('Production homepage or CSS still references the generic Unsplash wrestling image.');
if (/src(set)?="https?:\/\//i.test(index)) failures.push('Production homepage contains a remote browser image src or srcset.');
if (/url\(['"]https?:\/\//i.test(css)) failures.push('Production CSS contains a remote background image URL.');
if (!index.includes('image-credits.html')) failures.push('Production homepage does not link the root image credits page.');
if (!index.includes('archive-image-policy')) failures.push('Production homepage is missing the archive image policy metadata.');
if (!index.includes('archive-home-hero')) failures.push('Production homepage hero was not retrofitted.');
if (!index.includes('archive-card-art')) failures.push('Production promotion cards were not retrofitted.');
if (!index.includes('archive-evidence-photo')) failures.push('TNA investigation evidence was not retrofitted.');
if (!credits.includes('No generative material crosses a photographed person')) failures.push('Credits page is missing the hybrid-composition rule.');
if (index.includes('ECW_Championship.jpg') || index.includes('Paulheyman.jpg')) failures.push('Rejected WWE-era ECW imagery is present.');

for (const asset of manifest.assets) {
  if (!index.includes(`data-asset-id="${asset.id}"`)) failures.push(`Production homepage is missing ${asset.id}.`);
  if (!credits.includes(`id="${asset.id}"`)) failures.push(`Production credits page is missing ${asset.id}.`);
  if (!credits.includes(asset.sourcePage)) failures.push(`Production credits page is missing the source page for ${asset.id}.`);
  if (!credits.includes(asset.licenseUrl)) failures.push(`Production credits page is missing the license for ${asset.id}.`);
  for (const width of asset.widths) {
    const derivative = path.join(outputRoot, 'assets', 'archive', `${asset.slug}-${width}.${asset.extension}`);
    try { await access(derivative); } catch { failures.push(`Missing derivative ${path.relative(outputRoot, derivative)}`); }
  }
}

const imageTags = index.match(/<img\b[^>]*>/gi) || [];
for (const tag of imageTags) {
  const decorative = /aria-hidden="true"/i.test(tag);
  const alt = tag.match(/\balt="([^"]*)"/i)?.[1]?.trim();
  if (!decorative && !alt) failures.push(`Production image lacks meaningful alt text: ${tag.slice(0, 130)}`);
}

const expectedLinks = ['scorecard-wwe.html','scorecard-aew.html','scorecard-tna.html','scorecard-wcw.html','scorecard-ecw.html','scorecard-roh.html','report-wwe-vs-aew.html','report-tna-vs-aew.html','report-wwe-wcw-ecw.html'];
for (const link of expectedLinks) if (!index.includes(`href="${link}"`)) failures.push(`Approved production navigation changed or lost ${link}.`);
const expectedCopy = ['We don’t just list','We measure what they built.','Six systems.','Did TNA create'];
for (const copy of expectedCopy) if (!index.includes(copy)) failures.push(`Approved homepage copy changed or disappeared: ${copy}`);

if (failures.length) {
  console.error('Production Authentic Archive verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Production homepage verified: ${manifest.assets.length} sealed v1.2 authentic records plus ROH publication integration, preserved navigation/copy and no remote historical image dependencies.`);
