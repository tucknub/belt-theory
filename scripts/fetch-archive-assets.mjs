import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const outputDir = path.join(outputRoot, 'assets', 'archive');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const userAgent = 'BeltTheory/1.2 (+https://github.com/tucknub/belt-theory; archival asset build)';

await mkdir(outputDir, { recursive: true });

function thumbnailUrl(originalUrl, width) {
  const filename = originalUrl.split('/').at(-1);
  return `${originalUrl.replace('/wikipedia/commons/', '/wikipedia/commons/thumb/')}/${width}px-${filename}`;
}

async function download(url, target) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': userAgent, accept: 'image/*' }
  });
  if (!response.ok) throw new Error(`Failed ${response.status} ${url}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type ${contentType} for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 12_000) throw new Error(`Downloaded file is unexpectedly small: ${url}`);
  await writeFile(target, bytes);
  return {
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    contentType
  };
}

const built = [];
for (const asset of manifest.assets) {
  const variants = [];
  for (const width of asset.widths) {
    const useOriginal = width >= asset.originalWidth;
    const url = useOriginal ? asset.originalUrl : thumbnailUrl(asset.originalUrl, width);
    const filename = `${asset.slug}-${width}.${asset.extension}`;
    const target = path.join(outputDir, filename);
    const metadata = await download(url, target);
    variants.push({ width, filename, sourceUrl: url, ...metadata });
    console.log(`Archived ${asset.id} ${width}px -> assets/archive/${filename}`);
  }
  built.push({ ...asset, variants });
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify({ version: manifest.version, builtAt: new Date().toISOString(), assets: built }, null, 2)}\n`
);
console.log(`Archived ${built.length} rights-approved historical images.`);
