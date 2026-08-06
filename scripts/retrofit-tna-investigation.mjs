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
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete TNA investigation archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}

function framedPhoto(assetId, className, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="${className}">${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const pagePath = path.join(outputRoot, 'report-did-tna-create-stars.html');
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let html = await readFile(pagePath, 'utf8');
let css = await readFile(cssPath, 'utf8');

const heroNeedle = '<section class="hero generic" style="--tone:#57d9fa"><div class="hero-inner shell"><div>';
if (!html.includes(heroNeedle)) throw new Error('TNA investigation hero structure changed');
html = html.replace(heroNeedle, '<section class="hero generic archive-investigation-hero" style="--tone:#57d9fa"><div class="hero-inner shell"><div class="archive-investigation-copy">');
const panelNeedle = '<aside class="hero-panel"><small>Classified men’s world-title equity</small>';
if (!html.includes(panelNeedle)) throw new Error('TNA investigation hero panel changed');
html = html.replace(panelNeedle, `${framedPhoto('BT-TNA-003', 'archive-investigation-photo', '(max-width: 820px) 100vw, 48vw')}<aside class="hero-panel"><small>Classified men’s world-title equity</small>`);

const evidenceStart = html.indexOf('<div class="evidence-visual fade-up" role="img" aria-label="TNA final system scorecard summary">');
if (evidenceStart < 0) throw new Error('TNA investigation evidence visual changed');
const evidenceClose = html.indexOf('</div></div></section>', evidenceStart);
if (evidenceClose < 0) throw new Error('TNA investigation evidence boundary changed');
const evidencePhoto = framedPhoto('BT-TNA-001', 'archive-investigation-evidence fade-up', '(max-width: 820px) 100vw, 72vw');
html = `${html.slice(0, evidenceStart)}${evidencePhoto}${html.slice(evidenceClose)}`;

html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');

css += `
/* TNA star-creation investigation — authentic photographs in protected frames */
.archive-investigation-hero{min-height:900px;background:radial-gradient(circle at 16% 12%,rgba(87,217,250,.08),transparent 32%),#030505!important}.archive-investigation-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(390px,.88fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-investigation-copy{grid-area:copy;align-self:end}.archive-investigation-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px}.archive-investigation-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:670px;border:1px solid #315968;background:#080a0a;overflow:hidden}.archive-investigation-photo>img{min-height:0}.archive-investigation-photo figcaption,.archive-investigation-evidence figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid #315968;color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-investigation-photo figcaption a,.archive-investigation-evidence figcaption a{color:#57d9fa}.archive-investigation-evidence{margin:0;display:grid;grid-template-rows:minmax(430px,1fr) auto;border:1px solid #315968;background:#080a0a;overflow:hidden}.archive-investigation-evidence>img{min-height:430px}
@media(max-width:980px){.archive-investigation-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-investigation-photo{min-height:620px}.archive-investigation-hero .hero-panel{max-width:none}}
@media(max-width:560px){.archive-investigation-hero{min-height:auto}.archive-investigation-photo{min-height:500px}.archive-investigation-evidence>img{min-height:300px}}
`;

await writeFile(pagePath, html);
await writeFile(cssPath, css);
console.log('Retrofitted TNA star-creation investigation with two rights-approved TNA Impact photographs.');
