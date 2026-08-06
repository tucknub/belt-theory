import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const focalPoints = JSON.parse(await readFile(path.join(root, 'data', 'archive-focal-points.json'), 'utf8'));
const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]));

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function image(assetId, sizes) {
  const asset = assets.get(assetId);
  const focal = focalPoints[assetId];
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete comparison archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}

function frame(assetId, promotion, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="archive-matched-photo"><div class="archive-matched-label">${escapeHtml(promotion)}</div>${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const pagePath = path.join(outputRoot, 'report-tna-vs-aew.html');
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let html = await readFile(pagePath, 'utf8');
let css = await readFile(cssPath, 'utf8');

const heroNeedle = '<section class="hero split" style="--tone:#57d9fa;--c1a:#57d9fa99;--c2a:#e5ad3599"><div class="hero-inner shell"><div>';
if (!html.includes(heroNeedle)) throw new Error('TNA–AEW hero structure changed');
html = html.replace(heroNeedle, '<section class="hero split archive-matched-hero" style="--tone:#57d9fa;--c1a:#57d9fa99;--c2a:#e5ad3599"><div class="hero-inner shell"><div class="archive-matched-copy">');
const panelNeedle = '<aside class="hero-panel"><small>August 31, 2019–August 5, 2026</small>';
if (!html.includes(panelNeedle)) throw new Error('TNA–AEW hero panel changed');
const heroPair = `<div class="archive-matched-pair archive-matched-pair-hero">${frame('BT-TNA-001', 'TNA / Impact', '(max-width: 980px) 100vw, 25vw')}${frame('BT-AEW-001', 'AEW', '(max-width: 980px) 100vw, 25vw')}</div>`;
html = html.replace(panelNeedle, `${heroPair}<aside class="hero-panel"><small>August 31, 2019–August 5, 2026</small>`);

const bottomNeedle = '<div class="evidence"><div class="evidence-visual" role="img" aria-label="TNA versus AEW final comparison summary">';
if (!html.includes(bottomNeedle)) throw new Error('TNA–AEW bottom evidence structure changed');
const editorialPair = `<div class="archive-matched-pair archive-matched-pair-editorial">${frame('BT-TNA-003', 'TNA / Impact', '(max-width: 820px) 100vw, 38vw')}${frame('BT-AEW-003', 'AEW', '(max-width: 820px) 100vw, 38vw')}</div>`;
html = html.replace(bottomNeedle, `${editorialPair}<div class="evidence"><div class="evidence-visual" role="img" aria-label="TNA versus AEW final comparison summary">`);

html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');

css += `
/* TNA vs. AEW — matched authentic photography, never a fabricated face-off */
.archive-matched-hero{min-height:990px;background:radial-gradient(circle at 14% 12%,rgba(87,217,250,.08),transparent 30%),radial-gradient(circle at 86% 14%,rgba(229,173,53,.08),transparent 30%),#030505!important}.archive-matched-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(500px,.98fr);grid-template-areas:"copy photos" "panel photos";align-items:stretch;gap:24px}.archive-matched-copy{grid-area:copy;align-self:end}.archive-matched-hero .hero-panel{grid-area:panel;align-self:start;max-width:760px}.archive-matched-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.archive-matched-pair-hero{grid-area:photos;min-height:690px}.archive-matched-photo{position:relative;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;border:1px solid #3c4240;background:#080a0a;overflow:hidden}.archive-matched-photo>img{min-height:0}.archive-matched-label{position:absolute;z-index:2;top:12px;left:12px;padding:7px 9px;background:#080a0ae8;border-left:2px solid var(--gold2);color:#f4f0e5;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.archive-matched-photo figcaption{display:grid;gap:7px;padding:13px 14px;background:#080a0a;border-top:1px solid #3c4240;color:#d3d5cf;font-size:8px;line-height:1.45;text-transform:uppercase}.archive-matched-photo figcaption a{color:var(--gold2)}.archive-matched-pair-editorial{margin:0 0 28px;min-height:520px}.archive-matched-pair-editorial .archive-matched-photo:first-child{border-color:#315968}.archive-matched-pair-editorial .archive-matched-photo:first-child figcaption a{color:#57d9fa}
@media(max-width:1100px){.archive-matched-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photos" "panel"}.archive-matched-pair-hero{min-height:620px}.archive-matched-hero .hero-panel{max-width:none}}
@media(max-width:700px){.archive-matched-pair{grid-template-columns:1fr}.archive-matched-pair-hero{min-height:auto}.archive-matched-photo{min-height:490px}.archive-matched-pair-editorial{min-height:auto}.archive-matched-pair-editorial .archive-matched-photo{min-height:430px}}
`;

await writeFile(pagePath, html);
await writeFile(cssPath, css);
console.log('Retrofitted TNA–AEW report with two matched authentic photo pairs.');
