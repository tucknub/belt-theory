import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const outputDir = path.join(outputRoot, 'assets', 'archive');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const userAgent = 'BeltTheory/1.2 (+https://github.com/tucknub/belt-theory; archival asset build)';
const requestTimeoutMs = 30_000;

await mkdir(outputDir, { recursive: true });

function thumbnailUrl(originalUrl, width) {
  if (!originalUrl) return null;
  const filename = originalUrl.split('/').at(-1);
  return `${originalUrl.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/')}/${width}px-${filename}`;
}

function thumbPhpUrl(originalUrl, width) {
  if (!originalUrl) return null;
  const filename = decodeURIComponent(originalUrl.split('/').at(-1));
  return `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(filename)}&w=${width}`;
}

function redirectUrl(asset, width) {
  const separator = asset.remoteSrc.includes('?') ? '&' : '?';
  return `${asset.remoteSrc}${separator}width=${width}`;
}

function imageDimensions(bytes, contentType) {
  if (contentType.includes('png')) {
    const signature = bytes.subarray(0, 8).toString('hex');
    if (signature !== '89504e470d0a1a0a') throw new Error('PNG signature check failed');
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
      throw new Error('JPEG signature check failed');
    }
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      const standalone = marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7);
      if (standalone) {
        offset += 2;
        continue;
      }
      const segmentLength = bytes.readUInt16BE(offset + 2);
      if (segmentLength < 2) throw new Error('Invalid JPEG segment length');
      const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker);
      if (isStartOfFrame) {
        return {
          height: bytes.readUInt16BE(offset + 5),
          width: bytes.readUInt16BE(offset + 7)
        };
      }
      offset += 2 + segmentLength;
    }
    throw new Error('JPEG dimensions could not be read');
  }

  throw new Error(`Unsupported image content type: ${contentType}`);
}

async function fetchBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'user-agent': userAgent, accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type ${contentType || '(missing)'}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 12_000) throw new Error(`Downloaded file is unexpectedly small (${bytes.length} bytes)`);
    return { bytes, contentType, effectiveUrl: response.url };
  } finally {
    clearTimeout(timer);
  }
}

async function downloadVariant(asset, width, target) {
  const useOriginal = width >= asset.originalWidth;
  const candidates = useOriginal
    ? [asset.originalUrl, redirectUrl(asset, asset.originalWidth)]
    : [thumbPhpUrl(asset.originalUrl, width), thumbnailUrl(asset.originalUrl, width), redirectUrl(asset, width)];
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
  if (!uniqueCandidates.length) throw new Error(`No download URL is available for ${asset.id} ${width}px`);
  const failures = [];

  for (const url of uniqueCandidates) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const { bytes, contentType, effectiveUrl } = await fetchBytes(url);
        const dimensions = imageDimensions(bytes, contentType);
        const expectedWidth = Math.min(width, asset.originalWidth);
        if (dimensions.width < expectedWidth || dimensions.width > asset.originalWidth) {
          throw new Error(`Expected at least ${expectedWidth}px and no more than ${asset.originalWidth}px wide, received ${dimensions.width}px`);
        }
        await writeFile(target, bytes);
        return {
          bytes: bytes.length,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          contentType,
          effectiveUrl,
          width: dimensions.width,
          height: dimensions.height,
          requestedWidth: width,
          exactWidth: dimensions.width === expectedWidth,
          attempts: attempt
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push(`${url} attempt ${attempt}: ${reason}`);
        if (attempt < 3) await sleep(750 * attempt);
      }
    }
  }

  throw new Error(`Unable to archive ${asset.id} ${width}px:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

const built = [];
for (const asset of manifest.assets) {
  const variants = [];
  for (const width of asset.widths) {
    const filename = `${asset.slug}-${width}.${asset.extension}`;
    const target = path.join(outputDir, filename);
    const metadata = await downloadVariant(asset, width, target);
    variants.push({ filename, ...metadata });
    const qualifier = metadata.exactWidth ? '' : ` (requested ${width}px)`;
    console.log(`Archived ${asset.id} ${metadata.width}×${metadata.height}${qualifier} -> assets/archive/${filename}`);
  }
  built.push({ ...asset, variants });
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify({ version: manifest.version, builtAt: new Date().toISOString(), assets: built }, null, 2)}\n`
);
console.log(`Archived ${built.length} rights-approved historical images.`);
