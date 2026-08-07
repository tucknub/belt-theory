import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const pages = (await readdir(outputRoot)).filter((name) => name.endsWith('.html')).sort();
const failures = [];

for (const page of pages) {
  const html = await readFile(path.join(outputRoot, page), 'utf8');
  if (!/<html\b[^>]*lang="en"/i.test(html)) failures.push(`${page}: missing lang="en".`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${page}: missing title.`);
  if (!/<meta\b[^>]*name="description"/i.test(html)) failures.push(`${page}: missing description.`);
  if (page !== '404.html') {
    if (!html.includes('class="skip"')) failures.push(`${page}: missing skip link.`);
    if (!/<main\b[^>]*id="content"/i.test(html)) failures.push(`${page}: missing main content landmark.`);
    if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push(`${page}: expected exactly one h1.`);
  }
  for (const tag of html.match(/<nav\b[^>]*>/gi) || []) {
    if (!/\baria-label="[^"]+"/i.test(tag)) failures.push(`${page}: navigation landmark is missing an aria-label.`);
  }
  for (const tag of html.match(/<img\b[^>]*data-asset-id="[^"]+"[^>]*>/gi) || []) {
    if (!/\balt="[^"]+"/i.test(tag)) failures.push(`${page}: archival image is missing meaningful alt text.`);
    if (!/\bwidth="\d+"/i.test(tag) || !/\bheight="\d+"/i.test(tag)) failures.push(`${page}: archival image is missing intrinsic dimensions.`);
  }
  for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/gi) || []) {
    if (!/\brel="[^"]*noreferrer[^"]*"/i.test(tag)) failures.push(`${page}: external new-window link is missing noreferrer.`);
  }
  if (/<[^>]+tabindex="[1-9]\d*"/i.test(html)) failures.push(`${page}: positive tabindex is prohibited.`);
  if (html.includes('class="active"') && !html.includes('aria-current="page"')) failures.push(`${page}: active navigation link is missing aria-current.`);
  if (html.includes('class="menubutton"') && !html.includes('class="menubutton" type="button"')) failures.push(`${page}: menu button is missing an explicit type.`);
}

const css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');
if (!css.includes(':focus-visible')) failures.push('Production CSS is missing visible keyboard focus rules.');
if (!css.includes('@media (forced-colors: active)')) failures.push('Production CSS is missing forced-colors focus support.');

if (failures.length) {
  console.error('Release accessibility verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release accessibility verified across ${pages.length} production pages.`);
