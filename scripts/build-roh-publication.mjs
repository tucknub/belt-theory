import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const out=path.resolve(process.argv[2]||path.join(root,'dist'));
const sourceAssets=JSON.parse(await readFile(path.join(root,'data','roh-archive-assets.json'),'utf8'));
const focal=JSON.parse(await readFile(path.join(root,'data','roh-archive-focal-points.json'),'utf8'));
const built=JSON.parse(await readFile(path.join(out,'assets','archive','roh-manifest.json'),'utf8'));
const assets=new Map(built.assets.map(a=>[a.id,a]));
const finalSheet='https://docs.google.com/spreadsheets/d/18ZtPbJR7nWkvHXZki-wHOzfobG4K83PnxSyfA6atv5k/edit';

function asset(id){ const a=assets.get(id); if(!a) throw new Error(`Missing built ROH asset ${id}`); return a; }
function image(id,{sizes='(max-width: 820px) 100vw, 48vw',contain=false,priority=false}={}){
  const a=asset(id); const f=focal[id];
  const def=a.variants.find(v=>v.requestedWidth===a.defaultWidth)||a.variants.at(-1);
  const srcset=a.variants.map(v=>`assets/archive/${v.filename} ${v.width}w`).join(', ');
  return `<img alt="${a.alt}" class="archive-production-image${contain?' archive-roh-contain':''}" data-asset-id="${a.id}" decoding="async" ${priority?'fetchpriority="high"':'loading="lazy"'} sizes="${sizes}" src="assets/archive/${def.filename}" srcset="${srcset}" style="--focal-desktop:${f.desktop};--focal-mobile:${f.mobile}" width="${def.width}" height="${def.height}">`;
}
function fig(id,cls,opts={}){
  const a=asset(id);
  return `<figure class="${cls}">${image(id,opts)}<figcaption><span>${a.caption}</span><a href="${a.sourcePage}" rel="noreferrer" target="_blank">${a.shortCredit}</a></figcaption></figure>`;
}
function insertBeforeLast(text,needle,insertion){ const i=text.lastIndexOf(needle); if(i<0) throw new Error(`Could not find insertion marker ${needle}`); return text.slice(0,i)+insertion+text.slice(i); }

const shell=await readFile(path.join(out,'scorecard-tna.html'),'utf8');
const header=shell.match(/<header class="topbar">[\s\S]*?<\/header>/i)?.[0];
const footer=shell.match(/<footer class="footer">[\s\S]*?<\/footer>/i)?.[0];
if(!header||!footer) throw new Error('Could not extract Belt Theory scorecard shell.');

const dimensions=[
 ['World stability',94.0,'42 World reigns · 178.5-day median · 99.1% utilization'],
 ['Breakthrough durability',68.2,'174-day median first World reign · 63.6% durable-or-repeat'],
 ['Internal mobility',42.0,'19 of 33 World champions had prior ROH gold; women have no completed lower→world path'],
 ['Role distinctness',88.5,'Eight active seats with World, TV, Pure, team and women’s roles kept functionally separate'],
 ['Team ecosystem',82.0,'14 Tag-before-World paths · 5 Six-Man-before-World paths'],
 ['Women’s system',61.5,'Three active roles, but heavy concentration and no completed upward path'],
 ['Governance & continuity',72.6,'Core utilization above 98%; Pure gap and cross-brand authority reduce continuity']
];
const dimRows=dimensions.map(([name,score,note])=>`<div class="roh-dimension"><div><b>${name}</b><span>${note}</span></div><strong>${score.toFixed(1)}</strong><div class="roh-meter"><i style="width:${score}%"></i></div></div>`).join('');

const scorecard=`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width,initial-scale=1" name="viewport"/><meta content="#050606" name="theme-color"/><meta content="ROH's championship system scores 71.8 in Belt Theory's locked seven-dimension internal audit: elite World stability, a proven team ladder and interrupted continuity." name="description"/><title>ROH championship-system scorecard — Belt Theory</title><link href="assets/mark.svg" rel="icon"/><link href="assets/site.css" rel="stylesheet"/><meta content="dark" name="color-scheme"/><meta content="index, follow, max-image-preview:large" name="robots"/><meta content="article" property="og:type"/><meta content="Belt Theory" property="og:site_name"/><meta content="ROH championship-system scorecard — Belt Theory" property="og:title"/><meta content="Strong architecture. Proven team ladder. Interrupted continuity." property="og:description"/><meta content="summary_large_image" name="twitter:card"/><meta content="Authentic photography for real people and real events; AI is decorative only." name="archive-image-policy"/></head><body><a class="skip" href="#content">Skip to content</a>${header}<main id="content"><section class="hero generic archive-roh-scorecard-hero" style="--tone:#d44752"><div class="hero-inner shell"><div class="archive-roh-scorecard-copy"><span class="kicker">Promotion championship-system scorecard</span><h1>Ring of Honor<span>Strong architecture. Proven team ladder. Interrupted continuity.</span></h1><p>ROH’s championship history is stronger than a simple “indie prestige” story. Its World title is unusually stable, its roles are distinct, and its tag championships repeatedly served as a platform for future World champions. Structural resets and uneven mobility keep the system from scoring higher.</p><div class="actions"><a class="button" href="#verdict">Read verdict</a><a class="button" href="systems-index.html">Open Systems Index</a></div></div>${fig('BT-ROH-001','archive-roh-scorecard-photo',{priority:true})}<aside class="hero-panel"><small>locked seven-dimension internal audit</small><strong>71.8</strong><h2>Diagnostic score—not a universal cross-promotion ranking.</h2></aside></div></section><div class="statrail shell"><article><strong>201</strong><span>lineal champion reigns audited</span></article><article><strong>9</strong><span>identified lineages · 8 active</span></article><article><strong>57.6%</strong><span>World champions with prior ROH internal gold</span></article><article><strong>42.4%</strong><span>World champions who held Tag gold first</span></article></div>
<section class="section shell" id="verdict"><div class="section-head"><div><span class="kicker">System diagnosis</span><h2>ROH’s ladder was hiding in the tag division.</h2></div><p>TV and Pure mattered, but the strongest developmental evidence came from team championships: fourteen of 33 unique World champions held the World Tag title before their first World reign.</p></div><div class="two-col"><article class="panel" style="--tone:#d44752"><h3>What worked</h3><ul class="checklist"><li>World title: 178.5-day median and zero lineal reigns under 30 days</li><li>World, TV, Tag and Six-Man lineages each exceed 98% utilization</li><li>Fourteen Tag-before-World paths and five Six-Man-before-World paths</li><li>Pure and TV occupy distinct technical and breakthrough jobs rather than duplicating one another</li></ul></article><article class="panel" style="--tone:#d44752"><h3>What limited the system</h3><ul class="checklist"><li>Only seven unique World champions held TV or Pure before their first World reign</li><li>No completed women’s lower-title-to-Women’s-World path by the cutoff</li><li>Pure disappeared for 4,919 days between 2006 and 2020</li><li>Interim branches and title changes on AEW/CMLL programming complicate standalone governance</li></ul></article></div><blockquote class="quote" style="--tone:#d44752">Nineteen of 33 unique ROH World champions held some ROH internal championship before their first World reign. Sixteen used Tag or Six-Man gold.</blockquote></section>
<section class="section band"><div class="shell"><div class="section-head"><div><span class="kicker">Seven-dimension audit</span><h2>Where 71.8 comes from.</h2></div><p>The weights are the same AEW-style internal framework Belt Theory locked before ROH was scored: stability, durability, mobility, role clarity, teams, women and governance.</p></div><div class="roh-dimensions">${dimRows}</div><div class="panel roh-sensitivity"><h3>Sensitivity range</h3><p><strong>64.6–77.6.</strong> ROH rises in prestige-first and architecture-first models; it falls when development or the women’s system receives heavier weight. The diagnosis changes in degree, not direction.</p></div></div></section>
<section class="section shell"><div class="section-head"><div><span class="kicker">Research receipt</span><h2>Team gold before World gold.</h2></div><p>Jay Briscoe’s career illustrates the system’s strongest documented pathway: he held ROH World Tag gold repeatedly before his first ROH World Championship in 2013.</p></div><div class="evidence">${fig('BT-ROH-002','archive-roh-scorecard-evidence',{contain:true,sizes:'(max-width: 820px) 100vw, 55vw'})}<div class="panel"><h3>Six-phase canonical audit</h3><p>The final workbook traces all 201 lineal reigns, World/TV/Pure pathways, all 72 Tag and 20 Six-Man reigns, all women’s lineages, vacancy/interim operations and the locked seven-dimension scorecard.</p><a class="button blue" href="${finalSheet}" rel="external noopener">Open canonical ROH workbook</a><p class="roh-index-warning"><strong>Index rule:</strong> 71.8 is an ROH internal diagnostic. It is not evidence that ROH “ranks above” AEW 68.2 or “below” TNA 73.2 until all promotions are re-scored through one universal model.</p></div></div></section></main>${footer}<script src="assets/site.js"></script></body></html>`;
await writeFile(path.join(out,'scorecard-roh.html'),scorecard);

let home=await readFile(path.join(out,'index.html'),'utf8');
const homeCard=`<a class="promotion-card" href="scorecard-roh.html" style="--tone:#d44752"><div class="promotion-art archive-card-art">${image('BT-ROH-001',{sizes:'(max-width: 820px) 100vw, 50vw'})}<div class="archive-card-band"><span>ROH</span><a class="archive-card-credit" href="${asset('BT-ROH-001').sourcePage}" rel="noreferrer" target="_blank">${asset('BT-ROH-001').shortCredit}</a></div></div><div class="promotion-copy"><small>locked seven-dimension internal audit</small><strong>71.8</strong><h3>Strong architecture. Proven team ladder.</h3><p>ROH combined an unusually stable World title with distinct roles and a team system that repeatedly preceded future World champions. Structural resets and uneven mobility limited the total.</p><em>Open scorecard →</em></div></a>`;
home=home.replace('Five promotions. One repeatable model.','Six promotions. One repeatable model.')
 .replace('<strong>5</strong><span>promotion systems</span>','<strong>6</strong><span>promotion systems</span>')
 .replace('Five systems.<br/>Five different tradeoffs.','Six systems.<br/>Six different tradeoffs.')
 .replace('Five promotions, title lineages, pathways, durability, concentration and governance.','Six promotions, title lineages, pathways, durability, concentration and governance.')
 .replace('Five scorecards, three matched comparisons and one flagship investigation.','Six scorecards, three matched comparisons and one flagship investigation.');
const homeMarker='Open scorecard →</em></div></a></div></section>';
const lastHomeCard=home.lastIndexOf(homeMarker);
if(lastHomeCard<0) throw new Error('Could not locate homepage promotion grid end.');
home=home.slice(0,lastHomeCard+homeMarker.length-16)+homeCard+home.slice(lastHomeCard+homeMarker.length-16);
await writeFile(path.join(out,'index.html'),home);

let scorecards=await readFile(path.join(out,'scorecards.html'),'utf8');
const libraryCard=`<a class="promotion-card" href="scorecard-roh.html" style="--tone:#d44752"><div class="promotion-art"><span>ROH</span></div><div class="promotion-copy"><small>locked seven-dimension internal audit</small><strong>71.8</strong><h3>Strong architecture. Proven team ladder.</h3><p>ROH’s World title is highly stable and its team championships form the strongest documented internal path to the top. Pure continuity and cross-brand governance remain structural costs.</p><em>Open scorecard →</em></div></a>`;
scorecards=scorecards.replace('Belt Theory scorecards for WWE, AEW, TNA, WCW and original ECW.','Belt Theory scorecards for WWE, AEW, TNA, WCW, original ECW and ROH.')
 .replace('Five systems. Measured on their own terms.','Six systems. Measured on their own terms.')
 .replace('<strong>5</strong><h2>WWE · AEW · TNA · WCW · ECW</h2>','<strong>6</strong><h2>WWE · AEW · TNA · WCW · ECW · ROH</h2>');
const libEnd='Open scorecard →</em></div></a></div></section></main>';
const libIndex=scorecards.lastIndexOf(libEnd);
if(libIndex<0) throw new Error('Could not locate scorecard library grid end.');
scorecards=scorecards.slice(0,libIndex+libEnd.length-22)+libraryCard+scorecards.slice(libIndex+libEnd.length-22);
await writeFile(path.join(out,'scorecards.html'),scorecards);

let systems=await readFile(path.join(out,'systems-index.html'),'utf8');
const rohFingerprint=`<article class="system-fingerprint" style="--tone:#d44752"><div class="system-number"><small>locked seven-dimension internal diagnostic</small><strong>71.8</strong></div><div><span class="kicker">System fingerprint</span><h3>ROH</h3><dl><div><dt>Documented strength</dt><dd>Elite World-title stability, unusually distinct roles and a team ecosystem that repeatedly fed future World champions.</dd></div><div><dt>Structural risk</dt><dd>Women’s upward mobility is unproven; Pure suffered a 4,919-day interruption; cross-brand authority complicates continuity.</dd></div></dl><a class="text-link" href="scorecard-roh.html">Open ROH scorecard →</a></div></article>`;
systems=systems.replaceAll('Five promotion systems','Six promotion systems').replaceAll('Five promotion systems mapped','Six promotion systems mapped').replaceAll('five-promotion','six-promotion').replace('Map the five systems','Map the six systems').replace('<strong>5</strong><span>promotion systems</span>','<strong>6</strong><span>promotion systems</span>');
const fpMarker='Open Original ECW scorecard →</a></div></article></div></section>';
if(!systems.includes(fpMarker)) throw new Error('Could not locate Systems Index fingerprint grid end.');
systems=systems.replace(fpMarker,`Open Original ECW scorecard →</a></div></article>${rohFingerprint}</div></section>`);
await writeFile(path.join(out,'systems-index.html'),systems);

let research=await readFile(path.join(out,'research.html'),'utf8');
research=research.replace('<strong>2026-08-05</strong>','<strong>2026-08-07</strong>');
const sourceMarker='<a href="https://docs.google.com/spreadsheets/d/1J3sc2JCFxES-sKllOz9Z0MIFNUgh3YuBw1Mi9-bsO7Y/edit" rel="external noopener"><b>Tna Aew</b><span>Open canonical Google Sheet →</span></a>';
const rohSource=`<a href="${finalSheet}" rel="external noopener"><b>ROH Final</b><span>Open six-phase canonical Google Sheet →</span></a>`;
if(!research.includes(sourceMarker)) throw new Error('Could not locate research source-list insertion point.');
research=research.replace(sourceMarker,sourceMarker+rohSource);
research=research.replace('</div></div></section></main>',`<a class="report-card" href="scorecard-roh.html" style="--c1:#d4475299;--c2:#03050599"><div><small>ROH internal pathways</small><h3>Was ROH’s real ladder the tag division?</h3><strong>57.6% prior-internal path</strong></div></a></div></div></section></main>`);
await writeFile(path.join(out,'research.html'),research);

let credits=await readFile(path.join(out,'image-credits.html'),'utf8');
const creditCards=sourceAssets.assets.map(a=>{
  const contain=a.id==='BT-ROH-002'; const f=focal[a.id];
  return `<article class="production-credit-card" id="${a.id}"><figure>${image(a.id,{sizes:'(max-width: 820px) 100vw, 42vw',contain})}</figure><div><small>${a.id}</small><h2>${a.caption}</h2><p><strong>Creator:</strong> ${a.creator}</p><p><strong>License:</strong> <a href="${a.licenseUrl}" rel="noreferrer" target="_blank">${a.license}</a></p><p><strong>Source:</strong> <a href="${a.sourcePage}" rel="noreferrer" target="_blank">Open original source record →</a></p><p><strong>Changes:</strong> ${a.changes}</p><p><strong>Protected focal points:</strong> desktop ${f.desktop}; mobile ${f.mobile}.${contain?' Full subject/belt uses contain framing.':''}</p></div></article>`;
}).join('');
credits=insertBeforeLast(credits,'</div></section></main>',creditCards);
await writeFile(path.join(out,'image-credits.html'),credits);

let css=await readFile(path.join(out,'assets','site.css'),'utf8');
if(!css.includes('/* ROH publication */')) css+=`\n/* ROH publication */\n.archive-roh-scorecard-hero{min-height:900px;background:radial-gradient(circle at 18% 14%,rgba(212,71,82,.10),transparent 34%),#030505!important}.archive-roh-scorecard-hero .hero-inner{grid-template-columns:minmax(0,1fr) minmax(390px,.86fr);grid-template-areas:"copy photo" "panel photo";align-items:stretch;gap:24px}.archive-roh-scorecard-copy{grid-area:copy;align-self:end}.archive-roh-scorecard-hero .hero-panel{grid-area:panel;align-self:start;max-width:720px}.archive-roh-scorecard-photo{grid-area:photo;margin:0;display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:650px;border:1px solid #71333a;background:#080a0a;overflow:hidden}.archive-roh-scorecard-photo figcaption,.archive-roh-scorecard-evidence figcaption{display:grid;gap:7px;padding:14px 16px;background:#080a0a;border-top:1px solid #71333a;color:#d7d8d4;font-size:9px;line-height:1.45;text-transform:uppercase}.archive-roh-scorecard-photo figcaption a,.archive-roh-scorecard-evidence figcaption a{color:#ef747e}.archive-roh-scorecard-evidence{margin:0;display:grid;grid-template-rows:minmax(430px,1fr) auto;border:1px solid #71333a;background:#080a0a;overflow:hidden}.archive-roh-contain{object-fit:contain!important;background:#050606}.roh-dimensions{border:1px solid #393d3b}.roh-dimension{display:grid;grid-template-columns:minmax(260px,1fr) 76px minmax(180px,.7fr);gap:18px;align-items:center;padding:18px 20px;border-bottom:1px solid #303432}.roh-dimension:last-child{border-bottom:0}.roh-dimension b{display:block;font-size:17px}.roh-dimension span{display:block;color:var(--muted);font-size:12px;line-height:1.45;margin-top:5px}.roh-dimension>strong{font:700 26px/1 Impact,'Arial Black',sans-serif;color:#ef747e;text-align:right}.roh-meter{height:8px;background:#1b1f1e;overflow:hidden}.roh-meter i{display:block;height:100%;background:linear-gradient(90deg,#8e2630,#ef747e)}.roh-sensitivity{margin-top:22px}.roh-index-warning{margin-top:22px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted)}@media(max-width:980px){.archive-roh-scorecard-hero .hero-inner{grid-template-columns:1fr;grid-template-areas:"copy" "photo" "panel"}.archive-roh-scorecard-photo{min-height:560px}.archive-roh-scorecard-hero .hero-panel{max-width:none}}@media(max-width:680px){.roh-dimension{grid-template-columns:1fr 64px}.roh-meter{grid-column:1/-1}.archive-roh-scorecard-photo{min-height:430px}.archive-roh-scorecard-evidence{grid-template-rows:minmax(520px,1fr) auto}}\n`;
await writeFile(path.join(out,'assets','site.css'),css);

for(const file of (await readdir(out)).filter(name=>name.endsWith('.html'))){
  const p=path.join(out,file); let text=await readFile(p,'utf8');
  text=text.replaceAll('Canonical research snapshot through August 5, 2026.','Publication research snapshot through August 7, 2026.');
  await writeFile(p,text);
}
console.log('Published ROH as Belt Theory promotion #6: scorecard, homepage, Systems Index, research library and photo credits.');
