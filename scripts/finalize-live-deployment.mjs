import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const siteOrigin = (process.env.BELT_THEORY_SITE_ORIGIN || 'https://belt-theory.tucknub.workers.dev').replace(/\/$/, '');
const shareImage = `${siteOrigin}/assets/archive/aew-all-in-2023-1280.jpg`;
const today = process.env.BELT_THEORY_LASTMOD || '2026-08-07';

const pages = (await readdir(outputRoot)).filter((name) => name.endsWith('.html')).sort();
const indexablePages = pages.filter((name) => name !== '404.html');

function canonicalUrl(page) {
  return page === 'index.html' ? `${siteOrigin}/` : `${siteOrigin}/${page}`;
}

function upsertHead(html, matcher, tag) {
  if (matcher.test(html)) return html.replace(matcher, tag);
  return html.replace('</head>', `${tag}</head>`);
}

for (const page of pages) {
  const pagePath = path.join(outputRoot, page);
  let html = await readFile(pagePath, 'utf8');
  const canonical = canonicalUrl(page);

  if (page === '404.html') {
    html = upsertHead(html, /<meta\b[^>]*name="robots"[^>]*>/i, '<meta content="noindex, follow" name="robots"/>');
  } else {
    html = upsertHead(html, /<link\b[^>]*rel="canonical"[^>]*>/i, `<link href="${canonical}" rel="canonical"/>`);
  }
  html = upsertHead(html, /<meta\b[^>]*property="og:url"[^>]*>/i, `<meta content="${canonical}" property="og:url"/>`);
  html = upsertHead(html, /<meta\b[^>]*property="og:image"[^>]*>/i, `<meta content="${shareImage}" property="og:image"/>`);
  html = upsertHead(html, /<meta\b[^>]*property="og:image:alt"[^>]*>/i, '<meta content="AEW All In 2023 at Wembley Stadium, used as Belt Theory publication artwork." property="og:image:alt"/>');
  html = upsertHead(html, /<meta\b[^>]*name="twitter:image"[^>]*>/i, `<meta content="${shareImage}" name="twitter:image"/>`);
  html = upsertHead(html, /<meta\b[^>]*name="twitter:image:alt"[^>]*>/i, '<meta content="AEW All In 2023 at Wembley Stadium, used as Belt Theory publication artwork." name="twitter:image:alt"/>');

  if (page === 'index.html') {
    html = html
      .replace('Research complete.<br/>Product next.', 'Research complete.<br/>Publication live.')
      .replace('The roadmap freezes new promotion research until the site, data pipeline, quality controls and launch package are complete.', 'The first publication system is live. New research now enters Belt Theory through the same verified data, rights and release pipeline.')
      .replace('<strong>Launch infrastructure next</strong><p>Permanent repository, Cloudflare Pages, domain, canonical metadata and live QA.</p>', '<strong>Production infrastructure live</strong><p>Permanent repository, Cloudflare Workers Static Assets, canonical production metadata and release QA.</p>');

    const structuredData = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Belt Theory',
      url: `${siteOrigin}/`,
      description: 'Belt Theory measures what professional wrestling championship systems actually built.',
      publisher: { '@type': 'Organization', name: 'Belt Theory' }
    })}</script>`;
    if (!html.includes('application/ld+json')) html = html.replace('</head>', `${structuredData}</head>`);
  }

  if (page === 'about.html') {
    html = html.replace('<strong>Launch infrastructure next</strong><p>Permanent repository, Cloudflare Pages, domain, canonical metadata and live QA.</p>', '<strong>Production infrastructure live</strong><p>Permanent repository, Cloudflare Workers Static Assets, canonical production metadata and release QA.</p>');
  }

  await writeFile(pagePath, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePages.map((page) => `  <url><loc>${canonicalUrl(page)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap);
await writeFile(path.join(outputRoot, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);

const deployDoc = `# Belt Theory deployment\n\nProduction URL: ${siteOrigin}/\n\n## Cloudflare Workers Static Assets\n\nRepository: tucknub/belt-theory\nProduction branch: main\nBuild command: npm run build\nDeploy command: npx wrangler deploy\nRoot directory: /\nBuild variables: none\n\nThe Worker is configured by \`wrangler.toml\` to publish \`./dist\` as static assets. The build itself verifies the release archive, rights ledger, archival photography, accessibility, links and production metadata before deployment.\n`;
await writeFile(path.join(outputRoot, 'DEPLOY.md'), deployDoc);

for (const doc of ['README.md', 'AUDIT.md']) {
  const docPath = path.join(outputRoot, doc);
  try {
    let text = await readFile(docPath, 'utf8');
    text = text.replaceAll('Cloudflare Pages', 'Cloudflare Workers Static Assets');
    await writeFile(docPath, text);
  } catch {}
}

console.log(`Finalized live deployment metadata for ${indexablePages.length} indexable pages at ${siteOrigin}.`);
