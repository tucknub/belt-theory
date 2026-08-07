import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, '..', 'dist'));
const failures = [];
const pages = (await readdir(root)).filter((name) => name.endsWith('.html')).sort();
const expectedPageCount = 20;

if (pages.length !== expectedPageCount) failures.push(`Expected ${expectedPageCount} root HTML pages; found ${pages.length}.`);

for (const page of pages) {
  const pagePath = path.join(root, page);
  const html = await readFile(pagePath, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) failures.push(`${page}: missing non-empty title.`);

  const tags = html.match(/<(?:a|img|link|script)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const value = tag.match(/\b(?:href|src)=["']([^"']+)["']/i)?.[1];
    if (!value || /^(?:#|https?:|mailto:|data:|javascript:)/i.test(value)) continue;
    const clean = value.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? path.join(root, clean.slice(1)) : path.resolve(path.dirname(pagePath), clean);
    try { await access(target); } catch { failures.push(`${page}: missing local reference ${value}`); }
  }
}

if (failures.length) {
  console.error('Release link verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Release links verified: ${pages.length} root pages, zero missing local references.`);
