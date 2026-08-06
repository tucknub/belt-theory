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
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function image(assetId, { className = 'archive-production-image', sizes = '100vw', loading = 'lazy', relative = '' } = {}) {
  const asset = assets.get(assetId);
  if (!asset) throw new Error(`Unknown archival asset ${assetId}`);
  const focal = focalPoints[assetId];
  if (!focal?.desktop || !focal?.mobile) throw new Error(`Missing focal points for ${assetId}`);
  const src = `${relative}assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}`;
  const srcset = asset.widths
    .map((width) => `${relative}assets/archive/${asset.slug}-${width}.${asset.extension} ${width}w`)
    .join(', ');
  const fetchPriority = loading === 'eager' ? ' fetchpriority="high"' : '';
  return `<img alt="${escapeHtml(asset.alt)}" class="${className}" data-asset-id="${asset.id}" decoding="async" loading="${loading}" sizes="${sizes}" src="${src}" srcset="${srcset}" style="--focal-desktop:${escapeHtml(focal.desktop)};--focal-mobile:${escapeHtml(focal.mobile)}"${fetchPriority}>`;
}

function credit(assetId, className = 'archive-credit') {
  const asset = assets.get(assetId);
  return `<a class="${className}" href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit || `${asset.creator} · ${asset.license}`)}</a>`;
}

function cardArt(assetId, label) {
  return `<div class="promotion-art archive-card-art">${image(assetId, { sizes: '(max-width: 820px) 100vw, 50vw' })}<div class="archive-card-band"><span>${escapeHtml(label)}</span>${credit(assetId, 'archive-card-credit')}</div></div>`;
}

let html = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
let css = await readFile(path.join(outputRoot, 'assets', 'site.css'), 'utf8');

html = html.replace(
  '<section class="hero" style="--tone:var(--gold)">',
  `<section class="hero archive-home-hero" style="--tone:var(--gold)"><figure class="archive-hero-media">${image('BT-AEW-001', { loading: 'eager', sizes: '100vw' })}<figcaption>${credit('BT-AEW-001')}</figcaption></figure>`
);

const cardReplacements = [
  ['scorecard-wwe.html', 'BT-WWE-002', 'WWE'],
  ['scorecard-aew.html', 'BT-AEW-003', 'AEW'],
  ['scorecard-tna.html', 'BT-TNA-001', 'TNA / Impact'],
  ['scorecard-wcw.html', 'BT-WCW-003', 'WCW'],
  ['scorecard-ecw.html', 'BT-ECW-003', 'Original ECW']
];
for (const [href, assetId, label] of cardReplacements) {
  const pattern = new RegExp(`(<a class="promotion-card" href="${href.replaceAll('.', '\\.') }"[^>]*>)<div class="promotion-art"><span>[^<]+<\\/span><\\/div>`);
  if (!pattern.test(html)) throw new Error(`Could not find promotion art for ${href}`);
  html = html.replace(pattern, `$1${cardArt(assetId, label)}`);
}

const comparisonNeedle = '<a class="report-card" href="report-wwe-vs-aew.html"';
const comparisonStart = html.indexOf(comparisonNeedle);
if (comparisonStart < 0) throw new Error('Could not find WWE vs. AEW comparison card');
const comparisonContent = html.indexOf('<div>', comparisonStart);
html = `${html.slice(0, comparisonContent)}<div class="archive-comparison-media">${image('BT-WWE-001', { sizes: '(max-width: 820px) 50vw, 17vw' })}${image('BT-AEW-001', { sizes: '(max-width: 820px) 50vw, 17vw' })}</div>${html.slice(comparisonContent)}`;

const evidenceStartNeedle = '<div class="evidence-visual fade-up" role="img" aria-label="TNA final system scorecard summary">';
const evidenceStart = html.indexOf(evidenceStartNeedle);
if (evidenceStart < 0) throw new Error('Could not find the TNA homepage evidence visual');
const evidenceEndNeedle = '</div></div></section>';
const evidenceEnd = html.indexOf(evidenceEndNeedle, evidenceStart);
if (evidenceEnd < 0) throw new Error('Could not find the end of the TNA homepage evidence section');
const evidenceFigure = `<figure class="archive-evidence-photo fade-up">${image('BT-TNA-003', { sizes: '(max-width: 820px) 100vw, 42vw' })}<figcaption><span>${escapeHtml(assets.get('BT-TNA-003').caption)}</span>${credit('BT-TNA-003')}</figcaption></figure>`;
html = `${html.slice(0, evidenceStart)}${evidenceFigure}${html.slice(evidenceEnd)}`;

html = html.replace(
  '<a href="update-policy.html">Update policy</a>',
  '<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>'
);
html = html.replace(
  '<link href="manifest.webmanifest" rel="manifest"/>',
  '<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>'
);

const remoteImagePattern = /url\(['"]https:\/\/images\.unsplash\.com\/[^)]+\)/g;
css = css.replace(remoteImagePattern, 'none');
css += `
/* Belt Theory v1.2 Authentic Archive production-home retrofit */
.archive-production-image{width:100%;height:100%;object-fit:cover;object-position:var(--focal-desktop,50% 50%)}
.archive-home-hero{background:#030505}.archive-hero-media{position:absolute;inset:0;margin:0;z-index:0;overflow:hidden;background:#050606}.archive-hero-media:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#030505 0,rgba(3,5,5,.92) 35%,rgba(3,5,5,.18) 68%,rgba(3,5,5,.72)),linear-gradient(180deg,rgba(3,5,5,.12),#030505 98%);pointer-events:none}.archive-hero-media figcaption{position:absolute;right:16px;bottom:16px;z-index:2}.archive-credit,.archive-card-credit{display:inline-block;padding:7px 9px;border-left:2px solid var(--gold2);background:rgba(3,5,5,.9);color:#ddd9cf;font-size:8px;line-height:1.35;letter-spacing:.06em;text-transform:uppercase}.archive-credit:hover,.archive-card-credit:hover{color:#fff;border-color:#fff}
.archive-card-art{display:grid!important;grid-template-rows:minmax(0,1fr) auto;padding:0!important;background:#080a0a!important;background-blend-mode:normal!important}.archive-card-art:after{display:none}.archive-card-art>.archive-production-image{min-height:0}.archive-card-band{position:relative;z-index:2;min-height:64px;padding:11px 14px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:14px;background:#080a0a;border-top:1px solid color-mix(in srgb,var(--tone) 38%,#343936)}.archive-card-band>span{font:clamp(30px,3vw,47px)/.85 Impact,'Arial Black',sans-serif!important;color:var(--tone);text-transform:uppercase}.archive-card-credit{justify-self:end;max-width:265px;text-align:right;border-left:0;border-right:2px solid var(--tone);background:transparent;padding:2px 8px;color:#aeb1aa}
.report-card{background:radial-gradient(circle at 18% 18%,var(--c1),transparent 43%),radial-gradient(circle at 85% 84%,var(--c2),transparent 45%),linear-gradient(145deg,#111516,#030505)!important}.archive-comparison-media{position:absolute;inset:0 0 45%;display:grid;grid-template-columns:1fr 1fr;z-index:0;opacity:.8}.archive-comparison-media:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent,#030505)}.archive-comparison-media img{min-width:0}.report-card>div:not(.archive-comparison-media){margin-top:auto;background:linear-gradient(180deg,transparent,#030505 24%);width:100%}
.archive-evidence-photo{position:relative;margin:0;min-height:430px;border:1px solid #56533d;overflow:hidden;background:#080a0a}.archive-evidence-photo>img{position:absolute;inset:0}.archive-evidence-photo:after{content:"";position:absolute;inset:55% 0 0;background:linear-gradient(180deg,transparent,rgba(3,5,5,.96))}.archive-evidence-photo figcaption{position:absolute;inset:auto 0 0;z-index:2;display:flex;justify-content:space-between;align-items:end;gap:18px;padding:16px;background:rgba(3,5,5,.88);color:#d7d6d0;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-evidence-photo figcaption span{max-width:55%}
.credits-hero{min-height:560px}.credits-grid{display:grid;gap:18px}.production-credit-card{display:grid;grid-template-columns:minmax(260px,.78fr) 1fr;border:1px solid var(--line);background:linear-gradient(145deg,#111516,#070909);overflow:hidden}.production-credit-card figure{position:relative;min-height:360px;margin:0}.production-credit-card figure img{position:absolute;inset:0}.production-credit-card>div{padding:30px}.production-credit-card small{color:var(--gold2);font-weight:900;letter-spacing:.12em}.production-credit-card h2{font:42px/.95 Impact,'Arial Black',sans-serif;text-transform:uppercase}.production-credit-card p{color:var(--muted);line-height:1.65}.production-credit-card a{color:var(--gold2)}
@media(max-width:820px){.archive-production-image{object-position:var(--focal-mobile,50% 50%)}.archive-hero-media:after{background:linear-gradient(90deg,rgba(3,5,5,.88),rgba(3,5,5,.4)),linear-gradient(180deg,rgba(3,5,5,.22),#030505 98%)}.archive-card-band{grid-template-columns:1fr}.archive-card-credit{justify-self:start;text-align:left;border-right:0;border-left:2px solid var(--tone)}.archive-evidence-photo figcaption{display:grid}.archive-evidence-photo figcaption span{max-width:none}.production-credit-card{grid-template-columns:1fr}.production-credit-card figure{min-height:300px}}
@media(max-width:560px){.archive-hero-media figcaption{right:10px;bottom:10px;max-width:260px}.archive-card-band{min-height:76px}.archive-comparison-media{inset:0 0 55%}.production-credit-card figure{min-height:240px}}
`;

const cards = manifest.assets.map((asset) => {
  const focal = focalPoints[asset.id];
  return `<article class="production-credit-card" id="${escapeHtml(asset.id)}"><figure>${image(asset.id, { sizes: '(max-width: 820px) 100vw, 42vw' })}</figure><div><small>${escapeHtml(asset.id)}</small><h2>${escapeHtml(asset.caption)}</h2><p><strong>Creator:</strong> ${escapeHtml(asset.creator)}</p><p><strong>License:</strong> <a href="${escapeHtml(asset.licenseUrl)}" rel="noreferrer" target="_blank">${escapeHtml(asset.license)}</a></p><p><strong>Source:</strong> <a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">Open original source record →</a></p><p><strong>Changes:</strong> ${escapeHtml(asset.changes)}</p><p><strong>Protected focal points:</strong> desktop ${escapeHtml(focal.desktop)}; mobile ${escapeHtml(focal.mobile)}.</p></div></article>`;
}).join('');

const credits = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050606"><meta name="description" content="Photography credits, licenses, source records and transformation disclosures for Belt Theory."><title>Photography credits — Belt Theory</title><link href="assets/mark.svg" rel="icon"><link href="assets/site.css" rel="stylesheet"><meta content="dark" name="color-scheme"><meta content="noindex, follow" name="robots"></head><body><a class="skip" href="#content">Skip to content</a><header class="topbar"><div class="navwrap shell"><a class="brand" href="index.html"><img alt="" aria-hidden="true" height="56" src="assets/mark.svg" width="56"><span><b>BELT</b><em>THEORY</em></span></a><nav class="desktopnav"><a href="index.html">Home</a><a href="scorecards.html">Scorecards</a><a href="comparisons.html">Comparisons</a><a href="research.html">Research</a><a href="methodology.html">Methodology</a><a href="about.html">About</a></nav></div></header><main id="content"><section class="hero generic credits-hero" style="--tone:var(--gold)"><div class="hero-inner shell"><div><h1>Photography credits<span>and licenses.</span></h1><p>Real wrestlers, promoters, crowds, venues, championship belts and named historical events appear only through authentic photography. Crops, responsive derivatives and tonal presentation are disclosed below.</p></div><aside class="hero-panel"><small>Binding composition rule</small><strong>Real history</strong><h2>No generative material crosses a photographed person, clothing, hands, body or championship belt.</h2></aside></div></section><section class="section shell"><div class="section-head"><div><h2>Visible sources.<br>Auditable context.</h2></div><p>The source record remains linked for every photograph. Event dates and upload dates are distinguished whenever the source page treats them differently.</p></div><div class="credits-grid">${cards}</div></section></main><footer class="footer"><div class="shell footergrid"><a class="brand" href="index.html"><img alt="" aria-hidden="true" height="56" src="assets/mark.svg" width="56"><span><b>BELT</b><em>THEORY</em></span></a><p>Authentic Archive Edition. Independent research; not affiliated with any promotion.</p><nav><a href="methodology.html">Methodology</a><a href="research.html">Sources</a><a href="index.html">Homepage</a></nav></div></footer><script src="assets/site.js"></script></body></html>`;

await writeFile(path.join(outputRoot, 'index.html'), html);
await writeFile(path.join(outputRoot, 'assets', 'site.css'), css);
await writeFile(path.join(outputRoot, 'image-credits.html'), credits);
console.log(`Retrofitted production homepage with ${manifest.assets.length} authentic archival records.`);
