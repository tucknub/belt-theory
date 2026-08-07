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
  if (!asset || !focal?.desktop || !focal?.mobile) throw new Error(`Incomplete TNA archival record: ${assetId}`);
  const srcset = asset.widths.map((width) => `assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}

function framedPhoto(assetId, className, sizes) {
  const asset = assets.get(assetId);
  return `<figure class="${className}">${image(assetId, sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}

const pagePath = path.join(outputRoot, 'scorecard-tna.html');
const cssPath = path.join(outputRoot, 'assets', 'site.css');
let html = await readFile(pagePath, 'utf8');
let css = await readFile(cssPath, 'utf8');

const heroNeedle = '<section class="hero generic" style="--tone:#57d9fa"><div class="hero-inner shell"><div>';
if (!html.includes(heroNeedle)) throw new Error('TNA scorecard hero structure changed');
html = html.replace(heroNeedle, '<section class="hero generic archive-scorecard-hero" style="--tone:#57d9fa"><div class="hero-inner shell"><div class="archive-scorecard-copy">');
const asideNeedle = '<aside class="hero-panel"><small>complete internal championship-system score</small>';
if (!html.includes(asideNeedle)) throw new Error('TNA scorecard hero panel changed');
html = html.replace(asideNeedle, `${framedPhoto('BT-TNA-001', 'archive-scorecard-photo', '(max-width: 820px) 100vw, 48vw')}<aside class="hero-panel"><small>complete internal championship-system score</small>`);

const evidenceStart = html.indexOf('<div class="evidence-visual fade-up" role="img" aria-label="TNA final system scorecard summary">');
if (evidenceStart < 0) throw new Error('TNA scorecard evidence visual changed');
const evidenceEnd = html.indexOf('</div><div class="panel">', evidenceStart);
if (evidenceEnd < 0) throw new Error('TNA scorecard evidence boundary changed');
html = `${html.slice(0, evidenceStart)}${framedPhoto('BT-TNA-003', 'archive-scorecard-evidence fade-up', '(max-width: 820px) 100vw, 55vw')}${html.slice(evidenceEnd + 6)}`;

html = html.replace('<a href="update-policy.html">Update policy</a>', '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
html = html.replace('<link href="manifest.webmanifest" rel="manifest"/>', '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');

css += `
/* TNA scorecard — authentic photography in separate editorial frames */
.archive-evidence-photo{display:grid!important;grid-template-rows:minmax(330px,1fr) auto!important;min-height:430px}.archive-evidence-photo>img{position:relative!important;inset:auto!important;min-height:330px}.archive-evidence-photo:after{display:none!important}.archive-evidence-photo figcaption{position:relative!important;inset:auto!important;background:#080a0a!important}
.archive-scorecard-hero{min-height:880px;background:radial-gradient(circle at 18% 12%,rgba(87,217,250,.08),transparent 32%),#030505!important}.archive-scorecard-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(390px,.86fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-scorecard-copy{grid-area:copy;align-self:end}.archive-scorecard-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px}.archive-scorecard-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:650px;border:1px solid #315968;background:#080a0a;overflow:hidden}.archive-scorecard-photo>img{min-height:0}.archive-scorecard-photo figcaption,.archive-scorecard-evidence figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid #315968;color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-scorecard-photo figcaption a,.archive-scorecard-evidence figcaption a{color:#57d9fa}.archive-scorecard-evidence{margin:0;display:grid;grid-template-rows:minmax(360px,1fr) auto;border:1px solid #315968;background:#080a0a;overflow:hidden}.archive-scorecard-evidence>img{min-height:360px}
@media(max-width:980px){.archive-scorecard-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-scorecard-photo{min-height:620px}.archive-scorecard-hero .hero-panel{max-width:none}}
@media(max-width:560px){.archive-scorecard-hero{min-height:auto}.archive-scorecard-photo{min-height:480px}.archive-scorecard-evidence>img{min-height:280px}}
`;

await writeFile(pagePath, html);
await writeFile(cssPath, css);
console.log('Retrofitted TNA scorecard with two rights-approved TNA Impact photographs.');
