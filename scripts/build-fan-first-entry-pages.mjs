import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const out=path.resolve(process.argv[2]||path.join(root,'dist'));
const origin='https://belt-theory.tucknub.workers.dev';
const archive=JSON.parse(await readFile(path.join(root,'data','archive-assets.json'),'utf8'));
const map=new Map(archive.assets.map(a=>[a.id,a]));
const src=(id)=>{const a=map.get(id);return `assets/archive/${a.slug}-${a.defaultWidth}.${a.extension}`};
const alt=(id)=>map.get(id)?.alt||'';
const esc=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let roh=null;try{const r=JSON.parse(await readFile(path.join(out,'assets','archive','roh-manifest.json'),'utf8'));const a=r.assets.find(x=>x.id==='BT-ROH-001');const v=a?.variants?.find(x=>x.requestedWidth===a.defaultWidth)||a?.variants?.at(-1);roh=v?`assets/archive/${v.filename}`:null}catch{}

const home=await readFile(path.join(out,'index.html'),'utf8');
const header=home.match(/<header class="ff-header">[\s\S]*?<\/header>/i)?.[0];
const footer=home.match(/<footer class="ff-footer">[\s\S]*?<\/footer>/i)?.[0];
if(!header||!footer) throw new Error('Fan-first shell not available.');
const navHeader=(current)=>{
  let h=header.replaceAll(' aria-current="page"','');
  const target=current==='promotions'?'href="scorecards.html"':current==='compare'?'href="comparisons.html"':null;
  if(target) h=h.replace(target,`${target} aria-current="page"`);
  return `<a class="ff-skip" href="#content">Skip to content</a>${h}`;
};
function head(title,description,canonical,image){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050505"><meta name="color-scheme" content="dark"><meta name="description" content="${esc(description)}"><meta name="robots" content="index, follow, max-image-preview:large"><title>${esc(title)}</title><link rel="icon" href="assets/mark.svg"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="Belt Theory"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/${image}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="assets/fan-first.css"></head>`}

const promotions=[
 ['WWE','scorecard-wwe.html','#d7d7d7',src('BT-WWE-001'),alt('BT-WWE-001'),'Deepest all-around system','Triple H beat late Vince 55.8–44.2 in the equal-window study.','Best place to start: how lower titles fed future world champions.'],
 ['AEW','scorecard-aew.html','#d9b441',src('BT-AEW-001'),alt('BT-AEW-001'),'Sharp crown, uneven depth','AEW protects its flagship world championship extremely well.','Best place to start: why the top of the system is cleaner than the middle.'],
 ['TNA','scorecard-tna.html','#e34249',src('BT-TNA-001'),alt('BT-TNA-001'),'Strong system, constant resets','TNA created more internal upward movement than its reputation suggests.','Best place to start: how good pathways survived messy governance.'],
 ['WCW','scorecard-wcw.html','#5aa3d8',src('BT-WCW-003'),alt('BT-WCW-003'),'Better development than the myth','Nine of ten standard career-first world champions held earlier WCW-platform gold.','Best place to start: whether WCW really failed to build new stars.'],
 ['ECW','scorecard-ecw.html','#9d55c7',src('BT-ECW-003'),alt('BT-ECW-003'),'Small, clear, effective','Eight of thirteen mature World champions held earlier ECW core gold.','Best place to start: how a tiny title system created obvious upward paths.'],
 ['ROH','scorecard-roh.html','#d44752',roh,'Ring of Honor event photography.','Stable world title, hidden tag ladder','Fourteen of 33 World champions held Tag gold before their first World reign.','Best place to start: why the tag titles mattered more than most fans realize.']
];
const promoRows=promotions.map(([name,href,tone,image,imageAlt,verdict,finding,start])=>`<a class="ff-directory-row" href="${href}" style="--promotion:${tone}">${image?`<span class="ff-directory-media"><img src="${image}" alt="${esc(imageAlt)}" loading="lazy" decoding="async"></span>`:'<span class="ff-directory-media ff-promotion-media-empty" aria-hidden="true"></span>'}<span class="ff-directory-name">${name}</span><span class="ff-directory-verdict"><strong>${verdict}</strong><p>${finding}</p><small>${start}</small></span><em>Open breakdown →</em></a>`).join('');

const scorecards=`${head('Promotions — Belt Theory','Pick a wrestling promotion and get the plain-English Belt Theory verdict: what worked, what failed, what surprised us and where the evidence came from.',`${origin}/scorecards`,src('BT-WWE-001'))}<body>${navHeader('promotions')}<main id="content"><section class="ff-directory-hero"><div class="ff-directory-bg"><img src="${src('BT-WWE-001')}" alt="" aria-hidden="true"></div><div class="ff-shell"><p class="ff-section-label">Promotions</p><h1>Pick a company.<br>Get the verdict.</h1><p>Start with WWE, AEW, TNA, WCW, ECW or ROH. We explain what each championship system did well, what held it back and what the history actually says.</p></div></section><section class="ff-directory ff-shell"><div class="ff-directory-guide"><strong>No homework required.</strong><p>Every promotion page starts with the answer. The deeper scoring and source work are there only if you want them.</p></div>${promoRows}</section><section class="ff-section ff-directory-how"><div class="ff-shell"><div class="ff-section-intro"><div><p class="ff-section-label">How to read a breakdown</p><h2>Three questions. Then the data.</h2></div></div><div class="ff-three-steps"><article><span>1</span><h3>What did they do best?</h3><p>The strongest part of the championship system, in normal wrestling language.</p></article><article><span>2</span><h3>What hurt them?</h3><p>The booking, continuity or title-role problem that kept the system from working better.</p></article><article><span>3</span><h3>What surprised us?</h3><p>The finding that changes the usual fan argument—then the evidence underneath it.</p></article></div></div></section></main>${footer}</body></html>`;

const debateCards=[
 ['Did TNA actually create stars?','report-did-tna-create-stars.html','Yes. Barely.','51.6% created in TNA vs. 48.4% established elsewhere.',src('BT-TNA-003'),alt('BT-TNA-003')],
 ['TNA vs. AEW: who built the deeper system?','report-tna-vs-aew.html','TNA, 51.9–48.1.','TNA wins the total system. AEW still owns the stronger crown.',src('BT-AEW-003'),alt('BT-AEW-003')],
 ['WWE vs. AEW: which system is better?','report-wwe-vs-aew.html','Basically a draw.','AEW 50.2 — WWE 49.8. Different strengths, almost identical total result.',src('BT-AEW-001'),alt('BT-AEW-001')],
 ['WWE vs. WCW vs. ECW','report-wwe-wcw-ecw.html','WWE wins. ECW surprises.','WWE 38.0 · ECW 32.7 · WCW 29.2 across the matched framework.',src('BT-ECW-003'),alt('BT-ECW-003')]
];
const debateRows=debateCards.map(([question,href,answer,detail,image,imageAlt],i)=>`<a class="ff-debate-row" href="${href}"><span class="ff-debate-number">0${i+1}</span><span class="ff-debate-media"><img src="${image}" alt="${esc(imageAlt)}" loading="lazy" decoding="async"></span><span class="ff-debate-copy"><small>The question</small><h2>${question}</h2><strong>${answer}</strong><p>${detail}</p></span><em>Read the story →</em></a>`).join('');

const comparisons=`${head('Big debates — Belt Theory','Start with a wrestling argument. Belt Theory gives you the answer first, then shows the championship-history evidence behind it.',`${origin}/comparisons`,src('BT-AEW-001'))}<body>${navHeader('compare')}<main id="content"><section class="ff-directory-hero ff-debate-hero"><div class="ff-directory-bg"><img src="${src('BT-AEW-001')}" alt="" aria-hidden="true"></div><div class="ff-shell"><p class="ff-section-label">Big debates</p><h1>Wrestling arguments.<br>With receipts.</h1><p>No spreadsheet required. Start with the question, see our answer, then decide how deep you want to go.</p></div></section><section class="ff-debate-list ff-shell">${debateRows}</section><section class="ff-section ff-directory-how"><div class="ff-shell"><div class="ff-method-card"><div><p class="ff-section-label">What makes a fair comparison?</p><h2>Same window. Same rules. Same questions.</h2><p>When promotions are directly compared, Belt Theory locks the time window and framework before scoring the result. That keeps the argument from changing after we see who wins.</p></div><div><a class="ff-button" href="methodology.html">How it works →</a><a class="ff-text-link" href="research.html">Check the source data</a></div></div></div></section></main>${footer}</body></html>`;

await writeFile(path.join(out,'scorecards.html'),scorecards);
await writeFile(path.join(out,'comparisons.html'),comparisons);
console.log('Built fan-first Promotions and Big Debates entry pages.');
