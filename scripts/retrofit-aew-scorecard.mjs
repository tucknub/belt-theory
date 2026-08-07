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
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete AEW archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}

function framedPhoto(assetId, className, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="${className}">${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const pagePath = path.join(outputRoot, 'scorecard-aew.html');
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let html = await readFile(pagePath, 'utf8');
let css = await readFile(cssPath, 'utf8');

const heroNeedle = '<section class="hero generic" style="--tone:#4bd1d6"><div class="hero-inner shell"><div>';
if (!html.includes(heroNeedle)) throw new Error('AEW scorecard hero structure changed');
html = html.replace(heroNeedle, '<section class="hero generic archive-aew-scorecard-hero" style="--tone:#4bd1d6"><div class="hero-inner shell"><div class="archive-aew-scorecard-copy">');
const panelNeedle = '<aside class="hero-panel"><small>complete internal championship-system score</small>';
if (!html.includes(panelNeedle)) throw new Error('AEW scorecard hero panel changed');
html = html.replace(panelNeedle, `${framedPhoto('BT-AEW-001', 'archive-aew-scorecard-photo', '(max-width: 820px) 100vw, 48vw')}<aside class="hero-panel"><small>complete internal championship-system score</small>`);

const sourceNeedle = '<div class="panel"><h3>Complete archive</h3>';
if (!html.includes(sourceNeedle)) throw new Error('AEW scorecard source panel changed');
html = html.replace(sourceNeedle, `${framedPhoto('BT-AEW-003', 'archive-aew-scorecard-evidence fade-up', '(max-width: 820px) 100vw, 52vw')}<div class="panel"><h3>Complete archive</h3>`);
html = html.replace('<section class="section shell" id="verdict">', '<section class="section shell archive-aew-verdict" id="verdict">');

html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');

css += `
/* AEW scorecard — Wembley scale and real team identity in separate frames */
.archive-aew-scorecard-hero{min-height:880px;background:radial-gradient(circle at 16% 12%,rgba(75,209,214,.08),transparent 32%),#030505!important}.archive-aew-scorecard-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(390px,.86fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-aew-scorecard-copy{grid-area:copy;align-self:end}.archive-aew-scorecard-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px}.archive-aew-scorecard-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:650px;border:1px solid #2d6265;background:#080a0a;overflow:hidden}.archive-aew-scorecard-photo>img{min-height:0}.archive-aew-scorecard-photo figcaption,.archive-aew-scorecard-evidence figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid #2d6265;color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-aew-scorecard-photo figcaption a,.archive-aew-scorecard-evidence figcaption a{color:#4bd1d6}.archive-aew-scorecard-evidence{margin:0 0 18px;display:grid;grid-template-rows:minmax(360px,1fr) auto;border:1px solid #2d6265;background:#080a0a;overflow:hidden}.archive-aew-scorecard-evidence>img{min-height:360px}.archive-aew-scorecard-evidence+.panel{margin-top:0}
@media(max-width:980px){.archive-aew-scorecard-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-aew-scorecard-photo{min-height:620px}.archive-aew-scorecard-hero .hero-panel{max-width:none}}
@media(max-width:560px){.archive-aew-scorecard-hero{min-height:auto}.archive-aew-scorecard-photo{min-height:480px}.archive-aew-scorecard-evidence>img{min-height:280px}.archive-aew-verdict .section-head>*{min-width:0}.archive-aew-verdict .section-head h2{font-size:46px;overflow-wrap:anywhere}}
`;

await writeFile(pagePath, html);
await writeFile(cssPath, css);
console.log('Retrofitted AEW scorecard with two rights-approved AEW photographs.');
