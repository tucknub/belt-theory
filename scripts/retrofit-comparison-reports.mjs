import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const outputRoot=path.resolve(process.argv[2]||path.join(root,'dist'));
const manifest=JSON.parse(await readFile(path.join(root,'data','archive-assets.json'),'utf8'));
const focalPoints=JSON.parse(await readFile(path.join(root,'data','archive-focal-points.json'),'utf8'));
const assets=new Map(manifest.assets.map(a=>[a.id,a]));
const escapeHtml=(value)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

function image(assetId,sizes){
  const asset=assets.get(assetId); const focal=focalPoints[assetId];
  if(!asset||!focal?.desktop||!focal?.mobile) throw new Error(`Incomplete comparison archival record: ${assetId}`);
  const srcset=asset.widths.map(w=>`assets/archive/${asset.slug}-${w}.${asset.extension} ${w}w`).join(', ');
  return `<img alt="${escapeHtml(asset.alt)}" class="archive-production-image" data-asset-id="${asset.id}" decoding="async" loading="lazy" sizes="${sizes}" src="assets/archive/${asset.slug}-${asset.defaultWidth}.${asset.extension}" srcset="${srcset}" style="--focal-desktop:${focal.desktop};--focal-mobile:${focal.mobile}">`;
}
function figure(assetId,className,sizes,label=''){
  const asset=assets.get(assetId);
  return `<figure class="${className}">${label?`<strong>${escapeHtml(label)}</strong>`:''}${image(assetId,sizes)}<figcaption><span>${escapeHtml(asset.caption)}</span><a href="${escapeHtml(asset.sourcePage)}" rel="noreferrer" target="_blank">${escapeHtml(asset.shortCredit)}</a></figcaption></figure>`;
}
function addPolicy(html){
  html=html.replace('<a href="update-policy.html">Update policy</a>','<a href="update-policy.html">Update policy</a><a href="image-credits.html">Image credits</a>');
  html=html.replace('<link href="manifest.webmanifest" rel="manifest"/>','<link href="manifest.webmanifest" rel="manifest"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/>');
  return html;
}

const cssPath=path.join(outputRoot,'assets','site.css');
let css=await readFile(cssPath,'utf8');

{
  const pagePath=path.join(outputRoot,'report-wwe-vs-aew.html');
  let html=await readFile(pagePath,'utf8');
  const heroNeedle='<section class="hero split" style="--tone:#ef5550;--c1a:#ef555099;--c2a:#4bd1d699"><div class="hero-inner shell"><div>';
  if(!html.includes(heroNeedle)) throw new Error('WWE vs. AEW hero structure changed');
  html=html.replace(heroNeedle,'<section class="hero split archive-wwe-aew-hero" style="--tone:#ef5550;--c1a:#ef555099;--c2a:#4bd1d699"><div class="hero-inner shell"><div class="archive-wwe-aew-copy">');
  const panelNeedle='<aside class="hero-panel"><small>August 31, 2019–August 5, 2026</small>';
  const heroPair=`<div class="archive-wwe-aew-pair">${figure('BT-WWE-001','archive-wwe-aew-photo','(max-width: 820px) 100vw, 25vw','WWE')}${figure('BT-AEW-001','archive-wwe-aew-photo','(max-width: 820px) 100vw, 25vw','AEW')}</div>`;
  if(!html.includes(panelNeedle)) throw new Error('WWE vs. AEW hero panel changed');
  html=html.replace(panelNeedle,`${heroPair}${panelNeedle}`);
  const bottomNeedle='<blockquote class="quote" style="--tone:#ef5550">';
  const secondPair=`<div class="archive-wwe-aew-secondary">${figure('BT-GENERAL-001','archive-wwe-aew-photo','(max-width: 820px) 100vw, 36vw','WWE live presentation')}${figure('BT-AEW-003','archive-wwe-aew-photo','(max-width: 820px) 100vw, 36vw','AEW identity')}</div>`;
  if(!html.includes(bottomNeedle)) throw new Error('WWE vs. AEW bottom-line structure changed');
  html=html.replace(bottomNeedle,`${secondPair}${bottomNeedle}`);
  html=addPolicy(html);
  await writeFile(pagePath,html);
}

{
  const pagePath=path.join(outputRoot,'report-wwe-wcw-ecw.html');
  let html=await readFile(pagePath,'utf8');
  const heroClose='</aside></div></section>\n<section class="section shell" id="scorecard">';
  if(!html.includes(heroClose)) throw new Error('Three-way comparison hero boundary changed');
  const strip=`</aside></div></section><section class="archive-three-way-strip shell" aria-label="Authentic promotion photography">${figure('BT-GENERAL-001','archive-three-way-photo','(max-width: 820px) 100vw, 31vw','WWE')}${figure('BT-WCW-003','archive-three-way-photo','(max-width: 820px) 100vw, 31vw','WCW')}${figure('BT-ECW-003','archive-three-way-photo','(max-width: 820px) 100vw, 31vw','Original ECW')}</section>\n<section class="section shell" id="scorecard">`;
  html=html.replace(heroClose,strip);
  html=addPolicy(html);
  await writeFile(pagePath,html);
}

css+=`
/* WWE vs. AEW — matched source frames; no invented face-off */
.archive-wwe-aew-hero{min-height:980px;background:linear-gradient(90deg,rgba(239,85,80,.10),transparent 45%,rgba(75,209,214,.10)),#030505!important}.archive-wwe-aew-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(520px,.94fr);grid-template-areas:"copy photos" "panel photos";align-items:stretch;gap:24px}.archive-wwe-aew-copy{grid-area:copy;align-self:end;min-width:0}.archive-wwe-aew-hero .hero-panel{grid-area:panel;align-self:start;max-width:760px;min-width:0}.archive-wwe-aew-pair{grid-area:photos;display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:720px}.archive-wwe-aew-secondary{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 0 34px}.archive-wwe-aew-photo{position:relative;margin:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;border:1px solid #3a4240;background:#080a0a;overflow:hidden;min-width:0}.archive-wwe-aew-photo>strong{padding:10px 12px;color:#f2c250;font-size:10px;letter-spacing:.14em;text-transform:uppercase}.archive-wwe-aew-photo>img{min-height:0}.archive-wwe-aew-photo figcaption{display:grid;gap:6px;padding:12px;background:#080a0a;border-top:1px solid #3a4240;color:#d7d8d4;font-size:8px;line-height:1.45;text-transform:uppercase}.archive-wwe-aew-photo figcaption a{color:#f2c250}.archive-wwe-aew-hero h1,.archive-wwe-aew-hero h2,.archive-wwe-aew-hero p{overflow-wrap:anywhere}
@media(max-width:1100px){.archive-wwe-aew-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photos" "panel"}.archive-wwe-aew-pair{min-height:620px}.archive-wwe-aew-hero .hero-panel{max-width:none}}
@media(max-width:700px){.archive-wwe-aew-pair,.archive-wwe-aew-secondary{grid-template-columns:1fr}.archive-wwe-aew-pair{min-height:auto}.archive-wwe-aew-photo>img{min-height:340px}.archive-wwe-aew-hero{min-height:auto}}
/* WWE vs. WCW vs. ECW — independent archival records */
.archive-three-way-strip{position:relative;z-index:4;margin-top:-36px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:10px;background:#070909;border:1px solid #4a4030;box-shadow:0 28px 70px #000}.archive-three-way-photo{margin:0;display:grid;grid-template-rows:auto 310px auto;min-width:0;border:1px solid #353a37;background:#080a0a;overflow:hidden}.archive-three-way-photo>strong{padding:10px 12px;color:#e8ad28;font-size:10px;letter-spacing:.14em;text-transform:uppercase}.archive-three-way-photo figcaption{display:grid;gap:6px;padding:12px;background:#080a0a;border-top:1px solid #353a37;color:#d7d8d4;font-size:8px;line-height:1.45;text-transform:uppercase}.archive-three-way-photo figcaption a{color:#e8ad28}
@media(max-width:900px){.archive-three-way-strip{grid-template-columns:1fr;margin-top:-12px}.archive-three-way-photo{grid-template-rows:auto 430px auto}}
@media(max-width:560px){.archive-three-way-photo{grid-template-rows:auto 330px auto}}
`;
await writeFile(cssPath,css);
console.log('Retrofitted WWE vs. AEW and WWE vs. WCW vs. ECW with independent authentic source frames.');
