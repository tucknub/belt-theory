import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outputRoot = path.resolve(process.argv[2] || path.join(root, 'dist'));
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'archive-assets.json'), 'utf8'));
const focalPoints = JSON.parse(await readFile(path.join(root, 'data', 'archive-focal-points.json'), 'utf8'));
const assets = new Map(manifest.assets.map((asset) => [asset.id, asset]));
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function image(assetId, sizes) {
  const asset = assets.get(assetId);
  const focal = focalPoints[assetId];
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete historical archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}
function framedPhoto(assetId, className, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="${className}">${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const configs = [
  {
    page: 'scorecard-wcw.html', key: 'wcw', tone: '#f28a3a', assetId: 'BT-WCW-003', border: '#7c4a29', credit: '#f28a3a', minHeight: 680,
    heroNeedle: '<section class="hero generic" style="--tone:#f28a3a"><div class="hero-inner shell"><div>',
    panelNeedle: '<aside class="hero-panel"><small>standard career-first world champions with earlier WCW-platform gold</small>',
    panelStart: '<aside class="hero-panel"><small>standard career-first world champions with earlier WCW-platform gold</small>'
  },
  {
    page: 'scorecard-ecw.html', key: 'ecw', tone: '#d83d36', assetId: 'BT-ECW-003', border: '#743431', credit: '#ef655f', minHeight: 660,
    heroNeedle: '<section class="hero generic" style="--tone:#d83d36"><div class="hero-inner shell"><div>',
    panelNeedle: '<aside class="hero-panel"><small>mature World Champions with prior ECW core gold</small>',
    panelStart: '<aside class="hero-panel"><small>mature World Champions with prior ECW core gold</small>'
  }
];

const cssPath = path.join(outputRoot, 'assets', 'site.css');
let css = await readFile(cssPath, 'utf8');
for (const config of configs) {
  const pagePath = path.join(outputRoot, config.page);
  let html = await readFile(pagePath, 'utf8');
  if (!html.includes(config.heroNeedle)) throw new Error(`${config.page} hero structure changed`);
  html = html.replace(config.heroNeedle, `<section class="hero generic archive-${config.key}-scorecard-hero" style="--tone:${config.tone}"><div class="hero-inner shell"><div class="archive-${config.key}-scorecard-copy">`);
  if (!html.includes(config.panelNeedle)) throw new Error(`${config.page} hero panel changed`);
  html = html.replace(config.panelNeedle, `${framedPhoto(config.assetId, `archive-${config.key}-scorecard-photo`, '(max-width: 820px) 100vw, 46vw')}${config.panelStart}`);
  html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
  html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');
  await writeFile(pagePath, html);
  css += `
/* ${config.key.toUpperCase()} scorecard — period-correct photograph in a separate editorial frame */
.archive-${config.key}-scorecard-hero{min-height:900px;background:radial-gradient(circle at 18% 14%,color-mix(in srgb,${config.tone} 11%,transparent),transparent 34%),#030505!important}.archive-${config.key}-scorecard-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(380px,.80fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-${config.key}-scorecard-copy{grid-area:copy;align-self:end;min-width:0}.archive-${config.key}-scorecard-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px;min-width:0}.archive-${config.key}-scorecard-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:${config.minHeight}px;border:1px solid ${config.border};background:#080a0a;overflow:hidden}.archive-${config.key}-scorecard-photo>img{min-height:0}.archive-${config.key}-scorecard-photo figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid ${config.border};color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-${config.key}-scorecard-photo figcaption a{color:${config.credit}}.archive-${config.key}-scorecard-hero h1,.archive-${config.key}-scorecard-hero h2,.archive-${config.key}-scorecard-hero p{overflow-wrap:anywhere}
@media(max-width:980px){.archive-${config.key}-scorecard-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-${config.key}-scorecard-photo{min-height:620px}.archive-${config.key}-scorecard-hero .hero-panel{max-width:none}}
@media(max-width:560px){.archive-${config.key}-scorecard-hero{min-height:auto}.archive-${config.key}-scorecard-photo{min-height:500px}.archive-${config.key}-scorecard-hero .hero-panel h2{font-size:clamp(24px,8vw,34px)}}
`;
}
await writeFile(cssPath, css);
console.log('Retrofitted WCW and original ECW scorecards with rights-approved, period-correct photography.');
