import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const pagePath = path.join(outputRoot, 'systems-index.html');
let html = await readFile(pagePath, 'utf8');

const mobileNav = html.match(/<nav class="mobilenav">[\s\S]*?<\/nav>/i)?.[0];
if (!mobileNav) throw new Error('Systems Index mobile navigation was not found.');

if (!mobileNav.includes('href="systems-index.html"')) {
  const updatedNav = mobileNav.replace(
    '<a href="about.html">About</a>',
    '<a class="active" href="systems-index.html">Systems index</a><a href="about.html">About</a>'
  );
  html = html.replace(mobileNav, updatedNav);
}

await writeFile(pagePath, html);
console.log('Finalized Systems Index mobile navigation.');
