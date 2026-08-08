import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const outputDir = path.join(outputRoot, 'assets', 'archive');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'tna-star-assets.json'), 'utf8'));
const userAgent = 'BeltTheory/1.4 (+https://github.com/tucknub/belt-theory; TNA star imagery archive build)';
await mkdir(outputDir, { recursive: true });

function specialRedirect(asset, width) {
  const sep = asset.remoteSrc.includes('?') ? '&' : '?';
  return `${asset.remoteSrc}${sep}width=${width}`;
}
function thumbUrl(asset, width) {
  const u = new URL(asset.originalUrl);
  const filename = u.pathname.split('/').at(-1);
  return `${u.origin}${u.pathname.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/')}/${width}px-${filename}`;
}
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
async function fetchImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'user-agent': userAgent, accept: 'image/jpeg,image/png,image/*;q=.8' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = (res.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (!type.startsWith('image/')) throw new Error(`Unexpected content type ${type}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 30000) throw new Error(`Image unexpectedly small: ${bytes.length}`);
    return { bytes, type, url: res.url };
  } finally {
    clearTimeout(timer);
  }
}

const built = [];
for (const asset of manifest.assets) {
  const variants = [];
  for (const requestedWidth of asset.widths) {
    const candidates = requestedWidth >= asset.originalWidth
      ? [asset.originalUrl, specialRedirect(asset, requestedWidth)]
      : [thumbUrl(asset, requestedWidth), specialRedirect(asset, requestedWidth), asset.originalUrl];
    let result = null;
    const errors = [];
    for (const url of [...new Set(candidates)]) {
      try {
        const fetched = await fetchImage(url);
        const size = dimensions(fetched.bytes, fetched.type);
        if (size.width < Math.min(requestedWidth, asset.originalWidth)) {
          throw new Error(`Received ${size.width}px for requested ${requestedWidth}px`);
        }
        result = { ...fetched, ...size };
        break;
      } catch (error) {
        errors.push(`${url}: ${error.message}`);
      }
    }
    if (!result) throw new Error(`Unable to archive ${asset.id} ${requestedWidth}px:\n${errors.join('\n')}`);
    const filename = `${asset.slug}-${requestedWidth}.${asset.extension}`;
    await writeFile(path.join(outputDir, filename), result.bytes);
    variants.push({
      requestedWidth,
      filename,
      width: result.width,
      height: result.height,
      bytes: result.bytes.length,
      sha256: createHash('sha256').update(result.bytes).digest('hex'),
      contentType: result.type,
      effectiveUrl: result.url
    });
    console.log(`Archived ${asset.id} ${result.width}×${result.height} -> assets/archive/${filename}`);
  }
  built.push({ ...asset, variants });
}
await writeFile(path.join(outputDir, 'tna-star-manifest.json'), `${JSON.stringify({ version: manifest.version, builtAt: new Date().toISOString(), assets: built }, null, 2)}\n`);
console.log(`Archived ${built.length} rights-approved TNA star photographs.`);
