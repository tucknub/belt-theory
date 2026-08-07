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
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete WWE archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}

function framedPhoto(assetId, className, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="${className}">${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const pagePath = path.join(outputRoot, 'scorecard-wwe.html');
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let html = await readFile(pagePath, 'utf8');
let css = await readFile(cssPath, 'utf8');

const heroNeedle = '<section class="hero generic" style="--tone:#ef5550"><div class="hero-inner shell"><div>';
if (!html.includes(heroNeedle)) throw new Error('WWE scorecard hero structure changed');
html = html.replace(heroNeedle, '<section class="hero generic archive-wwe-scorecard-hero" style="--tone:#ef5550"><div class="hero-inner shell"><div class="archive-wwe-scorecard-copy">');
const panelNeedle = '<aside class="hero-panel"><small>Triple H share in the equal-window era scorecard</small>';
if (!html.includes(panelNeedle)) throw new Error('WWE scorecard hero panel changed');
html = html.replace(panelNeedle, `${framedPhoto('BT-WWE-001', 'archive-wwe-scorecard-photo', '(max-width: 820px) 100vw, 48vw')}<aside class="hero-panel"><small>Triple H share in the equal-window era scorecard</small>`);

const sourceNeedle = '<div class="panel"><h3>Canonical source</h3>';
if (!html.includes(sourceNeedle)) throw new Error('WWE scorecard source panel changed');
const evidence = `${framedPhoto('BT-GENERAL-001', 'archive-wwe-scorecard-evidence fade-up', '(max-width: 820px) 100vw, 52vw')}<div class="panel"><h3>Canonical source</h3>`;
html = html.replace(sourceNeedle, evidence);

html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');

css += `
/* WWE scorecard — approved WWE Raw event photography in separate frames */
.archive-wwe-scorecard-hero{min-height:880px;background:radial-gradient(circle at 16% 12%,rgba(239,85,80,.08),transparent 32%),#030505!important}.archive-wwe-scorecard-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(390px,.86fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-wwe-scorecard-copy{grid-area:copy;align-self:end}.archive-wwe-scorecard-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px}.archive-wwe-scorecard-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:650px;border:1px solid #66302e;background:#080a0a;overflow:hidden}.archive-wwe-scorecard-photo>img{min-height:0}.archive-wwe-scorecard-photo figcaption,.archive-wwe-scorecard-evidence figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid #66302e;color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-wwe-scorecard-photo figcaption a,.archive-wwe-scorecard-evidence figcaption a{color:#ef5550}.archive-wwe-scorecard-evidence{margin:0 0 18px;display:grid;grid-template-rows:minmax(360px,1fr) auto;border:1px solid #66302e;background:#080a0a;overflow:hidden}.archive-wwe-scorecard-evidence>img{min-height:360px}.archive-wwe-scorecard-evidence+.panel{margin-top:0}
@media(max-width:980px){.archive-wwe-scorecard-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-wwe-scorecard-photo{min-height:620px}.archive-wwe-scorecard-hero .hero-panel{max-width:none}}
@media(max-width:560px){.archive-wwe-scorecard-hero{min-height:auto}.archive-wwe-scorecard-photo{min-height:480px}.archive-wwe-scorecard-evidence>img{min-height:280px}}
`;

await writeFile(pagePath, html);
await writeFile(cssPath, css);
console.log('Retrofitted WWE scorecard with two globally approved WWE Raw event photographs.');
