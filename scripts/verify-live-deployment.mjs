import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const siteOrigin = (process.env.BELT_THEORY_SITE_ORIGIN || 'https://belt-theory.tucknub.workers.dev').replace(/\/$/, '');
const pages = (await readdir(outputRoot)).filter((name) => name.endsWith('.html')).sort();
const failures = [];

for (const page of pages) {
  const html = await readFile(path.join(outputRoot, page), 'utf8');
  const canonical = page === 'index.html' ? `${siteOrigin}/` : `${siteOrigin}/${page}`;
  if (page !== '404.html' && !html.includes(`<link href="${canonical}" rel="canonical"/>`)) failures.push(`${page}: canonical URL missing or incorrect.`);
  if (!html.includes(`<meta content="${canonical}" property="og:url"/>`)) failures.push(`${page}: og:url missing or incorrect.`);
  if (!html.includes(`${siteOrigin}/assets/archive/aew-all-in-2023-1280.jpg`)) failures.push(`${page}: absolute social image missing.`);
  if (page === '404.html' && !/name="robots"[^>]*content="noindex, follow"|content="noindex, follow"[^>]*name="robots"/i.test(html)) failures.push('404.html: noindex directive missing.');
}

const sitemap = await readFile(path.join(outputRoot, 'sitemap.xml'), 'utf8');
const sitemapUrls = (sitemap.match(/<loc>/g) || []).length;
if (sitemapUrls !== pages.length - 1) failures.push(`sitemap.xml: expected ${pages.length - 1} URLs, found ${sitemapUrls}.`);
if (sitemap.includes('/404.html')) failures.push('sitemap.xml: 404 page must not be indexed.');
const robots = await readFile(path.join(outputRoot, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) failures.push('robots.txt: production sitemap URL missing.');
const home = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
if (!home.includes('Production infrastructure live')) failures.push('index.html: launch roadmap is stale.');
if (!home.includes('application/ld+json')) failures.push('index.html: WebSite structured data missing.');
const about = await readFile(path.join(outputRoot, 'about.html'), 'utf8');
if (!about.includes('Production infrastructure live')) failures.push('about.html: launch roadmap is stale.');
const deploy = await readFile(path.join(outputRoot, 'DEPLOY.md'), 'utf8');
if (!deploy.includes('npx wrangler deploy') || !deploy.includes('Cloudflare Workers Static Assets')) failures.push('DEPLOY.md: Workers deployment instructions missing.');

if (failures.length) {
  console.error('Live deployment verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Live deployment verified: ${pages.length - 1} canonical pages, sitemap, robots and Workers deployment metadata.`);
