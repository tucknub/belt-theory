import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const outputDir = path.join(outputRoot, 'assets', 'archive');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'wwe-aew-star-assets.json'), 'utf8'));
const userAgent = 'BeltTheory/1.4 (+https://github.com/tucknub/belt-theory; WWE-AEW champion archive build)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await mkdir(outputDir, { recursive: true });

function dimensions(bytes, type) {
  if (type.includes('png')) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (type.includes('jpeg') || type.includes('jpg')) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const standalone = marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7);
      if (standalone) { offset += 2; continue; }
      const length = bytes.readUInt16BE(offset + 2);
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  throw new Error(`Could not read image dimensions for ${type}`);
}

async function fetchOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      redirect: 'follow', cache: 'no-store', signal: controller.signal,
      headers: { 'user-agent': userAgent, accept: 'image/jpeg,image/png,image/*;q=.8' }
    });
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    const type = (res.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (!type.startsWith('image/')) throw new Error(`Unexpected content type ${type}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 12000) throw new Error(`Image unexpectedly small: ${bytes.length}`);
    return { bytes, type, url: res.url };
  } finally { clearTimeout(timer); }
}

async function fetchWithRetry(url, label) {
  const errors = [];
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try { return await fetchOnce(url); }
    catch (error) {
      errors.push(`attempt ${attempt}: ${error.message}`);
      if (![429, 500, 502, 503, 504].includes(error.status) && error.name !== 'AbortError') break;
      const wait = 1500 * attempt;
      console.log(`${label}: ${error.message}; retrying in ${wait}ms`);
      await sleep(wait);
    }
  }
  throw new Error(`${label}: ${errors.join('; ')}`);
}

const built = [];
await sleep(2500);
for (const asset of manifest.assets) {
  const fetched = await fetchWithRetry(asset.originalUrl, asset.id);
  const size = dimensions(fetched.bytes, fetched.type);
  if (size.width !== asset.originalWidth) throw new Error(`${asset.id}: expected original width ${asset.originalWidth}, received ${size.width}`);
  const requestedWidth = asset.originalWidth;
  const filename = `${asset.slug}-${requestedWidth}.${asset.extension}`;
  await writeFile(path.join(outputDir, filename), fetched.bytes);
  const variants = [{
    requestedWidth, filename, width: size.width, height: size.height, bytes: fetched.bytes.length,
    sha256: createHash('sha256').update(fetched.bytes).digest('hex'), contentType: fetched.type, effectiveUrl: fetched.url
  }];
  built.push({ ...asset, variants });
  console.log(`Archived ${asset.id} ${size.width}×${size.height} -> assets/archive/${filename}`);
  await sleep(900);
}
await writeFile(path.join(outputDir, 'wwe-aew-star-manifest.json'), `${JSON.stringify({ version: manifest.version, builtAt: new Date().toISOString(), assets: built }, null, 2)}\n`);
console.log(`Archived ${built.length} rights-approved WWE/AEW champion photographs with six total Wikimedia requests.`);
